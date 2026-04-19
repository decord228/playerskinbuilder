import React from 'react';
import useStore from '../store/useStore';
import { getPropSections } from '../data/propertySystem';
import { getNodeType } from '../data/nodeTypes';
import { getTypeIcon } from '../data/icons';
import { applyPropertyChange } from '../utils/propertyApplier';
import './PropertiesPanel.css';

export default function PropertiesPanel() {
  const { selectedNodeId, tree, updateNode, updateNodeProps } = useStore();
  const selectedNode = tree.find(n => n.id === selectedNodeId);

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
    }

    // Apply changes to DOM immediately
    applyPropertyChange(selectedNode.id, key, value, tree);
  };

  const renderField = (field) => {
    const currentValue = field.key === 'label'
      ? selectedNode.label
      : field.key === 'visible'
      ? String(selectedNode.visible)
      : (selectedNode.props[field.key] || field.def || '');

    switch (field.type) {
      case 'text':
        return (
          <div className="pitem" key={field.key}>
            <label className="plabel">{field.label || field.key}</label>
            <input
              className="ptextinput"
              type="text"
              value={currentValue}
              onChange={(e) => handlePropChange(field.key, e.target.value)}
            />
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
