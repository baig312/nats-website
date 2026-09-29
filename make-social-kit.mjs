// Generates profile pictures and cover banners for NATS social accounts.
// Output: SOCIAL-KIT/ (gitignored — upload these manually to each platform).
import sharp from 'sharp';
import { mkdirSync } from 'fs';

const OUT = 'SOCIAL-KIT';
mkdirSync(OUT, { recursive: true });

const ESPRESSO = '#1e1811';
const CREAM = '#f3ede3';
const BRONZE = '#c9a06a';
const MARK = 'assets/brand/logo/nats-mark-tan.png';
const PHOTO = 'assets/stock/svc-interior-design.webp';

const esc = (s) => s.replace(/&/g, '&amp;');

// Solid espresso canvas
const canvas = (w, h) => sharp({ create: { width: w, height: h, channels: 4, background: ESPRESSO } });

// Photo cropped to (w,h) with a left-to-right fade into espresso
async function fadedPhoto(w, h, fadeFrom = 0, fadeTo = 0.45, dim = 0.55) {
  const img = await sharp(PHOTO).resize(w, h, { fit: 'cover', position: 'centre' }).toBuffer();
  const overlay = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
      <stop offset="${fadeFrom}" stop-color="${ESPRESSO}" stop-opacity="1"/>
      <stop offset="${fadeTo}" stop-color="${ESPRESSO}" stop-opacity="${dim}"/>
      <stop offset="1" stop-color="${ESPRESSO}" stop-opacity="${dim * 0.55}"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/></svg>`);
  return sharp(img).composite([{ input: overlay }]).toBuffer();
}

// Text block: mark + NATS wordmark, tagline, services, URL
function textSvg(w, h, { x, y, scale = 1, align = 'start' }) {
  const s = (n) => Math.round(n * scale);
  const anchor = align === 'middle' ? 'middle' : 'start';
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Segoe UI, Arial, sans-serif" font-size="${s(20)}" letter-spacing="${s(6)}" fill="${BRONZE}">NAAMA ALBAYINA TECHNICAL SERVICES</text>
    <text x="${x}" y="${y + s(92)}" text-anchor="${anchor}" font-family="Georgia, 'Times New Roman', serif" font-size="${s(78)}" fill="${CREAM}">Design. Build. Automate.</text>
    <text x="${x}" y="${y + s(148)}" text-anchor="${anchor}" font-family="Segoe UI, Arial, sans-serif" font-size="${s(26)}" fill="${CREAM}" fill-opacity="0.78">${esc('Fit-Out · Interiors · MEP · Pools & Landscaping · Smart Homes')}</text>
    <text x="${x}" y="${y + s(204)}" text-anchor="${anchor}" font-family="Segoe UI, Arial, sans-serif" font-size="${s(24)}" letter-spacing="${s(3)}" fill="${BRONZE}">NATSAE.COM  ·  DUBAI, UAE</text>
  </svg>`);
}

async function banner(name, w, h, textOpts, photoOpts = {}) {
  const photo = await fadedPhoto(w, h, photoOpts.fadeFrom, photoOpts.fadeTo, photoOpts.dim);
  await canvas(w, h)
    .composite([{ input: photo }, { input: textSvg(w, h, textOpts) }])
    .png()
    .toFile(`${OUT}/${name}`);
  console.log('wrote', name);
}

async function avatar(name, size, bg, markScale = 0.46) {
  const m = Math.round(size * markScale);
  // Trim the source's uneven padding so the mark is optically centred
  const trimmed = await sharp(MARK).trim().toBuffer();
  const mark = await sharp(trimmed).resize(m, m, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: mark, gravity: 'centre' }])
    .png()
    .toFile(`${OUT}/${name}`);
  console.log('wrote', name);
}

// Profile pictures — mark kept inside the circular crop
await avatar('profile-1080-dark.png', 1080, ESPRESSO);
await avatar('profile-1080-cream.png', 1080, CREAM);

// Facebook cover 1640x624 — mobile shows the centre ~1110px, so text starts at x=300
await banner('facebook-cover-1640x624.png', 1640, 624, { x: 300, y: 190, scale: 1 }, { fadeFrom: 0.2, fadeTo: 0.62 });

// LinkedIn company cover 1128x191 (exported 2x). Logo overlaps bottom-left, so text sits right of it.
await banner('linkedin-cover-2256x382.png', 2256, 382, { x: 560, y: 70, scale: 1.05 }, { fadeFrom: 0.35, fadeTo: 0.7 });

// X / Twitter header 1500x500 — avatar overlaps bottom-left
await banner('x-header-1500x500.png', 1500, 500, { x: 360, y: 120, scale: 0.92 }, { fadeFrom: 0.3, fadeTo: 0.7 });

// YouTube 2560x1440 — safe area is the centre 1546x423
await banner('youtube-banner-2560x1440.png', 2560, 1440, { x: 1280, y: 560, scale: 1.3, align: 'middle' }, { fadeFrom: 0, fadeTo: 0.5, dim: 0.72 });
