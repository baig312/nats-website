/* NATS cost estimator — 5-step wizard, WhatsApp unlock, interactive result.
   Client-side only: the estimate is calculated in the browser. The only data that
   leaves the page is the WhatsApp message the visitor chooses to send to NATS.

   NOTE on "WhatsApp verification": this is a reverse-code flow — the 4-digit code
   is written into the WhatsApp message to NATS, so the visitor must open WhatsApp
   to read it. A true server-sent WhatsApp OTP needs the WhatsApp Business API and a
   small backend (e.g. a Cloudflare Worker + Twilio Verify); see CALCULATOR-OTP.md. */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('estimator-form');
    if (!form || !window.NATS_RATES) return;
    var R = window.NATS_RATES;
    var WA_NUMBER = '971522299418';
    var FT2_PER_M2 = 10.7639;
    var LAST_Q = 5, UNLOCK = 6, RESULT = 7;
    var STORE = 'nats-estimator-v1';
    var step = 1;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var fmt = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 });
    var round1k = function (n) { return Math.round(n / 1000) * 1000; };
    var aed = function (n) { return 'AED ' + fmt.format(round1k(n)); };
    var $ = function (sel) { return form.querySelector(sel); };
    var byId = function (id) { return document.getElementById(id); };
    var val = function (name) { var el = form.querySelector('[name="' + name + '"]:checked'); return el ? el.value : null; };
    var checked = function (name) { return $('[name="' + name + '"]').checked; };
    var setRadio = function (name, v) { var el = form.querySelector('[name="' + name + '"][value="' + v + '"]'); if (el) el.checked = true; };

    function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
    function save(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) { /* private mode */ } }
    var stored = load();

    var LABELS = {
      type: { apartment: 'Apartment', townhouse: 'Townhouse', villa: 'Villa', commercial: 'Commercial' },
      typeLower: { apartment: 'apartment', townhouse: 'townhouse', villa: 'villa', commercial: 'commercial space' },
      scope: { light: 'Light refresh', standard: 'Standard renovation', turnkey: 'Full turnkey' },
      scopeLong: { light: 'light refresh', standard: 'standard renovation', turnkey: 'full turnkey renovation' },
      tier: { standard: 'Standard', premium: 'Premium', ultra: 'Ultra-premium' },
      extra: { automation: 'Automation', cinema: 'Cinema', pool: 'Pool', landscape: 'Landscaping' }
    };

    // ---------------------------------------------------------------- elements
    var panels = form.querySelectorAll('[data-step]');
    var dots = form.querySelectorAll('[data-step-dot]');
    var back = byId('calc-back'), next = byId('calc-next'), nav = byId('calc-nav'), count = byId('calc-count');
    var area = byId('area'), bedrooms = byId('bedrooms'), bathrooms = byId('bathrooms');
    var areaTouched = false;
    var touched = { type: true, size: false, scope: false, tier: false, extras: false };

    // ---------------------------------------------------------------- navigation
    function show(n, opts) {
      step = n;
      panels.forEach(function (p) { p.hidden = Number(p.getAttribute('data-step')) !== n; });
      var dotStep = Math.min(n, 6);
      dots.forEach(function (d) {
        var i = Number(d.getAttribute('data-step-dot'));
        d.classList.toggle('is-active', i === dotStep);
        d.classList.toggle('is-done', i < dotStep || n === RESULT);
      });
      back.hidden = n === 1;
      next.hidden = n >= UNLOCK;
      nav.hidden = n === RESULT;
      count.textContent = n <= LAST_Q ? 'Step ' + n + ' of 5' : '';
      next.innerHTML = n === LAST_Q ? 'See my estimate &rarr;' : 'Continue &rarr;';
      if (n >= 2) touched.size = true;
      if (n >= 3) touched.scope = true;
      if (n >= 4) touched.tier = true;
      if (n >= 5) touched.extras = true;
      updateSummary();
      if (!(opts && opts.noScroll)) {
        var top = form.getBoundingClientRect().top + window.scrollY - 96;
        if (Math.abs(window.scrollY - top) > 40 && window.scrollY > top - 400) window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      }
      if (n === UNLOCK) setTimeout(function () { byId('lead-name').focus({ preventScroll: true }); }, 60);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (step === 2) {
        var a = parseFloat(area.value);
        if (!a || a <= 0) { area.focus(); area.reportValidity(); return; }
      }
      if (step < LAST_Q) { show(step + 1); return; }
      if (step === LAST_Q) {
        if (stored.verified) { openResult(); } else { show(UNLOCK); }
      }
    });
    back.addEventListener('click', function () { if (step > 1) show(step === UNLOCK ? LAST_Q : step - 1); });
    byId('calc-restart').addEventListener('click', function () { show(1); });

    // Single-choice tiles advance automatically when clicked with a pointer.
    form.querySelectorAll('[name="property-type"], [name="scope"], [name="tier"]').forEach(function (r) {
      r.addEventListener('click', function (e) {
        if (!e.detail) return;
        setTimeout(function () { if (step < LAST_Q) show(step + 1); }, 240);
      });
    });

    // ---------------------------------------------------------------- size step
    var bedOut = byId('bedrooms-out'), bathOut = byId('bathrooms-out'), bedWrap = byId('bedrooms-wrap');
    function unit() { return val('unit') || 'm2'; }
    function areaM2() { var a = parseFloat(area.value) || 0; return unit() === 'ft2' ? a / FT2_PER_M2 : a; }
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
      [bedrooms, bathrooms].forEach(function (s) { s.style.setProperty('--fill', (s.value / s.max * 100) + '%'); });
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
    function onType() {
      bedWrap.hidden = val('property-type') === 'commercial';
      suggestArea();
    }
    form.querySelectorAll('[name="property-type"]').forEach(function (p) { p.addEventListener('change', onType); });

    // ---------------------------------------------------------------- extras step
    var poolWrap = byId('pool-size-wrap'), landWrap = byId('land-area-wrap');
    function toggleExtras() { poolWrap.hidden = !checked('pool'); landWrap.hidden = !checked('landscape'); }
    ['pool', 'landscape'].forEach(function (n) { $('[name="' + n + '"]').addEventListener('change', toggleExtras); });

    // ---------------------------------------------------------------- live summary
    var ringFg = byId('calc-ring-fg'), pctEl = byId('calc-pct');
    var RING = 2 * Math.PI * 52;
    if (ringFg) { ringFg.style.strokeDasharray = RING; ringFg.style.strokeDashoffset = RING; }
    function extrasList() {
      return ['automation', 'cinema', 'pool', 'landscape'].filter(checked).map(function (k) { return LABELS.extra[k]; });
    }
    function setSum(k, text) {
      var b = document.querySelector('#calc-sum [data-k="' + k + '"] b');
      if (b && b.textContent !== text) { b.textContent = text; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
    }
    function updateSummary() {
      var type = val('property-type');
      setSum('type', LABELS.type[type]);
      var beds = Number(bedrooms.value);
      setSum('size', touched.size ? fmt.format(Math.round(areaM2())) + ' m²' + (type === 'commercial' ? '' : ' · ' + (beds === 0 ? 'studio' : beds + ' bed')) : '—');
      setSum('scope', touched.scope ? LABELS.scope[val('scope')] : '—');
      setSum('tier', touched.tier ? LABELS.tier[val('tier')] : '—');
      var ex = extrasList();
      setSum('extras', touched.extras ? (ex.length ? ex.join(', ') : 'None') : (ex.length ? ex.join(', ') : '—'));
      var done = step >= RESULT ? 6 : Math.min(step - 1, 5);
      var pct = Math.round(done / 6 * 100);
      if (pctEl) pctEl.textContent = pct + '%';
      if (ringFg) ringFg.style.strokeDashoffset = RING * (1 - pct / 100);
    }
    form.addEventListener('input', updateSummary);
    form.addEventListener('change', updateSummary);

    // ---------------------------------------------------------------- calculation
    function compute(o) {
      var m2 = areaM2();
      var baths = Number(bathrooms.value), beds = Number(bedrooms.value);
      var lines = [];
      lines.push({ key: 'base', label: LABELS.scope[o.scope] + ' · ' + fmt.format(Math.round(m2)) + ' m²', amount: R.fitOut[o.type][o.tier] * R.scope[o.scope] * m2 });
      if (baths > 0) lines.push({ key: 'bath', label: 'Bathrooms × ' + baths, amount: R.bathroom[o.tier] * R.bathroomScope[o.scope] * baths });

      var addonWeeks = [], extras = [];
      if (checked('automation')) { lines.push({ key: 'x', label: 'Home automation', amount: R.automation.base[o.tier] + R.automation.perSqm[o.tier] * m2 }); addonWeeks.push(R.timeline.addon.automation); extras.push('automation'); }
      if (checked('cinema')) { lines.push({ key: 'x', label: 'Home cinema', amount: R.cinema[o.tier] }); addonWeeks.push(R.timeline.addon.cinema); extras.push('cinema'); }
      if (checked('pool')) { var size = $('[name="pool-size"]').value; lines.push({ key: 'x', label: 'Swimming pool (' + size + ')', amount: R.pool[size] }); addonWeeks.push(R.timeline.addon.pool); extras.push('pool'); }
      if (checked('landscape')) {
        var garden = parseFloat($('[name="land-area"]').value) || 0;
        if (garden > 0) { lines.push({ key: 'x', label: 'Landscaping · ' + fmt.format(garden) + ' m²', amount: R.landscape[o.tier] * garden }); addonWeeks.push(R.timeline.addon.landscape); extras.push('landscape'); }
      }
      var total = lines.reduce(function (s, l) { return s + l.amount; }, 0);
      var T = R.timeline;
      var weeks = T.base[o.scope] + (m2 / 100) * T.perHundredSqm[o.scope] + baths * T.perBathroom[o.scope];
      addonWeeks.sort(function (a, b) { return b - a; }).forEach(function (w, i) { weeks += i === 0 ? w : w / 2; });
      var wLow = Math.max(1, Math.round(weeks * R.rangeLow));
      var wHigh = Math.max(wLow + 1, Math.round(weeks * R.rangeHigh));
      var summary = LABELS.tier[o.tier] + ' finish · ' + LABELS.scopeLong[o.scope] + ' of a ' +
        (o.type === 'commercial' ? '' : (beds === 0 ? 'studio ' : beds + '-bedroom ')) + LABELS.typeLower[o.type];
      return {
        m2: m2, baths: baths, lines: lines, extras: extras, total: total,
        low: total * R.rangeLow, high: total * R.rangeHigh,
        weeks: weeks, wLow: wLow, wHigh: wHigh,
        summary: summary.charAt(0).toUpperCase() + summary.slice(1)
      };
    }
    function current() { return { type: val('property-type'), scope: val('scope'), tier: val('tier') }; }

    // ---------------------------------------------------------------- WhatsApp unlock
    var code = null;
    var otpWrap = byId('otp-wrap'), otpMsg = byId('otp-msg');
    var boxes = Array.prototype.slice.call(document.querySelectorAll('#otp-boxes input'));

    function waUrl(text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }
    function leadName() { return (byId('lead-name').value || '').trim().replace(/\s+/g, ' ').slice(0, 60); }
    function projectLines(r) {
      var ex = r.extras.map(function (k) { return LABELS.extra[k]; });
      return '• ' + r.summary + '\n' +
        '• Size: ' + fmt.format(Math.round(r.m2)) + ' m², ' + r.baths + ' bathroom' + (r.baths === 1 ? '' : 's') + '\n' +
        (ex.length ? '• Extras: ' + ex.join(', ') + '\n' : '');
    }
    function openWhatsApp() {
      var name = leadName();
      var input = byId('lead-name');
      if (name.length < 2) {
        input.setCustomValidity('Please enter your name');
        input.reportValidity();
        input.setCustomValidity('');
        input.focus();
        return;
      }
      if (!code) code = String(Math.floor(1000 + Math.random() * 9000));
      var r = compute(current());
      var msg = 'NATS estimate code: ' + code + '\n\n' +
        'Hi NATS, I\'m ' + name + '. I\'m planning a project and used your cost estimator:\n' +
        projectLines(r) +
        'Please send me a detailed quote.';
      window.open(waUrl(msg), '_blank', 'noopener');
      otpWrap.hidden = false;
      otpMsg.textContent = 'The code is at the top of the message WhatsApp just opened. Tap send so our team receives your details, then type the code here.';
      otpMsg.className = 'text-[13px] text-taupe mt-3';
      setTimeout(function () { boxes[0].focus(); }, 80);
    }
    byId('wa-verify').addEventListener('click', openWhatsApp);
    byId('wa-resend').addEventListener('click', openWhatsApp);
    byId('lead-name').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); openWhatsApp(); } });

    function otpValue() { return boxes.map(function (b) { return b.value; }).join(''); }
    function checkOtp() {
      var v = otpValue();
      if (v.length < 4) return;
      if (v === code) {
        stored = { verified: true, name: leadName(), at: Date.now() };
        save(stored);
        otpMsg.textContent = 'Verified. Unlocking your estimate…';
        otpMsg.className = 'text-[13px] text-accent mt-3 font-semibold';
        setTimeout(openResult, 450);
      } else {
        var wrap = byId('otp-boxes');
        wrap.classList.remove('shake'); void wrap.offsetWidth; wrap.classList.add('shake');
        otpMsg.textContent = 'That code doesn\'t match. Check the first line of the WhatsApp message and try again.';
        otpMsg.className = 'text-[13px] text-[#f0a48c] mt-3';
        boxes.forEach(function (b) { b.value = ''; });
        boxes[0].focus();
      }
    }
    boxes.forEach(function (b, i) {
      b.addEventListener('input', function () {
        b.value = b.value.replace(/\D/g, '').slice(-1);
        if (b.value && i < boxes.length - 1) boxes[i + 1].focus();
        checkOtp();
      });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !b.value && i > 0) boxes[i - 1].focus();
      });
      b.addEventListener('paste', function (e) {
        var t = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\D/g, '').slice(0, 4);
        if (!t) return;
        e.preventDefault();
        boxes.forEach(function (x, j) { x.value = t[j] || ''; });
        boxes[Math.min(t.length, 4) - 1].focus();
        checkOtp();
      });
    });

    // ---------------------------------------------------------------- result
    var shown = { low: 0, high: 0 };
    function animateNumber(el, from, to, ms) {
      if (reduce) { el.textContent = aed(to); return; }
      var t0 = null;
      function frame(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / ms);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = aed(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    var PHASES = {
      light: [['Survey & selections', 0, 0.15], ['Protection & prep', 0.1, 0.25], ['Painting & repairs', 0.2, 0.8], ['Fixtures & fittings', 0.6, 0.92], ['Snagging & handover', 0.88, 1]],
      standard: [['Design & selections', 0, 0.18], ['Approvals & procurement', 0.1, 0.3], ['Strip-out', 0.2, 0.32], ['MEP & ceilings', 0.28, 0.55], ['Floors, joinery & finishes', 0.45, 0.9], ['Snagging & handover', 0.88, 1]],
      turnkey: [['Concept & detailed design', 0, 0.2], ['Authority approvals', 0.12, 0.3], ['Demolition & strip-out', 0.25, 0.38], ['MEP & structure', 0.33, 0.62], ['Finishes & joinery', 0.55, 0.92], ['Testing & handover', 0.88, 1]]
    };
    function renderGantt(r, scope) {
      var phases = PHASES[scope].slice();
      if (r.extras.length) {
        var names = r.extras.map(function (k) { return LABELS.extra[k].toLowerCase(); });
        var label = names.join(', ');
        phases.splice(phases.length - 1, 0, [label.charAt(0).toUpperCase() + label.slice(1), 0.4, 0.95]);
      }
      var w = r.weeks;
      byId('gantt').innerHTML = phases.map(function (p) {
        var s = Math.round(p[1] * w), e = Math.max(s + 1, Math.round(p[2] * w));
        return '<div class="g-row"><span class="g-name">' + p[0] + '</span><span class="g-track"><i style="left:' + (p[1] * 100) + '%;width:' + ((p[2] - p[1]) * 100) + '%"></i></span><span class="g-wk">wk ' + (s + 1) + '–' + e + '</span></div>';
      }).join('');
    }
    function renderLines(r) {
      var max = Math.max.apply(null, r.lines.map(function (l) { return l.amount; }));
      byId('line-items').innerHTML = r.lines.map(function (l) {
        var pct = Math.round(l.amount / r.total * 100);
        return '<div class="b-row"><div class="b-top"><span>' + l.label + '</span><b>' + aed(l.amount) + '</b></div>' +
          '<div class="b-track"><i style="width:' + (l.amount / max * 100) + '%"></i></div><span class="b-pct">' + pct + '% of budget</span></div>';
      }).join('');
    }
    function syncSeg() {
      document.querySelectorAll('.calc-seg').forEach(function (seg) {
        var v = val(seg.getAttribute('data-seg'));
        seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-val') === v ? 'true' : 'false'); });
      });
    }
    function renderResult(animate) {
      var o = current();
      var r = compute(o);
      animateNumber(byId('total-low'), animate ? 0 : shown.low, r.low, animate ? 1300 : 600);
      animateNumber(byId('total-high'), animate ? 0 : shown.high, r.high, animate ? 1300 : 600);
      shown.low = r.low; shown.high = r.high;
      byId('result-summary').textContent = r.summary;
      byId('timeline').textContent = r.wLow + '–' + r.wHigh + ' weeks';
      byId('per-sqm').textContent = 'AED ' + fmt.format(Math.round(r.total / Math.max(1, r.m2) / 10) * 10);
      byId('amc-estimate').textContent = aed(r.total * R.amcPercent);
      renderLines(r);
      renderGantt(r, o.scope);
      syncSeg();
      var name = stored.name || leadName();
      byId('result-greeting').textContent = name ? name.split(' ')[0] + ', here is your indicative estimate' : 'Your indicative estimate';
      var msg = 'Hi NATS' + (name ? ', this is ' + name : '') + '. Here is my estimate from natsae.com:\n' +
        projectLines(r) +
        '• Estimate: ' + aed(r.low) + ' – ' + aed(r.high) + ', ' + r.wLow + '–' + r.wHigh + ' weeks\n' +
        'Could you arrange a site visit for an exact quote?';
      byId('wa-estimate').href = waUrl(msg);
    }
    function openResult() {
      show(RESULT);
      renderResult(true);
    }
    document.querySelectorAll('.calc-seg').forEach(function (seg) {
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        setRadio(seg.getAttribute('data-seg'), b.getAttribute('data-val'));
        updateSummary();
        renderResult(false);
      });
    });
    byId('calc-print').addEventListener('click', function () { window.print(); });

    // ---------------------------------------------------------------- deep links
    // calculator.html?type=villa  → preselects the property type and opens step 2
    var params = new URLSearchParams(window.location.search);
    var preType = params.get('type');
    syncSliders();
    if (preType && LABELS.type[preType]) {
      setRadio('property-type', preType);
      onType();
      show(2, { noScroll: true });
      setTimeout(function () {
        var top = form.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      }, 350);
    } else {
      onType();
      show(1, { noScroll: true });
    }
  });
})();
