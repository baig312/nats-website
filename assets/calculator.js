/* NATS cost estimator — 5-step wizard. Client-side calculation only; no data leaves the browser. */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('estimator-form');
    if (!form || !window.NATS_RATES) return;
    var R = window.NATS_RATES;
    var FT2_PER_M2 = 10.7639;
    var LAST = 5, RESULT = 6;
    var step = 1;

    var fmt = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 });
    var aed = function (n) { return 'AED ' + fmt.format(Math.round(n / 1000) * 1000); };
    var $ = function (sel) { return form.querySelector(sel); };
    var val = function (name) { var el = form.querySelector('[name="' + name + '"]:checked'); return el ? el.value : null; };
    var checked = function (name) { return $('[name="' + name + '"]').checked; };

    var panels = form.querySelectorAll('[data-step]');
    var dots = form.querySelectorAll('[data-step-dot]');
    var back = document.getElementById('calc-back');
    var next = document.getElementById('calc-next');
    var nav = document.getElementById('calc-nav');
    var area = $('#area');
    var areaTouched = false;

    // ---------- step navigation ----------
    function show(n) {
      step = n;
      panels.forEach(function (p) { p.hidden = Number(p.getAttribute('data-step')) !== n; });
      dots.forEach(function (d) {
        var i = Number(d.getAttribute('data-step-dot'));
        d.classList.toggle('is-active', i === n);
        d.classList.toggle('is-done', i < n);
      });
      back.hidden = n === 1;
      nav.hidden = n === RESULT;
      next.innerHTML = n === LAST ? 'See my estimate &rarr;' : 'Continue &rarr;';
      var top = form.getBoundingClientRect().top + window.scrollY - 100;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (step === 2) {
        var a = parseFloat(area.value);
        if (!a || a <= 0) { area.focus(); area.reportValidity(); return; }
      }
      if (step < LAST) { show(step + 1); return; }
      render();
      show(RESULT);
    });
    back.addEventListener('click', function () { if (step > 1) show(step - 1); });
    document.getElementById('calc-restart').addEventListener('click', function () { show(1); });

    // Picking a single-choice tile moves on automatically (steps 1, 3, 4).
    form.querySelectorAll('input[type="radio"][name="property-type"], input[type="radio"][name="scope"], input[type="radio"][name="tier"]').forEach(function (r) {
      r.addEventListener('click', function (e) { if (!e.detail) return; setTimeout(function () { if (step < LAST) show(step + 1); }, 220); });
    });

    // ---------- size step ----------
    var bedrooms = $('#bedrooms'), bathrooms = $('#bathrooms');
    var bedOut = document.getElementById('bedrooms-out'), bathOut = document.getElementById('bathrooms-out');
    var bedWrap = document.getElementById('bedrooms-wrap');

    function unit() { return val('unit') || 'm2'; }
    function areaM2() {
      var a = parseFloat(area.value) || 0;
      return unit() === 'ft2' ? a / FT2_PER_M2 : a;
    }
    function suggestArea() {
      if (areaTouched) return;
      var t = R.typicalArea[val('property-type')] || R.typicalArea.apartment;
      var m2 = t.base + t.perBedroom * Number(bedrooms.value);
      area.value = Math.round(unit() === 'ft2' ? m2 * FT2_PER_M2 : m2);
    }
    function syncSliders() {
      var b = Number(bedrooms.value);
      bedOut.textContent = b === 0 ? 'Studio' : (b === 8 ? '8+' : b);
      bathOut.textContent = Number(bathrooms.value) === 8 ? '8+' : bathrooms.value;
      [bedrooms, bathrooms].forEach(function (s) {
        s.style.setProperty('--fill', (s.value / s.max * 100) + '%');
      });
    }
    area.addEventListener('input', function () { areaTouched = true; });
    bedrooms.addEventListener('input', function () { syncSliders(); suggestArea(); });
    bathrooms.addEventListener('input', syncSliders);
    form.querySelectorAll('[name="unit"]').forEach(function (u) {
      u.addEventListener('change', function () {
        var a = parseFloat(area.value) || 0;
        area.value = Math.round(u.value === 'ft2' ? a * FT2_PER_M2 : a / FT2_PER_M2);
      });
    });
    form.querySelectorAll('[name="property-type"]').forEach(function (p) {
      p.addEventListener('change', function () {
        var commercial = p.value === 'commercial';
        bedWrap.hidden = commercial;
        suggestArea();
      });
    });

    // ---------- extras step ----------
    var poolWrap = document.getElementById('pool-size-wrap');
    var landWrap = document.getElementById('land-area-wrap');
    function toggleExtras() {
      poolWrap.hidden = !checked('pool');
      landWrap.hidden = !checked('landscape');
    }
    $('[name="pool"]').addEventListener('change', toggleExtras);
    $('[name="landscape"]').addEventListener('change', toggleExtras);

    // ---------- calculation ----------
    var LABELS = {
      'property-type': { apartment: 'apartment', townhouse: 'townhouse', villa: 'villa', commercial: 'commercial space' },
      scope: { light: 'Light refresh', standard: 'Standard renovation', turnkey: 'Full turnkey renovation' },
      tier: { standard: 'Standard', premium: 'Premium', ultra: 'Ultra-premium' }
    };

    function render() {
      var type = val('property-type'), scope = val('scope'), tier = val('tier');
      var m2 = areaM2();
      var beds = Number(bedrooms.value), baths = Number(bathrooms.value);
      var lines = [];

      lines.push({ label: LABELS.scope[scope] + ' · ' + fmt.format(Math.round(m2)) + ' m²', amount: R.fitOut[type][tier] * R.scope[scope] * m2 });
      if (baths > 0) {
        lines.push({ label: 'Bathrooms × ' + baths, amount: R.bathroom[tier] * R.bathroomScope[scope] * baths });
      }

      var addonWeeks = [];
      if (checked('automation')) {
        lines.push({ label: 'Home automation', amount: R.automation.base[tier] + R.automation.perSqm[tier] * m2 });
        addonWeeks.push(R.timeline.addon.automation);
      }
      if (checked('cinema')) {
        lines.push({ label: 'Home cinema', amount: R.cinema[tier] });
        addonWeeks.push(R.timeline.addon.cinema);
      }
      if (checked('pool')) {
        var size = $('[name="pool-size"]').value;
        lines.push({ label: 'Swimming pool (' + size + ')', amount: R.pool[size] });
        addonWeeks.push(R.timeline.addon.pool);
      }
      if (checked('landscape')) {
        var garden = parseFloat($('[name="land-area"]').value) || 0;
        if (garden > 0) {
          lines.push({ label: 'Landscaping · ' + fmt.format(garden) + ' m²', amount: R.landscape[tier] * garden });
          addonWeeks.push(R.timeline.addon.landscape);
        }
      }

      var extras = lines.slice(baths > 0 ? 2 : 1).map(function (l) { return l.label.split(' · ')[0]; });
      var total = lines.reduce(function (s, l) { return s + l.amount; }, 0);
      var low = total * R.rangeLow, high = total * R.rangeHigh;

      // Timeline: base + size + bathrooms + longest add-on in full, others at half.
      var T = R.timeline;
      var weeks = T.base[scope] + (m2 / 100) * T.perHundredSqm[scope] + baths * T.perBathroom[scope];
      addonWeeks.sort(function (a, b) { return b - a; }).forEach(function (w, i) { weeks += i === 0 ? w : w / 2; });
      var wLow = Math.max(1, Math.round(weeks * R.rangeLow));
      var wHigh = Math.max(wLow + 1, Math.round(weeks * R.rangeHigh));

      document.getElementById('total-low').textContent = aed(low);
      document.getElementById('total-high').textContent = aed(high);
      document.getElementById('timeline').textContent = wLow + '–' + wHigh + ' weeks';
      document.getElementById('amc-estimate').textContent = aed(total * R.amcPercent) + ' / year';

      var summary = LABELS.tier[tier] + ' finish · ' + LABELS.scope[scope].toLowerCase() + ' of a ' +
        (type === 'commercial' ? '' : (beds === 0 ? 'studio ' : beds + '-bedroom ')) + LABELS['property-type'][type];
      document.getElementById('result-summary').textContent = summary.charAt(0).toUpperCase() + summary.slice(1);

      var list = document.getElementById('line-items');
      list.innerHTML = '';
      lines.forEach(function (l) {
        var row = document.createElement('div');
        row.className = 'calc-line';
        var name = document.createElement('span');
        name.textContent = l.label;
        var amt = document.createElement('span');
        amt.textContent = aed(l.amount);
        row.appendChild(name); row.appendChild(amt);
        list.appendChild(row);
      });

      var msg = 'Hi NATS, I used the cost estimator on natsae.com.\n' +
        '• ' + summary.charAt(0).toUpperCase() + summary.slice(1) + '\n' +
        '• Size: ' + fmt.format(Math.round(m2)) + ' m², ' + baths + ' bathroom' + (baths === 1 ? '' : 's') + '\n' +
        (extras.length ? '• Extras: ' + extras.join(', ') + '\n' : '') +
        '• Estimate: ' + aed(low) + ' – ' + aed(high) + ', ' + wLow + '–' + wHigh + ' weeks\n' +
        'Could you arrange a site visit for an exact quote?';
      document.getElementById('wa-estimate').href = 'https://wa.me/971522299418?text=' + encodeURIComponent(msg);
    }

    syncSliders();
    show(1);
  });
})();
