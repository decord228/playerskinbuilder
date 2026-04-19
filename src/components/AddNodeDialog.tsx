import React, { useState } from 'react';
import { NODE_TYPES, NODE_INHERITANCE, NODE_HIERARCHY } from '../data/nodeTypes';
import { getTypeIcon } from '../data/icons';
import useStore from '../store/useStore';
import type { NodeType } from '../types';
import './AddNodeDialog.css';

interface AddNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string | null;
}

export default function AddNodeDialog({ isOpen, onClose, parentId }: AddNodeDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<NodeType | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('tree');
  const { createNode } = useStore();

  if (!isOpen) return null;

  const filteredTypes = NODE_TYPES.filter(nt =>
    nt.type.toLowerCase().includes(search.toLowerCase()) ||
    nt.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (selectedType) {
      createNode(selectedType, selectedType, parentId);
      onClose();
      setSearch('');
      setSelectedType(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedType) {
      handleAdd();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const renderTreeNode = (nodeName: string, depth: number = 0): React.ReactNode => {
    const nodeType = NODE_TYPES.find(nt => nt.type === nodeName);
    const hierarchy = NODE_HIERARCHY[nodeName];
    const isSelectable = nodeType !== undefined;
    const isSelected = selectedType === nodeName;

    return (
      <div key={nodeName} style={{ marginLeft: `${depth * 8}px` }}>
        <div
          className={`tree-node ${isSelectable ? 'selectable' : 'parent'} ${isSelected ? 'selected' : ''}`}
          onClick={() => isSelectable && setSelectedType(nodeName as NodeType)}
          onDoubleClick={() => isSelectable && handleAdd()}
        >
          {hierarchy?.children && <span className="tree-arrow">▸</span>}
          {isSelectable && (
            <div
              className="tree-icon"
              dangerouslySetInnerHTML={{ __html: getTypeIcon(nodeName as NodeType) }}
            />
          )}
          <div className="tree-info">
            <span className="tree-label">{nodeName}</span>
            {nodeType?.desc && <span className="tree-desc">{nodeType.desc}</span>}
          </div>
          {nodeType?.isC && <span className="tree-badge">C</span>}
        </div>
        {hierarchy?.children && (
          <div className="tree-children">
            {hierarchy.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dlg-hdr">
          <span className="dlg-title">Add Node</span>
          <div className="dlg-tabs">
            <button
              className={`dlg-tab ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
            >
              Tree
            </button>
            <button
              className={`dlg-tab ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          <button className="dlg-x" onClick={onClose}>✕</button>
        </div>
        {viewMode === 'list' && (
          <div className="dlg-search">
            <input
              type="text"
              placeholder="Search node types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        )}
        {viewMode === 'list' ? (
          <div className="dlg-list">
            {filteredTypes.map(nt => (
            <div
              key={nt.type}
              className={`dlg-item ${selectedType === nt.type ? 'selected' : ''}`}
              onClick={() => setSelectedType(nt.type)}
              onDoubleClick={handleAdd}
            >
              <div
                className="dlg-icon"
                dangerouslySetInnerHTML={{ __html: getTypeIcon(nt.type) }}
              />
              <div className="dlg-info">
                <div className="dlg-name">{nt.type}</div>
                <div className="dlg-desc">{nt.desc}</div>
                <div className="dlg-inherit">Inherits: {NODE_INHERITANCE[nt.type]}</div>
              </div>
              {nt.isC && <span className="dlg-badge">Container</span>}
            </div>
          ))}
        </div>
        ) : (
          <div className="dlg-tree">
            {renderTreeNode('Node', 0)}
          </div>
        )}
        <div className="dlg-foot">
          <button className="btns" onClick={onClose}>Cancel</button>
          <button
            className="btnp"
            onClick={handleAdd}
            disabled={!selectedType}
          >
            Add Node
          </button>
        </div>
      </div>
    </div>
  );
}
