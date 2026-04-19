import { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import useStore from '../store/useStore';
import { projectStorage, isLocalhost } from '../utils/projectStorage';

export function useFileWatcher() {
  const { currentProjectId } = useProjectStore();
  const { importProject } = useStore();
  const lastCheckedRef = useRef<number>(Date.now());
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // Disabled: auto-save handles file synchronization
    // File watcher was causing annoying confirmation dialogs
    return;

    // Only watch files on localhost
    if (!isLocalhost() || !currentProjectId) return;

    const checkForChanges = async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        // Load current project data
        const projectData = await projectStorage.openProject(currentProjectId);

        if (projectData) {
          const currentState = useStore.getState();
          const currentTree = JSON.stringify(currentState.tree);
          const fileTree = JSON.stringify(projectData.tree);

          // Check if file changed externally
          if (currentTree !== fileTree) {
            console.log('🔄 External file change detected');

            // Ask user what to do
            const reload = window.confirm(
              'Project file was modified externally. Reload changes?\n\n' +
              'OK = Load external changes (your unsaved work will be lost)\n' +
              'Cancel = Keep current version (external changes will be overwritten on next save)'
            );

            if (reload) {
              if (importProject && typeof importProject === 'function') {
                importProject(projectData);
                console.log('✓ Reloaded from disk');
              } else {
                console.error('importProject is not available');
              }
            }
          }
        }
      } catch (error) {
        console.error('File watcher error:', error);
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Check every 2 seconds
    const interval = setInterval(checkForChanges, 2000);

    return () => clearInterval(interval);
  }, [currentProjectId, importProject]);
}
