import React, { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId: string | null;
  onClose: () => void;
}

export default function ContextMenu({ x, y, nodeId, onClose }: ContextMenuProps) {
  const { deleteNode, duplicateNode, tree } = useStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!nodeId) return null;

  const node = tree.find(n => n.id === nodeId);
  if (!node) return null;

  const handleDuplicate = () => {
    if (!node.locked) {
      duplicateNode(nodeId);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!node.locked) {
      if (window.confirm(`Delete "${node.label}"?`)) {
        deleteNode(nodeId);
      }
    }
    onClose();
  };

  const handleRename = () => {
    // Trigger rename in outliner (F2 functionality)
    const event = new KeyboardEvent('keydown', { key: 'F2' });
    window.dispatchEvent(event);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="ctx-menu"
      style={{ left: x, top: y }}
    >
      <div className="ctx-item" onClick={handleRename}>
        <span className="ctx-icon">✏️</span>
        <span className="ctx-label">Rename</span>
        <span className="ctx-shortcut">F2</span>
      </div>
      <div
        className={`ctx-item ${node.locked ? 'disabled' : ''}`}
        onClick={handleDuplicate}
      >
        <span className="ctx-icon">📋</span>
        <span className="ctx-label">Duplicate</span>
        <span className="ctx-shortcut">Ctrl+D</span>
      </div>
      <div className="ctx-separator" />
      <div
        className={`ctx-item danger ${node.locked ? 'disabled' : ''}`}
        onClick={handleDelete}
      >
        <span className="ctx-icon">🗑️</span>
        <span className="ctx-label">Delete</span>
        <span className="ctx-shortcut">Del</span>
      </div>
    </div>
  );
}
