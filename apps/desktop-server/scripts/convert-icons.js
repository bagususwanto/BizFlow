const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const resourcesDir = path.join(__dirname, '../src/resources');
const rendererIconsDir = path.join(__dirname, '../src/renderer/assets/icons');
const dirs = [resourcesDir, rendererIconsDir];

(async () => {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    console.log(`Converting SVGs in ${dir}...`);
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (file.endsWith('.svg')) {
        const svgPath = path.join(dir, file);
        const pngPath = path.join(dir, file.replace('.svg', '.png'));

        try {
          await sharp(svgPath).resize(32, 32).png().toFile(pngPath);

          console.log(`Converted ${file} -> ${path.basename(pngPath)}`);
        } catch (err) {
          console.error(`Error converting ${file}:`, err);
        }
      }
    }
  }
  console.log('Conversion complete.');
})();
