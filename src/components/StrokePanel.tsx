import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import GradientPicker from './GradientPicker';
import type { StatefulStroke, StrokeStyle, GradientData } from '../types/styles';
import './StylePanels.css';

interface StrokePanelProps {
  value: StatefulStroke;
  onChange: (stroke: StatefulStroke) => void;
}

type StateType = 'normal' | 'hover' | 'active' | 'disabled';

export default function StrokePanel({ value, onChange }: StrokePanelProps) {
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

  // Get current state stroke or fallback to normal
  const currentStroke: StrokeStyle = value[activeState] || value.normal;

  const handleToggle = (enabled: boolean) => {
    onChange({
      ...value,
      [activeState]: { ...currentStroke, enabled }
    });
  };

  const handleTypeChange = (type: 'solid' | 'gradient') => {
    let newStroke: StrokeStyle;

    if (type === 'solid') {
      newStroke = {
        ...currentStroke,
        type: 'solid',
        color: currentStroke.color || '#000000',
        opacity: currentStroke.opacity || 1
      };
    } else {
      newStroke = {
        ...currentStroke,
        type: 'gradient',
        gradient: currentStroke.gradient || {
          type: 'linear',
          angle: 90,
          stops: [
            { color: '#ffffff', position: 0 },
            { color: '#000000', position: 100 }
          ]
        },
        opacity: currentStroke.opacity || 1
      };
    }

    onChange({
      ...value,
      [activeState]: newStroke
    });
  };

  const handleColorChange = (color: string) => {
    onChange({
      ...value,
      [activeState]: { ...currentStroke, color }
    });
  };

  const handleGradientChange = (gradient: GradientData) => {
    onChange({
      ...value,
      [activeState]: { ...currentStroke, gradient }
    });
  };

  const handleWidthChange = (width: number) => {
    onChange({
      ...value,
      [activeState]: { ...currentStroke, width }
    });
  };

  const handleOpacityChange = (opacity: number) => {
    onChange({
      ...value,
      [activeState]: { ...currentStroke, opacity }
    });
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

  return (
    <div className="style-panel">
      <div className="sp-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div className="sp-header-left">
          <span className="sp-header-title">Stroke</span>
        </div>
        <div className="sp-header-right">
          <label className="sp-toggle" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={currentStroke.enabled}
              onChange={(e) => handleToggle(e.target.checked)}
            />
            <span className="sp-toggle-slider"></span>
          </label>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginLeft: '8px' }}>{isOpen ? '▼' : '▶'}</span>
        </div>
      </div>

      {isOpen && currentStroke.enabled && (
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

          {/* Type */}
          <div className="sp-row">
            <span className="sp-label">Type</span>
            <div className="sp-segmented">
              <button
                className={currentStroke.type === 'solid' ? 'active' : ''}
                onClick={() => handleTypeChange('solid')}
              >
                Solid
              </button>
              <button
                className={currentStroke.type === 'gradient' ? 'active' : ''}
                onClick={() => handleTypeChange('gradient')}
              >
                Gradient
              </button>
            </div>
          </div>

          {/* Width */}
          <div className="sp-row">
            <span className="sp-label">Width</span>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={currentStroke.width || 1}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span className="sp-value">{currentStroke.width || 1}px</span>
          </div>

          {/* Solid Color */}
          {currentStroke.type === 'solid' && (
            <div className="sp-row">
              <span className="sp-label">Color</span>
              <div
                ref={colorPreviewRef}
                className="sp-color-preview"
                style={{ background: currentStroke.color || '#000000' }}
                onClick={handleColorPreviewClick}
              />
            </div>
          )}

          {/* Gradient */}
          {currentStroke.type === 'gradient' && currentStroke.gradient && (
            <div className="sp-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <GradientPicker
                value={currentStroke.gradient}
                onChange={handleGradientChange}
              />
            </div>
          )}

          {/* Opacity */}
          <div className="sp-row">
            <span className="sp-label">Opacity</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={currentStroke.opacity || 1}
              onChange={(e) => handleOpacityChange(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span className="sp-value">{Math.round((currentStroke.opacity || 1) * 100)}%</span>
          </div>
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
            color={currentStroke.color || '#000000'}
            onChange={handleColorChange}
          />
        </div>
      )}
    </div>
  );
}
