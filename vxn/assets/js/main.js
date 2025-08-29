// VXN CRM – Modern JavaScript
// - Page fade transitions
// - Mobile navigation drawer
// - Scroll reveal animations
// - Touch optimizations

(function () {
  var transitionDurationMs = 500;

  function onReady() {
    // Allow CSS transition to apply after initial render
    requestAnimationFrame(function () {
      document.body.classList.add('is-ready');
    });

    setupInternalLinkTransitions();
    setupMobileDrawer();
    setupScrollReveal();
    setupMobileOptimizations();
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
    
    if (!toggle || !drawer) {
      return;
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.hidden = true;
      // Prevent body scroll when drawer is closed
      document.body.style.overflow = '';
    }

    function openDrawer() {
      drawer.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.hidden = false;
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    // Close drawer when clicking on navigation links
    drawer.addEventListener('click', function (e) {
      var anchor = e.target.closest('a');
      if (!anchor) return;
      
      // Small delay to allow the click to register before closing
      setTimeout(function() {
        closeDrawer();
      }, 100);
    });

    // Close drawer when clicking outside
    document.addEventListener('click', function (e) {
      if (drawer.classList.contains('open') && 
          !drawer.contains(e.target) && 
          !toggle.contains(e.target)) {
        closeDrawer();
      }
    });

    // Close drawer on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Handle orientation change
    window.addEventListener('orientationchange', function() {
      // Close drawer on orientation change to prevent layout issues
      if (drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Handle window resize
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // Close drawer if screen becomes large enough for desktop navigation
        if (window.innerWidth > 860 && drawer.classList.contains('open')) {
          closeDrawer();
        }
      }, 250);
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

  function setupMobileOptimizations() {
    // Prevent zoom on double tap for iOS
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      var now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Improve touch scrolling performance
    if ('ontouchstart' in window) {
      document.documentElement.style.webkitOverflowScrolling = 'touch';
    }

    // Handle viewport height issues on mobile browsers
    function setVH() {
      var vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', vh + 'px');
    }
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // Ensure proper focus management for mobile navigation
    var mobileDrawer = document.querySelector('.mobile-drawer');
    if (mobileDrawer) {
      var firstLink = mobileDrawer.querySelector('a');
      var lastLink = mobileDrawer.querySelectorAll('a');
      lastLink = lastLink[lastLink.length - 1];

      if (firstLink && lastLink) {
        // Trap focus within mobile drawer when open
        mobileDrawer.addEventListener('keydown', function(e) {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstLink) {
                e.preventDefault();
                lastLink.focus();
              }
            } else {
              if (document.activeElement === lastLink) {
                e.preventDefault();
                firstLink.focus();
              }
            }
          }
        });
      }
    }

    // Add smooth scrolling for iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();


