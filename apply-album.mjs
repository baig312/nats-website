// Maps real ALBUM/ photos onto the site's existing stock-photo slots,
// overwriting the file at each path so every page referencing it updates
// automatically (hero images, OG tags, JSON-LD).
import sharp from 'sharp';
import { promises as fs } from 'fs';

const HERO_WIDTH = 1800;
const BLOCK_WIDTH = 900;

const mapping = [
  ['ALBUM/NATS-FitOut-Office.jpg',            'assets/stock/svc-fitout.webp',            HERO_WIDTH],
  ['ALBUM/NATS-Landscaping-Garden.jpg',       'assets/stock/svc-landscape-pools.webp',   HERO_WIDTH],
  ['ALBUM/NATS-Cinema-Room.jpg',              'assets/stock/svc-automation-cinema.webp', HERO_WIDTH],
  ['ALBUM/NATS-MEP-Ductwork.jpg',             'assets/stock/svc-mep.webp',                HERO_WIDTH],
  ['ALBUM/NATS-InteriorDesign-LivingRoom.jpg','assets/stock/svc-interior-design.webp',    HERO_WIDTH],
  ['ALBUM/NATS-Facilities-ControlRoom.jpg',   'assets/stock/svc-facilities.webp',         HERO_WIDTH],
  ['ALBUM/NATS-InteriorDesign-Bedroom.jpg',   'assets/stock/interior-living.webp',        HERO_WIDTH],
  ['ALBUM/NATS-DubaiSkyline-Building.jpg',    'assets/stock/about-hero.webp',             HERO_WIDTH],
  ['ALBUM/NATS-Landscaping-Pool.jpg',         'assets/stock/pool-villa.webp',             HERO_WIDTH],
  ['ALBUM/NATS-Automation-SmartHome.jpg',     'assets/stock/landscape-patio.webp',        HERO_WIDTH],
  ['ALBUM/NATS-FitOut-Retail.jpg',            'assets/stock/interior-detail.webp',        BLOCK_WIDTH],
  ['ALBUM/NATS-FitOut-Office.jpg',            'assets/stock/fitout-reception.webp',       BLOCK_WIDTH],
];

for (const [src, dest, width] of mapping) {
  const buf = await fs.readFile(src);
  const out = await sharp(buf).rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  await fs.writeFile(dest, out);
  console.log(`${src}  →  ${dest}  (${(out.length / 1024).toFixed(1)} KB)`);
}
console.log('\nDone.');
