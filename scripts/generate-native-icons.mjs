import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'public', 'logo.svg'));
const BACKGROUND = '#e05b49';

const renderLogo = (size) => {
  const rendered = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: BACKGROUND,
  }).render();
  return rendered.asPng();
};

const writePng = (relativePath, bytes) => {
  const path = join(root, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
};

const launcherSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const foregroundSizes = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

for (const [folder, size] of Object.entries(launcherSizes)) {
  const png = renderLogo(size);
  writePng(`android/app/src/main/res/${folder}/ic_launcher.png`, png);
  writePng(`android/app/src/main/res/${folder}/ic_launcher_round.png`, png);
}

for (const [folder, size] of Object.entries(foregroundSizes)) {
  writePng(`android/app/src/main/res/${folder}/ic_launcher_foreground.png`, renderLogo(size));
}

writePng('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', renderLogo(1024));
