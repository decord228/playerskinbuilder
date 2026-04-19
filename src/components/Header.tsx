import React, { useRef } from 'react';
import useStore from '../store/useStore';
import { assetManager } from '../store/assetStore';
import './Header.css';

export default function Header() {
  const { mode, setMode, loadDefaultScene, resetScene, tree, nidCounter } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    if (window.confirm('Reset to default scene? All changes will be lost.')) {
      loadDefaultScene();
    }
  };

  const handleNew = () => {
    if (window.confirm('Create new empty scene? All changes will be lost.')) {
      resetScene();
    }
  };

  const handleExport = () => {
    const projectData = {
      version: '1.0',
      tree,
      nidCounter,
      assets: assetManager.listAssets()
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skin_${Date.now()}.skinbuilder`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const projectData = JSON.parse(text);

      if (!projectData.tree || !Array.isArray(projectData.tree)) {
        alert('Invalid project file');
        return;
      }

      // Clear existing assets
      assetManager.clearAll();

      // Import assets
      if (projectData.assets && Array.isArray(projectData.assets)) {
        projectData.assets.forEach((asset: any) => {
          // Manually add to asset store
          const store = (assetManager as any).store;
          store.assets[asset.id] = asset;
        });
        (assetManager as any).saveToStorage();
      }

      // Load tree
      useStore.setState({
        tree: projectData.tree,
        nidCounter: projectData.nidCounter || 500,
        selectedNodeId: null
      });

      alert('Project loaded successfully!');
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project file');
    }

    // Reset input
    e.target.value = '';
  };

  return (
    <div className="header">
      <div className="logo">
        SKIN<span>BUILDER</span>
      </div>
      <div className="hsep" />
      <div className="hmenu">
        <button onClick={handleNew}>New</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleExport}>Save</button>
        <button onClick={handleImport}>Load</button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".skinbuilder,.json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
      <div className="hsep" />
      <div className="hmenu">
        <button
          className={`tab-btn ${mode === 'edit' ? 'active' : ''}`}
          onClick={() => setMode('edit')}
        >
          Edit
        </button>
        <button
          className={`tab-btn ${mode === 'test' ? 'active' : ''}`}
          onClick={() => setMode('test')}
        >
          Test
        </button>
      </div>
      <div className="hright">
        <div className="pbg">
          <button className="pb">⚙</button>
          <button className="pb">?</button>
        </div>
      </div>
    </div>
  );
}
