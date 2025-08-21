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
  }

  function isInternalLink(anchor) {
    try {
      var url = new URL(anchor.href);
      return url.origin === window.location.origin;
    } catch (e) {
      return false;
    }
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
    var toggle = document.querySelector('.nav-toggle');
    var drawer = document.querySelector('.mobile-drawer');
    if (!toggle || !drawer) return;

    function closeDrawer() {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.hidden = true;
    }

    toggle.addEventListener('click', function () {
      var isOpen = drawer.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      drawer.hidden = !isOpen;
    });

    drawer.addEventListener('click', function (e) {
      var anchor = e.target.closest('a');
      if (!anchor) return;
      closeDrawer();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();


