/* NATS — Atelier motion (library-free, progressive, reduced-motion aware). */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* ---- Reading-progress bar ---- */
    var bar = document.querySelector('.read-progress');
    if (bar) {
      var raf = 0;
      var upd = function () {
        raf = 0;
        var d = document.documentElement;
        var max = d.scrollHeight - d.clientHeight;
        var p = max > 0 ? Math.min(1, (window.scrollY || d.scrollTop) / max) : 0;
        bar.style.transform = 'scaleX(' + p + ')';
      };
      var onScroll = function () { if (!raf) raf = requestAnimationFrame(upd); };
      upd();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    }

    /* ---- Split-text word reveal ---- */
    var splitWrap = function (node, counter) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (tok) {
            if (tok === '') return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
            var s = document.createElement('span');
            s.className = 'w'; s.textContent = tok;
            s.style.setProperty('--i', counter.i++);
            frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          splitWrap(n, counter);
        }
      });
    };
    document.querySelectorAll('.split').forEach(function (el) {
      splitWrap(el, { i: 0 });
    });

    /* ---- IntersectionObserver: reveal / split / process ---- */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll('.split').forEach(function (el) { io.observe(el); });

      /* Process active step */
      var steps = document.querySelectorAll('.proc-step');
      if (steps.length) {
        var fill = document.querySelector('.proc-rail .fill');
        var pio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              steps.forEach(function (s) { s.classList.remove('active'); });
              e.target.classList.add('active');
              if (fill) {
                var idx = Array.prototype.indexOf.call(steps, e.target);
                fill.style.setProperty('--p', (idx + 1) / steps.length);
              }
            }
          });
        }, { rootMargin: '-45% 0px -45% 0px' });
        steps.forEach(function (s) { pio.observe(s); });
      }
    }

    /* ---- Magnetic buttons (desktop, motion-on) ---- */
    if (finePointer && !reduce) {
      document.querySelectorAll('.magnetic').forEach(function (el) {
        var strength = 0.3;
        el.addEventListener('pointermove', function (ev) {
          var r = el.getBoundingClientRect();
          var x = ev.clientX - (r.left + r.width / 2);
          var y = ev.clientY - (r.top + r.height / 2);
          el.style.transform = 'translate(' + x * strength + 'px,' + y * strength + 'px)';
        });
        el.addEventListener('pointerleave', function () { el.style.transform = ''; });
      });

      /* ---- 3D tilt cards ---- */
      document.querySelectorAll('.tilt').forEach(function (el) {
        el.addEventListener('pointermove', function (ev) {
          var r = el.getBoundingClientRect();
          var px = (ev.clientX - r.left) / r.width - 0.5;
          var py = (ev.clientY - r.top) / r.height - 0.5;
          el.style.transform = 'perspective(900px) rotateY(' + px * 5 + 'deg) rotateX(' + (-py * 5) + 'deg) translateY(-4px)';
        });
        el.addEventListener('pointerleave', function () { el.style.transform = ''; });
      });
    }

    /* ---- Before / After sliders ---- */
    document.querySelectorAll('.ba').forEach(function (ba) {
      var set = function (clientX) {
        var r = ba.getBoundingClientRect();
        var pct = Math.max(2, Math.min(98, ((clientX - r.left) / r.width) * 100));
        ba.style.setProperty('--x', pct + '%');
        ba.setAttribute('aria-valuenow', Math.round(pct));
      };
      var dragging = false;
      ba.addEventListener('pointerdown', function (e) { dragging = true; ba.setPointerCapture(e.pointerId); set(e.clientX); });
      ba.addEventListener('pointermove', function (e) { if (dragging) set(e.clientX); });
      ba.addEventListener('pointerup', function () { dragging = false; });
      ba.addEventListener('pointercancel', function () { dragging = false; });
      ba.addEventListener('keydown', function (e) {
        var cur = parseFloat(ba.style.getPropertyValue('--x')) || 50;
        if (e.key === 'ArrowLeft') { ba.style.setProperty('--x', Math.max(2, cur - 4) + '%'); e.preventDefault(); }
        if (e.key === 'ArrowRight') { ba.style.setProperty('--x', Math.min(98, cur + 4) + '%'); e.preventDefault(); }
      });
    });

    /* ---- Sticky mobile CTA bar (after hero) ---- */
    var cta = document.querySelector('.mobile-cta');
    if (cta) {
      document.body.classList.add('has-cta');
      var toggle = function () {
        if ((window.scrollY || 0) > 420) cta.classList.add('show'); else cta.classList.remove('show');
      };
      toggle();
      window.addEventListener('scroll', toggle, { passive: true });
    }
  });
})();

/* Marquee seamless loop — clone track content once (skipped for reduced motion). */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-marquee]').forEach(function (track) {
      track.setAttribute('aria-hidden', 'false');
      var items = Array.prototype.slice.call(track.children);
      items.forEach(function (n) { var c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.setAttribute('tabindex', '-1'); track.appendChild(c); });
    });
  });
})();
