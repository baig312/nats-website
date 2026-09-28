// One-off image optimization pass for the NATS static site.
// Re-encodes every raster asset in place (same path/format) at sane
// quality settings, strips metadata, and never upscales. Run again any
// time new images are dropped into /assets.
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve('assets');
const MAX_WIDTH = 2000; // nothing on this site needs to be wider than this

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

function fmtKB(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }

async function optimizeOne(file) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return null;

  const before = (await fs.stat(file)).size;
  const buf = await fs.readFile(file);
  const img = sharp(buf, { failOn: 'none' });
  const meta = await img.metadata();

  let pipeline = img.rotate(); // apply EXIF orientation, then strip it
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  let outBuf;
  if (ext === '.png') {
    outBuf = await pipeline.png({ quality: 82, compressionLevel: 9, palette: true }).toBuffer();
  } else if (ext === '.webp') {
    outBuf = await pipeline.webp({ quality: 82 }).toBuffer();
  } else {
    outBuf = await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  }

  if (outBuf.length < before) {
    await fs.writeFile(file, outBuf);
    return { file, before, after: outBuf.length };
  }
  return { file, before, after: before, skipped: true };
}

const files = await walk(ROOT);
let totalBefore = 0, totalAfter = 0;
console.log(`Scanning ${files.length} files under /assets ...\n`);
for (const file of files) {
  const res = await optimizeOne(file);
  if (!res) continue;
  totalBefore += res.before;
  totalAfter += res.after;
  const rel = path.relative(ROOT, res.file);
  if (res.skipped) {
    console.log(`  =  ${rel}  (${fmtKB(res.before)}, already optimal)`);
  } else {
    const pct = (100 * (1 - res.after / res.before)).toFixed(0);
    console.log(`  ↓  ${rel}  ${fmtKB(res.before)} → ${fmtKB(res.after)}  (-${pct}%)`);
  }
}
console.log(`\nTotal: ${fmtKB(totalBefore)} → ${fmtKB(totalAfter)}  (saved ${fmtKB(totalBefore - totalAfter)})`);
