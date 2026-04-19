import type { Asset, AssetStore, AssetFolder } from '../types/assets';

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

  async addAsset(file: File, folder?: string): Promise<string> {
    const id = this.generateId();
    const data = await this.fileToDataUrl(file);

    let fileType = file.type.split('/')[1] as Asset['type'];
    // Normalize svg+xml to svg
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

  createFolder(name: string, parentPath: string | null = null): string {
    const id = this.generateId();
    const path = parentPath ? `${parentPath}/${name}` : name;

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

  deleteFolder(id: string): void {
    const folder = this.store.folders[id];
    if (!folder) return;

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

  listFolders(parentPath: string | null = null): AssetFolder[] {
    return Object.values(this.store.folders).filter(f => f.parentPath === parentPath);
  }

  getAssetsInFolder(folderPath: string | null): Asset[] {
    return Object.values(this.store.assets).filter(a => a.folder === folderPath);
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
