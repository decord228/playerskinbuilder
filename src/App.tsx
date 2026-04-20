import React, { useEffect, useState, useRef } from 'react';
import useStore from './store/useStore';
import { useProjectStore } from './store/useProjectStore';
import Header from './components/Header';
import Outliner from './components/Outliner';
import FileBrowser from './components/FileBrowser';
import PropertiesPanel from './components/PropertiesPanel';
import Viewport from './components/Viewport';
import AddNodeDialog from './components/AddNodeDialog';
import ProjectManager from './components/ProjectManager';
import GlobalDropZone from './components/GlobalDropZone';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useProjectFileWatcher } from './hooks/useProjectFileWatcher';
import { useAutoSave } from './hooks/useAutoSave';
import { useFileWatcher } from './hooks/useFileWatcher';
import './App.css';

function App() {
  const { tree, importProject, selectedNodeId, mode } = useStore();
  const { isSaving, lastSaved, currentProjectName, currentProjectId, initStorage, projects, openProject } = useProjectStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const projectLoadedRef = useRef(false);

  useKeyboardShortcuts();
  useProjectFileWatcher();
  useAutoSave();
  useFileWatcher();

  // Expose store to window for debugging
  useEffect(() => {
    (window as any).__STORE__ = useStore.getState();
  }, []);

  useEffect(() => {
    if (!projectLoadedRef.current) {
      projectLoadedRef.current = true;

      // Initialize storage and check if we have any projects
      initStorage().then(() => {
        // Try to restore last opened project
        const lastProjectId = localStorage.getItem('current-project-id');

        if (lastProjectId) {
          // Try to open last project
          openProject(lastProjectId).catch(() => {
            // If failed, show project manager
            if (projects.length === 0) {
              useStore.setState({ tree: [] });
              setShowProjectManager(true);
            }
          });
        } else if (projects.length === 0 && !currentProjectId) {
          // No projects exist - clear tree and show project manager
          useStore.setState({ tree: [] });
          setShowProjectManager(true);
        }
      });
    }
  }, []);

  useEffect(() => {
    const resizeHorizontal = document.getElementById('resizeHorizontal');
    if (!resizeHorizontal) return;

    // Load saved horizontal split position
    const savedFlex = localStorage.getItem('ui-horizontal-split-flex');
    if (savedFlex) {
      requestAnimationFrame(() => {
        const topPanel = resizeHorizontal.previousElementSibling as HTMLElement;
        if (topPanel) {
          topPanel.style.flex = savedFlex;
        }
      });
    }

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
      if (isResizing) {
        const topPanel = resizeHorizontal.previousElementSibling as HTMLElement;
        const bottomPanel = resizeHorizontal.nextElementSibling as HTMLElement;
        const topFlex = topPanel.style.flex;
        const bottomFlex = bottomPanel.style.flex;
        localStorage.setItem('ui-horizontal-split-flex', topFlex);
        localStorage.setItem('ui-ph-bottom-flex', bottomFlex);
      }
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

    // Load saved left panel width
    const savedLeftWidth = localStorage.getItem('ui-left-panel-width');
    if (savedLeftWidth) {
      const leftPanel = resizeLeft.previousElementSibling as HTMLElement;
      if (leftPanel) {
        leftPanel.style.width = `${savedLeftWidth}px`;
      }
    }

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
      if (isResizing) {
        const leftPanel = resizeLeft.previousElementSibling as HTMLElement;
        const width = leftPanel.getBoundingClientRect().width;
        localStorage.setItem('ui-left-panel-width', width.toString());
      }
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

  useEffect(() => {
    const resizeRight = document.getElementById('resizeRight');
    if (!resizeRight) return;

    // Load saved right panel width
    const savedRightWidth = localStorage.getItem('ui-right-panel-width');
    if (savedRightWidth) {
      const rightPanel = resizeRight.nextElementSibling as HTMLElement;
      if (rightPanel) {
        rightPanel.style.width = `${savedRightWidth}px`;
      }
    }

    let isResizing = false;

    const handleMouseDown = (e: MouseEvent) => {
      isResizing = true;
      document.body.style.cursor = 'ew-resize';
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const rightPanel = resizeRight.nextElementSibling as HTMLElement;
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 250;
      const maxWidth = 600;

      const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      rightPanel.style.width = `${clampedWidth}px`;
    };

    const handleMouseUp = () => {
      if (isResizing) {
        const rightPanel = resizeRight.nextElementSibling as HTMLElement;
        const width = rightPanel.getBoundingClientRect().width;
        localStorage.setItem('ui-right-panel-width', width.toString());
      }
      isResizing = false;
      document.body.style.cursor = '';
    };

    resizeRight.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      resizeRight.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mode]);

  const handleAddNode = () => {
    setShowAddDialog(true);
  };

  // Get saved flex value for ph-top
  const savedPhTopFlex = typeof window !== 'undefined' ? localStorage.getItem('ui-horizontal-split-flex') : null;
  const savedPhBottomFlex = typeof window !== 'undefined' ? localStorage.getItem('ui-ph-bottom-flex') : null;
  const savedRightPanelWidth = typeof window !== 'undefined' ? localStorage.getItem('ui-right-panel-width') : null;

  return (
    <div className="app">
      <Header />
      <div className="main" style={!currentProjectId ? { filter: 'blur(8px)', pointerEvents: 'none' } : {}}>
        {mode === 'edit' && (
          <>
            <div className="panel-left">
              <div className="ph">
                <div className="ph-top" style={savedPhTopFlex ? { flex: savedPhTopFlex } : {}}>
                  <div className="tabbar">
                    <div className="tab active">Scene</div>
                    <div className="tab-actions">
                      <button className="ib" title="Add Node" onClick={handleAddNode}>+</button>
                    </div>
                  </div>
                  <Outliner />
                </div>
                <div className="ph-resize" id="resizeHorizontal"></div>
                <div className="ph-bottom" style={savedPhBottomFlex ? { flex: savedPhBottomFlex } : {}}>
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

            <div className="panel-right" style={savedRightPanelWidth ? { width: `${savedRightPanelWidth}px` } : {}}>
              <PropertiesPanel />
            </div>
          </>
        )}
      </div>

      <div className="statusbar">
        <div className="si">
          {isSaving ? (
            <>
              <span className="sdot" style={{ background: 'var(--accent)' }}></span> Saving...
            </>
          ) : lastSaved ? (
            <>
              <span className="sdot"></span> Saved {new Date(lastSaved).toLocaleTimeString()}
            </>
          ) : (
            <>
              <span className="sdot"></span> Ready
            </>
          )}
        </div>
        <div className="si">
          {currentProjectName && <span style={{ color: 'var(--accent)' }}>{currentProjectName}</span>}
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

      <ProjectManager isOpen={showProjectManager} onClose={() => setShowProjectManager(false)} />

      <GlobalDropZone />
    </div>
  );
}

export default App;
