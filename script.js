// Sticky nav
const nav = document.getElementById('nav');
if(nav) window.addEventListener('scroll', function() {
  nav.classList.toggle('stuck', window.scrollY > 20);
}, {passive: true});

// Active nav tab on scroll (only runs on pages that have these sections)
const sections = ['hero-section','about','skills','experience','projects','certifications','contact'];
const navLinks = document.querySelectorAll('.nav-links a[data-section]');

function setActive(id) {
  navLinks.forEach(function(a) {
    a.classList.toggle('active', a.dataset.section === id);
  });
}

if(document.getElementById('hero-section')){
  window.addEventListener('scroll', function() {
    let current = 'hero-section';
    sections.forEach(function(id) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    setActive(current);
  }, {passive: true});
  setActive('hero-section');
}

// Settings panel (dark mode + accent color) — shared across every page
(function(){
  var fab = document.getElementById('settings-trigger');
  var panel = document.getElementById('settings-panel');
  var darkToggle = document.getElementById('sp-dark-toggle');
  var navToggle = document.getElementById('theme-toggle');

  var COLORS = {
    green:  {main:'#1a6b45', light:'#e8f5ef', mid:'#2d9b67', rgb:'26,107,69'},
    blue:   {main:'#1d4ed8', light:'#eff6ff', mid:'#3b82f6', rgb:'29,78,216'},
    purple: {main:'#7c3aed', light:'#f5f3ff', mid:'#8b5cf6', rgb:'124,58,237'},
    rose:   {main:'#e11d48', light:'#fff1f2', mid:'#f43f5e', rgb:'225,29,72'},
    cyan:   {main:'#0891b2', light:'#ecfeff', mid:'#06b6d4', rgb:'8,145,178'},
    amber:  {main:'#d97706', light:'#fef3c7', mid:'#f59e0b', rgb:'217,119,6'},
  };

  function applyColor(name){
    var c = COLORS[name]; if(!c) return;
    var r = document.documentElement;
    r.style.setProperty('--green', c.main);
    r.style.setProperty('--green-light', c.light);
    r.style.setProperty('--green-mid', c.mid);
    r.style.setProperty('--accent-main', c.main);
    r.style.setProperty('--accent-light', c.light);
    r.style.setProperty('--accent-rgb', c.rgb);
    localStorage.setItem('accent', name);
    document.querySelectorAll('.sp-color').forEach(function(el){
      el.classList.toggle('active', el.dataset.color === name);
    });
  }
  function isDark(){ return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function syncDark(d){ if(darkToggle) darkToggle.classList.toggle('on', d); }

  var savedTheme = localStorage.getItem('theme');
  if(savedTheme === 'dark') document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.removeAttribute('data-theme');

  syncDark(isDark());
  applyColor(localStorage.getItem('accent') || 'green');

  if(fab && panel){
    fab.addEventListener('click', function(e){ e.stopPropagation(); panel.classList.toggle('open'); });
    document.addEventListener('click', function(e){ if(!panel.contains(e.target) && e.target!==fab) panel.classList.remove('open'); });
  }
  if(darkToggle){
    darkToggle.addEventListener('click', function(){
      var next = !isDark();
      if(next) document.documentElement.setAttribute('data-theme','dark');
      else document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', next?'dark':'light');
      syncDark(next);
    });
  }
  if(navToggle){ navToggle.addEventListener('click', function(){ syncDark(isDark()); }); }
  document.querySelectorAll('.sp-color').forEach(function(el){
    el.addEventListener('click', function(){ applyColor(el.dataset.color); });
  });
})();

// Back to top
(function(){
  var btn = document.getElementById('btt');
  var wa = document.getElementById('wa-fab');
  if(!btn) return;
  window.addEventListener('scroll', function(){
    var show = window.scrollY > 400;
    btn.classList.toggle('show', show);
    if(wa) wa.classList.toggle('show', show);
  }, {passive:true});
  btn.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
})();

// Theme toggle (nav button - syncs with settings panel)
(function(){
  var btn = document.getElementById('theme-toggle');
  if(btn){
    btn.addEventListener('click', function(){
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if(isDark) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', !isDark ? 'dark' : 'light');
      var spToggle = document.getElementById('sp-dark-toggle');
      if(spToggle) spToggle.classList.toggle('on', !isDark);
    });
  }
})();

// Cursor companion — the H.Solutions character follows the pointer on desktop and
// docks above the footer; on touch devices it floats beside the back-to-top button
// and leans with the scroll instead. One rAF loop drives both modes, writing only
// transforms: #mascot gets position, .m-body gets lean/bob, .m-figure is left to
// CSS for the hover/press classes so the two never fight over one property.
const mascot = document.getElementById('mascot');
if(mascot) {
  var mBody = mascot.querySelector('.m-body') || mascot;

  var DOCK_THRESHOLD = 260;  // px from the bottom of the page before it settles
  var HYSTERESIS = 40;       // extra travel needed to undock, so it can't flicker
  var FOLLOW = 0.2;          // ease toward the pointer per 60fps frame: trails, never lags
  var OFFSET_X = 16, OFFSET_Y = 14;  // character sits down-right of the hotspot
  var LEAN_MAX = 10;         // deg at a fast flick
  var LEAN_PER_PX = 0.5;     // deg per px-per-frame of horizontal speed
  var LEAN_EASE = 0.14;
  var STRETCH_MAX = 0.05;    // slight stretch in the direction of fast travel
  var BOB_AMP = 2, BOB_PERIOD = 3200;   // idle float when docked / on touch
  var SCROLL_VMAX = 28;      // px/frame of scroll that counts as "fast"
  var SCROLL_LEAN = 9, SCROLL_SHIFT = 10, SCROLL_EASE = 0.1;
  var TAU = Math.PI * 2;

  var coarse = window.matchMedia('(hover: none) and (pointer: coarse)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var mx = 0, my = 0;          // pointer
  var x = 0, y = 0;            // smoothed position of the box's top-left corner
  var w = 48, h = 84;          // box size, re-read on resize (never in the loop)
  var seen = false, away = true, docked = false;
  var lean = 0, stretch = 0, scrollVel = 0;
  var lastScrollY = window.scrollY, lastFrame = 0;
  var lastPos = '', lastBody = '';

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  // Frame-rate independent ease: `ease` is the per-60fps-frame fraction.
  function decay(ease, k) { return 1 - Math.pow(1 - ease, k); }
  function write(el, t, last) {
    if (t !== last) el.style.transform = t;
    return t;
  }

  function measure() {
    w = mascot.offsetWidth || w;
    h = mascot.offsetHeight || h;
  }

  function gapToBottom() {
    var docH = Math.max(document.body.offsetHeight, document.documentElement.offsetHeight);
    return docH - (window.innerHeight + window.scrollY);
  }

  function checkDock() {
    var gap = gapToBottom();
    if (coarse.matches) docked = false;
    else if(!docked && gap <= DOCK_THRESHOLD) docked = true;
    else if(docked && gap > DOCK_THRESHOLD + HYSTERESIS) docked = false;
    mascot.classList.toggle('docked', docked);
    syncVisible();
  }

  // Shown once the pointer has been seen and is still inside the window, or
  // whenever it's parked above the footer. Touch mode is always shown.
  function syncVisible() {
    var show = coarse.matches || docked || (seen && !away);
    mascot.classList.toggle('hidden', !show);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = lastFrame ? Math.min(now - lastFrame, 64) : 16.7;
    lastFrame = now;
    var k = dt / 16.7;
    var still = reduceMotion.matches;
    var bob;

    if (coarse.matches) {
      // Touch: the box is placed by CSS; only the scroll reaction moves. Sampled
      // per frame so a 120Hz screen and a throttled one reach the same amplitude.
      var sy = window.scrollY;
      var raw = still ? 0 : clamp((sy - lastScrollY) / k, -SCROLL_VMAX, SCROLL_VMAX) / SCROLL_VMAX;
      lastScrollY = sy;
      scrollVel += (raw - scrollVel) * decay(SCROLL_EASE, k);
      bob = still ? 0 : Math.sin((now / BOB_PERIOD) * TAU) * BOB_AMP;
      lastBody = write(mBody,
        'translate3d(0,' + (scrollVel * SCROLL_SHIFT + bob).toFixed(2) + 'px,0) ' +
        'rotate(' + (scrollVel * SCROLL_LEAN).toFixed(2) + 'deg)', lastBody);
      return;
    }

    // Desktop: docked just swaps the target the same ease glides toward.
    var tx = docked ? window.innerWidth / 2 - w / 2 : mx + OFFSET_X;
    var ty = docked ? window.innerHeight - 96 - h / 2 : my + OFFSET_Y;
    var e = still ? 1 : decay(FOLLOW, k);
    var px = x;
    x += (tx - x) * e;
    y += (ty - y) * e;

    // Lean into the direction of travel, harder when fast, back to neutral at rest
    var vx = (x - px) / k;
    var targetLean = still ? 0 : clamp(vx * LEAN_PER_PX, -LEAN_MAX, LEAN_MAX);
    lean += (targetLean - lean) * decay(LEAN_EASE, k);
    var speed = still ? 0 : Math.min(Math.abs(vx) / 30, 1);
    stretch += (speed * STRETCH_MAX - stretch) * decay(LEAN_EASE, k);
    bob = (docked && !still) ? Math.sin((now / BOB_PERIOD) * TAU) * BOB_AMP : 0;

    lastPos = write(mascot, 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)', lastPos);
    lastBody = write(mBody,
      'translate3d(0,' + bob.toFixed(2) + 'px,0) rotate(' + lean.toFixed(2) + 'deg) ' +
      'scale(' + (1 + stretch).toFixed(3) + ',' + (1 - stretch * .6).toFixed(3) + ')', lastBody);
  }

  // Delegated so it also covers cards rendered later from data/projects/*.md
  var HOVER_TARGETS = 'a,button,.btn,[role="button"],summary,label,.skill-card,.proj-card,.proj-x-card,.cert-card,.cs-cap';
  var TEXT_TARGETS = 'input,textarea,select,[contenteditable]';
  function isTarget(node) {
    return !!(node && node.closest && node.closest(HOVER_TARGETS));
  }
  function isText(node) {
    return !!(node && node.closest && node.closest(TEXT_TARGETS));
  }
  document.addEventListener('mouseover', function(e) {
    if (isTarget(e.target)) mascot.classList.add('expand');
    // Over a field the character steps back so it never covers what's being typed
    mascot.classList.toggle('quiet', isText(e.target));
  });
  document.addEventListener('mouseout', function(e) {
    if (!isTarget(e.relatedTarget)) mascot.classList.remove('expand');
  });

  window.addEventListener('pointermove', function(e) {
    if (e.pointerType === 'touch') return;
    mx = e.clientX; my = e.clientY;
    if (!seen) { seen = true; x = mx + OFFSET_X; y = my + OFFSET_Y; }
    if (away) { away = false; syncVisible(); }
  }, { passive: true });

  window.addEventListener('pointerdown', function(e) {
    if (e.pointerType !== 'touch') mascot.classList.add('press');
  }, { passive: true });
  function release() { mascot.classList.remove('press'); }
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });

  // Pointer off the page or the window lost focus: fade out until it's back
  function leave() { away = true; release(); syncVisible(); }
  document.documentElement.addEventListener('mouseleave', leave);
  window.addEventListener('blur', leave);

  // Fine <-> coarse can flip live (a tablet gaining a mouse): clear what the
  // other mode wrote so CSS placement takes over cleanly.
  function modeChange() {
    mascot.style.transform = '';
    mBody.style.transform = '';
    lastPos = lastBody = '';
    lean = stretch = scrollVel = 0;
    lastScrollY = window.scrollY;
    mascot.classList.remove('expand', 'press', 'quiet');
    measure();
    checkDock();
  }
  if (coarse.addEventListener) coarse.addEventListener('change', modeChange);
  else if (coarse.addListener) coarse.addListener(modeChange);

  window.addEventListener('scroll', checkDock, { passive: true });
  window.addEventListener('resize', function() { measure(); checkDock(); });
  measure();
  checkDock();
  requestAnimationFrame(frame);
}

// Scroll animations
// Exposed as SiteFX.applyReveals(root) so dynamically rendered content (project
// cards, case-study sections) can be wired up the moment it lands in the DOM.
(function(){
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
  },{threshold:0.12});
  var obsCt = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); obsCt.unobserve(e.target); } });
  },{threshold:0.01});

  // [selector, reveal class, per-item stagger in seconds, extra class]
  var GROUPS = [
    ['.skill-card',                   'reveal',       0.07],
    ['.proj-card',                    'reveal-scale', 0.08],
    ['.cert-card',                    'reveal',       0.07],
    ['.exp-row',                      'reveal',       0.1 ],
    ['.sec-tag,.sec-h',               'reveal',       0   ],
    ['.about-in > div',               'reveal',       0.12],
    ['.ct-h,.ct-sub,.ct-btns,.ct-info','reveal',      0.1 , 'ct-reveal'],
    ['.cs-cap',                       'reveal',       0.06],
    ['.cs-challenge',                 'reveal',       0.08],
  ];

  function applyReveals(root){
    var scope = root || document;
    GROUPS.forEach(function(g){
      var sel = g[0], cls = g[1], stagger = g[2], extra = g[3];
      scope.querySelectorAll(sel).forEach(function(el,i){
        if(el.dataset.fx) return; // already wired up by an earlier pass
        el.dataset.fx = '1';
        el.classList.add(cls);
        if(extra) el.classList.add(extra);
        if(stagger) el.style.transitionDelay = (i*stagger)+'s';
        if(el.classList.contains('ct-reveal')) obsCt.observe(el);
        else obs.observe(el);
      });
    });
  }

  window.SiteFX = { applyReveals: applyReveals };
  applyReveals(document);
})();

// Mobile hamburger
(function(){
  var btn = document.getElementById('nav-hamburger');
  var menu = document.getElementById('mobile-menu');
  if(!btn || !menu) return;
  btn.addEventListener('click', function(){
    var open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      menu.classList.remove('open');
      btn.classList.remove('open');
    });
  });
})();

// Email obfuscation (works on any page containing these ids)
(function(){
  var u='hussein.mohamed.software';
  var d='gmail.com';
  var e=u+'@'+d;
  var m='mailto:'+e;
  function openMail(ev){ ev.preventDefault(); window.location.href=m; }
  var btn=document.getElementById('em-link-btn');
  if(btn){ btn.href=m; btn.addEventListener('click', openMail); }
  var ct=document.getElementById('em-link-ct');
  if(ct){ ct.href=m; ct.addEventListener('click', openMail); }
  var ft=document.getElementById('em-link-footer');
  if(ft){ ft.href=m; ft.addEventListener('click', openMail); }
  var disp=document.getElementById('em-display-ct');
  if(disp){ disp.textContent=e; }
  var yr=document.getElementById('copy-year');
  if(yr){ yr.textContent=new Date().getFullYear(); }
})();
