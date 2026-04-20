import type { NodeType, NodeTypeDefinition } from '../types';

// Inheritance hierarchy tree structure
export const NODE_HIERARCHY = {
  'Node': {
    children: ['Control']
  },
  'Control': {
    children: ['Container', 'Button', 'Label', 'ColorRect', 'HSlider', 'TextureRect', 'VideoStreamPlayer', 'Separator', 'CanvasLayer']
  },
  'Container': {
    children: ['HBoxContainer', 'VBoxContainer', 'PanelContainer', 'MarginContainer', 'AutoHideContainer']
  },
  'Button': {
    children: ['VolumeButton']
  }
};

// Inheritance hierarchy: Node -> Control -> specific types
export const NODE_INHERITANCE: Record<NodeType, string> = {
  'CanvasLayer': 'Control',
  'AutoHideContainer': 'Container',
  'MarginContainer': 'Container',
  'HBoxContainer': 'Container',
  'VBoxContainer': 'Container',
  'PanelContainer': 'Container',
  'ColorRect': 'Control',
  'Button': 'Control',
  'Label': 'Control',
  'HSlider': 'Control',
  'VolumeButton': 'Button',
  'TextureRect': 'Control',
  'VideoStreamPlayer': 'Control',
  'Separator': 'Control',
  'Control': 'Node',
};

export const NODE_TYPES: NodeTypeDefinition[] = [
  { type: 'CanvasLayer', icon: 'ic-canvas', isC: true, desc: 'Root canvas layer' },
  { type: 'AutoHideContainer', icon: 'ic-eye', isC: true, desc: 'Container with auto-hide in test mode' },
  { type: 'MarginContainer', icon: 'ic-margin', isC: true, desc: 'Adds inner margins' },
  { type: 'HBoxContainer', icon: 'ic-hbox', isC: true, desc: 'Horizontal layout' },
  { type: 'VBoxContainer', icon: 'ic-vbox', isC: true, desc: 'Vertical layout' },
  { type: 'PanelContainer', icon: 'ic-panel', isC: true, desc: 'Styled panel' },
  { type: 'ColorRect', icon: 'ic-palette', isC: false, desc: 'Color overlay/gradient' },
  { type: 'Button', icon: 'ic-ctrl', isC: false, desc: 'Clickable button' },
  { type: 'Label', icon: 'ic-label', isC: false, desc: 'Text label' },
  { type: 'HSlider', icon: 'ic-timer', isC: false, desc: 'Horizontal slider' },
  { type: 'VolumeButton', icon: 'ic-volume', isC: false, desc: 'Button with expandable volume slider' },
  { type: 'TextureRect', icon: 'ic-sprite', isC: false, desc: 'Image/texture' },
  { type: 'VideoStreamPlayer', icon: 'ic-video', isC: false, desc: 'Video stream' },
  { type: 'Separator', icon: 'ic-margin', isC: false, desc: 'Visual separator line' },
  { type: 'Control', icon: 'ic-ctrl', isC: false, desc: 'Base control' },
];

export function getNodeType(type: NodeType): NodeTypeDefinition {
  return NODE_TYPES.find(x => x.type === type) || NODE_TYPES[NODE_TYPES.length - 1];
}

export function isContainer(type: NodeType): boolean {
  const nt = getNodeType(type);
  return nt.isC;
}
