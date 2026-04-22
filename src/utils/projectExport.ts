import JSZip from 'jszip';
import { projectStorage } from './projectStorage';
import type { ProjectData } from '../types';

export async function exportProjectAsZip(projectId: string, projectName: string): Promise<void> {
  const zip = new JSZip();

  // Get project data
  const projectData = await projectStorage.openProject(projectId);
  if (!projectData) {
    throw new Error('Project not found');
  }

  // Add project.json
  zip.file('project.json', JSON.stringify(projectData, null, 2));

  // Add assets
  const assetNames = await projectStorage.listAssets(projectId);
  const assetsFolder = zip.folder('assets');

  if (assetsFolder) {
    for (const assetName of assetNames) {
      const blob = await projectStorage.getAsset(projectId, assetName);
      if (blob) {
        assetsFolder.file(assetName, blob);
      }
    }
  }

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importProjectFromZip(file: File): Promise<{ projectId: string; projectData: ProjectData }> {
  const zip = await JSZip.loadAsync(file);

  // Read project.json
  const projectFile = zip.file('project.json');
  if (!projectFile) {
    throw new Error('Invalid project file: missing project.json');
  }

  const projectJson = await projectFile.async('string');
  const projectData: ProjectData = JSON.parse(projectJson);

  // Create new project
  const projectId = await projectStorage.createProject(projectData.name);

  // Save project data
  await projectStorage.saveProject(projectId, projectData);

  // Import assets
  const assetsFolder = zip.folder('assets');
  if (assetsFolder) {
    const assetFiles = Object.keys(zip.files).filter(
      name => name.startsWith('assets/') && !name.endsWith('/')
    );

    for (const assetPath of assetFiles) {
      const assetFile = zip.file(assetPath);
      if (assetFile) {
        const blob = await assetFile.async('blob');
        const fileName = assetPath.split('/').pop() || 'unknown';
        await projectStorage.saveAsset(projectId, fileName, blob);
      }
    }
  }

  return { projectId, projectData };
}
