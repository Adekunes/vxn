(function(){
  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 'vxn_lang';
  var CACHE = {};

  var LEGACY_MAP = [
    { sel: '.nav-cta a.btn.btn-primary', key: 'nav.requestDemo' },
    { sel: '.footer-links a[href="privacy.html"]', key: 'common.privacy' },
    { sel: '.footer-links a[href="security.html"]', key: 'common.security' }
  ];

  function setText(el, text){ try { el.textContent = text; } catch(e) {} }

  function loadTranslations(lang){
    if (CACHE[lang]) return Promise.resolve(CACHE[lang]);
    return fetch('assets/i18n/' + lang + '.json', { cache: 'no-cache' })
      .then(function(r){ return r.json(); })
      .then(function(json){ CACHE[lang] = json; return json; })
      .catch(function(){ return {}; });
  }

  function get(obj, path){
    return path.split('.').reduce(function(acc, k){ return acc && acc[k] != null ? acc[k] : undefined; }, obj);
  }

  function applyTranslations(lang){
    loadTranslations(lang).then(function(dict){
      document.documentElement.setAttribute('lang', lang);

      // data-i18n attributes
      var nodes = document.querySelectorAll('[data-i18n]');
      nodes.forEach(function(el){
        var key = el.getAttribute('data-i18n');
        var txt = get(dict, key);
        if (typeof txt === 'string') setText(el, txt);
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
    });
  }

  function init(){
    var saved = DEFAULT_LANG;
    try { saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; } catch(e) {}
    applyTranslations(saved);

    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-lang]');
      if (!btn) return;
      var lang = btn.getAttribute('data-lang');
      if (!lang) return;
      applyTranslations(lang);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.applyTranslations = applyTranslations;
})();
