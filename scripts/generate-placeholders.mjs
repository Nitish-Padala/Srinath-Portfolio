import fs from 'node:fs';
import path from 'node:path';

const baseDir = path.resolve(process.cwd(), 'public', 'photos');

const categories = [
  { id: '1:1', folder: 'ratio-1-1', aspect: '1:1', label: '1:1 Square Format', w: 1000, h: 1000 },
  { id: '3:4', folder: 'ratio-3-4', aspect: '3:4', label: '3:4 Vertical Portrait', w: 900, h: 1200 },
  { id: '4:3', folder: 'ratio-4-3', aspect: '4:3', label: '4:3 Classic Landscape', w: 1200, h: 900 },
  { id: '9:16', folder: 'ratio-9-16', aspect: '9:16', label: '9:16 Cinematic Story', w: 720, h: 1280 },
  { id: '16:9', folder: 'ratio-16-9', aspect: '16:9', label: '16:9 Horizon Panorama', w: 1280, h: 720 },
];

// Gather existing real photographs from quickshare and cinema to seed placeholders
const sourcePool = [];
const cinemaDir = path.resolve(process.cwd(), 'public', 'assets', 'cinema');
const quickshareDir = path.resolve(process.cwd(), 'public', 'assets', 'quickshare');

if (fs.existsSync(cinemaDir)) {
  for (const f of fs.readdirSync(cinemaDir)) {
    if (f.endsWith('.jpg')) sourcePool.push(path.join(cinemaDir, f));
  }
}
if (fs.existsSync(quickshareDir)) {
  for (const f of fs.readdirSync(quickshareDir)) {
    if (f.endsWith('.jpg')) sourcePool.push(path.join(quickshareDir, f));
  }
}

console.log(`Found ${sourcePool.length} source images to seed placeholder pool.`);

let poolIndex = 0;
let totalCreated = 0;

for (const cat of categories) {
  const catDir = path.join(baseDir, cat.folder);
  fs.mkdirSync(catDir, { recursive: true });

  for (let i = 1; i <= 30; i++) {
    const filename = `photo-${String(i).padStart(2, '0')}.jpg`;
    const destPath = path.join(catDir, filename);

    // Seed with existing high-res photograph if available
    if (sourcePool.length > 0) {
      const srcFile = sourcePool[poolIndex % sourcePool.length];
      poolIndex++;
      fs.copyFileSync(srcFile, destPath);
    }
    totalCreated++;
  }
  console.log(`Created 30 placeholder photos in ${cat.folder}`);
}

console.log(`Successfully prepared ${totalCreated} placeholder photos across 5 ratio categories.`);
