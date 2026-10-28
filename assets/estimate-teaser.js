/* Homepage "Instant cost estimate" teaser — cycles sample estimates.
   Figures use the same formula and rates as the calculator (assets/calculator-rates.js),
   so they stay in step when the rates are updated. */
(function () {
  'use strict';
  var R = window.NATS_RATES;
  var el = function (id) { return document.getElementById(id); };
  if (!R || !el('est-demo-total')) return;

  var fmt = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 });
  var k = function (n) { return fmt.format(Math.round(n / 1000) * 1000); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SAMPLES = [
    { title: '2-bedroom apartment', type: 'apartment', area: 121, baths: 2, scope: 'standard', tier: 'premium', extras: [] },
    { title: '4-bedroom villa', type: 'villa', area: 460, baths: 5, scope: 'turnkey', tier: 'premium', extras: ['pool'] },
    { title: '3-bedroom townhouse', type: 'townhouse', area: 275, baths: 3, scope: 'standard', tier: 'standard', extras: ['automation'] },
    { title: 'Office fit-out, 200 m²', type: 'commercial', area: 200, baths: 2, scope: 'turnkey', tier: 'premium', extras: [] }
  ];
  var SCOPE = { light: 'light refresh', standard: 'standard renovation', turnkey: 'full turnkey' };
  var TIER = { standard: 'Standard', premium: 'Premium', ultra: 'Ultra-premium' };

  function estimate(s) {
    var parts = [
      { name: 'Renovation', v: R.fitOut[s.type][s.tier] * R.scope[s.scope] * s.area },
      { name: 'Bathrooms', v: R.bathroom[s.tier] * R.bathroomScope[s.scope] * s.baths }
    ];
    var addon = [];
    s.extras.forEach(function (x) {
      if (x === 'pool') { parts.push({ name: 'Pool', v: R.pool.medium }); addon.push(R.timeline.addon.pool); }
      if (x === 'automation') { parts.push({ name: 'Automation', v: R.automation.base[s.tier] + R.automation.perSqm[s.tier] * s.area }); addon.push(R.timeline.addon.automation); }
    });
    var total = parts.reduce(function (a, p) { return a + p.v; }, 0);
    var T = R.timeline;
    var w = T.base[s.scope] + s.area / 100 * T.perHundredSqm[s.scope] + s.baths * T.perBathroom[s.scope];
    addon.sort(function (a, b) { return b - a; }).forEach(function (x, i) { w += i ? x / 2 : x; });
    return { parts: parts, total: total, low: total * R.rangeLow, high: total * R.rangeHigh,
      wLow: Math.max(1, Math.round(w * R.rangeLow)), wHigh: Math.max(2, Math.round(w * R.rangeHigh)) };
  }

  var dots = el('est-demo-dots');
  dots.innerHTML = SAMPLES.map(function () { return '<i></i>'; }).join('');
  var i = 0, timer = null, prev = { low: 0, high: 0 };

  function render() {
    var s = SAMPLES[i], r = estimate(s);
    el('est-demo-title').textContent = s.title;
    el('est-demo-sub').textContent = TIER[s.tier] + ' finish · ' + SCOPE[s.scope] + (s.extras.length ? ' + ' + s.extras.join(', ') : '');
    el('est-demo-weeks').textContent = r.wLow + '–' + r.wHigh + ' weeks';
    var lo0 = prev.low, hi0 = prev.high;
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = reduce ? 1 : Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - p, 3);
      el('est-demo-total').textContent = 'AED ' + k(lo0 + (r.low - lo0) * e) + ' – ' + k(hi0 + (r.high - hi0) * e);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    prev = { low: r.low, high: r.high };
    var max = Math.max.apply(null, r.parts.map(function (p) { return p.v; }));
    el('est-demo-bars').innerHTML = r.parts.map(function (p) {
      return '<span class="b"><span class="n">' + p.name + '</span><span class="t"><i style="width:' + (p.v / max * 100) + '%"></i></span></span>';
    }).join('');
    Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle('on', j === i); });
  }

  function start() {
    render();
    if (reduce) return;
    timer = setInterval(function () { i = (i + 1) % SAMPLES.length; render(); }, 4200);
  }
  var demo = document.querySelector('.est-demo');
  demo.addEventListener('mouseenter', function () { clearInterval(timer); });
  demo.addEventListener('mouseleave', function () { clearInterval(timer); if (!reduce) timer = setInterval(function () { i = (i + 1) % SAMPLES.length; render(); }, 4200); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); start(); } }, { threshold: 0.3 });
    io.observe(demo);
  } else { start(); }
})();
