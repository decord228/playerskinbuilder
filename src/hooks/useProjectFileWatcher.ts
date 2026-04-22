import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';

export function useProjectFileWatcher() {
  const { importProject } = useStore();
  const lastModifiedRef = useRef<number>(0);

  useEffect(() => {
    // Only in development
    if (process.env.NODE_ENV !== 'development') return;

    const checkForUpdates = async () => {
      try {
        const response = await fetch('/default_project/project.json', {
          method: 'HEAD',
          cache: 'no-cache'
        });

        const lastModified = new Date(response.headers.get('last-modified') || '').getTime();

        if (lastModifiedRef.current === 0) {
          lastModifiedRef.current = lastModified;
          return;
        }

        if (lastModified > lastModifiedRef.current) {
          console.log('🔄 project.json changed, reloading...');
          lastModifiedRef.current = lastModified;

          const response = await fetch('/default_project/project.json');
          const projectData = await response.json();
          importProject(projectData);
          console.log('✓ Project reloaded');
        }
      } catch (error) {
        // Ignore errors
      }
    };

    // Check every 2 seconds
    const interval = setInterval(checkForUpdates, 2000);
    checkForUpdates();

    return () => clearInterval(interval);
  }, [importProject]);
}
