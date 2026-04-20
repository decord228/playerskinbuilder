import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { GradientData, GradientStop } from '../types/styles';
import './StylePanels.css';

interface GradientPickerProps {
  value: GradientData;
  onChange: (gradient: GradientData) => void;
}

export default function GradientPicker({ value, onChange }: GradientPickerProps) {
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const trackRef = useRef<HTMLDivElement>(null);
  const stopRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const pickerRef = useRef<HTMLDivElement>(null);

  const selectedStop = value.stops[selectedStopIndex];

  // Close picker when clicking outside
  useEffect(() => {
    if (!showColorPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        !Array.from(stopRefs.current.values()).some(ref => ref.contains(e.target as Node))
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  const handleStopClick = (index: number, event: React.MouseEvent) => {
    const stopElement = stopRefs.current.get(index);
    if (stopElement) {
      const rect = stopElement.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + 8,
        left: rect.left - 100 // Center the picker
      });
    }
    setSelectedStopIndex(index);
    setShowColorPicker(true);
  };

  const handleColorChange = (color: string) => {
    const newStops = [...value.stops];
    newStops[selectedStopIndex] = { ...newStops[selectedStopIndex], color };
    onChange({ ...value, stops: newStops });
  };

  const handleStopPositionChange = (index: number, position: number) => {
    const newStops = [...value.stops];
    newStops[index] = { ...newStops[index], position: Math.max(0, Math.min(100, position)) };
    onChange({ ...value, stops: newStops });
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;

    // Find color at this position by interpolating
    const sortedStops = [...value.stops].sort((a, b) => a.position - b.position);
    let color = sortedStops[0].color;

    for (let i = 0; i < sortedStops.length - 1; i++) {
      if (position >= sortedStops[i].position && position <= sortedStops[i + 1].position) {
        color = sortedStops[i].color;
        break;
      }
    }

    const newStop: GradientStop = { color, position };
    const newStops = [...value.stops, newStop];
    onChange({ ...value, stops: newStops });
    setSelectedStopIndex(newStops.length - 1);
  };

  const handleDeleteStop = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (value.stops.length <= 2) return;
    const newStops = value.stops.filter((_, i) => i !== index);
    onChange({ ...value, stops: newStops });
    setSelectedStopIndex(Math.max(0, index - 1));
    setShowColorPicker(false);
  };

  const handleAngleChange = (angle: number) => {
    onChange({ ...value, angle: Math.max(0, Math.min(360, angle)) });
  };

  const handleTypeChange = (type: 'linear' | 'radial') => {
    onChange({ ...value, type });
  };

  const gradientCss = value.stops
    .sort((a, b) => a.position - b.position)
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');

  const gradientPreview = value.type === 'linear'
    ? `linear-gradient(${value.angle}deg, ${gradientCss})`
    : `radial-gradient(circle, ${gradientCss})`;

  return (
    <div className="sp-gradient-compact">
      {/* Preview */}
      <div className="sp-gradient-preview" style={{ background: gradientPreview }} />

      {/* Controls Row */}
      <div className="sp-gradient-controls">
        <button
          className={`sp-gradient-type-btn ${value.type === 'linear' ? 'active' : ''}`}
          onClick={() => handleTypeChange('linear')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="4" x2="20" y2="20" />
          </svg>
          Linear
        </button>
        <button
          className={`sp-gradient-type-btn ${value.type === 'radial' ? 'active' : ''}`}
          onClick={() => handleTypeChange('radial')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8" />
          </svg>
          Radial
        </button>

        {value.type === 'linear' && (
          <div className="sp-gradient-angle">
            <input
              type="number"
              value={value.angle}
              onChange={(e) => handleAngleChange(Number(e.target.value))}
              min="0"
              max="360"
            />
            <span>°</span>
          </div>
        )}
      </div>

      {/* Gradient track with stops */}
      <div className="sp-gradient-track-container">
        <div
          ref={trackRef}
          className="sp-gradient-track"
          style={{ background: `linear-gradient(to right, ${gradientCss})` }}
          onClick={handleTrackClick}
        >
          {value.stops.map((stop, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) stopRefs.current.set(index, el);
              }}
              className={`sp-gradient-stop ${selectedStopIndex === index ? 'selected' : ''}`}
              style={{
                left: `${stop.position}%`,
                backgroundColor: stop.color
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleStopClick(index, e);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startPosition = stop.position;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  if (!trackRef.current) return;
                  const rect = trackRef.current.getBoundingClientRect();
                  const deltaX = moveEvent.clientX - startX;
                  const deltaPosition = (deltaX / rect.width) * 100;
                  handleStopPositionChange(index, startPosition + deltaPosition);
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              {value.stops.length > 2 && (
                <button
                  className="sp-gradient-stop-delete"
                  onClick={(e) => handleDeleteStop(index, e)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="sp-gradient-track-hint">Click track to add color stop</div>
      </div>

      {/* Floating Color Picker */}
      {showColorPicker && selectedStop && (
        <div
          ref={pickerRef}
          className="sp-color-picker-popover"
          style={{
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`
          }}
        >
          <HexColorPicker color={selectedStop.color} onChange={handleColorChange} />
          <input
            type="text"
            value={selectedStop.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="sp-color-hex-input"
            placeholder="#FFFFFF"
          />
        </div>
      )}
    </div>
  );
}
