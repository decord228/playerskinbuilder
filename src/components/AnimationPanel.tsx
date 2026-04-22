import React, { useState } from 'react';
import './StylePanels.css';

interface AnimationSettings {
  hover_animation?: string;
  active_animation?: string;
  animation_duration?: string;
  hover_scale?: string;
  active_scale?: string;
  lift_distance?: string;
}

interface AnimationPanelProps {
  value: AnimationSettings;
  onChange: (settings: AnimationSettings) => void;
}

export default function AnimationPanel({ value, onChange }: AnimationPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const hoverAnimation = value.hover_animation || 'none';
  const activeAnimation = value.active_animation || 'none';
  const duration = parseFloat(value.animation_duration || '200');
  const hoverScale = parseFloat(value.hover_scale || '1.05');
  const activeScale = parseFloat(value.active_scale || '0.95');
  const liftDistance = parseFloat(value.lift_distance || '2');

  return (
    <div className="sp-panel">
      <div className="sp-header" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div className="sp-header-left">
          <span className="sp-header-title">Animation</span>
        </div>
        <div className="sp-header-right">
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{isOpen ? '▼' : '▶'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="sp-content">
          {/* Hover Animation */}
          <div className="sp-row">
            <label className="sp-label">hover animation</label>
            <select
              className="sp-select"
              value={hoverAnimation}
              onChange={(e) => onChange({ ...value, hover_animation: e.target.value })}
            >
              <option value="none">None</option>
              <option value="scale">Scale</option>
              <option value="lift">Lift</option>
              <option value="glow">Glow</option>
            </select>
          </div>

          {/* Active Animation */}
          <div className="sp-row">
            <label className="sp-label">active animation</label>
            <select
              className="sp-select"
              value={activeAnimation}
              onChange={(e) => onChange({ ...value, active_animation: e.target.value })}
            >
              <option value="none">None</option>
              <option value="scale">Scale</option>
              <option value="press">Press</option>
            </select>
          </div>

          {/* Duration */}
          <div className="sp-row">
            <label className="sp-label">duration (ms)</label>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={duration}
              onChange={(e) => onChange({ ...value, animation_duration: e.target.value })}
              className="sp-slider"
            />
            <span className="sp-value">{duration}</span>
          </div>

          {/* Hover Scale */}
          {hoverAnimation === 'scale' && (
            <div className="sp-row">
              <label className="sp-label">hover scale</label>
              <input
                type="range"
                min="1"
                max="1.2"
                step="0.01"
                value={hoverScale}
                onChange={(e) => onChange({ ...value, hover_scale: e.target.value })}
                className="sp-slider"
              />
              <span className="sp-value">{hoverScale.toFixed(2)}</span>
            </div>
          )}

          {/* Active Scale */}
          {activeAnimation === 'scale' && (
            <div className="sp-row">
              <label className="sp-label">active scale</label>
              <input
                type="range"
                min="0.8"
                max="1"
                step="0.01"
                value={activeScale}
                onChange={(e) => onChange({ ...value, active_scale: e.target.value })}
                className="sp-slider"
              />
              <span className="sp-value">{activeScale.toFixed(2)}</span>
            </div>
          )}

          {/* Lift Distance */}
          {hoverAnimation === 'lift' && (
            <div className="sp-row">
              <label className="sp-label">lift distance (px)</label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={liftDistance}
                onChange={(e) => onChange({ ...value, lift_distance: e.target.value })}
                className="sp-slider"
              />
              <span className="sp-value">{liftDistance}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
