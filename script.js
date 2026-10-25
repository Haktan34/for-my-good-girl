/* ==========================================================================
   script.js — how the little world behaves
   --------------------------------------------------------------------------
   You shouldn't need to edit this file to personalise the site:
   all text, photos and the letter live in content.js.

   Sections:
     0. Helpers (storage, motion preference, random)
     1. Language system (ky / en)
     2. Toast messages
     3. Music
     4. Scene navigation + progress + chapters menu
     5. Petals & sparkles
     6. Intro + bouquet
     7. Typewriter letter (one glass panel, nothing is ever erased)
     8. Scratch-to-reveal (used by the photos on the last page)
     9. "From your Daddy" love notes
    10. Final page (photos revealed by scratching)
    11. Start
   ========================================================================== */
(function () {
  'use strict';

  const C = window.SITE_CONTENT;
  if (!C) {
    document.body.insertAdjacentHTML('afterbegin',
      '<p class="noscript">content.js could not be loaded. Check that it is uploaded next to index.html.</p>');
    return;
  }

  /* ------------------------------------------------------------------------
     0. HELPERS
     ------------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const reducedMotion = () => !!(motionQuery && motionQuery.matches);

  // localStorage can throw (private mode, blocked storage). Never let it break the site.
  const store = {
    get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ } }
  };
  const KEY_LANG = 'iwchy.lang';
  const KEY_MUSIC = 'iwchy.music';

  // Small seeded random so decorative layouts look the same every visit.
  function seeded(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // Run a setup function without letting one failure break everything else.
  function safely(name, fn) {
    try { return fn(); } catch (err) { console.error('[' + name + ']', err); return null; }
  }

  // Load an image; on failure call onFail (used for every photo on the site).
  function loadImage(img, src, onFail) {
    if (!src) { onFail(); return; }
    img.addEventListener('error', function handler() {
      img.removeEventListener('error', handler);
      onFail();
    });
    img.src = src;
  }

  /* ------------------------------------------------------------------------
     1. LANGUAGE SYSTEM
     ------------------------------------------------------------------------ */
  const LANGS = ['ky', 'en'];
  let lang = (function () {
    const saved = store.get(KEY_LANG);
    if (LANGS.indexOf(saved) !== -1) return saved;
    return LANGS.indexOf(C.settings.defaultLanguage) !== -1 ? C.settings.defaultLanguage : 'ky';
  })();

  function lookup(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  // Replaces {her}, {me}, {n}, … inside a string.
  function fmt(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, (match, key) => {
      if (vars && vars[key] !== undefined) return vars[key];
      const nick = C.nicknames && C.nicknames[key];
      if (nick) return nick[lang] !== undefined ? nick[lang] : nick.en;
      return match;
    });
  }

  // Interface text by key, e.g. t('intro.title').
  function t(key, vars) {
    let value = lookup(C.translations[lang], key);
    if (value === undefined) value = lookup(C.translations.en, key);
    if (value === undefined) { console.warn('Missing translation:', key); return ''; }
    return fmt(value, vars);
  }

  // Content objects shaped like { ky: '…', en: '…' }.
  function pick(obj, vars) {
    if (obj == null) return '';
    if (typeof obj === 'string') return fmt(obj, vars);
    const value = obj[lang] !== undefined ? obj[lang] : obj.en;
    return value == null ? '' : fmt(value, vars);
  }

  const languageListeners = [];
  const onLanguage = (fn) => languageListeners.push(fn);

  function applyStaticText() {
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-attr]').forEach((el) => {
      el.getAttribute('data-i18n-attr').split(';').forEach((pair) => {
        const parts = pair.split(':');
        if (parts.length === 2) el.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });
  }

  function setLanguage(next, persist) {
    if (!C.translations[next]) next = 'ky';
    lang = next;
    document.documentElement.lang = next;
    document.title = t('meta.title');
    applyStaticText();
    $$('.lang-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === next)));
    languageListeners.forEach((fn) => safely('language', () => fn(next)));
    if (persist) store.set(KEY_LANG, next);
  }

  /* ------------------------------------------------------------------------
     2. TOAST (small friendly messages)
     ------------------------------------------------------------------------ */
  const toastEl = $('#toast');
  let toastTimer = null;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 4500);
  }

  /* ------------------------------------------------------------------------
     3. MUSIC — only ever starts after a tap/click. Never breaks the site.
     ------------------------------------------------------------------------ */
  const Music = (function () {
    const btn = $('#music-btn');
    let audio = null;
    let missing = false;
    let playing = false;
    let fadeFrame = null;
    let pausedByVisibility = false;

    function wanted() { return store.get(KEY_MUSIC) !== 'off'; }

    function ensureAudio() {
      if (audio || missing) return audio;
      try {
        audio = new Audio();
        audio.loop = true;
        audio.preload = 'auto';
        audio.addEventListener('error', () => {
          missing = true;
          playing = false;
          render();
        });
        audio.src = C.settings.musicFile;
        audio.volume = 0;
      } catch (e) {
        missing = true;
        audio = null;
      }
      return audio;
    }

    function render() {
      btn.setAttribute('aria-pressed', String(playing));
      const label = t(playing ? 'music.turnOff' : 'music.turnOn');
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      btn.classList.toggle('is-on', playing);
    }

    function fadeTo(target, ms, done) {
      if (!audio) return;
      cancelAnimationFrame(fadeFrame);
      const from = audio.volume;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / ms);
        try { audio.volume = from + (target - from) * p; } catch (e) { /* iOS: volume is read-only */ }
        if (p < 1) fadeFrame = requestAnimationFrame(step);
        else if (done) done();
      };
      fadeFrame = requestAnimationFrame(step);
    }

    // `explicit` = she pressed the music button herself (then we may explain failures).
    function play(explicit) {
      const a = ensureAudio();
      if (!a || missing) {
        playing = false; render();
        if (explicit) toast(t('music.unavailable'));
        return;
      }
      let promise;
      try { promise = a.play(); } catch (e) { promise = Promise.reject(e); }
      playing = true; render();
      Promise.resolve(promise).then(() => {
        if (!playing) return;
        fadeTo(Math.max(0, Math.min(1, Number(C.settings.musicVolume) || 0.45)), 1600);
      }).catch((err) => {
        playing = false; render();
        if (err && err.name === 'NotAllowedError') {
          if (explicit) toast(t('music.blocked'));
        } else {
          missing = true;
          if (explicit) toast(t('music.unavailable'));
        }
      });
    }

    function pause() {
      playing = false; render();
      if (!audio) return;
      fadeTo(0, 450, () => { if (!playing) audio.pause(); });
    }

    function toggle() {
      if (playing) { pause(); store.set(KEY_MUSIC, 'off'); }
      else { store.set(KEY_MUSIC, 'on'); play(true); }
    }

    // Called from the "Open my little surprise" button (an explicit tap).
    function startFromGesture() {
      if (!playing && wanted()) play(false);
    }

    btn.addEventListener('click', toggle);
    document.addEventListener('visibilitychange', () => {
      if (!audio) return;
      if (document.hidden && playing) { audio.pause(); pausedByVisibility = true; }
      else if (!document.hidden && pausedByVisibility) {
        pausedByVisibility = false;
        if (playing) { const p = audio.play(); if (p && p.catch) p.catch(() => { playing = false; render(); }); }
      }
    });
    onLanguage(render);
    return { render, startFromGesture };
  })();

  /* ------------------------------------------------------------------------
     4. SCENES, PROGRESS & CHAPTERS MENU
     ------------------------------------------------------------------------ */
  const SCENES = ['intro', 'bouquet', 'letter', 'notes', 'final'];
  const sceneEls = {};
  SCENES.forEach((id) => { sceneEls[id] = $('section.scene[data-scene="' + id + '"]'); });
  const hooks = {};
  let current = 0;
  let maxReached = 0;
  let transitioning = false;

  function callHook(id, name) {
    const h = hooks[id];
    if (h && typeof h[name] === 'function') safely(id + '.' + name, () => h[name]());
  }

  function goTo(index) {
    if (transitioning || index === current || index < 0 || index >= SCENES.length) return;
    transitioning = true;
    closeChapters();
    const fromId = SCENES[current];
    const toId = SCENES[index];
    const from = sceneEls[fromId];
    const to = sceneEls[toId];
    const duration = reducedMotion() ? 120 : 420;

    callHook(fromId, 'leave');
    from.classList.add('is-leaving');

    setTimeout(() => {
      from.hidden = true;
      from.classList.remove('is-active', 'is-leaving');
      current = index;
      maxReached = Math.max(maxReached, index);
      document.body.setAttribute('data-scene', toId);
      to.hidden = false;
      window.scrollTo(0, 0);
      void to.offsetWidth; // let the browser register the hidden → visible change
      to.classList.add('is-active');
      updateProgress();
      callHook(toId, 'enter');
      const heading = to.querySelector('h2');
      if (heading) { try { heading.focus({ preventScroll: true }); } catch (e) { heading.focus(); } }
      setTimeout(() => { transitioning = false; }, duration);
    }, duration);
  }

  const next = () => goTo(current + 1);
  const back = () => goTo(current - 1);

  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-nav]');
    if (!navBtn) return;
    if (navBtn.getAttribute('data-nav') === 'next') next();
    else back();
  });

  // Tiny rosebud progress indicator.
  const rosebuds = $('.rosebuds');
  SCENES.forEach(() => {
    const li = document.createElement('li');
    li.innerHTML = '<svg viewBox="-12 -12 24 24"><path d="M0,9 C-7,7 -8,-2 -5,-6 C-3,-9 -1,-7 0,-9 C1,-7 3,-9 5,-6 C8,-2 7,7 0,9Z"/></svg>';
    rosebuds.appendChild(li);
  });

  function updateProgress() {
    $$('li', rosebuds).forEach((li, i) => {
      li.classList.toggle('is-done', i <= maxReached && i !== current);
      li.classList.toggle('is-current', i === current);
    });
    renderChapters();
  }

  // Chapters menu (revisit any opened chapter, or peek one ahead).
  const chaptersBtn = $('#chapters-btn');
  const chaptersMenu = $('#chapters-menu');
  const chaptersList = $('#chapters-list');

  function renderChapters() {
    chaptersList.innerHTML = '';
    SCENES.forEach((id, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chapter-item';
      const available = i <= maxReached + 1;
      b.disabled = !available;
      b.innerHTML = '<span class="chapter-num">' + (i + 1) + '</span><span class="chapter-name"></span>';
      $('.chapter-name', b).textContent = t('scenes.' + id) + (available ? '' : ' · ' + t('nav.locked'));
      if (i === current) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', () => { closeChapters(); goTo(i); });
      li.appendChild(b);
      chaptersList.appendChild(li);
    });
    rosebuds.setAttribute('title', t('nav.progress', { n: current + 1, total: SCENES.length }));
  }

  function openChapters() {
    chaptersMenu.hidden = false;
    chaptersBtn.setAttribute('aria-expanded', 'true');
    chaptersBtn.setAttribute('aria-label', t('nav.closeChapters'));
    const first = $('.chapter-item[aria-current]', chaptersMenu) || $('.chapter-item', chaptersMenu);
    if (first) first.focus();
  }
  function closeChapters(returnFocus) {
    if (chaptersMenu.hidden) return;
    chaptersMenu.hidden = true;
    chaptersBtn.setAttribute('aria-expanded', 'false');
    chaptersBtn.setAttribute('aria-label', t('nav.openChapters'));
    if (returnFocus) chaptersBtn.focus();
  }
  chaptersBtn.addEventListener('click', () => (chaptersMenu.hidden ? openChapters() : closeChapters(true)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeChapters(true); });
  document.addEventListener('pointerdown', (e) => {
    if (!chaptersMenu.hidden && !chaptersMenu.contains(e.target) && !chaptersBtn.contains(e.target)) closeChapters(false);
  });
  onLanguage(() => {
    renderChapters();
    chaptersBtn.setAttribute('aria-label', t(chaptersMenu.hidden ? 'nav.openChapters' : 'nav.closeChapters'));
  });

  /* ------------------------------------------------------------------------
     5. PETALS & SPARKLES (decoration only, skipped with reduced motion)
     ------------------------------------------------------------------------ */
  function fillPetals(field, count, seed) {
    if (!field || field.childElementCount) return;
    const rnd = seeded(seed);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      // mostly rose petals, with the occasional tiny rosebud drifting by
      p.className = i % 4 === 3 ? 'petal petal--bud' : 'petal';
      p.style.setProperty('--x', (rnd() * 100).toFixed(1) + '%');
      p.style.setProperty('--s', (12 + rnd() * 10).toFixed(1) + 'px');
      p.style.setProperty('--dur', (20 + rnd() * 14).toFixed(1) + 's');
      p.style.setProperty('--delay', (-rnd() * 20).toFixed(1) + 's');
      p.style.setProperty('--drift', ((rnd() - 0.5) * 160).toFixed(0) + 'px');
      p.style.setProperty('--rot', (180 + rnd() * 360).toFixed(0) + 'deg');
      field.appendChild(p);
    }
  }

  // A one-off burst of petals from a point on screen (used by "Take my flowers").
  function burstPetals(x, y, count) {
    if (reducedMotion() || !Element.prototype.animate) return;
    const layer = $('#fly-layer');
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'petal petal-burst';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      layer.appendChild(p);
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 90 + Math.random() * 110;
      const anim = p.animate([
        { transform: 'translate(-50%, -50%) rotate(0deg) scale(.6)', opacity: 0 },
        { opacity: 0.95, offset: 0.15 },
        { transform: 'translate(calc(-50% + ' + Math.cos(angle) * dist + 'px), calc(-50% + ' + (Math.sin(angle) * dist + 60) + 'px)) rotate(' + (200 + Math.random() * 260) + 'deg) scale(1)', opacity: 0 }
      ], { duration: 1300 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
      anim.onfinish = () => p.remove();
    }
  }

  function sparkleBurst(container, count) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.style.left = (8 + Math.random() * 84) + '%';
      s.style.top = (8 + Math.random() * 84) + '%';
      s.style.animationDelay = (Math.random() * 0.6).toFixed(2) + 's';
      container.appendChild(s);
    }
    setTimeout(() => { container.innerHTML = ''; }, 2600);
  }

  /* ------------------------------------------------------------------------
     6. INTRO + BOUQUET
     ------------------------------------------------------------------------ */
  $('#open-surprise').addEventListener('click', () => {
    Music.startFromGesture();
    goTo(1);
  });

  (function bouquetScene() {
    const scene = sceneEls.bouquet;
    const wrap = $('#bouquet-wrap');
    const art = $('#bouquet-art');
    const takeBtn = $('#take-flowers');
    let settleTimer = null;
    let taken = false;

    // Optional: your own bouquet image instead of the drawing (content.js → SETTINGS.bouquetImage).
    if (C.settings.bouquetImage) {
      const original = art.innerHTML;
      const img = new Image();
      img.className = 'bouquet-img';
      img.alt = '';
      loadImage(img, C.settings.bouquetImage, () => { art.innerHTML = original; });
      art.innerHTML = '';
      art.appendChild(img);
    }

    function settle() {
      clearTimeout(settleTimer);
      scene.classList.add('is-settled');
    }

    hooks.bouquet = {
      enter() {
        taken = false;
        takeBtn.disabled = false;
        wrap.classList.remove('is-taken');
        scene.classList.remove('is-settled');
        fillPetals($('.petal-field', scene), 9, 11);
        if (reducedMotion()) settle();
        else settleTimer = setTimeout(settle, 2800);
      },
      leave() { clearTimeout(settleTimer); }
    };

    art.addEventListener('click', settle); // tap the flowers to skip the opening animation

    takeBtn.addEventListener('click', () => {
      if (taken) return;
      taken = true;
      takeBtn.disabled = true;
      settle();
      wrap.classList.add('is-taken');
      const r = art.getBoundingClientRect();
      burstPetals(r.left + r.width / 2, r.top + r.height * 0.4, 14);
      setTimeout(() => goTo(SCENES.indexOf('letter')), reducedMotion() ? 250 : 1250);
    });
  })();

  /* ------------------------------------------------------------------------
     7. TYPEWRITER LETTER
     One glass panel. Paragraphs are typed one after another and NEVER erased:
     every finished paragraph stays, the next one starts underneath.
     The text comes from content.js → LETTER. This code only animates it.

     How it stays light: only the paragraph being typed changes, and it grows
     through a single text node (appendData) — no DOM rebuild per character.
     Screen readers get the whole letter at once from a hidden copy, so they
     never read it letter by letter.
     ------------------------------------------------------------------------ */
  const Letter = (function () {
    const title = $('#letter-title');
    const panel = $('#letter-panel');
    const body = $('#letter-body');
    const srCopy = $('#letter-sr');
    const completeEl = $('#letter-complete');
    const pauseBtn = $('#letter-pause');
    const skipBtn = $('#letter-skip');
    const topBtn = $('#letter-top');
    const replayBtn = $('#letter-replay');

    const TYPE_SPEED = 26;        // ms per character (a little random on top)
    const PARAGRAPH_PAUSE = 750;  // pause before the next paragraph starts

    const cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    const state = {
      started: false, done: false, paused: false, active: false,
      para: 0,          // index of the paragraph being typed
      char: 0,          // characters already typed in that paragraph
      timer: null
    };
    let chars = [];       // the current paragraph split into characters
    let liveText = null;  // the single text node that grows while typing
    let stick = true;     // keep the newest line in view (until she scrolls up herself)
    let autoScrolling = false;
    let autoTimer = null;

    function letter() { return C.letterContent[lang] || C.letterContent.en; }
    function paragraphs() { return (letter().paragraphs || []).map(String); }
    function total() { return paragraphs().length; }

    function clearTimer() { clearTimeout(state.timer); state.timer = null; }
    function schedule(fn, ms) { clearTimer(); state.timer = setTimeout(fn, ms); }

    function makeParagraph(text) {
      const p = document.createElement('p');
      p.textContent = text;
      return p;
    }

    // Build the panel from the state (used on start, skip, language switch).
    function render() {
      const ps = paragraphs();
      body.textContent = '';
      const upTo = state.done ? ps.length : Math.min(state.para, ps.length);
      for (let i = 0; i < upTo; i++) body.appendChild(makeParagraph(ps[i]));
      liveText = null;
      if (!state.done && state.para < ps.length) {
        chars = Array.from(ps[state.para]);
        state.char = Math.min(state.char, chars.length);
        const p = document.createElement('p');
        p.className = 'is-typing';
        liveText = document.createTextNode(chars.slice(0, state.char).join(''));
        p.appendChild(liveText);
        p.appendChild(cursor);
        body.appendChild(p);
      }
    }

    function renderScreenReaderCopy() {
      srCopy.textContent = '';
      paragraphs().forEach((text) => srCopy.appendChild(makeParagraph(text)));
    }

    function setReadable(readable) {
      // While typing, sighted readers watch the panel and screen readers read the hidden copy.
      if (readable) {
        panel.removeAttribute('aria-hidden');
        panel.setAttribute('tabindex', '0');
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', t('letter.panelLabel'));
        srCopy.hidden = true;
      } else {
        panel.setAttribute('aria-hidden', 'true');
        panel.removeAttribute('tabindex');
        panel.removeAttribute('role');
        panel.removeAttribute('aria-label');
        srCopy.hidden = false;
      }
    }

    function renderControls() {
      pauseBtn.textContent = t(state.paused ? 'letter.resume' : 'letter.pause');
      pauseBtn.setAttribute('aria-pressed', String(state.paused));
      pauseBtn.hidden = state.done;
      skipBtn.hidden = state.done;
      topBtn.hidden = !state.done;
      completeEl.hidden = !state.done;
    }

    // Gently keep the newest line visible — but never fight her own scrolling.
    function keepInView() {
      if (!stick) return;
      const target = panel.scrollHeight - panel.clientHeight;
      if (target - panel.scrollTop < 2) return;
      autoScrolling = true;
      clearTimeout(autoTimer);
      try { panel.scrollTo({ top: target, behavior: reducedMotion() ? 'auto' : 'smooth' }); }
      catch (e) { panel.scrollTop = target; }
      autoTimer = setTimeout(() => { autoScrolling = false; }, 450);
    }
    panel.addEventListener('scroll', () => {
      if (autoScrolling) return;
      stick = panel.scrollHeight - panel.scrollTop - panel.clientHeight < 40;
    });
    ['wheel', 'touchstart', 'keydown'].forEach((type) => {
      panel.addEventListener(type, () => { autoScrolling = false; }, { passive: true });
    });

    // --- the sequence -------------------------------------------------------
    function tick() {
      if (state.paused || !state.active || state.done) return;
      if (state.char >= chars.length) { nextParagraph(); return; }

      if (reducedMotion()) {
        // No character animation: show the whole paragraph, then pause to read.
        liveText.appendData(chars.slice(state.char).join(''));
        state.char = chars.length;
        keepInView();
        schedule(tick, 1200);
        return;
      }

      const ch = chars[state.char];
      liveText.appendData(ch);
      state.char += 1;
      if (ch === ' ' || state.char === 1) keepInView();
      let delay = TYPE_SPEED + Math.random() * 22 - 8;
      if (/[,;:—–]/.test(ch)) delay += 120;
      if (/[.!?…»"]/.test(ch)) delay += 220;
      schedule(tick, delay);
    }

    function nextParagraph() {
      const done = body.lastElementChild;
      if (done) { done.classList.remove('is-typing'); if (cursor.parentNode === done) done.removeChild(cursor); }
      state.para += 1;
      state.char = 0;
      if (state.para >= total()) { complete(); return; }
      chars = Array.from(paragraphs()[state.para]);
      const p = document.createElement('p');
      p.className = 'is-typing';
      liveText = document.createTextNode('');
      p.appendChild(liveText);
      p.appendChild(cursor);
      body.appendChild(p);
      keepInView();
      schedule(tick, PARAGRAPH_PAUSE);
    }

    function complete() {
      clearTimer();
      state.done = true;
      state.paused = false;
      const keepScroll = panel.scrollTop;
      render();               // the full letter, every paragraph, stays in the panel
      panel.scrollTop = keepScroll;
      setReadable(true);
      renderControls();
    }

    function start() {
      clearTimer();
      Object.assign(state, { started: true, done: false, paused: false, para: 0, char: 0 });
      stick = true;
      panel.scrollTop = 0;
      setReadable(false);
      render();
      renderControls();
      schedule(tick, 700);
    }

    function skip() {
      complete();
      topBtn.focus();
    }

    function togglePause() {
      if (state.done) return;
      state.paused = !state.paused;
      renderControls();
      if (state.paused) clearTimer();
      else schedule(tick, 250);
    }

    function readFromTop() {
      try { panel.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }); }
      catch (e) { panel.scrollTop = 0; }
      const r = panel.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.5) {
        window.scrollTo({ top: Math.max(0, window.scrollY + r.top - 110), behavior: reducedMotion() ? 'auto' : 'smooth' });
      }
      panel.focus({ preventScroll: true });
    }

    pauseBtn.addEventListener('click', togglePause);
    skipBtn.addEventListener('click', skip);
    topBtn.addEventListener('click', readFromTop);
    replayBtn.addEventListener('click', start);

    hooks.letter = {
      enter() {
        state.active = true;
        if (!state.started) start();
        else if (!state.done && !state.paused) schedule(tick, 400);
      },
      leave() {
        state.active = false;
        clearTimer();
      }
    };

    // Language switch: keep the position, swap the words. Never mixes languages.
    onLanguage(() => {
      title.textContent = letter().heading || '';
      renderScreenReaderCopy();
      if (state.done) {
        const keepScroll = panel.scrollTop;
        render();
        panel.scrollTop = keepScroll;
        panel.setAttribute('aria-label', t('letter.panelLabel'));
      } else if (state.started) {
        state.para = Math.min(state.para, Math.max(0, total() - 1));
        const oldLength = chars.length || 1;
        const ratio = state.char / oldLength;
        const nextLength = Array.from(paragraphs()[state.para] || '').length;
        state.char = Math.round(ratio * nextLength);
        render();
        keepInView();
      }
      renderControls();
    });

    return { reset: () => { clearTimer(); state.started = false; } };
  })();

  /* ------------------------------------------------------------------------
     8. SCRATCH-TO-REVEAL (reusable — used for each photo on the last page)
     makeScratch(frame, onReveal) paints a blush-pink cover with tiny hearts
     on a <canvas> inside `frame`. Scratching ~half of it (finger or mouse)
     reveals what is underneath. Only the canvas blocks touch-scrolling.
     ------------------------------------------------------------------------ */
  function makeScratch(frame, onReveal) {
    const canvas = $('canvas', frame);
    const hint = $('.scratch-hint', frame);
    const sparkles = $('.sparkle-layer', frame);
    const ctx = canvas.getContext('2d');
    const THRESHOLD = 0.5;

    let revealed = false;
    let drawing = false;
    let last = null;
    let paintedWidth = 0;
    let lastCheck = 0;
    let brush = 30;

    function heartPath(x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.3);
      ctx.bezierCurveTo(x, y - s * 0.3, x - s, y - s * 0.3, x - s, y + s * 0.25);
      ctx.bezierCurveTo(x - s, y + s * 0.75, x - s * 0.2, y + s * 1.05, x, y + s * 1.35);
      ctx.bezierCurveTo(x + s * 0.2, y + s * 1.05, x + s, y + s * 0.75, x + s, y + s * 0.25);
      ctx.bezierCurveTo(x + s, y - s * 0.3, x, y - s * 0.3, x, y + s * 0.3);
      ctx.closePath();
    }

    function paint() {
      // clientWidth/Height ignore the polaroid's small tilt, so the cover fits exactly.
      const w = frame.clientWidth;
      const h = frame.clientHeight;
      if (w < 10 || h < 10) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';

      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#FCE4EC');
      g.addColorStop(0.55, '#F7C9D7');
      g.addColorStop(1, '#F4B8CB');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(232, 142, 175, 0.28)';
      const step = 30;
      for (let y = 10, row = 0; y < h; y += step, row++) {
        for (let x = (row % 2 ? step / 2 : 0) + 8; x < w; x += step) { heartPath(x, y, 4); ctx.fill(); }
      }
      const cx = w / 2, cy = h / 2 - 12;
      const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, Math.min(w, h) * 0.45);
      glow.addColorStop(0, 'rgba(255,255,255,.85)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      const size = Math.min(w, h) * 0.14;
      heartPath(cx, cy - size * 0.5, size);
      ctx.fillStyle = '#E88EAF'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 7]);
      ctx.lineCap = 'round';
      const inset = 10;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, 12);
      else ctx.rect(inset, inset, w - inset * 2, h - inset * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      brush = Math.max(28, Math.min(50, w * 0.11));
      paintedWidth = w;
    }

    // offsetX/offsetY are measured on the canvas itself, so they stay correct on tilted photos.
    function point(e) { return { x: e.offsetX, y: e.offsetY }; }

    function scratch(a, b) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brush;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(b.x, b.y, brush / 2, 0, Math.PI * 2); ctx.fill();
    }

    function scratchedRatio() {
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let clear = 0, count = 0;
        for (let i = 3; i < data.length; i += 24) { count++; if (data[i] < 128) clear++; }
        return count ? clear / count : 0;
      } catch (e) { return 1; }
    }

    function check(force) {
      const now = performance.now();
      if (!force && now - lastCheck < 200) return;
      lastCheck = now;
      if (scratchedRatio() >= THRESHOLD) reveal();
    }

    function reveal() {
      if (revealed) return;
      revealed = true;
      drawing = false;
      frame.classList.add('is-revealed');
      if (hint) hint.classList.add('is-hidden');
      if (!reducedMotion()) sparkleBurst(sparkles, 12);
      if (onReveal) onReveal();
    }

    canvas.addEventListener('pointerdown', (e) => {
      if (revealed) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      drawing = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      last = point(e);
      scratch(last, last);
      if (hint) hint.classList.add('is-hidden');
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drawing || revealed) return;
      e.preventDefault();
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      (events.length ? events : [e]).forEach((ev) => { const p = point(ev); scratch(last, p); last = p; });
      check(false);
    });
    const stop = () => { if (!drawing) return; drawing = false; check(true); };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
    canvas.addEventListener('lostpointercapture', stop);

    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        if (!revealed && frame.clientWidth > 10 && Math.abs(frame.clientWidth - paintedWidth) > 1) paint();
      }).observe(frame);
    }

    return {
      reveal: reveal,
      ensurePainted() { if (!revealed && Math.abs(frame.clientWidth - paintedWidth) > 1) paint(); },
      isRevealed: () => revealed
    };
  }

  /* ------------------------------------------------------------------------
     9. "FROM YOUR DADDY" — LOVE NOTES
     Closed glass cards with a rosebud. Tap one → its message opens softly.
     Close it and open it again as often as she likes; nothing disappears,
     nothing is counted. Messages come from content.js → LOVE_NOTES.
     ------------------------------------------------------------------------ */
  // A rose drawn with plain shapes (no ids), coloured with currentColor.
  const ROSE_MARKUP =
    '<path d="M-36,2 C-38,-22 -16,-36 0,-32 C16,-36 38,-22 36,2 C34,24 16,36 0,36 C-16,36 -34,24 -36,2Z" fill="currentColor"/>' +
    '<path d="M-36,2 C-34,24 -16,36 0,36 C16,36 34,24 36,2 C26,18 12,24 0,24 C-12,24 -26,18 -36,2Z" fill="#B84F78" opacity=".2"/>' +
    '<path d="M-26,-4 C-26,-22 -8,-28 4,-24 C18,-26 28,-12 24,2 C20,16 4,20 -8,16 C-20,12 -27,6 -26,-4Z" fill="#FFFFFF" opacity=".22"/>' +
    '<path d="M-30,-8 C-22,-26 -4,-30 8,-26 M30,-6 C26,-20 14,-26 4,-26 M-22,12 C-10,22 12,22 22,10" fill="none" stroke="#B84F78" stroke-opacity=".32" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M2,-3 C7,-7 11,0 7,5 C2,10 -7,8 -9,1 C-11,-8 -2,-14 7,-13 C16,-12 20,-2 17,7 C14,15 4,18 -4,16" fill="none" stroke="#6E3450" stroke-opacity=".42" stroke-width="2.4" stroke-linecap="round"/>';
  const BUD_MARKUP =
    '<path d="M0,34 C-2,20 -1,10 0,2" stroke="#6F9E73" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M0,20 C-10,12 -18,16 -20,22 C-12,26 -4,24 0,20Z" fill="#8DB38B"/>' +
    '<path d="M0,6 C-14,2 -16,-14 -8,-24 C-4,-29 4,-29 8,-24 C16,-14 14,2 0,6Z" fill="currentColor"/>' +
    '<path d="M-6,-20 C-2,-12 2,-12 6,-20" fill="none" stroke="#6E3450" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M0,6 C-8,4 -12,-2 -12,-8 C-6,-4 -2,-2 0,6Z M0,6 C8,4 12,-2 12,-8 C6,-4 2,-2 0,6Z" fill="#8DB38B"/>';

  (function loveNotes() {
    const grid = $('#notes-grid');
    const modal = $('#note-modal');
    const textEl = $('#note-modal-text');
    const closeBtn = $('#note-close');
    $('#note-rose').innerHTML = ROSE_MARKUP;
    let openIndex = -1;
    let lastFocus = null;
    let closeTimer = null;

    const cards = (C.loveNotes || []).map((note, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'note-card glass';
      b.style.setProperty('--i', i);
      b.innerHTML =
        '<svg class="note-card-bud" viewBox="-40 -40 80 80" aria-hidden="true">' + BUD_MARKUP + '</svg>' +
        '<svg class="note-card-rose" viewBox="-40 -40 80 80" aria-hidden="true">' + ROSE_MARKUP + '</svg>' +
        '<span class="note-card-label" aria-hidden="true"></span>';
      b.addEventListener('click', () => openNote(i, b));
      li.appendChild(b);
      grid.appendChild(li);
      return { note: note, button: b, opened: false };
    });

    function renderCards() {
      cards.forEach((c, i) => {
        c.button.classList.toggle('is-opened', c.opened);
        $('.note-card-label', c.button).textContent = t(c.opened ? 'notes.again' : 'notes.open');
        c.button.setAttribute('aria-label', t(c.opened ? 'notes.cardLabelOpened' : 'notes.cardLabel', { n: i + 1 }));
      });
    }

    function renderOpen() {
      if (openIndex >= 0) textEl.textContent = pick(cards[openIndex].note);
    }

    function openNote(i, button) {
      clearTimeout(closeTimer);
      openIndex = i;
      lastFocus = button;
      cards[i].opened = true;
      renderCards();
      renderOpen();
      modal.hidden = false;
      modal.classList.remove('is-open', 'is-closing');
      void modal.offsetWidth;
      modal.classList.add('is-open');
      document.documentElement.classList.add('has-modal');
      setTimeout(() => closeBtn.focus({ preventScroll: true }), 30);
    }

    function closeNote() {
      if (modal.hidden) return;
      modal.classList.add('is-closing');
      closeTimer = setTimeout(() => {
        modal.hidden = true;
        modal.classList.remove('is-open', 'is-closing');
        document.documentElement.classList.remove('has-modal');
        openIndex = -1;
        if (lastFocus) lastFocus.focus({ preventScroll: true });
      }, reducedMotion() ? 50 : 320);
    }

    closeBtn.addEventListener('click', closeNote);
    modal.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close-modal')) closeNote(); });
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeNote(); }
      if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); } // only one control inside
    });

    hooks.notes = {
      enter() { fillPetals($('.petal-field', sceneEls.notes), 7, 23); },
      leave() {
        if (!modal.hidden) {
          clearTimeout(closeTimer);
          modal.hidden = true;
          modal.classList.remove('is-open', 'is-closing');
          document.documentElement.classList.remove('has-modal');
          openIndex = -1;
        }
      }
    };
    onLanguage(() => { renderCards(); renderOpen(); });
    renderCards();
  })();

  /* ------------------------------------------------------------------------
     10. FINAL PAGE — our photos, each hidden under a scratch card
     Same layout as before (three polaroids, the final message, a heart);
     each photo is uncovered by scratching it, or with its "Reveal now" button.
     ------------------------------------------------------------------------ */
  (function finalPage() {
    const scene = sceneEls.final;
    const gallery = $('#gallery-grid');
    const status = $('#gallery-status');
    const replayBtn = $('#replay-btn');
    const HEART = '<svg viewBox="-24 -24 48 48" aria-hidden="true"><path d="M0,-6 C0,-14 -12,-16 -12,-6 C-12,2 -2,8 0,12 C2,8 12,2 12,-6 C12,-16 0,-14 0,-6Z"/></svg>';

    const figures = (C.photos.gallery || []).map((photo, i) => {
      const fig = document.createElement('figure');
      fig.className = 'polaroid';
      fig.style.setProperty('--tilt', [-2.2, 1.6, -1.1, 2][i % 4] + 'deg');
      fig.innerHTML =
        '<div class="polaroid-frame scratch-frame">' +
          '<img loading="lazy" decoding="async" alt="">' +
          '<div class="photo-fallback small" hidden>' + HEART + '<p></p></div>' +
          '<canvas role="img"></canvas>' +
          '<p class="scratch-hint" aria-hidden="true"></p>' +
          '<div class="sparkle-layer" aria-hidden="true"></div>' +
        '</div>' +
        '<figcaption></figcaption>' +
        '<button type="button" class="btn btn-small btn-secondary polaroid-reveal"></button>';
      gallery.appendChild(fig);
      const f = {
        photo: photo, fig: fig,
        img: $('img', fig), fb: $('.photo-fallback', fig), canvas: $('canvas', fig),
        hint: $('.scratch-hint', fig), cap: $('figcaption', fig), btn: $('.polaroid-reveal', fig)
      };
      loadImage(f.img, photo.src, () => { f.img.hidden = true; f.fb.hidden = false; });
      f.scratch = makeScratch($('.scratch-frame', fig), () => {
        f.btn.hidden = true;
        fig.classList.add('is-revealed');
        renderStatus();
      });
      f.btn.addEventListener('click', () => f.scratch.reveal());
      return f;
    });

    function renderStatus() {
      const done = figures.filter((f) => f.scratch.isRevealed()).length;
      status.textContent = done && done === figures.length ? t('final.allRevealed') : '';
    }

    function renderGallery() {
      figures.forEach((f, i) => {
        f.img.alt = pick(f.photo.alt);
        f.cap.textContent = pick(f.photo.caption);
        $('p', f.fb).textContent = t('final.photoMissing');
        f.hint.textContent = t('final.scratchHint');
        f.btn.textContent = t('final.revealNow');
        f.canvas.setAttribute('aria-label', t('final.canvasLabel', { n: i + 1 }));
      });
      renderStatus();
    }

    hooks.final = {
      enter() {
        fillPetals($('.petal-field', scene), 10, 77);
        figures.forEach((f) => f.scratch.ensurePainted());
        scene.classList.remove('is-playing');
        void scene.offsetWidth;
        scene.classList.add('is-playing');
      }
    };

    replayBtn.addEventListener('click', () => {
      Letter.reset();
      goTo(0);
    });

    onLanguage(renderGallery);
    renderGallery();
  })();

  /* ------------------------------------------------------------------------
     11. START
     ------------------------------------------------------------------------ */
  $$('.lang-btn').forEach((b) => b.addEventListener('click', () => {
    const chosen = b.getAttribute('data-lang');
    if (chosen !== lang) setLanguage(chosen, true);
  }));

  setLanguage(lang, false);
  updateProgress();
  fillPetals($('.petal-field', sceneEls.intro), 6, 5);
  Music.render();
  document.documentElement.classList.add('is-ready');
})();
