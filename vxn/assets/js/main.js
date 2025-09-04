// VXN CRM – Main JS
// - Page fade transitions
// - Mobile navigation drawer
// - Scroll reveal animations
// - Contact form validation

(function () {
  var transitionDurationMs = 380;

  function onReady() {
    // Allow CSS transition to apply after initial render
    requestAnimationFrame(function () {
      document.body.classList.add('is-ready');
    });

    setupInternalLinkTransitions();
    setupMobileDrawer();
    setupScrollReveal();
    setupFormValidation();
    setupTypingEffect();
    setupHeaderScrollState();
  }

  function isInternalLink(anchor) {
    try {
      var url = new URL(anchor.href);
      return url.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  function setupHeaderScrollState(){
    var header = document.querySelector('.site-header');
    if (!header) return;
    function onScroll(){
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 6) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setupInternalLinkTransitions() {
    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a');
      if (!anchor) return;
      var targetAttr = anchor.getAttribute('target');
      var downloadAttr = anchor.getAttribute('download');
      var skipTransition = anchor.hasAttribute('data-no-transition');

      if (skipTransition || targetAttr === '_blank' || downloadAttr !== null || !isInternalLink(anchor)) {
        return;
      }

      e.preventDefault();
      var href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) {
        // Anchor within the page
        if (href) {
          var id = href.slice(1);
          var el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
        return;
      }

      document.body.classList.add('fade-out');
      setTimeout(function () { window.location.assign(href); }, transitionDurationMs);
    });

    // Handle BFCache back-forward to remove fade-out quickly
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) {
        document.body.classList.remove('fade-out');
        document.body.classList.add('is-ready');
      }
    });
  }

  function setupMobileDrawer() {
    // Ensure only a single nav toggle exists
    var allToggles = Array.prototype.slice.call(document.querySelectorAll('.nav-toggle'));
    if (allToggles.length > 1) {
      allToggles.slice(1).forEach(function (btn) {
        if (btn && btn.parentElement) btn.parentElement.removeChild(btn);
      });
    }

    var toggle = document.querySelector('.nav-toggle');
    var drawer = document.querySelector('.mobile-drawer');
    if (!toggle || !drawer) return;

    function closeDrawer() {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.hidden = true;
      // Prevent body scroll when drawer is open
      document.body.style.overflow = '';
      document.body.classList.remove('drawer-open');
    }

    function openDrawer() {
      drawer.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.hidden = false;
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
      document.body.classList.add('drawer-open');
    }

    toggle.addEventListener('click', function () {
      var isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    drawer.addEventListener('click', function (e) {
      var anchor = e.target.closest('a');
      if (anchor) {
        closeDrawer();
        return;
      }
      var langBtn = e.target.closest('.lang-switch [data-lang]');
      if (langBtn) {
        // Let i18n handler run, then close the drawer to reveal changes
        setTimeout(closeDrawer, 0);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });

    // Close drawer on window resize to prevent layout issues
    window.addEventListener('resize', function() {
      if (window.innerWidth > 860) {
        closeDrawer();
      }
    });
  }

  function setupScrollReveal() {
    var elements = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!('IntersectionObserver' in window) || elements.length === 0) {
      elements.forEach(function (el) { el.classList.add('reveal-visible'); });
      return;
    }

    var timers = new WeakMap();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        var revealOnce = el.hasAttribute('data-reveal-once');
        if (entry.isIntersecting) {
          if (el.classList.contains('metric')) {
            runCountUp(el);
          }
          var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
          if (timers.has(el)) { clearTimeout(timers.get(el)); }
          var id = setTimeout(function () { el.classList.add('reveal-visible'); }, isNaN(delay) ? 0 : delay);
          timers.set(el, id);
          if (revealOnce) observer.unobserve(el);
        } else {
          if (!revealOnce) {
            if (timers.has(el)) { clearTimeout(timers.get(el)); timers.delete(el); }
            el.classList.remove('reveal-visible');
          }
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

    elements.forEach(function (el) { observer.observe(el); });
  }

  // Count-up animation for metrics
  function runCountUp(metricEl){
    try {
      var strong = metricEl.querySelector('strong');
      if (!strong) return;
      if (strong.getAttribute('data-countup')) return; // already run
      var text = strong.textContent.trim();
      var isPercent = text.indexOf('%') !== -1;
      var isPlus = text.indexOf('+') !== -1;
      var hasX = /x$/i.test(text);
      var clean = text.replace(/[^0-9.]/g, '');
      var target = parseFloat(clean);
      if (isNaN(target)) return;
      strong.setAttribute('data-countup', '1');
      var duration = 1200;
      var start = null;
      function step(ts){
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        var val = Math.floor(target * p * 100) / 100;
        var prefix = isPlus ? '+' : '';
        var suffix = (isPercent ? '%' : '') + (hasX ? 'x' : '');
        strong.textContent = prefix + (val.toFixed(val % 1 === 0 ? 0 : 1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    } catch(e) {}
  }

  function setupFormValidation() {
    var form = document.querySelector('form[data-validate="contact"]');
    if (!form) return;

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showError(field, message) {
      var container = field.closest('.field') || field.parentElement;
      if (!container) return;
      var error = container.querySelector('.error');
      if (!error) {
        error = document.createElement('div');
        error.className = 'error';
        error.setAttribute('role', 'alert');
        container.appendChild(error);
      }
      error.textContent = message;
      field.setAttribute('aria-invalid', 'true');
    }

    function clearError(field) {
      var container = field.closest('.field') || field.parentElement;
      if (!container) return;
      var error = container.querySelector('.error');
      if (error) error.textContent = '';
      field.removeAttribute('aria-invalid');
    }

    form.addEventListener('submit', function (e) {
      var isValid = true;
      var name = form.querySelector('input[name="name"]');
      var email = form.querySelector('input[name="email"]');
      var company = form.querySelector('input[name="company"]');
      var message = form.querySelector('textarea[name="message"]');

      [name, email, company, message].forEach(function (field) {
        if (!field) return;
        clearError(field);
        if (!field.value || field.value.trim() === '') {
          isValid = false;
          showError(field, 'This field is required.');
        }
      });

      if (email && email.value && !emailPattern.test(email.value)) {
        isValid = false;
        showError(email, 'Enter a valid email address.');
      }

      if (!isValid) {
        e.preventDefault();
      } else {
        e.preventDefault();
        // Simulate successful submit for static site
        form.reset();
        var notice = document.createElement('div');
        notice.className = 'pill';
        notice.textContent = 'Thanks! Your message has been sent.';
        form.appendChild(notice);
        setTimeout(function () { if (notice && notice.parentElement) notice.parentElement.removeChild(notice); }, 4000);
      }
    });
  }

  // -----------------------------
  // Typing Effect Utility
  // -----------------------------
  function setupTypingEffect(){
    // Feature detect: reduce motion
    var prefersReduced = false;
    try { prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e) {}

    // Helper to type a single element's textContent
    function typeElement(el, options){
      var text = el.textContent || '';
      var speed = options && options.speed != null ? options.speed : 35; // ms per char
      var startDelay = options && options.startDelay != null ? options.startDelay : 0;
      var showCursor = options && options.showCursor !== false;
      var cursorMuted = !!(options && options.cursorMuted);

      // Skip if no text or reduced motion
      if (!text || prefersReduced) return Promise.resolve(0);

      // Prepare element
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      var original = text;
      el.textContent = '';
      el.classList.add('typing-line');

      var cursor
      if (showCursor){
        cursor = document.createElement('span');
        cursor.className = 'typing-cursor' + (cursorMuted ? ' muted' : '');
        el.appendChild(cursor);
      }

      var i = 0;
      function step(){
        if (i < original.length){
          // Insert next char before cursor
          if (cursor){ cursor.remove(); }
          el.textContent += original.charAt(i);
          if (cursor){ el.appendChild(cursor); }
          i++;
          setTimeout(step, speed);
        } else {
          // Done: remove cursor after a short pause
          setTimeout(function(){ if (cursor && cursor.parentElement) cursor.parentElement.removeChild(cursor); }, 250);
        }
      }

      return new Promise(function(resolve){
        setTimeout(function(){ step(); resolve(original.length * speed + startDelay + 250); }, startDelay);
      });
    }

    // Auto-wire: find hero sections and type h1 lines and subtitle
    var hero = document.querySelector('.hero, .blog-hero, main > .section:first-of-type');
    if (!hero) return;

    // Strategy: type within the hero container for elements marked with data-typed
    var targets = Array.prototype.slice.call(hero.querySelectorAll('[data-typed]'));
    if (targets.length === 0){
      // Fallback heuristic: split .hero-title lines if present
      var title = hero.querySelector('.hero-title');
      if (title){
        var lines = Array.prototype.slice.call(title.querySelectorAll('.line'));
        if (lines.length){
          // Chain typing: line1 -> line2 -> lede
          var totalDelay = 0;
          lines.forEach(function(line, idx){
            typeElement(line, { startDelay: totalDelay, speed: 32, showCursor: true, cursorMuted: false });
            totalDelay += (line.textContent || '').length * 32 + 400;
          });
          var lede = hero.querySelector('.lede');
          if (lede){ typeElement(lede, { startDelay: totalDelay + 250, speed: 18, showCursor: true, cursorMuted: true }); }
        }
      } else {
        // Generic: try h1 and following p.lede
        var h1 = hero.querySelector('h1');
        if (h1){ typeElement(h1, { speed: 28, showCursor: true }); }
        var p = hero.querySelector('.lede');
        if (p){ typeElement(p, { startDelay: (h1 && (h1.textContent||'').length*28+300) || 300, speed: 18, showCursor: true, cursorMuted: true }); }
      }
      return;
    }

    // If explicit targets exist, sequence by DOM order
    var cumulativeDelay = 0;
    targets.forEach(function(el, idx){
      var speedAttr = parseInt(el.getAttribute('data-typed-speed') || '28', 10);
      var delayAttr = parseInt(el.getAttribute('data-typed-delay') || String(cumulativeDelay), 10);
      var muted = el.hasAttribute('data-typed-muted');
      typeElement(el, { speed: isNaN(speedAttr) ? 28 : speedAttr, startDelay: isNaN(delayAttr) ? cumulativeDelay : delayAttr, showCursor: true, cursorMuted: muted });
      cumulativeDelay = (isNaN(delayAttr) ? cumulativeDelay : delayAttr) + (el.textContent || '').length * (isNaN(speedAttr) ? 28 : speedAttr) + 350;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();


