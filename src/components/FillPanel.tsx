import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import GradientPicker from './GradientPicker';
import type { FillStyle, GradientData } from '../types/styles';
import './StylePanels.css';

interface FillPanelProps {
  value: FillStyle;
  onChange: (fill: FillStyle) => void;
}

export default function FillPanel({ value, onChange }: FillPanelProps) {
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

  const handleTypeChange = (type: 'none' | 'solid' | 'gradient') => {
    if (type === 'none') {
      onChange({ type: 'none', enabled: false });
    } else if (type === 'solid') {
      onChange({
        type: 'solid',
        enabled: true,
        color: value.color || '#ffffff',
        opacity: value.opacity || 1
      });
    } else {
      onChange({
        type: 'gradient',
        enabled: true,
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
          <span className="sp-header-title">Fill</span>
        </div>
      </div>

      <div className="sp-content">
        {/* Type selector */}
        <div className="sp-type-selector">
          <button
            className={value.type === 'none' ? 'active' : ''}
            onClick={() => handleTypeChange('none')}
          >
            None
          </button>
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

        {/* Solid color picker */}
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
                value={value.color || '#ffffff'}
                onChange={(e) => handleColorChange(e.target.value)}
                className="sp-color-input"
                placeholder="#FFFFFF"
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

        {/* Gradient picker */}
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
            color={value.color || '#ffffff'}
            onChange={handleColorChange}
          />
          <input
            type="text"
            value={value.color || '#ffffff'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="sp-color-hex-input"
            placeholder="#FFFFFF"
          />
        </div>
      )}
    </div>
  );
}
