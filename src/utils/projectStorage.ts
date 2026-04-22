import type { ProjectData } from '../types';

// Detect if running on localhost
export const isLocalhost = (): boolean => {
  return window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname === '';
};

// Storage interface
export interface ProjectStorage {
  init(): Promise<void>;
  initWithCustomPath?(): Promise<void>;
  createProject(name: string): Promise<string>;
  openProject(id: string): Promise<ProjectData | null>;
  saveProject(id: string, data: ProjectData): Promise<void>;
  deleteProject(id: string): Promise<void>;
  listProjects(): Promise<Array<{ id: string; name: string; modified: string; path?: string }>>;
  saveAsset(projectId: string, fileName: string, data: Blob): Promise<void>;
  getAsset(projectId: string, fileName: string): Promise<Blob | null>;
  deleteAsset(projectId: string, fileName: string): Promise<void>;
  listAssets(projectId: string): Promise<string[]>;
  listAssetsRecursive(projectId: string, folderPath?: string): Promise<Array<{ name: string; type: 'file' | 'folder'; path: string }>>;
  createFolder(projectId: string, folderPath: string): Promise<void>;
  deleteFolder(projectId: string, folderPath: string): Promise<void>;
}

// File System Access API implementation (localhost only)
class FileSystemStorage implements ProjectStorage {
  private projectHandles: Map<string, FileSystemDirectoryHandle> = new Map();
  private dbName = 'skinbuilder-handles';

  async init(): Promise<void> {
    // Restore saved handles from IndexedDB
    await this.restoreHandles();
    console.log('✓ File System Storage ready');
  }

  async initWithCustomPath(): Promise<void> {
    // Not needed anymore - each project has its own path
  }

  private async restoreHandles(): Promise<void> {
    try {
      const db = await this.openHandlesDB();
      const tx = db.transaction('handles', 'readonly');
      const store = tx.objectStore('handles');
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = async () => {
          const handles = request.result;
          for (const item of handles) {
            try {
              // Verify permission
              const permission = await item.handle.queryPermission({ mode: 'readwrite' });
              if (permission === 'granted') {
                this.projectHandles.set(item.projectId, item.handle);
              }
            } catch (error) {
              // Handle expired or invalid
              console.log(`Handle for ${item.projectId} expired`);
            }
          }
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to restore handles:', error);
    }
  }

  private async saveHandle(projectId: string, handle: FileSystemDirectoryHandle): Promise<void> {
    try {
      const db = await this.openHandlesDB();
      const tx = db.transaction('handles', 'readwrite');
      const store = tx.objectStore('handles');
      await store.put({ projectId, handle });
    } catch (error) {
      console.error('Failed to save handle:', error);
    }
  }

  private async openHandlesDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles', { keyPath: 'projectId' });
        }
      };
    });
  }

  async createProject(name: string): Promise<string> {
    // Ask user to select parent folder for new project
    const parentHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite'
    });

    // Create project folder inside selected folder
    const projectHandle = await parentHandle.getDirectoryHandle(name, { create: true });

    // Store handle for later use
    this.projectHandles.set(name, projectHandle);
    await this.saveHandle(name, projectHandle);

    // Create assets folder
    const assetsHandle = await projectHandle.getDirectoryHandle('assets', { create: true });

    // Create default-icons folder and copy icons
    const defaultIconsHandle = await assetsHandle.getDirectoryHandle('default-icons', { create: true });

    // List of default icons to copy
    const defaultIcons = [
      'Vector.svg', 'fullscreen.svg', 'mic.svg', 'nextep.svg',
      'overlay.svg', 'play.svg', 'seasonsandeps.svg', 'settings.svg',
      'timeback.svg', 'timeforward.svg', 'volume.svg'
    ];

    // Copy each icon
    for (const iconName of defaultIcons) {
      try {
        const response = await fetch(`/default-icons/${iconName}`);
        const blob = await response.blob();
        const fileHandle = await defaultIconsHandle.getFileHandle(iconName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (error) {
        console.error(`Failed to copy icon ${iconName}:`, error);
      }
    }

    // Load default scene structure
    let defaultTree = [];
    let defaultNidCounter = 500;
    try {
      const defaultResponse = await fetch('/default_project/project.json');
      const defaultProject = await defaultResponse.json();
      defaultTree = defaultProject.tree || [];
      defaultNidCounter = defaultProject.nidCounter || 500;
    } catch (error) {
      console.error('Failed to load default scene:', error);
    }

    // Create project.json with default scene
    const fileHandle = await projectHandle.getFileHandle('project.json', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify({
      version: '1.0.0',
      name,
      description: '',
      author: '',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      tree: defaultTree,
      nidCounter: defaultNidCounter
    }, null, 2));
    await writable.close();

    // Save to recent projects
    this.addToRecentProjects(name, projectHandle);

    return name;
  }

  private async addToRecentProjects(name: string, handle: FileSystemDirectoryHandle) {
    const recent = JSON.parse(localStorage.getItem('recent-projects') || '[]');

    // Remove if already exists
    const filtered = recent.filter((p: any) => p.name !== name);

    // Add to beginning
    filtered.unshift({
      name,
      lastOpened: new Date().toISOString()
    });

    // Keep only last 10
    const limited = filtered.slice(0, 10);

    localStorage.setItem('recent-projects', JSON.stringify(limited));
  }

  async openProject(id: string): Promise<ProjectData | null> {
    try {
      // Check if we have cached handle
      let projectHandle = this.projectHandles.get(id);

      if (!projectHandle) {
        // Ask user to select project folder
        projectHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite'
        });
        this.projectHandles.set(id, projectHandle);
        await this.saveHandle(id, projectHandle);
      }

      const fileHandle = await projectHandle.getFileHandle('project.json');
      const file = await fileHandle.getFile();
      const text = await file.text();

      // Update recent projects
      this.addToRecentProjects(id, projectHandle);

      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to open project:', error);
      return null;
    }
  }

  async saveProject(id: string, data: ProjectData): Promise<void> {
    try {
      const projectHandle = this.projectHandles.get(id);
      if (!projectHandle) {
        throw new Error('Project not open');
      }

      const fileHandle = await projectHandle.getFileHandle('project.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    // Remove from cache and recent projects
    this.projectHandles.delete(id);

    const recent = JSON.parse(localStorage.getItem('recent-projects') || '[]');
    const filtered = recent.filter((p: any) => p.name !== id);
    localStorage.setItem('recent-projects', JSON.stringify(filtered));
  }

  async listProjects(): Promise<Array<{ id: string; name: string; modified: string; path?: string }>> {
    // Return recent projects from localStorage
    const recent = JSON.parse(localStorage.getItem('recent-projects') || '[]');

    return recent.map((p: any) => ({
      id: p.name,
      name: p.name,
      modified: p.lastOpened,
      path: 'Recent'
    }));
  }

  async saveAsset(projectId: string, fileName: string, data: Blob): Promise<void> {
    try {
      const projectHandle = this.projectHandles.get(projectId);
      if (!projectHandle) {
        throw new Error('Project not open');
      }

      let targetHandle = await projectHandle.getDirectoryHandle('assets', { create: true });

      // Navigate to subfolder if path contains /
      const parts = fileName.split('/');
      const actualFileName = parts.pop()!;

      for (const part of parts) {
        if (part) {
          targetHandle = await targetHandle.getDirectoryHandle(part, { create: true });
        }
      }

      const fileHandle = await targetHandle.getFileHandle(actualFileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
    } catch (error) {
      console.error('Failed to save asset:', error);
      throw error;
    }
  }

  async getAsset(projectId: string, fileName: string): Promise<Blob | null> {
    try {
      const projectHandle = this.projectHandles.get(projectId);
      if (!projectHandle) {
        return null;
      }

      let targetHandle = await projectHandle.getDirectoryHandle('assets');

      // Navigate to subfolder if path contains /
      const parts = fileName.split('/');
      const actualFileName = parts.pop()!;

      for (const part of parts) {
        if (part) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
      }

      const fileHandle = await targetHandle.getFileHandle(actualFileName);
      const file = await fileHandle.getFile();
      return file;
    } catch (error) {
      return null;
    }
  }

  async deleteAsset(projectId: string, fileName: string): Promise<void> {
    try {
      const projectHandle = this.projectHandles.get(projectId);
      if (!projectHandle) {
        throw new Error('Project not open');
      }

      let targetHandle = await projectHandle.getDirectoryHandle('assets');

      // Navigate to subfolder if path contains /
      const parts = fileName.split('/');
      const actualFileName = parts.pop()!;

      for (const part of parts) {
        if (part) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
      }

      await targetHandle.removeEntry(actualFileName);
    } catch (error) {
      console.error('Failed to delete asset:', error);
      throw error;
    }
  }

  async listAssets(projectId: string): Promise<string[]> {
    const assets: string[] = [];

    try {
      const projectHandle = this.projectHandles.get(projectId);
      if (!projectHandle) {
        return assets;
      }

      const assetsHandle = await projectHandle.getDirectoryHandle('assets');

      for await (const entry of assetsHandle.values()) {
        if (entry.kind === 'file') {
          assets.push(entry.name);
        }
      }
    } catch (error) {
      // Assets folder doesn't exist yet
    }

    return assets;
  }

  async listAssetsRecursive(projectId: string, folderPath: string = ''): Promise<Array<{ name: string; type: 'file' | 'folder'; path: string }>> {
    const items: Array<{ name: string; type: 'file' | 'folder'; path: string }> = [];

    try {
      const projectHandle = this.projectHandles.get(projectId);
      if (!projectHandle) {
        return items;
      }

      let targetHandle = await projectHandle.getDirectoryHandle('assets');

      // Navigate to subfolder if specified
      if (folderPath) {
        const parts = folderPath.split('/').filter(p => p);
        for (const part of parts) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
      }

      for await (const entry of targetHandle.values()) {
        const itemPath = folderPath ? `${folderPath}/${entry.name}` : entry.name;
        items.push({
          name: entry.name,
          type: entry.kind === 'directory' ? 'folder' : 'file',
          path: itemPath
        });
      }
    } catch (error) {
      console.error('Failed to list assets:', error);
    }

    return items;
  }

  async createFolder(projectId: string, folderPath: string): Promise<void> {
    try {
      const projectHandle = this.projectHandles.get(projectId);
      if (!projectHandle) {
        throw new Error('Project not open');
      }

      let targetHandle = await projectHandle.getDirectoryHandle('assets');

      // Navigate to parent folder and create new folder
      const parts = folderPath.split('/').filter(p => p);
      for (let i = 0; i < parts.length; i++) {
        targetHandle = await targetHandle.getDirectoryHandle(parts[i], { create: true });
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  }

  async deleteFolder(projectId: string, folderPath: string): Promise<void> {
    try {
      const projectHandle = this.projectHandles.get(projectId);
      if (!projectHandle) {
        throw new Error('Project not open');
      }

      let targetHandle = await projectHandle.getDirectoryHandle('assets');

      // Navigate to parent and delete folder
      const parts = folderPath.split('/').filter(p => p);
      const folderName = parts.pop()!;

      for (const part of parts) {
        targetHandle = await targetHandle.getDirectoryHandle(part);
      }

      await targetHandle.removeEntry(folderName, { recursive: true });
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  }
}

// IndexedDB implementation (for hosting)
class IndexedDBStorage implements ProjectStorage {
  private db: IDBDatabase | null = null;
  private dbName = 'skinbuilder-fs';
  private version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✓ IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('projects')) {
          const store = db.createObjectStore('projects', { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('modified', 'modified', { unique: false });
        }

        if (!db.objectStoreNames.contains('assets')) {
          const store = db.createObjectStore('assets', { keyPath: ['projectId', 'fileName'] });
          store.createIndex('projectId', 'projectId', { unique: false });
        }
      };
    });
  }

  async createProject(name: string): Promise<string> {
    if (!this.db) await this.init();

    const projectId = `project_${Date.now()}`;
    const projectData: ProjectData = {
      version: '1.0.0',
      name,
      description: '',
      author: '',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      tree: [],
      nidCounter: 500
    };

    await this.saveProject(projectId, projectData);
    return projectId;
  }

  async openProject(id: string): Promise<ProjectData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { id, ...projectData } = result;
          resolve(projectData as ProjectData);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveProject(id: string, data: ProjectData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');

      const record = {
        id,
        ...data,
        modified: new Date().toISOString()
      };

      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects', 'assets'], 'readwrite');

      // Delete project
      const projectStore = transaction.objectStore('projects');
      projectStore.delete(id);

      // Delete all assets
      const assetStore = transaction.objectStore('assets');
      const index = assetStore.index('projectId');
      const request = index.openCursor(IDBKeyRange.only(id));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async listProjects(): Promise<Array<{ id: string; name: string; modified: string }>> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.getAll();

      request.onsuccess = () => {
        const projects = request.result.map((p: any) => ({
          id: p.id,
          name: p.name,
          modified: p.modified
        }));
        resolve(projects.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveAsset(projectId: string, fileName: string, data: Blob): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');

      const request = store.put({ projectId, fileName, data });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAsset(projectId: string, fileName: string): Promise<Blob | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      const request = store.get([projectId, fileName]);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAsset(projectId: string, fileName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const request = store.delete([projectId, fileName]);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async listAssets(projectId: string): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => {
        const assets = request.result.map((a: any) => a.fileName);
        resolve(assets);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Factory function
export function createProjectStorage(): ProjectStorage {
  if (isLocalhost()) {
    return new FileSystemStorage();
  } else {
    return new IndexedDBStorage();
  }
}

// Singleton instance
export const projectStorage = createProjectStorage();
