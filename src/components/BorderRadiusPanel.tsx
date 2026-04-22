import React, { useState } from 'react';
import type { BorderRadiusStyle } from '../types/styles';
import './StylePanels.css';

interface BorderRadiusPanelProps {
  value: BorderRadiusStyle;
  onChange: (radius: BorderRadiusStyle) => void;
}

export default function BorderRadiusPanel({ value, onChange }: BorderRadiusPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const handleLinkedChange = (linked: boolean) => {
    if (linked) {
      const all = value.topLeft || value.topRight || value.bottomLeft || value.bottomRight || 0;
      onChange({ linked: true, all });
    } else {
      const all = value.all || 0;
      onChange({
        linked: false,
        topLeft: all,
        topRight: all,
        bottomLeft: all,
        bottomRight: all
      });
    }
  };

  const handleAllChange = (all: number) => {
    onChange({ ...value, all });
  };

  const handleCornerChange = (corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', val: number) => {
    onChange({ ...value, [corner]: val });
  };

  return (
    <div className="style-panel">
      <div className="sp-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div className="sp-header-left">
          <span className="sp-header-title">Border Radius</span>
        </div>
        <div className="sp-header-right">
          <button
            className={`sp-link-btn ${value.linked ? 'linked' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleLinkedChange(!value.linked); }}
            title={value.linked ? 'Unlink corners' : 'Link corners'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {value.linked ? (
                <>
                  <rect x="8" y="2" width="8" height="10" rx="2"/>
                  <rect x="8" y="12" width="8" height="10" rx="2"/>
                  <line x1="12" y1="12" x2="12" y2="12"/>
                </>
              ) : (
                <>
                  <rect x="8" y="2" width="8" height="10" rx="2"/>
                  <rect x="8" y="12" width="8" height="10" rx="2"/>
                  <line x1="12" y1="12" x2="12" y2="12" strokeDasharray="2 2"/>
                </>
              )}
            </svg>
          </button>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginLeft: '8px' }}>{isOpen ? '▼' : '▶'}</span>
        </div>
      </div>

      {isOpen && (
      <div className="sp-content">
        {value.linked ? (
          <div className="sp-slider-row">
            <label>All</label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={value.all || 0}
              onChange={(e) => handleAllChange(Number(e.target.value))}
            />
            <span>{value.all || 0}px</span>
          </div>
        ) : (
          <div className="sp-corners-grid">
            <div className="sp-corner-control">
              <label>
                <svg width="10" height="10" viewBox="0 0 12 12">
                  <path d="M 0 12 L 0 0 L 12 0" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                TL
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={value.topLeft || 0}
                onChange={(e) => handleCornerChange('topLeft', Number(e.target.value))}
              />
            </div>

            <div className="sp-corner-control">
              <label>
                <svg width="10" height="10" viewBox="0 0 12 12">
                  <path d="M 0 0 L 12 0 L 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                TR
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={value.topRight || 0}
                onChange={(e) => handleCornerChange('topRight', Number(e.target.value))}
              />
            </div>

            <div className="sp-corner-control">
              <label>
                <svg width="10" height="10" viewBox="0 0 12 12">
                  <path d="M 0 0 L 0 12 L 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                BL
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={value.bottomLeft || 0}
                onChange={(e) => handleCornerChange('bottomLeft', Number(e.target.value))}
              />
            </div>

            <div className="sp-corner-control">
              <label>
                <svg width="10" height="10" viewBox="0 0 12 12">
                  <path d="M 0 12 L 12 12 L 12 0" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                BR
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={value.bottomRight || 0}
                onChange={(e) => handleCornerChange('bottomRight', Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
