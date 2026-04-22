import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { StatefulEffects, EffectsStyle, ShadowStyle } from '../types/styles';
import './StylePanels.css';

interface EffectsPanelProps {
  value: StatefulEffects;
  onChange: (effects: StatefulEffects) => void;
}

type StateType = 'normal' | 'hover' | 'active' | 'disabled';

export default function EffectsPanel({ value, onChange }: EffectsPanelProps) {
  const [activeState, setActiveState] = useState<StateType>('normal');
  const [expandedShadow, setExpandedShadow] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const [isOpen, setIsOpen] = useState(true);
  const colorPreviewRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showColorPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        !Array.from(colorPreviewRefs.current.values()).some(ref => ref.contains(e.target as Node))
      ) {
        setShowColorPicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  // Get current state effects or fallback to normal
  const currentEffects: EffectsStyle = value[activeState] || value.normal;

  const handleBlurChange = (blur: number) => {
    onChange({
      ...value,
      [activeState]: { ...currentEffects, backgroundBlur: blur }
    });
  };

  const handleAddShadow = (type: 'inner' | 'drop') => {
    const newShadow: ShadowStyle = {
      id: `shadow_${Date.now()}`,
      type,
      offsetX: 0,
      offsetY: 4,
      blur: 8,
      spread: 0,
      color: '#000000',
      opacity: 0.25
    };
    onChange({
      ...value,
      [activeState]: { ...currentEffects, shadows: [...currentEffects.shadows, newShadow] }
    });
    setExpandedShadow(newShadow.id);
  };

  const handleRemoveShadow = (shadowId: string) => {
    onChange({
      ...value,
      [activeState]: {
        ...currentEffects,
        shadows: currentEffects.shadows.filter(s => s.id !== shadowId)
      }
    });
    if (expandedShadow === shadowId) {
      setExpandedShadow(null);
    }
  };

  const handleShadowChange = (shadowId: string, updates: Partial<ShadowStyle>) => {
    onChange({
      ...value,
      [activeState]: {
        ...currentEffects,
        shadows: currentEffects.shadows.map(s =>
          s.id === shadowId ? { ...s, ...updates } : s
        )
      }
    });
  };

  const handleColorPreviewClick = (shadowId: string, ref: HTMLDivElement) => {
    const rect = ref.getBoundingClientRect();
    setPickerPosition({
      top: rect.bottom + 8,
      left: rect.left
    });
    setShowColorPicker(shadowId);
  };

  const handleStateChange = (state: StateType) => {
    setActiveState(state);
  };

  const handleClearState = () => {
    if (activeState === 'normal') return;

    const newValue = { ...value };
    delete newValue[activeState];
    onChange(newValue);
    setActiveState('normal');
  };

  const activeShadow = showColorPicker
    ? currentEffects.shadows.find(s => s.id === showColorPicker)
    : null;

  return (
    <div className="style-panel">
      <div className="sp-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div className="sp-header-left">
          <span className="sp-header-title">Effects</span>
        </div>
        <div className="sp-header-right">
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{isOpen ? '▼' : '▶'}</span>
        </div>
      </div>
      {isOpen && (
      <div className="sp-content">
        {/* State Selector */}
        <div className="sp-row">
          <div className="sp-state-selector">
            <button
              className={activeState === 'normal' ? 'active' : ''}
              onClick={() => handleStateChange('normal')}
            >
              Normal
            </button>
            <button
              className={activeState === 'hover' ? 'active' : ''}
              onClick={() => handleStateChange('hover')}
            >
              Hover
            </button>
            <button
              className={activeState === 'active' ? 'active' : ''}
              onClick={() => handleStateChange('active')}
            >
              Active
            </button>
            <button
              className={activeState === 'disabled' ? 'active' : ''}
              onClick={() => handleStateChange('disabled')}
            >
              Disabled
            </button>
          </div>
          {activeState !== 'normal' && value[activeState] && (
            <button className="sp-clear-state" onClick={handleClearState} title="Clear state">
              ×
            </button>
          )}
        </div>

        {/* Background Blur */}
        <div className="sp-row">
          <span className="sp-label">Blur</span>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={currentEffects.backgroundBlur || 0}
            onChange={(e) => handleBlurChange(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span className="sp-value">{currentEffects.backgroundBlur || 0}px</span>
        </div>

        {/* Shadows */}
        <div className="sp-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="sp-label">Shadows</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className="sp-add-btn"
                onClick={() => handleAddShadow('drop')}
                title="Add Drop Shadow"
              >
                + Drop
              </button>
              <button
                className="sp-add-btn"
                onClick={() => handleAddShadow('inner')}
                title="Add Inner Shadow"
              >
                + Inner
              </button>
            </div>
          </div>

          {currentEffects.shadows.map((shadow) => (
            <div key={shadow.id} className="shadow-item">
              <div
                className="shadow-header"
                onClick={() => setExpandedShadow(expandedShadow === shadow.id ? null : shadow.id)}
              >
                <span className="shadow-type">{shadow.type === 'inner' ? 'Inner' : 'Drop'} Shadow</span>
                <button
                  className="shadow-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveShadow(shadow.id);
                  }}
                >
                  ×
                </button>
              </div>

              {expandedShadow === shadow.id && (
                <div className="shadow-controls">
                  <div className="sp-row">
                    <span className="sp-label">X</span>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={shadow.offsetX}
                      onChange={(e) => handleShadowChange(shadow.id, { offsetX: Number(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                    <span className="sp-value">{shadow.offsetX}px</span>
                  </div>

                  <div className="sp-row">
                    <span className="sp-label">Y</span>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={shadow.offsetY}
                      onChange={(e) => handleShadowChange(shadow.id, { offsetY: Number(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                    <span className="sp-value">{shadow.offsetY}px</span>
                  </div>

                  <div className="sp-row">
                    <span className="sp-label">Blur</span>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={shadow.blur}
                      onChange={(e) => handleShadowChange(shadow.id, { blur: Number(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                    <span className="sp-value">{shadow.blur}px</span>
                  </div>

                  <div className="sp-row">
                    <span className="sp-label">Spread</span>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={shadow.spread}
                      onChange={(e) => handleShadowChange(shadow.id, { spread: Number(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                    <span className="sp-value">{shadow.spread}px</span>
                  </div>

                  <div className="sp-row">
                    <span className="sp-label">Color</span>
                    <div
                      ref={(el) => {
                        if (el) colorPreviewRefs.current.set(shadow.id, el);
                      }}
                      className="sp-color-preview"
                      style={{ background: shadow.color }}
                      onClick={() => {
                        const ref = colorPreviewRefs.current.get(shadow.id);
                        if (ref) handleColorPreviewClick(shadow.id, ref);
                      }}
                    />
                  </div>

                  <div className="sp-row">
                    <span className="sp-label">Opacity</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={shadow.opacity}
                      onChange={(e) => handleShadowChange(shadow.id, { opacity: Number(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                    <span className="sp-value">{Math.round(shadow.opacity * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      )}

      {showColorPicker && activeShadow && (
        <div
          ref={pickerRef}
          className="floating-color-picker"
          style={{
            position: 'fixed',
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`,
            zIndex: 10000
          }}
        >
          <HexColorPicker
            color={activeShadow.color}
            onChange={(color) => handleShadowChange(activeShadow.id, { color })}
          />
        </div>
      )}
    </div>
  );
}
