import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { EffectsStyle, ShadowStyle } from '../types/styles';
import './StylePanels.css';

interface EffectsPanelProps {
  value: EffectsStyle;
  onChange: (effects: EffectsStyle) => void;
}

export default function EffectsPanel({ value, onChange }: EffectsPanelProps) {
  const [expandedShadow, setExpandedShadow] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
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

  const handleBlurChange = (blur: number) => {
    onChange({ ...value, backgroundBlur: blur });
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
    onChange({ ...value, shadows: [...value.shadows, newShadow] });
    setExpandedShadow(newShadow.id);
  };

  const handleShadowChange = (id: string, updates: Partial<ShadowStyle>) => {
    const newShadows = value.shadows.map(shadow =>
      shadow.id === id ? { ...shadow, ...updates } : shadow
    );
    onChange({ ...value, shadows: newShadows });
  };

  const handleDeleteShadow = (id: string) => {
    onChange({ ...value, shadows: value.shadows.filter(s => s.id !== id) });
    if (expandedShadow === id) setExpandedShadow(null);
    if (showColorPicker === id) setShowColorPicker(null);
  };

  const handleColorPreviewClick = (shadowId: string) => {
    const ref = colorPreviewRefs.current.get(shadowId);
    if (ref) {
      const rect = ref.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
      setShowColorPicker(showColorPicker === shadowId ? null : shadowId);
    }
  };

  return (
    <div className="style-panel">
      <div className="sp-header">
        <div className="sp-header-left">
          <span className="sp-header-title">Effects</span>
        </div>
      </div>

      <div className="sp-content">
        {/* Background Blur */}
        <div className="sp-section">
          <div className="sp-section-header">
            <span>Background Blur</span>
          </div>
          <div className="sp-slider-row">
            <label>Blur</label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={value.backgroundBlur}
              onChange={(e) => handleBlurChange(Number(e.target.value))}
            />
            <span>{value.backgroundBlur}px</span>
          </div>
        </div>

        {/* Shadows */}
        <div className="sp-section">
          <div className="sp-section-header">
            <span>Shadows</span>
            <div className="sp-add-buttons">
              <button
                className="sp-add-btn"
                onClick={() => handleAddShadow('inner')}
                title="Add Inner Shadow"
              >
                Inner
              </button>
              <button
                className="sp-add-btn"
                onClick={() => handleAddShadow('drop')}
                title="Add Drop Shadow"
              >
                Drop
              </button>
            </div>
          </div>

          {value.shadows.length === 0 && (
            <div className="sp-empty">No shadows</div>
          )}

          {value.shadows.map((shadow) => (
            <div key={shadow.id} className="sp-shadow-item">
              <div
                className="sp-shadow-header"
                onClick={() => setExpandedShadow(expandedShadow === shadow.id ? null : shadow.id)}
              >
                <div className="sp-shadow-header-left">
                  <span className="sp-shadow-type-badge">
                    {shadow.type === 'inner' ? 'Inner' : 'Drop'}
                  </span>
                  <div
                    className="sp-shadow-preview"
                    style={{
                      boxShadow: shadow.type === 'inner'
                        ? `inset ${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}${Math.round(shadow.opacity * 255).toString(16).padStart(2, '0')}`
                        : `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}${Math.round(shadow.opacity * 255).toString(16).padStart(2, '0')}`
                    }}
                  />
                </div>
                <div className="sp-shadow-actions">
                  <button
                    className="sp-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteShadow(shadow.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {expandedShadow === shadow.id && (
                <div className="sp-shadow-content">
                  <div className="sp-slider-row">
                    <label>X</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={shadow.offsetX}
                      onChange={(e) => handleShadowChange(shadow.id, { offsetX: Number(e.target.value) })}
                    />
                    <span>{shadow.offsetX}px</span>
                  </div>

                  <div className="sp-slider-row">
                    <label>Y</label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={shadow.offsetY}
                      onChange={(e) => handleShadowChange(shadow.id, { offsetY: Number(e.target.value) })}
                    />
                    <span>{shadow.offsetY}px</span>
                  </div>

                  <div className="sp-slider-row">
                    <label>Blur</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={shadow.blur}
                      onChange={(e) => handleShadowChange(shadow.id, { blur: Number(e.target.value) })}
                    />
                    <span>{shadow.blur}px</span>
                  </div>

                  <div className="sp-slider-row">
                    <label>Spread</label>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={shadow.spread}
                      onChange={(e) => handleShadowChange(shadow.id, { spread: Number(e.target.value) })}
                    />
                    <span>{shadow.spread}px</span>
                  </div>

                  <div className="sp-color-row">
                    <div
                      ref={(el) => {
                        if (el) colorPreviewRefs.current.set(shadow.id, el);
                      }}
                      className={`sp-color-preview ${showColorPicker === shadow.id ? 'active' : ''}`}
                      onClick={() => handleColorPreviewClick(shadow.id)}
                    >
                      <div
                        className="sp-color-preview-inner"
                        style={{ backgroundColor: shadow.color }}
                      />
                    </div>
                    <input
                      type="text"
                      value={shadow.color}
                      onChange={(e) => handleShadowChange(shadow.id, { color: e.target.value })}
                      className="sp-color-input"
                      placeholder="#000000"
                    />
                  </div>

                  <div className="sp-slider-row">
                    <label>Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={shadow.opacity}
                      onChange={(e) => handleShadowChange(shadow.id, { opacity: Number(e.target.value) })}
                    />
                    <span>{Math.round(shadow.opacity * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Color Picker */}
      {showColorPicker && (
        <div
          ref={pickerRef}
          className="sp-color-picker-popover"
          style={{
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`
          }}
        >
          <HexColorPicker
            color={value.shadows.find(s => s.id === showColorPicker)?.color || '#000000'}
            onChange={(color) => handleShadowChange(showColorPicker, { color })}
          />
          <input
            type="text"
            value={value.shadows.find(s => s.id === showColorPicker)?.color || '#000000'}
            onChange={(e) => handleShadowChange(showColorPicker, { color: e.target.value })}
            className="sp-color-hex-input"
            placeholder="#000000"
          />
        </div>
      )}
    </div>
  );
}
