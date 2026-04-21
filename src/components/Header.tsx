import React, { useState } from 'react';
import useStore from '../store/useStore';
import { useProjectStore } from '../store/useProjectStore';
import ProjectManager from './ProjectManager';
import './Header.css';

export default function Header() {
  const { mode, setMode } = useStore();
  const { currentProjectName } = useProjectStore();
  const [showProjectManager, setShowProjectManager] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Reset scene to default? This will replace all nodes with the default scene.')) {
      return;
    }

    try {
      const response = await fetch('/default_project/project.json');
      const defaultProject = await response.json();
      useStore.getState().importProject(defaultProject);
      console.log('✓ Scene reset to defaults');
    } catch (error) {
      console.error('Failed to reset scene:', error);
      alert('Failed to reset scene');
    }
  };

  return (
    <div className="header">
      <div className="logo">
        SKIN<span>BUILDER</span>
      </div>
      <div className="hsep" />
      <div className="hmenu">
        <button onClick={() => setShowProjectManager(true)}>Projects</button>
        <button onClick={handleReset}>Reset</button>
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
        <button
          className={`tab-btn ${mode === 'svg-edit' ? 'active' : ''}`}
          onClick={() => setMode('svg-edit')}
        >
          SVG Edit
        </button>
      </div>
      <div className="hright">
        <div className="pbg">
          <button className="pb">⚙</button>
          <button className="pb">?</button>
        </div>
      </div>

      <ProjectManager isOpen={showProjectManager} onClose={() => setShowProjectManager(false)} />
    </div>
  );
}
