/* NATS cost estimator — rate configuration.
   Every figure here is a PLACEHOLDER guess for illustration only.
   NATS has not confirmed these rates. Replace with real numbers from
   the "NATS Website Pricing Workbook" before relying on this publicly. */
window.NATS_RATES = {
  // AED per square metre of built-up area, by property type and finish tier
  fitOut: {
    villa:      { standard: 280, premium: 450, ultra: 750 },
    apartment:  { standard: 250, premium: 400, ultra: 680 },
    commercial: { standard: 220, premium: 360, ultra: 600 }
  },
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
  // The range shown around the calculated total
  rangeLow: 0.90,
  rangeHigh: 1.15
};
