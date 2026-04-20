// Gradient color stop
export interface GradientStop {
  color: string;
  position: number; // 0-100
}

// Gradient data
export interface GradientData {
  type: 'linear' | 'radial';
  angle: number; // 0-360 for linear
  stops: GradientStop[];
}

// Fill configuration
export interface FillStyle {
  type: 'none' | 'solid' | 'gradient';
  color?: string; // For solid fill
  gradient?: GradientData; // For gradient fill
  opacity?: number; // 0-1
}

// Stroke configuration
export interface StrokeStyle {
  enabled: boolean;
  type: 'solid' | 'gradient';
  color?: string; // For solid stroke
  gradient?: GradientData; // For gradient stroke
  width: number; // px
  opacity?: number; // 0-1
}

// Border radius configuration
export interface BorderRadiusStyle {
  linked: boolean; // If true, all corners use same value
  all?: number; // Used when linked=true
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
}

// Shadow configuration
export interface ShadowStyle {
  id: string;
  type: 'inner' | 'drop';
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number; // 0-1
}

// Effects configuration
export interface EffectsStyle {
  backgroundBlur: number; // px
  shadows: ShadowStyle[];
}

// Complete style configuration
export interface NodeStyle {
  fill: FillStyle;
  stroke: StrokeStyle;
  borderRadius: BorderRadiusStyle;
  effects: EffectsStyle;
}

// Default values
export const DEFAULT_FILL: FillStyle = {
  type: 'solid',
  color: 'rgba(255,255,255,0.1)',
  opacity: 1
};

export const DEFAULT_STROKE: StrokeStyle = {
  enabled: false,
  type: 'solid',
  color: '#ffffff',
  width: 1,
  opacity: 1
};

export const DEFAULT_BORDER_RADIUS: BorderRadiusStyle = {
  linked: true,
  all: 0
};

export const DEFAULT_EFFECTS: EffectsStyle = {
  backgroundBlur: 0,
  shadows: []
};

export const DEFAULT_STYLE: NodeStyle = {
  fill: DEFAULT_FILL,
  stroke: DEFAULT_STROKE,
  borderRadius: DEFAULT_BORDER_RADIUS,
  effects: DEFAULT_EFFECTS
};

// Helper functions
export function gradientToCss(gradient: GradientData): string {
  const stops = gradient.stops
    .sort((a, b) => a.position - b.position)
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');

  if (gradient.type === 'linear') {
    return `linear-gradient(${gradient.angle}deg, ${stops})`;
  } else {
    return `radial-gradient(circle, ${stops})`;
  }
}

export function shadowToCss(shadow: ShadowStyle): string {
  const inset = shadow.type === 'inner' ? 'inset ' : '';
  const rgba = shadow.color.startsWith('rgba')
    ? shadow.color
    : `${shadow.color}${Math.round(shadow.opacity * 255).toString(16).padStart(2, '0')}`;

  return `${inset}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${rgba}`;
}

export function borderRadiusToCss(radius: BorderRadiusStyle): string {
  if (radius.linked && radius.all !== undefined) {
    return `${radius.all}px`;
  }

  const tl = radius.topLeft || 0;
  const tr = radius.topRight || 0;
  const br = radius.bottomRight || 0;
  const bl = radius.bottomLeft || 0;

  return `${tl}px ${tr}px ${br}px ${bl}px`;
}
