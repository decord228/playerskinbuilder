import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildDefaultScene } from '../data/defaultScene';
import type { Store, TreeNode, NodeType, ProjectData } from '../types';

const useStore = create<Store>()(
  persist(
    (set, get) => ({
      tree: [],
      selectedNodeId: null,
      mode: 'edit',
      zoom: 1,
      pan: { x: 0, y: 0 },
      showContainerOverlays: false,
      tool: 'select',
      nidCounter: 500,

      // Node operations
      addNode: (node) => set((state) => ({
        tree: [...state.tree, node],
        nidCounter: state.nidCounter + 1
      })),

      createNode: (type, label, parentId) => set((state) => {
        const id = `n${state.nidCounter}`;

        // Set default props based on node type
        let defaultProps = {};
        if (type === 'Separator') {
          defaultProps = {
            size_flags_horizontal: 'FILL',
            size_flags_vertical: 'SHRINK_CENTER'
          };
        }

        const node = {
          id,
          label: label || type,
          type,
          pid: parentId || null,
          children: [],
          open: true,
          visible: true,
          locked: false,
          props: defaultProps
        };

        const newTree = [...state.tree];
        if (parentId) {
          const parent = newTree.find(n => n.id === parentId);
          if (parent) parent.children.push(id);
        }
        newTree.push(node);

        return {
          tree: newTree,
          nidCounter: state.nidCounter + 1,
          selectedNodeId: id
        };
      }),

      updateNode: (id, updates) => set((state) => ({
        tree: state.tree.map(n => n.id === id ? { ...n, ...updates } : n)
      })),

      updateNodeProps: (id, props) => set((state) => ({
        tree: state.tree.map(n => n.id === id ? { ...n, props: { ...n.props, ...props } } : n)
      })),

      deleteNode: (id) => set((state) => {
        const deleteRecursive = (nodeId) => {
          const node = state.tree.find(n => n.id === nodeId);
          if (!node) return [];

          const childIds = node.children || [];
          const allIds = [nodeId, ...childIds.flatMap(deleteRecursive)];
          return allIds;
        };

        const idsToDelete = deleteRecursive(id);

        // Remove from parent's children array
        const newTree = state.tree
          .filter(n => !idsToDelete.includes(n.id))
          .map(n => ({
            ...n,
            children: n.children?.filter(cid => !idsToDelete.includes(cid)) || []
          }));

        return {
          tree: newTree,
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
        };
      }),

      duplicateNode: (id) => set((state) => {
        const node = state.tree.find(n => n.id === id);
        if (!node) return state;

        const newId = `n${state.nidCounter}`;
        const newNode = {
          ...node,
          id: newId,
          label: `${node.label}_copy`,
          props: { ...node.props },
          children: []
        };

        const newTree = [...state.tree, newNode];

        // Add to parent if exists
        if (node.pid) {
          const parent = newTree.find(n => n.id === node.pid);
          if (parent) parent.children.push(newId);
        }

        return {
          tree: newTree,
          nidCounter: state.nidCounter + 1,
          selectedNodeId: newId
        };
      }),

      selectNode: (id) => set({ selectedNodeId: id }),

      toggleNodeOpen: (id) => set((state) => ({
        tree: state.tree.map(n => n.id === id ? { ...n, open: !n.open } : n)
      })),

      toggleNodeVisible: (id) => set((state) => ({
        tree: state.tree.map(n => n.id === id ? { ...n, visible: !n.visible } : n)
      })),

      toggleNodeLocked: (id) => set((state) => ({
        tree: state.tree.map(n => n.id === id ? { ...n, locked: !n.locked } : n)
      })),

      moveNode: (nodeId, newParentId, index) => set((state) => {
        const node = state.tree.find(n => n.id === nodeId);
        if (!node) return state;

        // Remove from old parent
        let tree = state.tree.map(n => ({
          ...n,
          children: n.children?.filter(cid => cid !== nodeId) || []
        }));

        // Add to new parent
        tree = tree.map(n => {
          if (n.id === newParentId) {
            const children = [...(n.children || [])];
            if (index !== undefined) {
              children.splice(index, 0, nodeId);
            } else {
              children.push(nodeId);
            }
            return { ...n, children };
          }
          return n;
        });

        // Update node's parent
        tree = tree.map(n => n.id === nodeId ? { ...n, pid: newParentId } : n);

        return { tree };
      }),

      reorderNode: (dragId, targetId, before) => set((state) => {
        const dragNode = state.tree.find(n => n.id === dragId);
        const targetNode = state.tree.find(n => n.id === targetId);
        if (!dragNode || !targetNode) return state;

        let newTree = [...state.tree];

        // Same parent - reorder
        if (dragNode.pid === targetNode.pid) {
          const parent = dragNode.pid ? newTree.find(n => n.id === dragNode.pid) : null;
          const siblings = parent ? parent.children : newTree.filter(n => !n.pid).map(n => n.id);

          const dragIdx = siblings.indexOf(dragId);
          const targetIdx = siblings.indexOf(targetId);
          if (dragIdx === -1 || targetIdx === -1) return state;

          siblings.splice(dragIdx, 1);
          const newTargetIdx = siblings.indexOf(targetId);
          const insertIdx = before ? newTargetIdx : newTargetIdx + 1;
          siblings.splice(insertIdx, 0, dragId);

          if (parent) {
            newTree = newTree.map(n => n.id === parent.id ? { ...n, children: siblings } : n);
          }
        } else {
          // Different parent - reparent and reorder
          newTree = newTree.map(n => ({
            ...n,
            children: n.children?.filter(cid => cid !== dragId) || []
          }));

          newTree = newTree.map(n => n.id === dragId ? { ...n, pid: targetNode.pid } : n);

          const newParent = targetNode.pid ? newTree.find(n => n.id === targetNode.pid) : null;
          const siblings = newParent ? newParent.children : newTree.filter(n => !n.pid).map(n => n.id);
          const targetIdx = siblings.indexOf(targetId);
          const insertIdx = before ? targetIdx : targetIdx + 1;
          siblings.splice(insertIdx, 0, dragId);

          if (newParent) {
            newTree = newTree.map(n => n.id === newParent.id ? { ...n, children: siblings } : n);
          }
        }

        return { tree: newTree };
      }),

      reparentNode: (dragId, newParentId) => set((state) => {
        const dragNode = state.tree.find(n => n.id === dragId);
        const newParent = state.tree.find(n => n.id === newParentId);
        if (!dragNode || !newParent || dragId === newParentId) return state;

        let newTree = state.tree.map(n => ({
          ...n,
          children: n.children?.filter(cid => cid !== dragId) || []
        }));

        newTree = newTree.map(n => {
          if (n.id === newParentId) {
            return { ...n, children: [...n.children, dragId], open: true };
          }
          if (n.id === dragId) {
            return { ...n, pid: newParentId };
          }
          return n;
        });

        return { tree: newTree };
      }),

      // UI operations
      setMode: (mode) => set({ mode }),
      setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
      setPan: (pan) => set({ pan }),
      setTool: (tool) => set({ tool }),
      toggleContainerOverlays: () => set((state) => ({ showContainerOverlays: !state.showContainerOverlays })),

      // Helpers
      getNode: (id) => get().tree.find(n => n.id === id),
      getRootNodes: () => get().tree.filter(n => !n.pid),
      getChildren: (id) => {
        const node = get().tree.find(n => n.id === id);
        return node?.children?.map(cid => get().tree.find(n => n.id === cid)).filter(Boolean) || [];
      },
      getSelectedNode: () => {
        const id = get().selectedNodeId;
        return id ? get().tree.find(n => n.id === id) : null;
      },

      // Scene management
      loadDefaultScene: () => {
        const defaultTree = buildDefaultScene();
        set({ tree: defaultTree, selectedNodeId: null, nidCounter: 500 });
      },

      resetScene: () => {
        set({ tree: [], selectedNodeId: null, nidCounter: 500 });
      },

      clearSelection: () => set({ selectedNodeId: null }),

      // Project export/import
      exportProject: () => {
        const state = get();
        return {
          version: '1.0.0',
          name: 'Untitled Project',
          description: '',
          author: '',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          tree: state.tree,
          nidCounter: state.nidCounter
        };
      },

      importProject: (projectData: any) => {
        set({
          tree: projectData.tree || [],
          nidCounter: projectData.nidCounter || 500,
          selectedNodeId: null
        });
      },
    }),
    {
      name: 'skinbuilder-storage',
      partialize: (state) => ({
        tree: state.tree,
        nidCounter: state.nidCounter
      })
    }
  )
);

export default useStore;
