/* NATS cost estimator — rate configuration.
   Every figure here is an INDICATIVE PLACEHOLDER based on typical Dubai market
   ranges. NATS has not confirmed these rates. Replace with real numbers from the
   "NATS Website Pricing Workbook" before relying on this publicly. */
window.NATS_RATES = {
  // Full turnkey renovation, AED per square metre of built-up area
  // (excludes bathrooms, which are priced per bathroom below).
  fitOut: {
    apartment:  { standard: 1200, premium: 1900, ultra: 3000 },
    townhouse:  { standard: 1100, premium: 1750, ultra: 2800 },
    villa:      { standard: 1050, premium: 1700, ultra: 2900 },
    commercial: { standard: 900,  premium: 1400, ultra: 2300 }
  },

  // Share of the full turnkey rate charged for each scope of work.
  scope: {
    light:    0.25, // paint, minor repairs, fixtures swap
    standard: 0.60, // + flooring, ceilings, joinery refresh, kitchen/bath updates
    turnkey:  1.00  // full strip-out to handover, incl. design & MEP
  },

  // Bathroom renovation, AED per bathroom at full scope, by finish tier
  bathroom: { standard: 22000, premium: 38000, ultra: 65000 },
  // Share of the bathroom rate per scope (light = regrout, fixtures only)
  bathroomScope: { light: 0.20, standard: 0.70, turnkey: 1.00 },

  // Home automation: one-off base fee (AED) + rate per sqm of the property
  automation: {
    base:   { standard: 15000, premium: 15000, ultra: 15000 },
    perSqm: { standard: 40, premium: 70, ultra: 120 }
  },
  // Dedicated home cinema room, flat fee (AED) by tier
  cinema: { standard: 60000, premium: 120000, ultra: 220000 },
  // Swimming pool, flat fee (AED) by size
  pool: { small: 80000, medium: 140000, large: 220000 },
  // Landscaping, AED per sqm of garden area, by tier
  landscape: { standard: 150, premium: 250, ultra: 400 },

  // Facilities Management & AMC — annual fee as a percentage of total project value
  amcPercent: 0.06,

  // Timeline (weeks). total = base + area/100 * perHundredSqm + bathrooms * perBathroom
  //   + the longest add-on in full + half of any other add-ons. Shown as a range.
  timeline: {
    base:          { light: 2,   standard: 5,   turnkey: 8 },
    perHundredSqm: { light: 0.6, standard: 1.2, turnkey: 2 },
    perBathroom:   { light: 0.3, standard: 0.6, turnkey: 0.8 },
    addon: { automation: 1, cinema: 3, pool: 10, landscape: 3 }
  },

  // Typical built-up area (m²) used to suggest a size from the bedroom count
  typicalArea: {
    apartment:  { base: 45,  perBedroom: 38 },
    townhouse:  { base: 110, perBedroom: 55 },
    villa:      { base: 160, perBedroom: 75 },
    commercial: { base: 120, perBedroom: 0 }
  },

  // The range shown around the calculated figures
  rangeLow: 0.90,
  rangeHigh: 1.15
};
