import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'public', 'logo.svg'));
const BACKGROUND = '#e05b49';

const logoInner = svg
  .toString('utf8')
  .replace(/<\?xml[^>]*>/, '')
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '');

const renderLogo = (size) => {
  const rendered = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: BACKGROUND,
  }).render();
  return rendered.asPng();
};

const renderSplash = (width, height, logoSize) => {
  const x = (width - logoSize) / 2;
  const y = (height - logoSize) / 2;
  const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${BACKGROUND}"/>
  <svg x="${x}" y="${y}" width="${logoSize}" height="${logoSize}" viewBox="0 0 512 512">${logoInner}</svg>
</svg>`;
  return new Resvg(Buffer.from(splashSvg), {
    fitTo: { mode: 'width', value: width },
  })
    .render()
    .asPng();
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

const splashIconSizes = {
  'drawable-mdpi': 240,
  'drawable-hdpi': 360,
  'drawable-xhdpi': 480,
  'drawable-xxhdpi': 720,
  'drawable-xxxhdpi': 960,
};

const portraitSplashes = {
  'drawable-port-mdpi': [320, 480],
  'drawable-port-hdpi': [480, 800],
  'drawable-port-xhdpi': [720, 1280],
  'drawable-port-xxhdpi': [1080, 1920],
  'drawable-port-xxxhdpi': [1440, 2560],
};

const landscapeSplashes = {
  'drawable-land-mdpi': [480, 320],
  'drawable-land-hdpi': [800, 480],
  'drawable-land-xhdpi': [1280, 720],
  'drawable-land-xxhdpi': [1920, 1080],
  'drawable-land-xxxhdpi': [2560, 1440],
};

for (const [folder, size] of Object.entries(launcherSizes)) {
  const png = renderLogo(size);
  writePng(`android/app/src/main/res/${folder}/ic_launcher.png`, png);
  writePng(`android/app/src/main/res/${folder}/ic_launcher_round.png`, png);
}

for (const [folder, size] of Object.entries(foregroundSizes)) {
  writePng(`android/app/src/main/res/${folder}/ic_launcher_foreground.png`, renderLogo(size));
}

for (const [folder, size] of Object.entries(splashIconSizes)) {
  writePng(`android/app/src/main/res/${folder}/splash_icon.png`, renderLogo(size));
}

for (const [folder, [width, height]] of Object.entries(portraitSplashes)) {
  writePng(
    `android/app/src/main/res/${folder}/splash.png`,
    renderSplash(width, height, Math.round(Math.min(width, height) * 0.42))
  );
}

for (const [folder, [width, height]] of Object.entries(landscapeSplashes)) {
  writePng(
    `android/app/src/main/res/${folder}/splash.png`,
    renderSplash(width, height, Math.round(Math.min(width, height) * 0.42))
  );
}

writePng('android/app/src/main/res/drawable/splash.png', renderSplash(1080, 1920, 454));
writePng('android/app/src/main/res/drawable/splash_icon.png', renderLogo(480));

const iosSplash = renderSplash(2732, 2732, 1024);
writePng('ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png', iosSplash);
writePng('ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png', iosSplash);
writePng('ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png', iosSplash);
writePng('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', renderLogo(1024));
