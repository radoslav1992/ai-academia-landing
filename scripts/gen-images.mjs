// One-off generator for favicons + Open Graph image.
// Run with: node scripts/gen-images.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

const BG = '#FAF6EF';
const INK = '#1C1A16';
const ACCENT = '#C2410C';

// --- Square brand icon (used for PWA + apple touch) ---
const iconSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${INK}"/>
  <text x="50%" y="50%" dy="2" text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, 'Times New Roman', serif" font-weight="700"
        font-size="30" fill="${BG}">AI</text>
  <circle cx="50" cy="16" r="5" fill="${ACCENT}"/>
</svg>`;

// --- Open Graph / social card 1200x630 ---
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="0" y="0" width="1200" height="10" fill="${ACCENT}"/>
  <g font-family="Georgia, 'Times New Roman', serif">
    <text x="80" y="120" font-size="30" font-weight="700" fill="${INK}">AI Академия</text>
  </g>
  <g font-family="Georgia, 'Times New Roman', serif" fill="${INK}">
    <text x="80" y="250" font-size="74" font-weight="700">Безплатни AI курсове</text>
    <text x="80" y="340" font-size="74" font-weight="700">на живо в <tspan font-style="italic" fill="${ACCENT}">София</tspan></text>
  </g>
  <g font-family="Arial, sans-serif" fill="#534F45">
    <text x="82" y="420" font-size="30">Три програми · 0 лв. · без условия</text>
  </g>
  <g font-family="Arial, sans-serif">
    <rect x="80" y="470" width="430" height="64" rx="32" fill="${INK}"/>
    <text x="295" y="510" font-size="26" font-weight="700" fill="${BG}"
          text-anchor="middle" font-family="Arial, sans-serif">Запиши се безплатно</text>
  </g>
  <g font-family="Arial, sans-serif" fill="#6B665C">
    <text x="80" y="585" font-size="24">с Радослав Додников · Software Engineer @ SAP · УНСС</text>
  </g>
  <circle cx="1080" cy="120" r="60" fill="none" stroke="${ACCENT}" stroke-width="3" opacity="0.5"/>
  <circle cx="1120" cy="300" r="30" fill="${ACCENT}" opacity="0.15"/>
  <circle cx="1010" cy="250" r="14" fill="${ACCENT}" opacity="0.3"/>
</svg>`;

async function main() {
  await sharp(Buffer.from(ogSvg)).png().toFile(join(pub, 'og-image.png'));
  await sharp(Buffer.from(iconSvg(512))).resize(512, 512).png().toFile(join(pub, 'icon-512.png'));
  await sharp(Buffer.from(iconSvg(192))).resize(192, 192).png().toFile(join(pub, 'icon-192.png'));
  await sharp(Buffer.from(iconSvg(180))).resize(180, 180).png().toFile(join(pub, 'apple-touch-icon.png'));
  console.log('✓ generated og-image.png, icon-512.png, icon-192.png, apple-touch-icon.png');
}

main();
