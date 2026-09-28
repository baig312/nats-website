/* NATS site behaviour: nav state, mobile menu, scroll reveal, contact form. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // ---- Intro logo animation (once per session) ----
  (function intro() {
    try {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Play on the homepage only (every load); skip inner pages.
      var p = location.pathname;
      var isHome = p === '/' || p === '' || /index\.html?$/i.test(p);
      if (reduce || !isHome || !document.body) return;

      var el = document.createElement('div');
      el.className = 'intro';
      el.setAttribute('role', 'presentation');
      el.innerHTML =
        '<div class="intro-stack">' +
          '<svg class="intro-mark" viewBox="0 0 120 120" aria-hidden="true">' +
            '<g fill="#c9a06a">' +
              '<rect class="bar bar-l" x="24" y="9.6" width="18" height="100.8"></rect>' +
              '<rect class="bar bar-r" x="78" y="9.6" width="18" height="100.8"></rect>' +
              '<g transform="rotate(50 24 9.6)"><rect class="diag" x="24" y="9.6" width="72" height="18"></rect></g>' +
            '</g>' +
          '</svg>' +
          '<span class="intro-word">NATS</span>' +
        '</div>';
      document.body.appendChild(el);
      document.documentElement.classList.add('intro-lock');

      window.setTimeout(function () {
        el.classList.add('done');
        document.documentElement.classList.remove('intro-lock');
        window.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 750);
      }, 1850);
    } catch (e) { /* no intro if storage/DOM unavailable */ }
  })();

  document.addEventListener('DOMContentLoaded', function () {
    // Sticky header state
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('scrolled', window.scrollY > 12);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Mobile menu toggle
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          menu.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Scroll reveal
    var reveals = document.querySelectorAll('.reveal');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }

    // Contact form -> WhatsApp (no backend needed)
    var form = document.querySelector('[data-wa-form]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var number = form.getAttribute('data-wa-number') || '';
        var name = (form.querySelector('[name="name"]') || {}).value || '';
        var phone = (form.querySelector('[name="phone"]') || {}).value || '';
        var message = (form.querySelector('[name="message"]') || {}).value || '';
        var text =
          'New enquiry from the NATS website%0A%0A' +
          'Name: ' + encodeURIComponent(name) + '%0A' +
          'Phone: ' + encodeURIComponent(phone) + '%0A' +
          'Details: ' + encodeURIComponent(message);
        window.open('https://wa.me/' + number + '?text=' + text, '_blank', 'noopener');
      });
    }

    // Footer year
    var y = document.querySelector('[data-year]');
    if (y) { y.textContent = new Date().getFullYear(); }

    // Animated count-up stats (data-target, optional data-decimals, data-suffix)
    var counters = document.querySelectorAll('.count-up');
    if (counters.length) {
      var animateCounter = function (el) {
        var target = parseFloat(el.getAttribute('data-target')) || 0;
        var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduce) {
          el.textContent = target.toFixed(decimals) + suffix;
          return;
        }
        var duration = 1400;
        var start = null;
        var step = function (ts) {
          if (start === null) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var value = target * eased;
          el.textContent = value.toFixed(decimals) + suffix;
          if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      };
      if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              cio.unobserve(entry.target);
            }
          });
        }, { threshold: 0.5 });
        counters.forEach(function (el) { cio.observe(el); });
      } else {
        counters.forEach(animateCounter);
      }
    }
  });
})();
