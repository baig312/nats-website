import sharp from 'sharp';
import { promises as fs } from 'fs';

const mark = 'assets/brand/logo/nats-mark-tan.png';
await fs.mkdir('assets/favicon', { recursive: true });

// Transparent favicons (browser tab / bookmarks)
for (const size of [16, 32, 48]) {
  await sharp(mark).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(`assets/favicon/favicon-${size}.png`);
}

// Apple touch icon — solid espresso background (Apple ignores transparency)
await sharp(mark)
  .resize(120, 120, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 30, bottom: 30, left: 30, right: 30, background: '#1e1811' })
  .png().toFile('assets/favicon/apple-touch-icon.png');

console.log('Favicons written to assets/favicon/');
