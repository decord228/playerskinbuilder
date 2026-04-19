import { useEffect } from 'react';
import useStore from '../store/useStore';

export function useKeyboardShortcuts(): void {
  const { selectedNodeId, deleteNode, duplicateNode, tree, selectNode } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete
      if (e.key === 'Delete' && selectedNodeId) {
        e.preventDefault();
        const node = tree.find(n => n.id === selectedNodeId);
        if (node && !node.locked) {
          if (window.confirm(`Delete "${node.label}"?`)) {
            deleteNode(selectedNodeId);
          }
        }
      }

      // Duplicate (Ctrl+D)
      if (e.ctrlKey && e.key === 'd' && selectedNodeId) {
        e.preventDefault();
        const node = tree.find(n => n.id === selectedNodeId);
        if (node && !node.locked) {
          duplicateNode(selectedNodeId);
        }
      }

      // Navigate tree (Arrow Up/Down)
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !e.target.matches('input, textarea, select')) {
        e.preventDefault();

        // Get all visible nodes in order
        const visibleNodes = [];
        const collectVisible = (nodeId, depth = 0) => {
          const node = tree.find(n => n.id === nodeId);
          if (!node) return;

          visibleNodes.push(node.id);

          if (node.open && node.children) {
            node.children.forEach(childId => collectVisible(childId, depth + 1));
          }
        };

        tree.filter(n => !n.pid).forEach(n => collectVisible(n.id));

        if (visibleNodes.length === 0) return;

        const currentIndex = selectedNodeId ? visibleNodes.indexOf(selectedNodeId) : -1;

        if (e.key === 'ArrowUp') {
          const newIndex = currentIndex > 0 ? currentIndex - 1 : visibleNodes.length - 1;
          selectNode(visibleNodes[newIndex]);
        } else {
          const newIndex = currentIndex < visibleNodes.length - 1 ? currentIndex + 1 : 0;
          selectNode(visibleNodes[newIndex]);
        }
      }

      // Escape - clear selection
      if (e.key === 'Escape') {
        useStore.getState().clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, tree, deleteNode, duplicateNode, selectNode]);
}
