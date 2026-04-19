import type { NodeType, NodeProps } from '../types';

export const NODE_TYPES = [
  { type: 'CanvasLayer', icon: 'layers', isContainer: true, desc: 'Root canvas layer' },
  { type: 'Control', icon: 'square', isContainer: false, desc: 'Base control node' },
  { type: 'Button', icon: 'circle', isContainer: false, desc: 'Interactive button' },
  { type: 'Label', icon: 'type', isContainer: false, desc: 'Text label' },
  { type: 'HBoxContainer', icon: 'columns', isContainer: true, desc: 'Horizontal box container' },
  { type: 'VBoxContainer', icon: 'rows', isContainer: true, desc: 'Vertical box container' },
  { type: 'MarginContainer', icon: 'maximize', isContainer: true, desc: 'Container with margins' },
  { type: 'PanelContainer', icon: 'square', isContainer: true, desc: 'Panel with background' },
  { type: 'HSlider', icon: 'sliders', isContainer: false, desc: 'Horizontal slider' },
  { type: 'VolumeButton', icon: 'volume-2', isContainer: false, desc: 'Button with expandable volume slider' },
  { type: 'ColorRect', icon: 'square', isContainer: false, desc: 'Colored rectangle with gradient support' },
  { type: 'TextureRect', icon: 'image', isContainer: false, desc: 'Image/texture display' },
  { type: 'VideoStreamPlayer', icon: 'video', isContainer: false, desc: 'Video player' },
  { type: 'AutoHideContainer', icon: 'eye-off', isContainer: true, desc: 'Auto-hiding container' }
];

export const getNodeType = (type: NodeType) => NODE_TYPES.find(t => t.type === type);

export const getDefaultProps = (type: NodeType): NodeProps => {
  const base = {
    visible: 'true',
    offset_left: '0',
    offset_top: '0',
    offset_right: '0',
    offset_bottom: '0',
    custom_minimum_size: '(0,0)',
    modulate: '#ffffff'
  };

  const defaults = {
    Button: {
      ...base,
      anchor_left: '0.5',
      anchor_top: '0.5',
      anchor_right: '0.5',
      anchor_bottom: '0.5',
      text: 'Button',
      bg_color: 'rgba(255,255,255,0.1)',
      hover_bg_color: 'rgba(255,255,255,0.2)',
      border_radius: '100',
      font_color: '#ffffff',
      font_size: '15',
      custom_minimum_size: '(200,54)'
    },
    VolumeButton: {
      ...base,
      anchor_left: '0.5',
      anchor_top: '0.5',
      anchor_right: '0.5',
      anchor_bottom: '0.5',
      bg_color: 'rgba(255,255,255,0.1)',
      hover_bg_color: 'rgba(255,255,255,0.18)',
      border_radius: '100',
      font_color: '#ffffff',
      icon: 'volume-2',
      button_size: '54',
      value: '65',
      slider_width: '200',
      custom_minimum_size: '(273,54)'
    }
  };

  return defaults[type] || base;
};
