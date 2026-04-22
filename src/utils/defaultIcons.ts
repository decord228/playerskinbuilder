import { assetManager } from '../store/assetStore';

const DEFAULT_ICONS = [
  'fullscreen.svg',
  'mic.svg',
  'nextep.svg',
  'overlay.svg',
  'play.svg',
  'Vector.svg',
  'seasonsandeps.svg',
  'settings.svg',
  'timeback.svg',
  'timeforward.svg',
  'volume.svg'
];

export async function loadDefaultIcons(): Promise<void> {
  console.log('Checking default icons...');

  // Create "Default Icons" folder if not exists
  const folders = assetManager.listFolders(null);
  let defaultFolder = folders.find(f => f.name === 'Default Icons');

  if (!defaultFolder) {
    assetManager.createFolder('Default Icons', null);
  }

  // Check if icons already exist
  const existingAssets = assetManager.getAssetsInFolder('Default Icons');
  const existingNames = new Set(existingAssets.map(a => a.name));

  let loadedCount = 0;

  for (const iconName of DEFAULT_ICONS) {
    // Skip if already exists
    if (existingNames.has(iconName)) {
      continue;
    }

    try {
      const response = await fetch(`/default-icons/${iconName}`);
      const blob = await response.blob();
      const file = new File([blob], iconName, { type: 'image/svg+xml' });

      await assetManager.addAsset(file, 'Default Icons');
      console.log(`Loaded: ${iconName}`);
      loadedCount++;
    } catch (error) {
      console.error(`Failed to load ${iconName}:`, error);
    }
  }

  if (loadedCount > 0) {
    console.log(`Loaded ${loadedCount} default icons`);
    // Trigger refresh
    window.dispatchEvent(new CustomEvent('assets-updated'));
  } else {
    console.log('All default icons already loaded');
  }
}
