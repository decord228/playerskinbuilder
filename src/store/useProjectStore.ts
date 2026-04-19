import { create } from 'zustand';
import { projectStorage } from '../utils/projectStorage';
import type { ProjectData } from '../types';

interface ProjectState {
  currentProjectId: string | null;
  currentProjectName: string | null;
  projects: Array<{ id: string; name: string; modified: string; path?: string }>;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
}

interface ProjectActions {
  initStorage: () => Promise<void>;
  loadProjects: () => Promise<void>;
  createProject: (name: string) => Promise<string>;
  openProject: (id: string) => Promise<void>;
  saveCurrentProject: (data: ProjectData) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  closeProject: () => void;
}

export const useProjectStore = create<ProjectState & ProjectActions>((set, get) => ({
  currentProjectId: null,
  currentProjectName: null,
  projects: [],
  isLoading: false,
  isSaving: false,
  lastSaved: null,

  initStorage: async () => {
    try {
      await projectStorage.init();
      await get().loadProjects();
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  },

  loadProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await projectStorage.listProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      console.error('Failed to load projects:', error);
      set({ isLoading: false });
    }
  },

  createProject: async (name: string) => {
    set({ isLoading: true });
    try {
      const projectId = await projectStorage.createProject(name);

      // Load default scene from /default_project/
      try {
        const response = await fetch('/default_project/project.json');
        const defaultProject = await response.json();

        // Save default scene to new project
        await projectStorage.saveProject(projectId, {
          ...defaultProject,
          name: name
        });
      } catch (error) {
        console.error('Failed to load default scene:', error);
      }

      await get().loadProjects();
      set({ isLoading: false });
      return projectId;
    } catch (error) {
      console.error('Failed to create project:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  openProject: async (id: string) => {
    set({ isLoading: true });
    try {
      const projectData = await projectStorage.openProject(id);
      if (projectData) {
        const project = get().projects.find(p => p.id === id);
        set({
          currentProjectId: id,
          currentProjectName: project?.name || projectData.name,
          isLoading: false
        });

        // Save current project to localStorage
        localStorage.setItem('current-project-id', id);

        // Preload default assets into memory
        const { assetManager } = await import('./assetStore');
        await assetManager.preloadDefaultAssets(id);

        // Load project into main store
        const useStoreModule = await import('./useStore');
        const useStore = useStoreModule.default;
        if (useStore && useStore.getState && useStore.getState().importProject) {
          useStore.getState().importProject(projectData);
        } else {
          console.error('useStore not properly initialized');
        }
      } else {
        throw new Error('Project not found');
      }
    } catch (error) {
      console.error('Failed to open project:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  saveCurrentProject: async (data: ProjectData) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;

    set({ isSaving: true });
    try {
      await projectStorage.saveProject(currentProjectId, data);
      set({
        isSaving: false,
        lastSaved: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save project:', error);
      set({ isSaving: false });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      await projectStorage.deleteProject(id);
      await get().loadProjects();

      // Close project if it's currently open
      if (get().currentProjectId === id) {
        get().closeProject();
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  },

  closeProject: () => {
    set({
      currentProjectId: null,
      currentProjectName: null,
      lastSaved: null
    });

    // Clear from localStorage
    localStorage.removeItem('current-project-id');

    // Clear main store
    const useStore = require('./useStore').default;
    useStore.getState().resetScene();
  }
}));
