import type { TreeNode } from '../types';

export interface ProjectData {
  version: string;
  name: string;
  description: string;
  author: string;
  created: string;
  modified: string;
  tree: TreeNode[];
  nidCounter: number;
  assets: {
    name: string;
    path: string;
  }[];
}

export function exportProject(tree: TreeNode[], nidCounter: number, projectName = 'Untitled Project'): ProjectData {
  const now = new Date().toISOString();

  return {
    version: '1.0.0',
    name: projectName,
    description: 'VideoPlayer skin project',
    author: '',
    created: now,
    modified: now,
    tree,
    nidCounter,
    assets: []
  };
}

export function importProject(data: ProjectData): { tree: TreeNode[]; nidCounter: number } {
  return {
    tree: data.tree || [],
    nidCounter: data.nidCounter || 500
  };
}
