import React, { useEffect, useState, useRef } from 'react';
import useStore from './store/useStore';
import Header from './components/Header';
import Outliner from './components/Outliner';
import FileBrowser from './components/FileBrowser';
import PropertiesPanel from './components/PropertiesPanel';
import Viewport from './components/Viewport';
import AddNodeDialog from './components/AddNodeDialog';
import GlobalDropZone from './components/GlobalDropZone';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { loadDefaultIcons } from './utils/defaultIcons';
import './App.css';

function App() {
  const { tree, loadDefaultScene, selectedNodeId, mode } = useStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const iconsLoadedRef = useRef(false);

  useKeyboardShortcuts();

  useEffect(() => {
    if (tree.length === 0) {
      loadDefaultScene();
    }
    if (!iconsLoadedRef.current) {
      iconsLoadedRef.current = true;
      loadDefaultIcons();
    }
  }, []);

  useEffect(() => {
    const resizeHorizontal = document.getElementById('resizeHorizontal');
    if (!resizeHorizontal) return;

    let isResizing = false;

    const handleMouseDown = (e: MouseEvent) => {
      isResizing = true;
      document.body.style.cursor = 'ns-resize';
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const topPanel = resizeHorizontal.previousElementSibling as HTMLElement;
      const bottomPanel = resizeHorizontal.nextElementSibling as HTMLElement;
      const container = topPanel.parentElement as HTMLElement;

      const containerRect = container.getBoundingClientRect();
      const newTopHeight = e.clientY - containerRect.top;
      const minHeight = 150;
      const maxHeight = containerRect.height - 100;

      const clampedHeight = Math.max(minHeight, Math.min(newTopHeight, maxHeight));

      topPanel.style.flex = `0 0 ${clampedHeight}px`;
      bottomPanel.style.flex = `1`;
    };

    const handleMouseUp = () => {
      isResizing = false;
      document.body.style.cursor = '';
    };

    resizeHorizontal.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      resizeHorizontal.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mode]);

  useEffect(() => {
    const resizeLeft = document.getElementById('resizeLeft');
    if (!resizeLeft) return;

    let isResizing = false;

    const handleMouseDown = (e: MouseEvent) => {
      isResizing = true;
      document.body.style.cursor = 'ew-resize';
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const leftPanel = resizeLeft.previousElementSibling as HTMLElement;
      const newWidth = e.clientX;
      const minWidth = 180;
      const maxWidth = 500;

      const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      leftPanel.style.width = `${clampedWidth}px`;
    };

    const handleMouseUp = () => {
      isResizing = false;
      document.body.style.cursor = '';
    };

    resizeLeft.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      resizeLeft.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mode]);

  const handleAddNode = () => {
    setShowAddDialog(true);
  };

  return (
    <div className="app">
      <Header />
      <div className="main">
        {mode === 'edit' && (
          <>
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
                <div className="ph-resize" id="resizeHorizontal"></div>
                <div className="ph-bottom">
                  <FileBrowser />
                </div>
              </div>
            </div>

            <div className="resv" id="resizeLeft"></div>
          </>
        )}

        <Viewport />

        {mode === 'edit' && (
          <>
            <div className="resv" id="resizeRight"></div>

            <div className="panel-right">
              <PropertiesPanel />
            </div>
          </>
        )}
      </div>

      <div className="statusbar">
        <div className="si">
          <span className="sdot"></span> Ready
        </div>
        <div className="si">Nodes: <span className="v">{tree.length}</span></div>
        <div className="si" style={{ marginLeft: 'auto' }}>
          <span style={{ color: 'var(--accent-dim)' }}>SkinBuilder React v1.7.3</span>
        </div>
      </div>

      <AddNodeDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        parentId={selectedNodeId}
      />

      <GlobalDropZone />
    </div>
  );
}

export default App;
