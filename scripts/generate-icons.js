// Generates icon-192.png and icon-512.png from public/icon.svg
// Run once (or whenever the icon changes): node scripts/generate-icons.js

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, '../public/icon.svg');
const svg = readFileSync(svgPath);

const sizes = [192, 512];

for (const size of sizes) {
  const out = join(__dirname, `../public/icon-${size}.png`);
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log(`Generated ${out}`);
}
