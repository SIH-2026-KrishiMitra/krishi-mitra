import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Source: the exact PNG provided by the user
const srcPath = 'C:\\Users\\moham\\OneDrive\\Pictures\\Screenshots\\Screenshot 2026-09-07 211235.png';
const srcBuffer = readFileSync(srcPath);

async function generate() {
  // High-res master for PWA / apple-touch-icon
  await sharp(srcBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(join(root, 'public', 'favicon-512x512.png'));

  // apple-touch-icon (180x180)
  await sharp(srcBuffer)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(join(root, 'public', 'apple-touch-icon.png'));

  // Standard PNG sizes
  await sharp(srcBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(join(root, 'public', 'favicon-32x32.png'));

  await sharp(srcBuffer)
    .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(join(root, 'public', 'favicon-16x16.png'));

  // Build multi-res ICO (16, 32, 48)
  const ico16 = await sharp(srcBuffer).resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toBuffer();
  const ico32 = await sharp(srcBuffer).resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toBuffer();
  const ico48 = await sharp(srcBuffer).resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toBuffer();

  writeFileSync(join(root, 'public', 'favicon.ico'), buildIco([ico16, ico32, ico48]));

  console.log('All favicons generated from source PNG.');
}

function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  const buf = Buffer.alloc(headerSize + pngBuffers.reduce((s, b) => s + b.length, 0));

  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);

  let offset = headerSize;
  pngBuffers.forEach((png, i) => {
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);
    const e = 6 + i * 16;
    buf.writeUInt8(w >= 256 ? 0 : w, e);
    buf.writeUInt8(h >= 256 ? 0 : h, e + 1);
    buf.writeUInt8(0, e + 2);
    buf.writeUInt8(0, e + 3);
    buf.writeUInt16LE(1, e + 4);
    buf.writeUInt16LE(32, e + 6);
    buf.writeUInt32LE(png.length, e + 8);
    buf.writeUInt32LE(offset, e + 12);
    png.copy(buf, offset);
    offset += png.length;
  });

  return buf;
}

generate().catch(err => { console.error(err); process.exit(1); });
