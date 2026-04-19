// Script to generate default project.json
import { buildDefaultScene } from '../src/data/defaultScene';
import { exportProject } from '../src/utils/projectExporter';
import * as fs from 'fs';
import * as path from 'path';

const tree = buildDefaultScene();
const projectData = exportProject(tree, 500, 'Default VideoPlayer Skin');

// List of default assets
projectData.assets = [
  { name: 'Vector.svg', path: 'assets/Vector.svg' },
  { name: 'fullscreen.svg', path: 'assets/fullscreen.svg' },
  { name: 'mic.svg', path: 'assets/mic.svg' },
  { name: 'nextep.svg', path: 'assets/nextep.svg' },
  { name: 'overlay.svg', path: 'assets/overlay.svg' },
  { name: 'play.svg', path: 'assets/play.svg' },
  { name: 'seasonsandeps.svg', path: 'assets/seasonsandeps.svg' },
  { name: 'settings.svg', path: 'assets/settings.svg' },
  { name: 'timeback.svg', path: 'assets/timeback.svg' },
  { name: 'timeforward.svg', path: 'assets/timeforward.svg' },
  { name: 'volume.svg', path: 'assets/volume.svg' }
];

const outputPath = path.join(__dirname, '../public/default_project/project.json');
fs.writeFileSync(outputPath, JSON.stringify(projectData, null, 2), 'utf-8');

console.log('✓ Generated project.json');
console.log(`  Nodes: ${tree.length}`);
console.log(`  Assets: ${projectData.assets.length}`);
