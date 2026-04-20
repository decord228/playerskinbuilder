import React from 'react';
import FillPanel from './FillPanel';
import StrokePanel from './StrokePanel';
import BorderRadiusPanel from './BorderRadiusPanel';
import EffectsPanel from './EffectsPanel';
import type { NodeStyle } from '../types/styles';
import { DEFAULT_STYLE } from '../types/styles';
import './StylePanels.css';

interface StyleTabProps {
  value: NodeStyle;
  onChange: (style: NodeStyle) => void;
}

export default function StyleTab({ value, onChange }: StyleTabProps) {
  // Ensure we have valid style object with defaults
  const style = {
    fill: value.fill || DEFAULT_STYLE.fill,
    stroke: value.stroke || DEFAULT_STYLE.stroke,
    borderRadius: value.borderRadius || DEFAULT_STYLE.borderRadius,
    effects: value.effects || DEFAULT_STYLE.effects
  };

  return (
    <div className="style-tab">
      <FillPanel
        value={style.fill}
        onChange={(fill) => onChange({ ...style, fill })}
      />

      <StrokePanel
        value={style.stroke}
        onChange={(stroke) => onChange({ ...style, stroke })}
      />

      <BorderRadiusPanel
        value={style.borderRadius}
        onChange={(borderRadius) => onChange({ ...style, borderRadius })}
      />

      <EffectsPanel
        value={style.effects}
        onChange={(effects) => onChange({ ...style, effects })}
      />
    </div>
  );
}
