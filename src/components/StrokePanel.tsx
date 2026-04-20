import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import GradientPicker from './GradientPicker';
import type { StrokeStyle, GradientData } from '../types/styles';
import './StylePanels.css';

interface StrokePanelProps {
  value: StrokeStyle;
  onChange: (stroke: StrokeStyle) => void;
}

export default function StrokePanel({ value, onChange }: StrokePanelProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const colorPreviewRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showColorPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        colorPreviewRef.current &&
        !colorPreviewRef.current.contains(e.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  const handleToggle = (enabled: boolean) => {
    onChange({ ...value, enabled });
  };

  const handleTypeChange = (type: 'solid' | 'gradient') => {
    if (type === 'solid') {
      onChange({
        ...value,
        type: 'solid',
        color: value.color || '#000000',
        opacity: value.opacity || 1
      });
    } else {
      onChange({
        ...value,
        type: 'gradient',
        gradient: value.gradient || {
          type: 'linear',
          angle: 90,
          stops: [
            { color: '#ffffff', position: 0 },
            { color: '#000000', position: 100 }
          ]
        },
        opacity: value.opacity || 1
      });
    }
  };

  const handleColorChange = (color: string) => {
    onChange({ ...value, color });
  };

  const handleGradientChange = (gradient: GradientData) => {
    onChange({ ...value, gradient });
  };

  const handleWidthChange = (width: number) => {
    onChange({ ...value, width });
  };

  const handleOpacityChange = (opacity: number) => {
    onChange({ ...value, opacity });
  };

  const handleColorPreviewClick = () => {
    if (colorPreviewRef.current) {
      const rect = colorPreviewRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
      setShowColorPicker(!showColorPicker);
    }
  };

  return (
    <div className="style-panel">
      <div className="sp-header">
        <div className="sp-header-left">
          <span className="sp-header-title">Stroke</span>
        </div>
        <div className="sp-header-right">
          <label className="sp-toggle">
            <input
              type="checkbox"
              checked={value.enabled}
              onChange={(e) => handleToggle(e.target.checked)}
            />
            <span className="sp-toggle-slider"></span>
          </label>
        </div>
      </div>

      {value.enabled && (
        <div className="sp-content">
          {/* Type selector */}
          <div className="sp-type-selector">
            <button
              className={value.type === 'solid' ? 'active' : ''}
              onClick={() => handleTypeChange('solid')}
            >
              Solid
            </button>
            <button
              className={value.type === 'gradient' ? 'active' : ''}
              onClick={() => handleTypeChange('gradient')}
            >
              Gradient
            </button>
          </div>

          {/* Width slider */}
          <div className="sp-slider-row">
            <label>Width</label>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={value.width || 1}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
            />
            <span>{value.width || 1}px</span>
          </div>

          {/* Solid color */}
          {value.type === 'solid' && (
            <>
              <div className="sp-color-row">
                <div
                  ref={colorPreviewRef}
                  className={`sp-color-preview ${showColorPicker ? 'active' : ''}`}
                  onClick={handleColorPreviewClick}
                >
                  <div
                    className="sp-color-preview-inner"
                    style={{ backgroundColor: value.color }}
                  />
                </div>
                <input
                  type="text"
                  value={value.color || '#000000'}
                  onChange={(e) => handleColorChange(e.target.value)}
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
                  value={value.opacity || 1}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                />
                <span>{Math.round((value.opacity || 1) * 100)}%</span>
              </div>
            </>
          )}

          {/* Gradient */}
          {value.type === 'gradient' && value.gradient && (
            <>
              <GradientPicker
                value={value.gradient}
                onChange={handleGradientChange}
              />

              <div className="sp-slider-row">
                <label>Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={value.opacity || 1}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                />
                <span>{Math.round((value.opacity || 1) * 100)}%</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Color Picker */}
      {showColorPicker && value.type === 'solid' && (
        <div
          ref={pickerRef}
          className="sp-color-picker-popover"
          style={{
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`
          }}
        >
          <HexColorPicker
            color={value.color || '#000000'}
            onChange={handleColorChange}
          />
          <input
            type="text"
            value={value.color || '#000000'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="sp-color-hex-input"
            placeholder="#000000"
          />
        </div>
      )}
    </div>
  );
}
