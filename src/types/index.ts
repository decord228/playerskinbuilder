// Node types
export type NodeType =
  | 'CanvasLayer'
  | 'AutoHideContainer'
  | 'MarginContainer'
  | 'HBoxContainer'
  | 'VBoxContainer'
  | 'PanelContainer'
  | 'ColorRect'
  | 'Button'
  | 'Label'
  | 'HSlider'
  | 'VolumeButton'
  | 'TextureRect'
  | 'VideoStreamPlayer'
  | 'Separator'
  | 'Control';

export interface NodeTypeDefinition {
  type: NodeType;
  icon: string;
  isC: boolean;
  desc: string;
}

export interface NodeProps {
  [key: string]: string;
}

export interface TreeNode {
  id: string;
  label: string;
  type: NodeType;
  pid: string | null;
  children: string[];
  open: boolean;
  visible: boolean;
  locked: boolean;
  props: NodeProps;
}

// Property system types
export type PropertyFieldType =
  | 'text'
  | 'bool'
  | 'color'
  | 'select'
  | 'slider'
  | 'size_flags'
  | 'anchor'
  | 'margin_preview'
  | 'gradient_editor'
  | 'icon_picker'
  | 'svg_picker'
  | 'button_mode_switch';

export interface PropertyField {
  key?: string;
  label?: string;
  type: PropertyFieldType;
  def?: string;
  opts?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface PropertySection {
  name: string;
  icon?: string;
  fields: PropertyField[];
}

// Store types
export interface StoreState {
  tree: TreeNode[];
  selectedNodeId: string | null;
  mode: 'edit' | 'test';
  zoom: number;
  pan: { x: number; y: number };
  showContainerOverlays: boolean;
  tool: 'select' | 'move';
  nidCounter: number;
}

export interface StoreActions {
  addNode: (node: TreeNode) => void;
  createNode: (type: NodeType, label: string, parentId: string | null) => void;
  updateNode: (id: string, updates: Partial<TreeNode>) => void;
  updateNodeProps: (id: string, props: Partial<NodeProps>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  toggleNodeOpen: (id: string) => void;
  toggleNodeVisible: (id: string) => void;
  toggleNodeLocked: (id: string) => void;
  moveNode: (nodeId: string, newParentId: string, index?: number) => void;
  reorderNode: (dragId: string, targetId: string, before: boolean) => void;
  reparentNode: (dragId: string, newParentId: string) => void;
  setMode: (mode: 'edit' | 'test') => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setTool: (tool: 'select' | 'move') => void;
  toggleContainerOverlays: () => void;
  getNode: (id: string) => TreeNode | undefined;
  getRootNodes: () => TreeNode[];
  getChildren: (id: string) => TreeNode[];
  getSelectedNode: () => TreeNode | null;
  loadDefaultScene: () => void;
  resetScene: () => void;
  clearSelection: () => void;
  exportProject: () => ProjectData;
  importProject: (projectData: ProjectData) => void;
}

export type Store = StoreState & StoreActions;

// Project data format
export interface ProjectData {
  version: string;
  name: string;
  description: string;
  author: string;
  created: string;
  modified: string;
  tree: TreeNode[];
  nidCounter: number;
}

// Re-export asset types
export type { Asset, AssetStore } from './assets';

// Context menu types
export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}
