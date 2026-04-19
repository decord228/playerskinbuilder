import React from 'react';
import useStore from '../store/useStore';
import './Header.css';

export default function Header() {
  const { mode, setMode, loadDefaultScene, resetScene } = useStore();

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

  return (
    <div className="header">
      <div className="logo">
        SKIN<span>BUILDER</span>
      </div>
      <div className="hsep" />
      <div className="hmenu">
        <button onClick={handleNew}>New</button>
        <button onClick={handleReset}>Reset</button>
        <button>Save</button>
        <button>Load</button>
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
