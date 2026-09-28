/* NATS cost estimator — client-side calculation only. No data leaves the browser. */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('estimator-form');
    if (!form || !window.NATS_RATES) return;
    var R = window.NATS_RATES;
    var fmt = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 });
    var aed = function (n) { return 'AED ' + fmt.format(Math.round(n)); };

    var poolWrap = document.getElementById('pool-size-wrap');
    var landWrap = document.getElementById('land-area-wrap');
    var poolCheckbox = form.querySelector('[name="pool"]');
    var landCheckbox = form.querySelector('[name="landscape"]');

    var toggleConditional = function () {
      poolWrap.classList.toggle('hidden', !poolCheckbox.checked);
      landWrap.classList.toggle('hidden', !landCheckbox.checked);
    };
    poolCheckbox.addEventListener('change', toggleConditional);
    landCheckbox.addEventListener('change', toggleConditional);
    toggleConditional();

    var resultsEmpty = document.getElementById('results-empty');
    var resultsFilled = document.getElementById('results-filled');
    var lineItemsEl = document.getElementById('line-items');
    var totalLowEl = document.getElementById('total-low');
    var totalHighEl = document.getElementById('total-high');
    var amcEl = document.getElementById('amc-estimate');

    var calculate = function (e) {
      if (e) e.preventDefault();

      var propertyType = form.querySelector('[name="property-type"]').value;
      var tier = form.querySelector('[name="tier"]:checked');
      var area = parseFloat(form.querySelector('[name="area"]').value);

      if (!tier || !area || area <= 0) {
        form.reportValidity();
        return;
      }
      tier = tier.value;

      var lines = [];

      var fitOutRate = R.fitOut[propertyType][tier];
      var fitOutCost = fitOutRate * area;
      lines.push({ label: 'Turnkey fit-out (base)', amount: fitOutCost });

      if (form.querySelector('[name="automation"]').checked) {
        var autoCost = R.automation.base[tier] + R.automation.perSqm[tier] * area;
        lines.push({ label: 'Home automation', amount: autoCost });
      }

      if (form.querySelector('[name="cinema"]').checked) {
        lines.push({ label: 'Home cinema', amount: R.cinema[tier] });
      }

      if (poolCheckbox.checked) {
        var poolSize = form.querySelector('[name="pool-size"]').value;
        lines.push({ label: 'Swimming pool (' + poolSize + ')', amount: R.pool[poolSize] });
      }

      if (landCheckbox.checked) {
        var gardenArea = parseFloat(form.querySelector('[name="land-area"]').value) || 0;
        if (gardenArea > 0) {
          lines.push({ label: 'Landscaping', amount: R.landscape[tier] * gardenArea });
        }
      }

      var total = lines.reduce(function (sum, l) { return sum + l.amount; }, 0);
      var low = total * R.rangeLow;
      var high = total * R.rangeHigh;
      var amc = total * R.amcPercent;

      lineItemsEl.innerHTML = '';
      lines.forEach(function (l) {
        var row = document.createElement('div');
        row.className = 'flex items-center justify-between py-2.5 border-b border-line text-[13.5px]';
        row.innerHTML = '<span class="text-taupe">' + l.label + '</span><span class="text-warm font-semibold">' + aed(l.amount) + '</span>';
        lineItemsEl.appendChild(row);
      });

      totalLowEl.textContent = aed(low);
      totalHighEl.textContent = aed(high);
      amcEl.textContent = aed(amc) + ' / year';

      resultsEmpty.classList.add('hidden');
      resultsFilled.classList.remove('hidden');
      resultsFilled.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    form.addEventListener('submit', calculate);
  });
})();
