import type { Asset, AssetStore, AssetFolder } from '../types/assets';
import { projectStorage } from '../utils/projectStorage';
import { useProjectStore } from './useProjectStore';

const STORAGE_KEY = 'skinbuilder-assets';

class AssetManager {
  private store: AssetStore;
  public selectedAssetId: string | null = null;

  constructor() {
    this.store = this.loadFromStorage();
  }

  private loadFromStorage(): AssetStore {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Migrate old format
        if (!parsed.folders) {
          parsed.folders = {};
        }
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load assets from storage:', error);
    }
    return { assets: {}, folders: {} };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch (error) {
      console.error('Failed to save assets to storage:', error);
    }
  }

  private generateId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Get current project ID
  private getCurrentProjectId(): string | null {
    return useProjectStore.getState().currentProjectId;
  }

  async addAsset(file: File, folder?: string): Promise<string> {
    const projectId = this.getCurrentProjectId();
    if (!projectId) {
      throw new Error('No project open');
    }

    // Save to real file system
    const fileName = folder ? `${folder}/${file.name}` : file.name;
    await projectStorage.saveAsset(projectId, fileName, file);

    // Also keep in memory for backward compatibility
    const id = this.generateId();
    const data = await this.fileToDataUrl(file);

    let fileType = file.type.split('/')[1] as Asset['type'];
    if (fileType === 'svg+xml') {
      fileType = 'svg';
    }

    const asset: Asset = {
      id,
      name: file.name,
      type: fileType,
      data,
      size: file.size,
      createdAt: Date.now(),
      folder: folder || null
    };

    this.store.assets[id] = asset;
    this.saveToStorage();

    return id;
  }

  async createFolder(name: string, parentPath: string | null = null): Promise<string> {
    const projectId = this.getCurrentProjectId();
    if (!projectId) {
      throw new Error('No project open');
    }

    const folderPath = parentPath ? `${parentPath}/${name}` : name;

    // Create in real file system
    await projectStorage.createFolder(projectId, folderPath);

    // Also keep in memory for backward compatibility
    const id = this.generateId();
    const path = folderPath;

    const folder: AssetFolder = {
      id,
      name,
      path,
      parentPath,
      createdAt: Date.now()
    };

    this.store.folders[id] = folder;
    this.saveToStorage();

    return id;
  }

  async deleteFolder(id: string): Promise<void> {
    const folder = this.store.folders[id];
    if (!folder) return;

    const projectId = this.getCurrentProjectId();
    if (projectId) {
      // Delete from real file system
      await projectStorage.deleteFolder(projectId, folder.path);
    }

    // Delete all assets in this folder
    Object.values(this.store.assets).forEach(asset => {
      if (asset.folder === folder.path) {
        delete this.store.assets[asset.id];
      }
    });

    // Delete all subfolders
    Object.values(this.store.folders).forEach(f => {
      if (f.parentPath === folder.path) {
        this.deleteFolder(f.id);
      }
    });

    delete this.store.folders[id];
    this.saveToStorage();
  }

  async listFolders(parentPath: string | null = null): Promise<AssetFolder[]> {
    const projectId = this.getCurrentProjectId();
    if (!projectId) {
      // Fallback to memory
      return Object.values(this.store.folders).filter(f => f.parentPath === parentPath);
    }

    try {
      // Read from real file system
      const items = await projectStorage.listAssetsRecursive(projectId, parentPath || '');
      const folders = items
        .filter(item => item.type === 'folder')
        .map(item => ({
          id: item.path,
          name: item.name,
          path: item.path,
          parentPath: parentPath,
          createdAt: Date.now()
        }));

      return folders;
    } catch (error) {
      console.error('Failed to list folders:', error);
      return [];
    }
  }

  async getAssetsInFolder(folderPath: string | null): Promise<Asset[]> {
    const projectId = this.getCurrentProjectId();
    if (!projectId) {
      // Fallback to memory
      return Object.values(this.store.assets).filter(a => a.folder === folderPath);
    }

    try {
      // Read from real file system
      const items = await projectStorage.listAssetsRecursive(projectId, folderPath || '');
      const files = items.filter(item => item.type === 'file');

      const assets: Asset[] = [];
      for (const file of files) {
        const blob = await projectStorage.getAsset(projectId, file.path);
        if (blob) {
          const data = await this.blobToDataUrl(blob);
          const fileType = blob.type.split('/')[1] as Asset['type'];

          assets.push({
            id: file.path,
            name: file.name,
            type: fileType === 'svg+xml' ? 'svg' : fileType,
            data,
            size: blob.size,
            createdAt: Date.now(),
            folder: folderPath
          });
        }
      }

      return assets;
    } catch (error) {
      console.error('Failed to get assets:', error);
      return [];
    }
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async preloadDefaultAssets(projectId: string): Promise<void> {
    try {
      // Load all assets from default-icons folder
      const items = await projectStorage.listAssetsRecursive(projectId, 'default-icons');

      for (const item of items) {
        if (item.type === 'file') {
          const blob = await projectStorage.getAsset(projectId, item.path);
          if (blob) {
            const data = await this.blobToDataUrl(blob);
            let fileType = blob.type.split('/')[1] as Asset['type'];
            if (fileType === 'svg+xml') {
              fileType = 'svg';
            }

            const asset: Asset = {
              id: item.path,
              name: item.name,
              type: fileType,
              data,
              size: blob.size,
              createdAt: Date.now(),
              folder: 'default-icons'
            };

            // Cache in memory
            this.store.assets[item.path] = asset;
          }
        }
      }

      console.log('✓ Preloaded default assets');
    } catch (error) {
      console.error('Failed to preload default assets:', error);
    }
  }

  getAsset(id: string): Asset | null {
    return this.store.assets[id] || null;
  }

  deleteAsset(id: string): void {
    delete this.store.assets[id];
    this.saveToStorage();
  }

  listAssets(): Asset[] {
    return Object.values(this.store.assets);
  }

  getAssetDataUrl(id: string): string | null {
    const asset = this.getAsset(id);
    return asset ? asset.data : null;
  }

  clearAll(): void {
    this.store = { assets: {} };
    this.saveToStorage();
  }
}

export const assetManager = new AssetManager();
