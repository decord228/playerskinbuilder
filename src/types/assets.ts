export interface Asset {
  id: string;
  name: string;
  type: 'svg' | 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp';
  data: string; // Base64 data URL
  size: number;
  createdAt: number;
  folder?: string; // Path to folder, e.g. "Default Icons" or "My Icons/Buttons"
}

export interface AssetFolder {
  id: string;
  name: string;
  path: string; // Full path, e.g. "Default Icons" or "My Icons/Buttons"
  parentPath: string | null; // Parent folder path
  createdAt: number;
}

export interface AssetStore {
  assets: Record<string, Asset>;
  folders: Record<string, AssetFolder>;
}
