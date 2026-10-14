// Builds web media for the Design Ideas page (ideas.html) from the reel sources in PROMO-VIDEO/.
// Usage: node make-ideas-media.mjs
// To add a new reel: add its cover to POSTERS and its room renders to ROOMS, run this,
// encode the video (see README note in assets/ideas-data.js), then add an entry to assets/ideas-data.js.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'PROMO-VIDEO/out';
const PUB = 'PROMO-VIDEO/public';

const POSTERS = {
  'living-1': `${OUT}/nats-palette-cover.jpg`,
  'living-2': `${OUT}/nats-palette-2-cover.jpg`,
  'bedroom': `${OUT}/nats-bedroom-cover.jpg`,
  'kitchen': `${OUT}/nats-kitchen-cover.jpg`,
  'bathroom': `${OUT}/nats-bathroom-cover.jpg`,
  'material-board': `${OUT}/nats-material-cover.jpg`,
  'panel-marble': `${OUT}/nats-pairing-cover.jpg`,
};

const ROOMS = {
  'living-blush': 'palette/blush.jpg',
  'living-sage': 'palette/sage.jpg',
  'living-pearl': 'palette/pearl.jpg',
  'living-sand': 'palette/sand.jpg',
  'living-orange': 'palette2/p1-orange.jpg',
  'living-teal': 'palette2/p2-teal.jpg',
  'living-caramel': 'palette2/p3-caramel.jpg',
  'living-burgundy': 'palette2/p4-burgundy.jpg',
  'living-olive': 'palette2/p5-olive.jpg',
  'bedroom-blue': 'bedroom/blue.jpg',
  'bedroom-olive': 'bedroom/olive.jpg',
  'bedroom-teal': 'bedroom/teal.jpg',
  'bedroom-terracotta': 'bedroom/terracotta.jpg',
  'kitchen-olive': 'palette4/k1-olive.jpg',
  'kitchen-rose': 'palette4/k2-rose.jpg',
  'kitchen-oak': 'palette4/k3-oak.jpg',
  'kitchen-grey': 'palette4/k4-grey.jpg',
  'kitchen-cappuccino': 'palette4/k5-cappuccino.jpg',
  'bathroom-bronze': 'palette3/b1-bronze.jpg',
  'bathroom-viola': 'palette3/b2-viola.jpg',
  'bathroom-navy': 'palette3/b3-navy.jpg',
  'bathroom-rose': 'palette3/b4-rose.jpg',
  'bathroom-sage': 'palette3/b5-sage.jpg',
  'material-kitchen': 'material/kitchen.jpg',
  'material-bathroom': 'material/bathroom.jpg',
  'material-living': 'material/living.jpg',
  'pair-navy': 'pair/navy.jpg',
  'pair-sage': 'pair/sage.jpg',
  'pair-beige': 'pair/beige.jpg',
  'pair-charcoal': 'pair/charcoal.jpg',
};

mkdirSync('assets/ideas/posters', { recursive: true });
mkdirSync('assets/ideas/rooms', { recursive: true });

for (const [name, src] of Object.entries(POSTERS)) {
  await sharp(src).resize(540, 960, { fit: 'cover' }).webp({ quality: 74 }).toFile(`assets/ideas/posters/${name}.webp`);
}
for (const [name, src] of Object.entries(ROOMS)) {
  await sharp(`${PUB}/${src}`).resize(600, 800, { fit: 'cover', position: 'centre' }).webp({ quality: 72 }).toFile(`assets/ideas/rooms/${name}.webp`);
}
console.log(`posters: ${Object.keys(POSTERS).length}, rooms: ${Object.keys(ROOMS).length}`);
