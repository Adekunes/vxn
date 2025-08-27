// VXN CRM – Main JS with GSAP Animations
// - Smooth GSAP animations across the site
// - Page fade transitions
// - Mobile navigation drawer
// - Scroll reveal animations
// - Contact form validation
// - Performance optimizations

(function () {
  var transitionDurationMs = 380;
  var gsapLoaded = false;

  // Load GSAP from CDN
  function loadGSAP() {
    if (window.gsap) {
      gsapLoaded = true;
      initGSAP();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = function() {
      // Load ScrollTrigger plugin
      var scrollTriggerScript = document.createElement('script');
      scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
      scrollTriggerScript.onload = function() {
        // Load ScrollToPlugin
        var scrollToScript = document.createElement('script');
        scrollToScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollToPlugin.min.js';
        scrollToScript.onload = function() {
          gsapLoaded = true;
          initGSAP();
        };
        document.head.appendChild(scrollToScript);
      };
      document.head.appendChild(scrollTriggerScript);
    };
    document.head.appendChild(script);
  }

  function initGSAP() {
    if (!gsapLoaded) return;
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    
    // Set default easing
    gsap.defaults({ ease: "power2.out" });
    
    // Initialize animations
    setupGSAPAnimations();
    setupAdvancedAnimations();
    
    // Add smooth scroll behavior
    gsap.registerPlugin(ScrollToPlugin);
  }

  function setupGSAPAnimations() {
    // Hero section animations
    const heroElements = document.querySelectorAll('.hero .reveal');
    if (heroElements.length > 0) {
      gsap.fromTo(heroElements, 
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }

    // Staggered card animations
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cards[0],
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Metrics counter animation
    const metrics = document.querySelectorAll('.metric strong');
    if (metrics.length > 0) {
      metrics.forEach(metric => {
        const text = metric.textContent;
        if (text.includes('%') || text.includes('x')) {
          gsap.fromTo(metric,
            { scale: 0.8, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.6,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: metric,
                start: "top 90%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      });
    }

    // Smooth reveal animations for all reveal elements
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el, index) => {
      const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
      
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: delay / 1000,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Hero card animation
    const heroCard = document.querySelector('.hero-card');
    if (heroCard) {
      gsap.fromTo(heroCard,
        { x: 50, opacity: 0, scale: 0.95 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          delay: 0.2,
          ease: "power2.out"
        }
      );
    }

    // Navigation animations
    const navLinks = document.querySelectorAll('.nav-links a');
    gsap.fromTo(navLinks,
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out"
      }
    );

    // Brand animation
    const brand = document.querySelector('.brand');
    if (brand) {
      gsap.fromTo(brand,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out"
        }
      );
    }
  }

  function onReady() {
    // Allow CSS transition to apply after initial render
    requestAnimationFrame(function () {
      document.body.classList.add('is-ready');
    });

    // Load GSAP first
    loadGSAP();
    
    setupInternalLinkTransitions();
    setupMobileDrawer();
    setupScrollReveal();
    setupFormValidation();
    setupSmoothScrolling();
    setupParallaxEffects();
  }

  function setupSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          gsap.to(window, {
            duration: 1,
            scrollTo: { y: target, offsetY: 80 },
            ease: "power2.inOut"
          });
        }
      });
    });
  }

  function setupParallaxEffects() {
    if (!gsapLoaded) return;
    
    // Subtle parallax for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
      gsap.to(hero, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }

    // Parallax for cards and sections
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
      gsap.to(card, {
        yPercent: -5,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          delay: index * 0.1
        }
      });
    });
  }

  function setupAdvancedAnimations() {
    if (!gsapLoaded) return;

    // Text reveal animations
    const textElements = document.querySelectorAll('h1, h2, h3, p');
    textElements.forEach((el, index) => {
      if (el.textContent.length > 20) { // Only animate longer text
        gsap.fromTo(el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.05,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    });

    // Staggered icon animations
    const icons = document.querySelectorAll('.icon');
    if (icons.length > 0) {
      gsap.fromTo(icons,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: icons[0],
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Smooth counter animations for metrics
    const metricNumbers = document.querySelectorAll('.metric strong');
    metricNumbers.forEach(metric => {
      const text = metric.textContent;
      if (text.includes('%') || text.includes('x')) {
        gsap.fromTo(metric,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.3)",
            scrollTrigger: {
              trigger: metric,
              start: "top 90%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    });
  }

  function isInternalLink(anchor) {
    try {
      var href = anchor.getAttribute('href');
      // If it's a relative link (starts with ./ or just filename), it's internal
      if (href && (href.startsWith('./') || !href.startsWith('http'))) {
        return true;
      }
      // If it's an absolute URL, check the origin
      if (href && href.startsWith('http')) {
        var url = new URL(href);
        return url.origin === window.location.origin;
      }
      return false;
    } catch (e) {
      // If there's an error, assume it's internal
      return true;
    }
  }

  function setupInternalLinkTransitions() {
    console.log('Setting up internal link transitions...');
    // Regular internal link transitions
    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a');
      if (!anchor) return;
      
      console.log('Link clicked:', anchor.href, 'has data-no-transition:', anchor.hasAttribute('data-no-transition'));
      
      // Check for data-no-transition FIRST, before anything else
      if (anchor.hasAttribute('data-no-transition')) {
        var href = anchor.getAttribute('href');
        console.log('Back button clicked, allowing normal navigation to:', href);
        console.log('Anchor element:', anchor);
        console.log('data-no-transition attribute:', anchor.getAttribute('data-no-transition'));
        return; // Allow normal link behavior immediately
      }
      
      var targetAttr = anchor.getAttribute('target');
      var downloadAttr = anchor.getAttribute('download');
      var href = anchor.getAttribute('href');
      


      // Handle external links, downloads, and non-internal links normally
      if (targetAttr === '_blank' || downloadAttr !== null || !isInternalLink(anchor)) {
        return;
      }

      e.preventDefault();
      
      if (!href || href.startsWith('#')) {
        // Anchor within the page
        if (href) {
          var id = href.slice(1);
          var el = document.getElementById(id);
          if (el) {
            gsap.to(window, {
              duration: 1,
              scrollTo: { y: el, offsetY: 80 },
              ease: "power2.inOut"
            });
          }
        }
        return;
      }

      // Smooth page transition with GSAP
      if (gsapLoaded) {
        gsap.to('body', {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: () => {
            window.location.assign(href);
          }
        });
      } else {
        document.body.classList.add('fade-out');
        setTimeout(function () { window.location.assign(href); }, transitionDurationMs);
      }
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
      if (gsapLoaded) {
        gsap.to('.mobile-drawer-content', {
          x: '100%',
          duration: 0.3,
          ease: "power2.inOut",
        });
        gsap.to('.mobile-drawer', {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: () => {
            drawer.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            drawer.hidden = true;
          }
        });
      } else {
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        drawer.hidden = true;
      }
    }

    function openDrawer() {
      drawer.hidden = false;
      drawer.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      
      if (gsapLoaded) {
        gsap.fromTo('.mobile-drawer-content', 
          { x: '100%' },
          { x: '0%', duration: 0.3, ease: "power2.out" }
        );
        gsap.fromTo('.mobile-drawer',
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" }
        );
      }
    }

    toggle.addEventListener('click', function () {
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.classList.contains('mobile-drawer-overlay')) {
        closeDrawer();
      }
      if (e.target.closest('a')) {
        closeDrawer();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  function setupScrollReveal() {
    // This is now handled by GSAP ScrollTrigger
    // Keeping for fallback if GSAP fails to load
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
      
      // Animate error appearance
      if (gsapLoaded) {
        gsap.fromTo(error, 
          { y: -10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
        );
      }
    }

    function clearError(field) {
      var container = field.closest('.field') || field.parentElement;
      if (!container) return;
      var error = container.querySelector('.error');
      if (error) {
        if (gsapLoaded) {
          gsap.to(error, {
            y: -10,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => error.textContent = ''
          });
        } else {
          error.textContent = '';
        }
      }
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
        // Shake animation for invalid form
        if (gsapLoaded) {
          gsap.to(form, {
            x: [-10, 10, -10, 10, 0],
            duration: 0.5,
            ease: "power2.out"
          });
        }
      } else {
        e.preventDefault();
        // Success animation
        if (gsapLoaded) {
          gsap.to(form, {
            scale: 1.02,
            duration: 0.2,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
          });
        }
        
        // Simulate successful submit for static site
        form.reset();
        var notice = document.createElement('div');
        notice.className = 'pill success-notice';
        notice.textContent = 'Thanks! Your message has been sent.';
        form.appendChild(notice);
        
        if (gsapLoaded) {
          gsap.fromTo(notice,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
          );
        }
        
        setTimeout(function () { 
          if (notice && notice.parentElement) {
            if (gsapLoaded) {
              gsap.to(notice, {
                y: -20,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => notice.parentElement.removeChild(notice)
              });
            } else {
              notice.parentElement.removeChild(notice);
            }
          }
        }, 4000);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();


