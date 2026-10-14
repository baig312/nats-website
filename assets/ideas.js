/* Renders the Design Ideas library (ideas.html) from window.NATS_IDEAS (assets/ideas-data.js). */
(function () {
  var data = window.NATS_IDEAS || [];
  var root = document.getElementById('ideas-list');
  var filters = document.getElementById('ideas-filters');
  if (!root) return;

  var WA = 'https://wa.me/971522299418?text=';
  var IG = 'https://www.instagram.com/natsdubai/';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
  function fmtDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function chip(hex) {
    return '<span class="inline-block w-5 h-5 rounded-full ring-1 ring-black/10 shrink-0" style="background:' + esc(hex) + '"></span>';
  }
  function waLink(text) { return WA + encodeURIComponent(text); }

  function schemeCard(c, item, n) {
    var label, swatches, msg;
    if (c.type === 'materials') {
      label = item.name + ' material board';
      swatches = '<ul class="mt-3 space-y-1.5">' + item.materials.map(function (m) {
        return '<li class="flex items-center gap-2.5 text-[13px] text-body">' + chip(m[1]) + esc(m[0]) + '</li>';
      }).join('') + '</ul>';
      msg = 'Hi NATS, I like the ' + item.name + ' material board from your Design Ideas page (natsae.com/ideas). Can you advise on this for my space?';
    } else {
      var first = item.name + (item.note ? ' ' + item.note.toLowerCase() : '');
      var second = item.name2 + (item.note2 ? ' ' + item.note2.toLowerCase() : '');
      label = first + ' & ' + second;
      swatches =
        '<div class="mt-3 space-y-1.5">' +
          '<div class="flex items-center gap-2.5 text-[13.5px] text-warm">' + chip(item.hex) + '<span>' + esc(item.name) + (item.note ? ' <span class="text-taupe">· ' + esc(item.note) + '</span>' : '') + '</span></div>' +
          '<div class="flex items-center gap-2.5 text-[13.5px] text-warm">' + chip(item.hex2) + '<span>' + esc(item.name2) + (item.note2 ? ' <span class="text-taupe">· ' + esc(item.note2) + '</span>' : '') + '</span></div>' +
        '</div>';
      msg = 'Hi NATS, I like the ' + label + ' ' + c.space.toLowerCase() + ' scheme from your Design Ideas page (natsae.com/ideas). Can we discuss it for my ' + (c.space === 'Living room' ? 'living room' : c.space.toLowerCase()) + '?';
    }
    return (
      '<article class="group rounded-[14px] overflow-hidden bg-white/60 border border-[rgba(30,24,17,0.10)] flex flex-col">' +
        '<div class="relative aspect-[3/4] overflow-hidden bg-sand">' +
          '<img src="assets/ideas/rooms/' + esc(item.img) + '.webp" alt="' + esc(label) + ' — concept ' + esc(c.space.toLowerCase()) + ' render" loading="lazy" width="600" height="800" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]">' +
          '<span class="absolute top-3 left-3 rounded-full bg-espresso/75 text-cream text-[10.5px] tracking-[0.16em] uppercase font-semibold px-2.5 py-1">' + (c.type === 'materials' ? esc(item.name) : 'No. ' + (n < 10 ? '0' : '') + n) + '</span>' +
        '</div>' +
        '<div class="p-4 sm:p-5 flex flex-col flex-1">' +
          (c.type === 'materials' ? '<h4 class="font-display text-[22px] leading-tight text-warm">' + esc(item.name) + '</h4>' : '') +
          swatches +
          '<a href="' + waLink(msg) + '" target="_blank" rel="noopener" class="mt-auto pt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:text-[#5a4326]">I like this one <span aria-hidden="true">→</span></a>' +
        '</div>' +
      '</article>'
    );
  }

  function collection(c) {
    var count = c.items.length;
    var kind = c.type === 'materials' ? count + ' material boards' : c.type === 'pairing' ? count + ' pairings' : count + ' colour stories';
    return (
      '<section id="' + esc(c.id) + '" data-space="' + esc(slug(c.space)) + '" class="ideas-collection py-14 sm:py-20 border-t border-[rgba(30,24,17,0.12)] first:border-t-0">' +
        '<div class="grid lg:grid-cols-[300px_1fr] gap-10 lg:gap-14 items-start">' +
          '<div class="reveal lg:sticky lg:top-28 mx-auto lg:mx-0 w-full max-w-[300px]">' +
            '<div class="relative rounded-[22px] overflow-hidden bg-espresso shadow-[0_24px_60px_-28px_rgba(30,24,17,0.55)] aspect-[9/16]">' +
              '<video class="ideas-video absolute inset-0 w-full h-full object-cover" src="assets/ideas/video/' + esc(c.id) + '.mp4" poster="assets/ideas/posters/' + esc(c.id) + '.webp" muted loop playsinline preload="none" aria-label="' + esc(c.title) + ' reel"></video>' +
              '<button type="button" class="ideas-play absolute inset-0 flex items-center justify-center" aria-label="Play or pause the reel">' +
                '<span class="ideas-play-icon w-14 h-14 rounded-full bg-cream/90 text-espresso flex items-center justify-center shadow-lg transition-opacity">' +
                  '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
                '</span>' +
              '</button>' +
            '</div>' +
            '<a href="' + IG + '" target="_blank" rel="noopener" class="mt-3 flex items-center justify-center gap-2 text-[12.5px] text-taupe hover:text-accent">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>' +
              'Posted on Instagram · ' + fmtDate(c.posted) +
            '</a>' +
          '</div>' +
          '<div>' +
            '<p class="eyebrow mb-3 reveal">' + esc(c.space) + ' · ' + kind + '</p>' +
            '<h2 class="reveal font-display font-medium text-warm text-[34px] sm:text-[46px] leading-[1.04]">' + esc(c.title) + '</h2>' +
            '<p class="reveal text-body text-[16px] leading-relaxed mt-3 max-w-[58ch]">' + esc(c.intro) + '</p>' +
            '<div class="grid grid-cols-2 xl:grid-cols-' + (count === 3 ? '3' : count === 4 ? '4' : '3') + ' gap-3.5 sm:gap-5 mt-8">' +
              c.items.map(function (it, i) { return schemeCard(c, it, i + 1); }).join('') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  root.innerHTML = data.map(collection).join('');

  // Filters (built from the spaces present in the data)
  if (filters) {
    var spaces = [];
    data.forEach(function (c) { if (spaces.indexOf(c.space) === -1) spaces.push(c.space); });
    var order = ['Living room', 'Bedroom', 'Kitchen', 'Bathroom', 'Materials'];
    spaces.sort(function (a, b) { return (order.indexOf(a) + 99) % 99 - (order.indexOf(b) + 99) % 99; });
    filters.innerHTML = ['All'].concat(spaces).map(function (s, i) {
      return '<button type="button" data-filter="' + (i ? slug(s) : 'all') + '" aria-pressed="' + (i ? 'false' : 'true') + '" class="ideas-filter shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors">' + esc(s) + '</button>';
    }).join('');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b) return;
      var f = b.getAttribute('data-filter');
      filters.querySelectorAll('[data-filter]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      root.querySelectorAll('.ideas-collection').forEach(function (s) {
        s.hidden = !(f === 'all' || s.getAttribute('data-space') === f);
      });
    });
  }

  // Videos: autoplay (muted) while on screen, tap to pause/play
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vids = root.querySelectorAll('.ideas-video');
  function setIcon(v) {
    var icon = v.parentNode.querySelector('.ideas-play-icon');
    if (icon) icon.style.opacity = v.paused ? '1' : '0';
  }
  vids.forEach(function (v) {
    v.addEventListener('play', function () { setIcon(v); });
    v.addEventListener('pause', function () { setIcon(v); });
    v.parentNode.querySelector('.ideas-play').addEventListener('click', function () {
      v.dataset.user = '1';
      if (v.paused) { v.play().catch(function () {}); } else { v.pause(); }
    });
  });
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && en.intersectionRatio > 0.5) {
          if (v.dataset.user !== '1') v.play().catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: [0, 0.5, 0.75] });
    vids.forEach(function (v) { io.observe(v); });
  }
})();
