/* =====================================================================
   NATS — Design Ideas library (powers ideas.html)

   One entry per reel posted to Instagram (@natsdubai) / Facebook.
   NEWEST FIRST — add new reels at the TOP of the list.

   To add a reel:
   1. Encode a silent web copy (720x1280, ~2 MB) into assets/ideas/video/<id>.mp4
        ffmpeg -i <reel>.mp4 -an -vf "scale=720:1280:flags=lanczos,format=yuv420p"
               -c:v libx264 -preset slow -crf 27 -movflags +faststart assets/ideas/video/<id>.mp4
   2. Add its cover + room renders to make-ideas-media.mjs and run: node make-ideas-media.mjs
   3. Add an entry below. type: "palette" (two colours per scheme),
      "materials" (list of finishes per room) or "pairing" (wall panel + marble).
   ===================================================================== */
window.NATS_IDEAS = [
  {
    id: 'kitchen', space: 'Kitchen', type: 'palette', posted: '2026-10-14',
    title: 'Pick your palette — Kitchen edition',
    intro: 'Five kitchen colour stories, from olive cabinetry to soft cappuccino and off-white.',
    items: [
      { name: 'Olive Green', hex: '#6f7355', name2: 'Warm Beige', hex2: '#d7c3a6', img: 'kitchen-olive' },
      { name: 'Warm Ivory', hex: '#ebe2d1', name2: 'Dusty Rose', hex2: '#b98a84', img: 'kitchen-rose' },
      { name: 'Dark Oak', hex: '#574031', name2: 'Warm Greige', hex2: '#cabda7', img: 'kitchen-oak' },
      { name: 'Grey', hex: '#8e8e90', name2: 'Off White', hex2: '#eee8dc', img: 'kitchen-grey' },
      { name: 'Cappuccino', hex: '#a98b72', name2: 'Off White', hex2: '#ece3d4', img: 'kitchen-cappuccino' },
    ],
  },
  {
    id: 'bathroom', space: 'Bathroom', type: 'palette', posted: '2026-10-14',
    title: 'Pick your palette — Bathroom edition',
    intro: 'Stone and patina pairings for a spa-like bathroom — travertine, Calacatta Viola, navy and sage.',
    items: [
      { name: 'Silver Travertine', hex: '#b4ada1', name2: 'Bronze Patina', hex2: '#5f4026', img: 'bathroom-bronze' },
      { name: 'Calacatta Viola', hex: '#ece2e1', name2: 'Burgundy Patina', hex2: '#531522', img: 'bathroom-viola' },
      { name: 'Seal Grey Tile', hex: '#a7a199', name2: 'Fresh Navy', hex2: '#1f3a5f', img: 'bathroom-navy' },
      { name: 'Crema Marfil', hex: '#e6dbc3', name2: 'Dusty Rose', hex2: '#c08880', img: 'bathroom-rose' },
      { name: 'Ivory Travertine', hex: '#e4dac6', name2: 'Sage Green Patina', hex2: '#6a7156', img: 'bathroom-sage' },
    ],
  },
  {
    id: 'panel-marble', space: 'Living room', type: 'pairing', posted: '2026-10-14',
    title: 'Wall panel + marble pairings',
    intro: 'Fluted panels and louvers matched with natural marble — four feature-wall combinations.',
    items: [
      { name: 'Deep Navy Blue', note: 'Louvers', hex: '#26324d', name2: 'Panda White', note2: 'Marble', hex2: '#f3f2ee', img: 'pair-navy' },
      { name: 'Sage Green', note: 'Fluted panels', hex: '#8f9870', name2: 'White Onyx', note2: 'Marble', hex2: '#f5efe2', img: 'pair-sage' },
      { name: 'Taupe Beige', note: 'Fluted panels', hex: '#b4a588', name2: 'Crema Marfil', note2: 'Marble', hex2: '#f3ead9', img: 'pair-beige' },
      { name: 'Charcoal Grey', note: 'Louvers', hex: '#393c41', name2: 'Statuario', note2: 'Marble', hex2: '#f4f3f1', img: 'pair-charcoal' },
    ],
  },
  {
    id: 'material-board', space: 'Materials', type: 'materials', posted: '2026-10-13',
    title: 'Material board — kitchen, bathroom & living',
    intro: 'The finishes behind each room: woods, natural stone, brass and textiles that work together.',
    items: [
      { name: 'Kitchen', img: 'material-kitchen', materials: [
        ['Light Oak', '#d8bf95'], ['Natural Stone', '#e4d9c5'], ['Cabinet Finish', '#c6b89e'], ['Brass', '#d4b06a'], ['Wood Floor', '#b1824f'] ] },
      { name: 'Bathroom', img: 'material-bathroom', materials: [
        ['Natural Stone', '#6b4a36'], ['Walnut Wood', '#5b3d28'], ['Stone Vanity', '#e2d6be'], ['Brass', '#d4b06a'], ['Flooring', '#cac0ad'] ] },
      { name: 'Living Room', img: 'material-living', materials: [
        ['Walnut Wood', '#5b3d28'], ['Calacatta Marble', '#efebe3'], ['Brass', '#d4b06a'], ['Bronze Glass', '#45331c'], ['Textile', '#ccbda3'] ] },
    ],
  },
  {
    id: 'bedroom', space: 'Bedroom', type: 'palette', posted: '2026-10-13',
    title: 'Pick your palette — Bedroom edition',
    intro: 'Calm, restful bedroom schemes — dusty blue, olive, deep teal and terracotta.',
    items: [
      { name: 'Dusty Blue', hex: '#7f9bb8', name2: 'Soft Grey', hex2: '#d2d5d9', img: 'bedroom-blue' },
      { name: 'Olive Green', hex: '#6d7352', name2: 'Warm Beige', hex2: '#e7dcc6', img: 'bedroom-olive' },
      { name: 'Deep Teal', hex: '#1f5f6b', name2: 'Greige', hex2: '#ddd4c6', img: 'bedroom-teal' },
      { name: 'Terracotta', hex: '#b5623c', name2: 'Off-White', hex2: '#efe8dd', img: 'bedroom-terracotta' },
    ],
  },
  {
    id: 'living-2', space: 'Living room', type: 'palette', posted: '2026-10-13',
    title: 'Pick your palette — Living room, vol. 2',
    intro: 'Five bolder living-room stories — burnt orange, deep teal, caramel, burgundy and olive.',
    items: [
      { name: 'Burnt Orange', hex: '#b4531f', name2: 'Charcoal Grey', hex2: '#3d3f43', img: 'living-orange' },
      { name: 'Deep Teal', hex: '#13404a', name2: 'Soft Ivory', hex2: '#f3ebdd', img: 'living-teal' },
      { name: 'Dusty Caramel', hex: '#a8693f', name2: 'Cream Beige', hex2: '#f1e6d4', img: 'living-caramel' },
      { name: 'Burgundy Wine', hex: '#561722', name2: 'Pearl Grey', hex2: '#c9c3be', img: 'living-burgundy' },
      { name: 'Olive Sage', hex: '#6e6b3f', name2: 'Warm Ivory', hex2: '#f4ead9', img: 'living-olive' },
    ],
  },
  {
    id: 'living-1', space: 'Living room', type: 'palette', posted: '2026-10-13',
    title: 'Pick your palette — Living room',
    intro: 'Four soft, timeless living-room palettes — blush, sage, pearl grey and desert sand.',
    items: [
      { name: 'Blush Rose', hex: '#cf8a86', name2: 'Ivory', hex2: '#f3ece4', img: 'living-blush' },
      { name: 'Sage Green', hex: '#9aa894', name2: 'Cream', hex2: '#f2ebdf', img: 'living-sage' },
      { name: 'Pearl Grey', hex: '#a9a9ad', name2: 'Ivory', hex2: '#efe8df', img: 'living-pearl' },
      { name: 'Desert Sand', hex: '#c9a06a', name2: 'Walnut', hex2: '#6b4a33', img: 'living-sand' },
    ],
  },
];
