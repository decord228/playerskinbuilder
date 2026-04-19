import React, { useState } from 'react';
import useStore from '../store/useStore';
import { getNodeType } from '../data/nodeTypes';
import { getTypeIcon, getUIIcon } from '../data/icons';
import ContextMenu from './ContextMenu';
import './Outliner.css';

export default function Outliner() {
  const { tree, selectedNodeId, selectNode, toggleNodeOpen, toggleNodeVisible, toggleNodeLocked, reorderNode, reparentNode } = useStore();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [dragOverId, setDragOverId] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const rootNodes = tree.filter(n => !n.pid);

  const isAncestorClosed = (nodeId) => {
    const node = tree.find(n => n.id === nodeId);
    if (!node || !node.pid) return false;

    let parent = tree.find(n => n.id === node.pid);
    while (parent) {
      if (!parent.open) return true;
      parent = tree.find(n => n.id === parent.pid);
    }
    return false;
  };

  const handleStartEdit = (node, e) => {
    e.stopPropagation();
    setEditingId(node.id);
    setEditValue(node.label);
  };

  const handleFinishEdit = (nodeId) => {
    if (editValue.trim()) {
      useStore.getState().updateNode(nodeId, { label: editValue.trim() });
    }
    setEditingId(null);
  };

  const handleDragStart = (e, node) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('nodeId', node.id);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDragOverId(null);
    setDragPosition(null);
  };

  const handleDragOver = (e, node) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const nodeType = getNodeType(node.type);

    // Determine drop position
    let position;
    if (y < height * 0.3) {
      position = 'before';
    } else if (y > height * 0.7) {
      position = 'after';
    } else if (nodeType.isC) {
      position = 'into';
    } else {
      position = y < height * 0.5 ? 'before' : 'after';
    }

    setDragOverId(node.id);
    setDragPosition(position);
  };

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setDragOverId(null);
      setDragPosition(null);
    }
  };

  const handleDrop = (e, targetNode) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('nodeId');

    if (!draggedId || draggedId === targetNode.id) {
      setDragOverId(null);
      setDragPosition(null);
      return;
    }

    if (dragPosition === 'into') {
      reparentNode(draggedId, targetNode.id);
    } else {
      reorderNode(draggedId, targetNode.id, dragPosition === 'before');
    }

    setDragOverId(null);
    setDragPosition(null);
  };

  const handleContextMenu = (e, node) => {
    e.preventDefault();
    selectNode(node.id);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId: node.id
    });
  };

  const renderNode = (node, depth = 0) => {
    if (isAncestorClosed(node.id)) return null;

    const nodeType = getNodeType(node.type);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = node.id === selectedNodeId;
    const isDragOver = dragOverId === node.id;

    let dragClass = '';
    if (isDragOver) {
      if (dragPosition === 'before') dragClass = 'drag-before';
      else if (dragPosition === 'after') dragClass = 'drag-after';
      else if (dragPosition === 'into') dragClass = 'drag-into';
    }

    return (
      <React.Fragment key={node.id}>
        <div
          className={`ti ${isSelected ? 'sel' : ''} ${dragClass}`}
          style={{ paddingLeft: `${depth * 14 + 2}px` }}
          onClick={() => selectNode(node.id)}
          onContextMenu={(e) => handleContextMenu(e, node)}
          draggable={!node.locked}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
        >
          <div
            className={`tt ${hasChildren ? (node.open ? 'open' : '') : 'leaf'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleNodeOpen(node.id);
            }}
            dangerouslySetInnerHTML={{ __html: hasChildren ? getUIIcon('chevron-right') : '' }}
          />
          <div
            className="ticon"
            dangerouslySetInnerHTML={{ __html: getTypeIcon(node.type) }}
          />
          {editingId === node.id ? (
            <input
              className="tlabel editing"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleFinishEdit(node.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishEdit(node.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              autoFocus
            />
          ) : (
            <div
              className="tlabel"
              onDoubleClick={(e) => handleStartEdit(node, e)}
            >
              {node.label}
            </div>
          )}
          <div
            className={`tlock ${node.locked ? 'on' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleNodeLocked(node.id);
            }}
            dangerouslySetInnerHTML={{ __html: getUIIcon(node.locked ? 'lock' : 'lock-open') }}
          />
          <div
            className={`tvis ${node.visible ? '' : 'off'}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleNodeVisible(node.id);
            }}
            dangerouslySetInnerHTML={{ __html: getUIIcon(node.visible ? 'eye' : 'eye-off') }}
          />
        </div>
        {node.open && node.children?.map(childId => {
          const child = tree.find(n => n.id === childId);
          return child ? renderNode(child, depth + 1) : null;
        })}
      </React.Fragment>
    );
  };

  return (
    <div className="outliner">
      {rootNodes.map(node => renderNode(node, 0))}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
