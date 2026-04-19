import React, { useEffect, useState } from 'react';
import useStore from './store/useStore';
import Header from './components/Header';
import Outliner from './components/Outliner';
import PropertiesPanel from './components/PropertiesPanel';
import Viewport from './components/Viewport';
import AddNodeDialog from './components/AddNodeDialog';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './App.css';

function App() {
  const { tree, loadDefaultScene, selectedNodeId } = useStore();
  const [showAddDialog, setShowAddDialog] = useState(false);

  useKeyboardShortcuts();

  useEffect(() => {
    if (tree.length === 0) {
      loadDefaultScene();
    }
  }, []);

  const handleAddNode = () => {
    setShowAddDialog(true);
  };

  return (
    <div className="app">
      <Header />
      <div className="main">
        <div className="panel-left">
          <div className="ph">
            <div className="ph-top">
              <div className="tabbar">
                <div className="tab active">Scene</div>
                <div className="tab-actions">
                  <button className="ib" title="Add Node" onClick={handleAddNode}>+</button>
                </div>
              </div>
              <Outliner />
            </div>
          </div>
        </div>

        <div className="resv" id="resizeLeft"></div>

        <Viewport />

        <div className="resv" id="resizeRight"></div>

        <div className="panel-right">
          <PropertiesPanel />
        </div>
      </div>

      <div className="statusbar">
        <div className="si">
          <span className="sdot"></span> Ready
        </div>
        <div className="si">Nodes: <span className="v">{tree.length}</span></div>
        <div className="si" style={{ marginLeft: 'auto' }}>
          <span style={{ color: 'var(--accent-dim)' }}>SkinBuilder React 1.0</span>
        </div>
      </div>

      <AddNodeDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        parentId={selectedNodeId}
      />
    </div>
  );
}

export default App;
