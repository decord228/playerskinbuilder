import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { getPropSections } from '../data/propertySystem';
import { getNodeType } from '../data/nodeTypes';
import { getTypeIcon } from '../data/icons';
import { applyPropertyChange } from '../utils/propertyApplier';
import { assetManager } from '../store/assetStore';
import IconPicker from './IconPicker';
import SVGPicker from './SVGPicker';
import SVGEditor from './SVGEditor';
import './PropertiesPanel.css';

export default function PropertiesPanel() {
  const { selectedNodeId, tree, updateNode, updateNodeProps } = useStore();
  const selectedNode = tree.find(n => n.id === selectedNodeId);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  useEffect(() => {
    const handleAssetSelected = () => {
      setSelectedAssetId(assetManager.selectedAssetId);
    };

    window.addEventListener('asset-selected', handleAssetSelected);
    return () => window.removeEventListener('asset-selected', handleAssetSelected);
  }, []);

  // Reset selected asset when node is selected
  useEffect(() => {
    if (selectedNodeId) {
      setSelectedAssetId(null);
      assetManager.selectedAssetId = null;
    }
  }, [selectedNodeId]);

  // Show SVG Editor if asset is selected
  if (selectedAssetId) {
    const asset = assetManager.getAsset(selectedAssetId);
    if (asset && asset.type === 'svg') {
      return (
        <div className="properties-panel">
          <div className="proph">
            <div className="proph-left">
              <span className="proptitle">SVG Editor</span>
            </div>
            <button
              onClick={() => {
                setSelectedAssetId(null);
                assetManager.selectedAssetId = null;
              }}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0 4px'
              }}
              title="Close"
            >
              ×
            </button>
          </div>
          <div className="propscroll">
            <div className="psec-body" style={{ padding: '12px' }}>
              <SVGEditor
                svgData={asset.data}
                onSave={(newSvgData) => {
                  asset.data = newSvgData;
                  (assetManager as any).saveToStorage();
                  window.dispatchEvent(new CustomEvent('assets-updated'));
                }}
              />
            </div>
          </div>
        </div>
      );
    }
  }

  if (!selectedNode) {
    return (
      <div className="properties-panel">
        <div className="proph">
          <span className="proptitle">Inspector</span>
          <span className="proptype">—</span>
        </div>
        <div className="propscroll">
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
            Select a node
          </div>
        </div>
      </div>
    );
  }

  const nodeType = getNodeType(selectedNode.type);
  const sections = getPropSections(selectedNode);

  const handlePropChange = (key, value) => {
    if (key === 'label') {
      updateNode(selectedNode.id, { label: value });
    } else if (key === 'visible') {
      updateNode(selectedNode.id, { visible: value === 'true' });
    } else {
      updateNodeProps(selectedNode.id, { [key]: value });

      // Sync alpha sliders with color pickers
      if (key === 'gradient_start') {
        const alpha = extractAlpha(value);
        if (alpha !== null) {
          updateNodeProps(selectedNode.id, { gradient_start_alpha: String(alpha) });
        }
      } else if (key === 'gradient_end') {
        const alpha = extractAlpha(value);
        if (alpha !== null) {
          updateNodeProps(selectedNode.id, { gradient_end_alpha: String(alpha) });
        }
      } else if (key === 'color') {
        const alpha = extractAlpha(value);
        if (alpha !== null) {
          updateNodeProps(selectedNode.id, { color_alpha: String(alpha) });
        }
      }
    }

    // Apply changes to DOM immediately
    applyPropertyChange(selectedNode.id, key, value, tree);
  };

  const extractAlpha = (color: string): number | null => {
    const rgbaMatch = color.match(/rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch && rgbaMatch[1]) {
      return parseFloat(rgbaMatch[1]);
    }
    return null;
  };

  const handleDragChange = (key: string, startValue: number, deltaX: number) => {
    const newValue = startValue + Math.round(deltaX / 2);
    handlePropChange(key, String(newValue));
  };

  const renderField = (field) => {
    const currentValue = field.key === 'label'
      ? selectedNode.label
      : field.key === 'visible'
      ? String(selectedNode.visible)
      : (selectedNode.props[field.key] || field.def || '');

    // Check for SVG asset before switch
    let isSVG = false;
    let svgAsset = null;
    // Removed SVG editor logic from icon_picker - it should only show in FileBrowser mode

    switch (field.type) {
      case 'text':
        const isNumeric = !isNaN(parseFloat(currentValue)) && isFinite(currentValue);

        return (
          <div className="pitem" key={field.key}>
            <label className="plabel">{field.label || field.key}</label>
            <div className="pinput-wrapper">
              {isNumeric && (
                <div
                  className="pinput-drag-handle"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startValue = parseFloat(currentValue) || 0;

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const deltaX = moveEvent.clientX - startX;
                      handleDragChange(field.key, startValue, deltaX);
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                      document.body.style.cursor = '';
                    };

                    document.body.style.cursor = 'ew-resize';
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 12h8M12 8l4 4-4 4M12 16l-4-4 4-4"/>
                  </svg>
                </div>
              )}
              <input
                className={`ptextinput ${isNumeric ? 'has-drag-handle' : ''}`}
                type="text"
                value={currentValue}
                onChange={(e) => handlePropChange(field.key, e.target.value)}
              />
            </div>
          </div>
        );

      case 'bool':
        return (
          <div className="pitem" key={field.key}>
            <label className="plabel">{field.label || field.key}</label>
            <label className="pswitch">
              <input
                type="checkbox"
                checked={currentValue === 'true' || currentValue === true}
                onChange={(e) => handlePropChange(field.key, String(e.target.checked))}
              />
              <span className="pslider"></span>
            </label>
          </div>
        );

      case 'color':
        return (
          <div className="pitem" key={field.key}>
            <label className="plabel">{field.label || field.key}</label>
            <div className="pcolor-wrap">
              <input
                type="color"
                className="pcolor-picker"
                value={currentValue.startsWith('#') ? currentValue : '#ffffff'}
                onChange={(e) => handlePropChange(field.key, e.target.value)}
              />
              <input
                className="ptextinput"
                type="text"
                value={currentValue}
                onChange={(e) => handlePropChange(field.key, e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        );

      case 'icon_picker':
        return (
          <div className="pitem" key={field.key}>
            <label className="plabel">{field.label || field.key}</label>
            <IconPicker
              value={currentValue}
              onChange={(value) => handlePropChange(field.key, value)}
            />
          </div>
        );

      case 'svg_picker':
        return (
          <div className="pitem" key={field.key}>
            <label className="plabel">{field.label || field.key}</label>
            <SVGPicker
              value={currentValue}
              onChange={(value) => handlePropChange(field.key, value)}
            />
          </div>
        );

      case 'button_mode_switch':
        const buttonMode = selectedNode.props.button_mode || 'legacy';
        return (
          <div className="pitem" key="button_mode_switch" style={{ flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                className={`mode-switch-btn ${buttonMode === 'legacy' ? 'active' : ''}`}
                onClick={() => handlePropChange('button_mode', 'legacy')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  background: buttonMode === 'legacy' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: buttonMode === 'legacy' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: buttonMode === 'legacy' ? '#3b82f6' : 'var(--text-muted)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="8" width="16" height="8" rx="4"/>
                  <text x="12" y="13.5" fontSize="6" fill="currentColor" textAnchor="middle" fontWeight="600">BTN</text>
                </svg>
                <span style={{ fontSize: '11px', fontWeight: '500' }}>Legacy</span>
              </button>
              <button
                className={`mode-switch-btn ${buttonMode === 'svg' ? 'active' : ''}`}
                onClick={() => handlePropChange('button_mode', 'svg')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  background: buttonMode === 'svg' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: buttonMode === 'svg' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: buttonMode === 'svg' ? '#3b82f6' : 'var(--text-muted)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span style={{ fontSize: '11px', fontWeight: '500' }}>SVG</span>
              </button>
            </div>
          </div>
        );


      case 'panel_mode_switch':
        const panelMode = selectedNode.props.panel_mode || 'legacy';
        return (
          <div className="pitem" key="panel_mode_switch" style={{ flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                className={`mode-switch-btn ${panelMode === 'legacy' ? 'active' : ''}`}
                onClick={() => handlePropChange('panel_mode', 'legacy')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  background: panelMode === 'legacy' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: panelMode === 'legacy' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: panelMode === 'legacy' ? '#3b82f6' : 'var(--text-muted)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <text x="12" y="13.5" fontSize="5" fill="currentColor" textAnchor="middle" fontWeight="600">PANEL</text>
                </svg>
                <span style={{ fontSize: '11px', fontWeight: '500' }}>Legacy</span>
              </button>
              <button
                className={`mode-switch-btn ${panelMode === 'svg' ? 'active' : ''}`}
                onClick={() => handlePropChange('panel_mode', 'svg')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  background: panelMode === 'svg' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: panelMode === 'svg' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: panelMode === 'svg' ? '#3b82f6' : 'var(--text-muted)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                </svg>
                <span style={{ fontSize: '11px', fontWeight: '500' }}>SVG</span>
              </button>
            </div>
          </div>
        );


      case 'select':
        return (
          <div className="pitem" key={field.key}>
            <label className="plabel">{field.label || field.key}</label>
            <select
              className="pselect"
              value={currentValue}
              onChange={(e) => handlePropChange(field.key, e.target.value)}
            >
              {field.opts?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );

      case 'anchor':
        return (
          <div className="pitem" key="anchor-preset">
            <label className="plabel">anchor preset</label>
            <div className="anchor-grid">
              {[
                { name: 'TL', al: 0, at: 0, ar: 0, ab: 0 },
                { name: 'Top', al: 0, at: 0, ar: 1, ab: 0 },
                { name: 'TR', al: 1, at: 0, ar: 1, ab: 0 },
                { name: 'Left', al: 0, at: 0, ar: 0, ab: 1 },
                { name: 'Center', al: 0.5, at: 0.5, ar: 0.5, ab: 0.5 },
                { name: 'Right', al: 1, at: 0, ar: 1, ab: 1 },
                { name: 'BL', al: 0, at: 1, ar: 0, ab: 1 },
                { name: 'Bottom', al: 0, at: 1, ar: 1, ab: 1 },
                { name: 'BR', al: 1, at: 1, ar: 1, ab: 1 },
                { name: 'Full', al: 0, at: 0, ar: 1, ab: 1 },
              ].map(preset => (
                <button
                  key={preset.name}
                  className="anchor-btn"
                  onClick={() => {
                    updateNodeProps(selectedNode.id, {
                      anchor_left: String(preset.al),
                      anchor_top: String(preset.at),
                      anchor_right: String(preset.ar),
                      anchor_bottom: String(preset.ab),
                    });
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        );

      case 'size_flags':
        return (
          <div className="pitem" key={field.key}>
            <label className="plabel">{field.key.replace('size_flags_', '')}</label>
            <div className="size-flags">
              {field.opts?.map(opt => (
                <button
                  key={opt}
                  className={`flag-btn ${currentValue === opt ? 'active' : ''}`}
                  onClick={() => handlePropChange(field.key, opt)}
                  title={opt}
                >
                  {opt.substring(0, 1)}
                </button>
              ))}
            </div>
          </div>
        );

      case 'slider':
        const min = field.min || 0;
        const max = field.max || 100;
        const step = field.step || 1;
        const numValue = parseFloat(currentValue) || parseFloat(field.def) || 0;

        return (
          <div className="pitem" key={field.key}>
            <label className="plabel">{field.label || field.key}</label>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={numValue}
                onChange={(e) => handlePropChange(field.key, e.target.value)}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background: 'var(--border)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <input
                className="ptextinput"
                type="number"
                min={min}
                max={max}
                step={step}
                value={numValue}
                onChange={(e) => handlePropChange(field.key, e.target.value)}
                style={{ width: '60px' }}
              />
            </div>
          </div>
        );

      case 'margin_preview':
      case 'gradient_editor':
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="properties-panel">
      <div className="proph">
        <div className="proph-left">
          <div
            className="proph-icon"
            dangerouslySetInnerHTML={{ __html: getTypeIcon(selectedNode.type) }}
          />
          <span className="proptitle">Inspector</span>
        </div>
        <span className="proptype">{selectedNode.type}</span>
      </div>
      <div className="propscroll">
        {sections.map((section, idx) => (
          <div key={idx} className="psec">
            <div className="psec-hdr">
              {section.icon && (
                <div
                  className="psec-icon"
                  dangerouslySetInnerHTML={{ __html: section.icon }}
                />
              )}
              <span className="psec-title">{section.name}</span>
            </div>
            <div className="psec-body">
              {section.fields.map(field => renderField(field))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
