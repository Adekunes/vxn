(function(){
  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 'vxn_lang';
  var CACHE = {};
  var LANG_NAME = { en: 'English', fr: 'Français' };

  var LEGACY_MAP = [
    { sel: '.nav-cta a.btn.btn-primary', key: 'nav.requestDemo' },
    { sel: '.footer-links a[href="privacy.html"]', key: 'common.privacy' },
    { sel: '.footer-links a[href="security.html"]', key: 'common.security' }
  ];

  function setText(el, text){ try { el.textContent = text; } catch(e) {} }

  function loadTranslations(lang){
    if (CACHE[lang]) return Promise.resolve(CACHE[lang]);
    var url = new URL('assets/i18n/' + lang + '.json', window.location.href);
    // bust cache
    url.searchParams.set('_', Date.now());

    function relaxedJsonParse(text){
      try {
        // Remove BOM
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
        // Strip // and /* */ comments
        text = text.replace(/\/\/[^\n]*$/mg, '').replace(/\/\*[\s\S]*?\*\//g, '');
        // Remove trailing commas before } or ]
        text = text.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(text);
      } catch (e) {
        try { console.error('i18n JSON parse error:', e); } catch(_) {}
        return {};
      }
    }

    return fetch(url.toString(), { cache: 'no-store' })
      .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function(text){ var json = relaxedJsonParse(text); CACHE[lang] = json; try { console.log('Loaded translations for', lang); } catch(e) {} return json; })
      .catch(function(err){ try { console.error('i18n load failed for', lang, err); } catch(e) {} return {}; });
  }

  function isObject(o){ return o && typeof o === 'object' && !Array.isArray(o); }
  function deepMerge(target, source){
    var out = Object.assign({}, target);
    Object.keys(source || {}).forEach(function(k){
      if (isObject(source[k]) && isObject(out[k])) out[k] = deepMerge(out[k], source[k]);
      else out[k] = source[k];
    });
    return out;
  }

  function flattenDict(obj, prefix){
    var out = {};
    Object.keys(obj || {}).forEach(function(k){
      var key = prefix ? (prefix + '.' + k) : k;
      if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
        var nested = flattenDict(obj[k], key);
        Object.assign(out, nested);
      } else {
        out[key] = obj[k];
      }
    });
    return out;
  }

  function get(obj, path){
    if (!obj || !path) return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path];
    return path.split('.').reduce(function(acc, k){ return acc && acc[k] != null ? acc[k] : undefined; }, obj);
  }

  function applyTranslations(lang){
    // Always merge selected language over default to avoid missing keys
    Promise.all([
      loadTranslations(DEFAULT_LANG),
      lang === DEFAULT_LANG ? Promise.resolve({}) : loadTranslations(lang),
      loadTranslations('fr')
    ]).then(function(res){
      var base = res[0] || {};
      var over = res[1] || {};
      var frAll = res[2] || {};
      var dict = deepMerge(base, over);
      document.documentElement.setAttribute('lang', lang);

      // Stop any ongoing typing animations before changing text to prevent duplication
      try { if (typeof window.cancelTyping === 'function') window.cancelTyping(); } catch(e) {}

      // data-i18n attributes
      var nodes = document.querySelectorAll('[data-i18n]');
      try { console.log('i18n scanning nodes:', nodes.length); } catch(e) {}
      var updated = 0;
      nodes.forEach(function(el){
        var key = el.getAttribute('data-i18n');
        var txt = get(dict, key);
        if (typeof txt === 'string') { setText(el, txt); updated++; }
        else { try { console.debug('i18n missing key:', key); } catch(e) {} }
      });

      // Fallback: value-based translation for elements without data-i18n (round-trip)
      var baseFlat = flattenDict(base); // EN
      var dictFlat = flattenDict(dict); // Selected
      var frFlat = flattenDict(frAll);  // FR
      var enToFr = {}; // en -> fr
      var frToEn = {}; // fr -> en
      Object.keys(baseFlat).forEach(function(k){
        var enV = baseFlat[k];
        var frV = frFlat[k];
        if (typeof enV === 'string' && typeof frV === 'string') {
          enToFr[enV] = frV;
          frToEn[frV] = enV;
        }
      });

      function translateTextElement(el){
        if (el.hasAttribute('data-i18n')) return false;
        // Avoid translating containers that have element children to prevent duplication
        if (el.children && el.children.length > 0) return false;
        var t = (el.textContent || '').trim();
        if (!t) return false;
        var repl = (lang === DEFAULT_LANG) ? frToEn[t] : enToFr[t];
        if (typeof repl === 'string' && repl !== t) { setText(el, repl); return true; }
        return false;
      }

      // Remove residual typing cursors on language switch
      Array.prototype.slice.call(document.querySelectorAll('.typing-cursor')).forEach(function(cursor){
        if (cursor && cursor.parentElement) cursor.parentElement.removeChild(cursor);
      });

      var candidates = document.querySelectorAll('h1,h2,h3,h4,h5,h6,a,button,span,p,li,label,small,strong,em,th,td');
      candidates.forEach(function(el){ if (translateTextElement(el)) updated++; });

      // Special handling: homepage hero title composed of two parts with styling
      var heroTitleLine = document.querySelector('.hero-title .line');
      if (heroTitleLine) {
        var part1 = get(dict, 'value.index.title.part1');
        var part2 = get(dict, 'value.index.title.part2');
        if (typeof part1 === 'string' && typeof part2 === 'string') {
          // Rebuild DOM to preserve accent styling and re-add data-i18n hooks
          while (heroTitleLine.firstChild) heroTitleLine.removeChild(heroTitleLine.firstChild);
          var s1 = document.createElement('span');
          s1.setAttribute('data-i18n', 'value.index.title.part1');
          s1.textContent = part1;
          var s2 = document.createElement('span');
          s2.className = 'accent';
          s2.setAttribute('data-i18n', 'value.index.title.part2');
          s2.textContent = part2;
          heroTitleLine.appendChild(s1);
          heroTitleLine.appendChild(s2);
          updated++;
        }
      }

      // Placeholders
      var inputs = document.querySelectorAll('input[placeholder],textarea[placeholder]');
      inputs.forEach(function(el){
        var ph = el.getAttribute('placeholder');
        var repl = (lang === DEFAULT_LANG) ? valueMapReverse[ph] : valueMapForward[ph];
        if (typeof repl === 'string' && repl !== ph) { el.setAttribute('placeholder', repl); updated++; }
      });

      // legacy selector map
      LEGACY_MAP.forEach(function(rule){
        var el = document.querySelector(rule.sel);
        if (!el) return;
        var txt = get(dict, rule.key);
        if (typeof txt === 'string') setText(el, txt);
      });

      // Footer rights text replacement
      var rights = document.querySelector('.site-footer .muted');
      if (rights) {
        var t = rights.textContent || '';
        var en = 'All rights reserved.';
        var fr = 'Tous droits réservés.';
        if (lang === 'fr' && t.indexOf(en) !== -1) setText(rights, t.replace(en, fr));
        if (lang === 'en' && t.indexOf(fr) !== -1) setText(rights, t.replace(fr, en));
      }

      try { localStorage.setItem(STORAGE_KEY, lang); } catch(e) {}
      try { console.log('i18n applied:', lang, '→', updated, 'nodes'); } catch(e) {}
    });
  }

  function init(){
    var saved = DEFAULT_LANG;
    try { saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; } catch(e) {}
    applyTranslations(saved);

    // Explicit listeners on language switch buttons (more reliable on some layouts)
    var langButtons = document.querySelectorAll('.lang-switch [data-lang]');
    langButtons.forEach(function(btn){
      btn.addEventListener('click', function(){
        var lang = btn.getAttribute('data-lang');
        if (!lang) return;
        applyTranslations(lang);
        // Visual active state (optional)
        langButtons.forEach(function(b){ b.classList.toggle('active', b === btn); });
        try { console.log('Language selected:', LANG_NAME[lang] || lang); } catch(e) {}
      });
    });

    // Fallback: delegate for dynamically injected buttons
    document.addEventListener('click', function(e){
      var btn = e.target.closest('.lang-switch [data-lang]');
      if (!btn) return;
      var lang = btn.getAttribute('data-lang');
      if (!lang) return;
      applyTranslations(lang);
      try { console.log('Language selected:', LANG_NAME[lang] || lang); } catch(e) {}
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.applyTranslations = applyTranslations;
})();
