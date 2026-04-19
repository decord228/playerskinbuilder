import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { useProjectStore } from '../store/useProjectStore';

export function useAutoSave() {
  const { tree, nidCounter, exportProject } = useStore();
  const { currentProjectId, saveCurrentProject } = useProjectStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTreeRef = useRef<string>('');

  useEffect(() => {
    // Only auto-save if project is open
    if (!currentProjectId) return;

    // Debounce: wait 500ms after last change
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const currentTreeStr = JSON.stringify({ tree, nidCounter });

    // Skip if nothing changed
    if (currentTreeStr === lastSavedTreeRef.current) {
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        if (!exportProject) {
          console.error('exportProject is not available');
          return;
        }

        const projectData = exportProject();

        if (!projectData) {
          console.error('exportProject returned null/undefined');
          return;
        }

        if (!saveCurrentProject) {
          console.error('saveCurrentProject is not available');
          return;
        }

        await saveCurrentProject(projectData);
        lastSavedTreeRef.current = currentTreeStr;
        console.log('💾 Auto-saved');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [tree, nidCounter, currentProjectId, exportProject, saveCurrentProject]);
}
