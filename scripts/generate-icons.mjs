import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "public/icons");
mkdirSync(outDir, { recursive: true });

function svg(size, { padding = 0 } = {}) {
  const r = size / 2;
  const inner = r - padding;
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#282b2e" rx="${padding ? 0 : size * 0.18}"/>
    <circle cx="${r}" cy="${r}" r="${inner * 0.78}" fill="none" stroke="#5fd0e4" stroke-width="${size * 0.035}"/>
    <circle cx="${r}" cy="${r}" r="${inner * 0.5}" fill="#8fd1a0"/>
    <text x="${r}" y="${r + size * 0.02}" font-family="Arial, sans-serif" font-weight="700"
      font-size="${size * 0.28}" fill="#1b2e22" text-anchor="middle" dominant-baseline="middle">OP</text>
  </svg>`;
}

const targets = [
  { file: "icon-192.png", size: 192, padding: 0 },
  { file: "icon-512.png", size: 512, padding: 0 },
  { file: "icon-maskable-512.png", size: 512, padding: 512 * 0.1 },
];

for (const t of targets) {
  const buf = Buffer.from(svg(t.size, { padding: t.padding }));
  await sharp(buf).png().toFile(path.join(outDir, t.file));
  console.log("wrote", t.file);
}
