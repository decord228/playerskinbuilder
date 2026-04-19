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
        <span className="ctx-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </span>
        <span className="ctx-label">Rename</span>
        <span className="ctx-shortcut">F2</span>
      </div>
      <div
        className={`ctx-item ${node.locked ? 'disabled' : ''}`}
        onClick={handleDuplicate}
      >
        <span className="ctx-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </span>
        <span className="ctx-label">Duplicate</span>
        <span className="ctx-shortcut">Ctrl+D</span>
      </div>
      <div className="ctx-separator" />
      <div
        className={`ctx-item danger ${node.locked ? 'disabled' : ''}`}
        onClick={handleDelete}
      >
        <span className="ctx-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </span>
        <span className="ctx-label">Delete</span>
        <span className="ctx-shortcut">Del</span>
      </div>
    </div>
  );
}
