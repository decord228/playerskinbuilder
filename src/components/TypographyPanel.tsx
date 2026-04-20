import React, { useState } from 'react';
import './StylePanels.css';

interface TypographySettings {
  font_color?: string;
  disabled_font_color?: string;
  font_size?: string;
  font_family?: string;
  font_weight?: string;
}

interface TypographyPanelProps {
  value: TypographySettings;
  onChange: (settings: TypographySettings) => void;
}

export default function TypographyPanel({ value, onChange }: TypographyPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const fontColor = value.font_color || '#ffffff';
  const disabledFontColor = value.disabled_font_color || 'rgba(255,255,255,0.3)';
  const fontSize = parseFloat(value.font_size || '14');
  const fontFamily = value.font_family || 'Montserrat';
  const fontWeight = parseFloat(value.font_weight || '600');

  return (
    <div className="sp-panel">
      <div className="sp-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div className="sp-header-left">
          <span className="sp-header-title">Typography</span>
        </div>
        <div className="sp-header-right">
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{isOpen ? '▼' : '▶'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="sp-content">
          {/* Font Color */}
          <div className="sp-row">
            <label className="sp-label">font color</label>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => onChange({ ...value, font_color: e.target.value })}
              className="sp-color-input"
            />
            <span className="sp-value">{fontColor}</span>
          </div>

          {/* Disabled Font Color */}
          <div className="sp-row">
            <label className="sp-label">disabled font</label>
            <input
              type="color"
              value={disabledFontColor.startsWith('rgba') ? '#ffffff' : disabledFontColor}
              onChange={(e) => onChange({ ...value, disabled_font_color: e.target.value })}
              className="sp-color-input"
            />
            <span className="sp-value">{disabledFontColor}</span>
          </div>

          {/* Font Size */}
          <div className="sp-row">
            <label className="sp-label">font size</label>
            <input
              type="range"
              min="8"
              max="32"
              step="1"
              value={fontSize}
              onChange={(e) => onChange({ ...value, font_size: e.target.value })}
              className="sp-slider"
            />
            <span className="sp-value">{fontSize}</span>
          </div>

          {/* Font Family */}
          <div className="sp-row">
            <label className="sp-label">font family</label>
            <select
              className="sp-select"
              value={fontFamily}
              onChange={(e) => onChange({ ...value, font_family: e.target.value })}
            >
              <option value="Montserrat">Montserrat</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Rajdhani">Rajdhani</option>
              <option value="system-ui">system-ui</option>
            </select>
          </div>

          {/* Font Weight */}
          <div className="sp-row">
            <label className="sp-label">font weight</label>
            <input
              type="range"
              min="100"
              max="900"
              step="100"
              value={fontWeight}
              onChange={(e) => onChange({ ...value, font_weight: e.target.value })}
              className="sp-slider"
            />
            <span className="sp-value">{fontWeight}</span>
          </div>
        </div>
      )}
    </div>
  );
}
