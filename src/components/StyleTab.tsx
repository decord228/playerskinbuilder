import React from 'react';
import FillPanel from './FillPanel';
import StrokePanel from './StrokePanel';
import BorderRadiusPanel from './BorderRadiusPanel';
import EffectsPanel from './EffectsPanel';
import AnimationPanel from './AnimationPanel';
import TypographyPanel from './TypographyPanel';
import type { NodeStyle, FillStyle, StrokeStyle, EffectsStyle, StatefulFill, StatefulStroke, StatefulEffects } from '../types/styles';
import { DEFAULT_STYLE } from '../types/styles';
import './StylePanels.css';

interface StyleTabProps {
  value: NodeStyle;
  onChange: (style: NodeStyle) => void;
  nodeProps?: any;
  onPropsChange?: (props: any) => void;
  nodeType?: string;
}

// Helper to migrate old FillStyle to StatefulFill
function migrateFill(fill: any): StatefulFill {
  // If already stateful, return as is
  if (fill && fill.normal) {
    return fill as StatefulFill;
  }
  // Migrate old format to new format
  return {
    normal: fill || DEFAULT_STYLE.fill.normal
  };
}

// Helper to migrate old StrokeStyle to StatefulStroke
function migrateStroke(stroke: any): StatefulStroke {
  // If already stateful, return as is
  if (stroke && stroke.normal) {
    return stroke as StatefulStroke;
  }
  // Migrate old format to new format
  return {
    normal: stroke || DEFAULT_STYLE.stroke.normal
  };
}

// Helper to migrate old EffectsStyle to StatefulEffects
function migrateEffects(effects: any): StatefulEffects {
  // If already stateful, return as is
  if (effects && effects.normal) {
    return effects as StatefulEffects;
  }
  // Migrate old format to new format
  return {
    normal: effects || DEFAULT_STYLE.effects.normal
  };
}

export default function StyleTab({ value, onChange, nodeProps = {}, onPropsChange, nodeType }: StyleTabProps) {
  // Migrate old format to new format
  const style = {
    fill: migrateFill(value.fill),
    stroke: migrateStroke(value.stroke),
    borderRadius: value.borderRadius || DEFAULT_STYLE.borderRadius,
    effects: migrateEffects(value.effects)
  };

  const handlePropsChange = (newProps: any) => {
    if (onPropsChange) {
      onPropsChange({ ...nodeProps, ...newProps });
    }
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

      {nodeType === 'Button' && (
        <>
          <AnimationPanel
            value={{
              hover_animation: nodeProps.hover_animation,
              active_animation: nodeProps.active_animation,
              animation_duration: nodeProps.animation_duration,
              hover_scale: nodeProps.hover_scale,
              active_scale: nodeProps.active_scale,
              lift_distance: nodeProps.lift_distance,
            }}
            onChange={handlePropsChange}
          />

          <TypographyPanel
            value={{
              font_color: nodeProps.font_color,
              disabled_font_color: nodeProps.disabled_font_color,
              font_size: nodeProps.font_size,
              font_family: nodeProps.font_family,
              font_weight: nodeProps.font_weight,
            }}
            onChange={handlePropsChange}
          />
        </>
      )}
    </div>
  );
}
