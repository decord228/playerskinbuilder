import React, { useState } from 'react';
import './CoordinateField.css';

interface CoordinateFieldProps {
  label: string;
  type: 'rect' | 'vector2';
  values: {
    left?: string;
    top?: string;
    right?: string;
    bottom?: string;
    x?: string;
    y?: string;
  };
  onChange: (key: string, value: string) => void;
  keys: {
    left?: string;
    top?: string;
    right?: string;
    bottom?: string;
    x?: string;
    y?: string;
  };
}

export default function CoordinateField({ label, type, values, onChange, keys }: CoordinateFieldProps) {
  const handleDrag = (key: string, startValue: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newValue = startValue + Math.round(deltaX / 2);
      onChange(key, String(newValue));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };

    document.body.style.cursor = 'ew-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (type === 'rect') {
    return (
      <div className="coord-field">
        <label className="coord-label">{label}</label>
        <div className="coord-inputs">
          <div className="coord-input-group">
            <span className="coord-prefix">L</span>
            <div
              className="coord-drag-handle"
              onMouseDown={(e) => handleDrag(keys.left!, parseFloat(values.left || '0'), e)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 12h8M12 8l4 4-4 4M12 16l-4-4 4-4"/>
              </svg>
            </div>
            <input
              type="text"
              className="coord-input"
              value={values.left || '0'}
              onChange={(e) => onChange(keys.left!, e.target.value)}
            />
          </div>

          <div className="coord-input-group">
            <span className="coord-prefix">T</span>
            <div
              className="coord-drag-handle"
              onMouseDown={(e) => handleDrag(keys.top!, parseFloat(values.top || '0'), e)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 12h8M12 8l4 4-4 4M12 16l-4-4 4-4"/>
              </svg>
            </div>
            <input
              type="text"
              className="coord-input"
              value={values.top || '0'}
              onChange={(e) => onChange(keys.top!, e.target.value)}
            />
          </div>

          <div className="coord-input-group">
            <span className="coord-prefix">R</span>
            <div
              className="coord-drag-handle"
              onMouseDown={(e) => handleDrag(keys.right!, parseFloat(values.right || '0'), e)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 12h8M12 8l4 4-4 4M12 16l-4-4 4-4"/>
              </svg>
            </div>
            <input
              type="text"
              className="coord-input"
              value={values.right || '0'}
              onChange={(e) => onChange(keys.right!, e.target.value)}
            />
          </div>

          <div className="coord-input-group">
            <span className="coord-prefix">B</span>
            <div
              className="coord-drag-handle"
              onMouseDown={(e) => handleDrag(keys.bottom!, parseFloat(values.bottom || '0'), e)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 12h8M12 8l4 4-4 4M12 16l-4-4 4-4"/>
              </svg>
            </div>
            <input
              type="text"
              className="coord-input"
              value={values.bottom || '0'}
              onChange={(e) => onChange(keys.bottom!, e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }

  // vector2 type
  return (
    <div className="coord-field">
      <label className="coord-label">{label}</label>
      <div className="coord-inputs">
        <div className="coord-input-group">
          <span className="coord-prefix">X</span>
          <div
            className="coord-drag-handle"
            onMouseDown={(e) => handleDrag(keys.x!, parseFloat(values.x || '0'), e)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 12h8M12 8l4 4-4 4M12 16l-4-4 4-4"/>
            </svg>
          </div>
          <input
            type="text"
            className="coord-input"
            value={values.x || '0'}
            onChange={(e) => onChange(keys.x!, e.target.value)}
          />
        </div>

        <div className="coord-input-group">
          <span className="coord-prefix">Y</span>
          <div
            className="coord-drag-handle"
            onMouseDown={(e) => handleDrag(keys.y!, parseFloat(values.y || '0'), e)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 12h8M12 8l4 4-4 4M12 16l-4-4 4-4"/>
            </svg>
          </div>
          <input
            type="text"
            className="coord-input"
            value={values.y || '0'}
            onChange={(e) => onChange(keys.y!, e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
