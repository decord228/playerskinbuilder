import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import GradientPicker from './GradientPicker';
import type { StatefulFill, FillStyle, GradientData } from '../types/styles';
import './StylePanels.css';

interface FillPanelProps {
  value: StatefulFill;
  onChange: (fill: StatefulFill) => void;
}

type StateType = 'normal' | 'hover' | 'active' | 'disabled';

export default function FillPanel({ value, onChange }: FillPanelProps) {
  const [activeState, setActiveState] = useState<StateType>('normal');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const [isOpen, setIsOpen] = useState(true);
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

  // Get current state fill or fallback to normal
  const currentFill: FillStyle = value[activeState] || value.normal;

  const handleTypeChange = (type: 'none' | 'solid' | 'gradient') => {
    let newFill: FillStyle;

    if (type === 'none') {
      newFill = { type: 'none', enabled: false };
    } else if (type === 'solid') {
      newFill = {
        type: 'solid',
        enabled: true,
        color: currentFill.color || '#ffffff',
        opacity: currentFill.opacity || 1
      };
    } else {
      newFill = {
        type: 'gradient',
        enabled: true,
        gradient: currentFill.gradient || {
          type: 'linear',
          angle: 90,
          stops: [
            { color: '#ffffff', position: 0 },
            { color: '#000000', position: 100 }
          ]
        },
        opacity: currentFill.opacity || 1
      };
    }

    onChange({
      ...value,
      [activeState]: newFill
    });
  };

  const handleColorChange = (color: string) => {
    onChange({
      ...value,
      [activeState]: { ...currentFill, color }
    });
  };

  const handleGradientChange = (gradient: GradientData) => {
    onChange({
      ...value,
      [activeState]: { ...currentFill, gradient }
    });
  };

  const handleOpacityChange = (opacity: number) => {
    onChange({
      ...value,
      [activeState]: { ...currentFill, opacity }
    });
  };

  const handleColorPreviewClick = () => {
    if (colorPreviewRef.current) {
      const rect = colorPreviewRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
      setShowColorPicker(true);
    }
  };

  const handleStateChange = (state: StateType) => {
    setActiveState(state);
  };

  const handleClearState = () => {
    if (activeState === 'normal') return; // Can't clear normal state

    const newValue = { ...value };
    delete newValue[activeState];
    onChange(newValue);
    setActiveState('normal');
  };

  return (
    <div className="style-panel">
      <div className="sp-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div className="sp-header-left">
          <span className="sp-header-title">Fill</span>
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

        {/* Fill Type */}
        <div className="sp-row">
          <span className="sp-label">Type</span>
          <div className="sp-segmented">
            <button
              className={currentFill.type === 'none' ? 'active' : ''}
              onClick={() => handleTypeChange('none')}
            >
              None
            </button>
            <button
              className={currentFill.type === 'solid' ? 'active' : ''}
              onClick={() => handleTypeChange('solid')}
            >
              Solid
            </button>
            <button
              className={currentFill.type === 'gradient' ? 'active' : ''}
              onClick={() => handleTypeChange('gradient')}
            >
              Gradient
            </button>
          </div>
        </div>

        {/* Solid Color */}
        {currentFill.type === 'solid' && (
          <div className="sp-row">
            <span className="sp-label">Color</span>
            <div
              ref={colorPreviewRef}
              className="sp-color-preview"
              style={{ background: currentFill.color || '#ffffff' }}
              onClick={handleColorPreviewClick}
            />
          </div>
        )}

        {/* Gradient */}
        {currentFill.type === 'gradient' && currentFill.gradient && (
          <div className="sp-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <GradientPicker
              value={currentFill.gradient}
              onChange={handleGradientChange}
            />
          </div>
        )}

        {/* Opacity */}
        {currentFill.type !== 'none' && (
          <div className="sp-row">
            <span className="sp-label">Opacity</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={currentFill.opacity || 1}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <span className="sp-value">{Math.round((currentFill.opacity || 1) * 100)}%</span>
          </div>
        )}
      </div>
      )}

      {showColorPicker && (
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
            color={currentFill.color || '#ffffff'}
            onChange={handleColorChange}
          />
        </div>
      )}
    </div>
  );
}
