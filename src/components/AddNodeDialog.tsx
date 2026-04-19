import React, { useState } from 'react';
import { NODE_TYPES } from '../data/nodeTypes';
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

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dlg-hdr">
          <span className="dlg-title">Add Node</span>
          <button className="dlg-x" onClick={onClose}>✕</button>
        </div>
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
              </div>
              {nt.isC && <span className="dlg-badge">Container</span>}
            </div>
          ))}
        </div>
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
