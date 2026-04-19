import React, { useState } from 'react';
import { assetManager } from '../store/assetStore';
import type { Asset, AssetFolder } from '../types/assets';
import SVGEditor from './SVGEditor';
import './FileBrowser.css';

export default function FileBrowser() {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');

  const loadData = () => {
    let folders = assetManager.listFolders(currentFolder);
    let assets = assetManager.getAssetsInFolder(currentFolder);

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      folders = folders.filter(f => f.name.toLowerCase().includes(query));
      assets = assets.filter(a => a.name.toLowerCase().includes(query));
    }

    // Sort
    const sortFn = (a: any, b: any) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return b.createdAt - a.createdAt;
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
      return 0;
    };

    folders.sort(sortFn);
    assets.sort(sortFn);

    return { folders, assets };
  };

  const [data, setData] = React.useState(loadData());

  React.useEffect(() => {
    setData(loadData());

    const handleAssetsUpdated = () => {
      setData(loadData());
    };

    window.addEventListener('assets-updated', handleAssetsUpdated);
    return () => {
      window.removeEventListener('assets-updated', handleAssetsUpdated);
    };
  }, [currentFolder, searchQuery, sortBy]);

  const handleFolderClick = (folder: AssetFolder) => {
    setCurrentFolder(folder.path);
    setSelectedItem(null);
  };

  const handleBackClick = () => {
    if (!currentFolder) return;
    const parts = currentFolder.split('/');
    parts.pop();
    setCurrentFolder(parts.length > 0 ? parts.join('/') : null);
    setSelectedItem(null);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    assetManager.createFolder(newFolderName.trim(), currentFolder);
    setNewFolderName('');
    setShowNewFolderDialog(false);
    setData(loadData());
    window.dispatchEvent(new CustomEvent('assets-updated'));
  };

  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm('Delete this folder and all its contents?')) {
      assetManager.deleteFolder(folderId);
      setData(loadData());
      window.dispatchEvent(new CustomEvent('assets-updated'));
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    if (window.confirm('Delete this file?')) {
      assetManager.deleteAsset(assetId);
      setData(loadData());
      if (selectedItem === assetId) {
        setSelectedItem(null);
      }
      window.dispatchEvent(new CustomEvent('assets-updated'));
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalItems = data.folders.length + data.assets.length;

  return (
    <div className="file-browser">
      <div className="fb-main">
        <div className="fb-header">
          <div className="fb-breadcrumb">
          <button
            className="fb-breadcrumb-item"
            onClick={() => setCurrentFolder(null)}
          >
            Files
          </button>
          {currentFolder && currentFolder.split('/').map((part, idx, arr) => (
            <React.Fragment key={idx}>
              <span className="fb-breadcrumb-sep">/</span>
              <button
                className="fb-breadcrumb-item"
                onClick={() => setCurrentFolder(arr.slice(0, idx + 1).join('/'))}
              >
                {part}
              </button>
            </React.Fragment>
          ))}
        </div>
        <button
          className="fb-new-folder-btn"
          onClick={() => setShowNewFolderDialog(true)}
          title="New Folder"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            <line x1="12" y1="11" x2="12" y2="17"/>
            <line x1="9" y1="14" x2="15" y2="14"/>
          </svg>
        </button>
      </div>

      <div className="fb-toolbar">
        <div className="fb-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="fb-toolbar-actions">
          <select
            className="fb-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="name">Name</option>
            <option value="date">Date</option>
            <option value="size">Size</option>
          </select>
          <button
            className={`fb-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
          <button
            className={`fb-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={`fb-list ${viewMode === 'grid' ? 'fb-grid' : ''}`}>
        {currentFolder && (
          <div className="fb-item fb-back" onClick={handleBackClick}>
            <div className="fb-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
            </div>
            <div className="fb-item-info">
              <div className="fb-item-name">..</div>
            </div>
          </div>
        )}

        {data.folders.map(folder => (
          <div
            key={folder.id}
            className={`fb-item fb-folder ${selectedItem === folder.id ? 'selected' : ''}`}
            onClick={() => setSelectedItem(folder.id)}
            onDoubleClick={() => handleFolderClick(folder)}
          >
            <div className="fb-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="fb-item-info">
              <div className="fb-item-name">{folder.name}</div>
            </div>
            <button
              className="fb-item-delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(folder.id);
              }}
              title="Delete folder"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        ))}

        {data.assets.map(asset => (
          <div
            key={asset.id}
            className={`fb-item ${selectedItem === asset.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedItem(asset.id);
              if (asset.type === 'svg') {
                assetManager.selectedAssetId = asset.id;
                window.dispatchEvent(new CustomEvent('asset-selected'));
              }
            }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('asset-id', asset.id);
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <div className="fb-item-preview">
              <img src={asset.data} alt={asset.name} />
            </div>
            <div className="fb-item-info">
              <div className="fb-item-name" title={asset.name}>{asset.name}</div>
              <div className="fb-item-meta">
                {formatSize(asset.size)} • {asset.type}
              </div>
            </div>
            <button
              className="fb-item-delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAsset(asset.id);
              }}
              title="Delete file"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        ))}

        {totalItems === 0 && !currentFolder && (
          <div className="fb-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
              <polyline points="13 2 13 9 20 9"/>
            </svg>
            <span>No files yet</span>
          </div>
        )}
      </div>

      {showNewFolderDialog && (
        <div className="fb-dialog-overlay" onClick={() => setShowNewFolderDialog(false)}>
          <div className="fb-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="fb-dialog-header">New Folder</div>
            <input
              type="text"
              className="fb-dialog-input"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') setShowNewFolderDialog(false);
              }}
              autoFocus
            />
            <div className="fb-dialog-actions">
              <button onClick={() => setShowNewFolderDialog(false)}>Cancel</button>
              <button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
