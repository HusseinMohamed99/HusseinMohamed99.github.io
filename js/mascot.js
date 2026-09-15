// H.Solutions hero mascot — pointer tracking, scroll inertia and an idle bob,
// composed into one transform per layer and written from a single rAF loop.
//
// Layers are discovered by [data-mascot-depth]: the attribute is the fraction of
// the full motion that layer receives, so the glow trailing the figure today and
// an independently-moving head/arm set tomorrow are the same mechanism.
(function () {
  'use strict';

  var root = document.getElementById('hs-mascot');
  if (!root) return;

  var stage = root.querySelector('.hs-stage');
  if (!stage) return;

  var layers = Array.prototype.map.call(
    stage.querySelectorAll('[data-mascot-depth]'),
    function (el) {
      return { el: el, depth: parseFloat(el.getAttribute('data-mascot-depth')) || 1, last: '' };
    }
  );
  if (!layers.length) return;

  // Travel budgets at full deflection. Tuned to read as a lean, not a slide.
  var T = {
    x: 26,            // px of horizontal follow
    y: 15,            // px of vertical follow
    ry: 9,            // deg of yaw
    rx: 6,            // deg of pitch
    scrollY: 17,      // px the figure lags behind the page at peak velocity
    scrollRx: 5,      // deg it leans while scrolling
    idleY: 4.5,       // px of idle float
    idlePeriod: 4200, // ms per idle cycle
    driftPeriod: 9000,// ms per slow yaw drift cycle
    vMax: 34,         // px/frame that counts as a fast flick
    pointerEase: 0.075,
    scrollEase: 0.09,
    strengthEase: 0.07,
    touchStrength: 0.3
  };

  var TAU = Math.PI * 2;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Pointer target (-1..1 around the viewport centre) and its smoothed value
  var px = 0, py = 0, cx = 0, cy = 0;
  // How much of the pointer budget to spend: 0 once the cursor leaves the page
  var strengthTarget = 0, strength = 0;
  var scrollVel = 0;
  var lastScrollY = window.scrollY;
  var lastFrame = 0;
  var raf = 0;
  var onScreen = false;

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  // Frame-rate independent lerp factor: `ease` is the per-60fps-frame amount.
  function decay(ease, k) {
    return 1 - Math.pow(1 - ease, k);
  }

  function setPointer(clientX, clientY, target) {
    px = clamp((clientX / window.innerWidth) * 2 - 1, -1, 1);
    py = clamp((clientY / window.innerHeight) * 2 - 1, -1, 1);
    strengthTarget = target;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);

    var dt = lastFrame ? Math.min(now - lastFrame, 64) : 16.7;
    lastFrame = now;
    var k = dt / 16.7;

    // Scroll velocity is sampled here rather than in a scroll handler: one read
    // per frame, already normalised to a 60fps frame so a 120Hz display and a
    // throttled one reach the same amplitude.
    var y = window.scrollY;
    var rawVel = clamp((y - lastScrollY) / k, -T.vMax, T.vMax) / T.vMax;
    lastScrollY = y;

    scrollVel += (rawVel - scrollVel) * decay(T.scrollEase, k);
    strength += (strengthTarget - strength) * decay(T.strengthEase, k);
    cx += (px - cx) * decay(T.pointerEase, k);
    cy += (py - cy) * decay(T.pointerEase, k);

    var idleY = Math.sin((now / T.idlePeriod) * TAU) * T.idleY;
    var driftRy = Math.sin((now / T.driftPeriod) * TAU) * 0.5;

    var tx = cx * T.x * strength;
    var ty = cy * T.y * strength + scrollVel * T.scrollY + idleY;
    var ry = cx * T.ry * strength + driftRy;
    var rx = -cy * T.rx * strength - scrollVel * T.scrollRx;

    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      var d = l.depth;
      var t =
        'translate3d(' + (tx * d).toFixed(2) + 'px,' + (ty * d).toFixed(2) + 'px,0) ' +
        'rotateX(' + (rx * d).toFixed(2) + 'deg) rotateY(' + (ry * d).toFixed(2) + 'deg)';
      if (t !== l.last) {
        l.el.style.transform = t;
        l.last = t;
      }
    }
  }

  function start() {
    if (raf || reduceMotion.matches) return;
    // Stale between stops, and a stale value reads as one huge velocity spike.
    lastScrollY = window.scrollY;
    lastFrame = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function reset() {
    px = py = cx = cy = scrollVel = strength = strengthTarget = 0;
    for (var i = 0; i < layers.length; i++) {
      layers[i].el.style.transform = '';
      layers[i].last = '';
    }
  }

  function sync() {
    if (reduceMotion.matches) {
      stop();
      reset();
    } else if (onScreen) {
      start();
    }
  }

  // Only animate while the mascot is actually on screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start();
      else stop();
    }, { rootMargin: '120px' }).observe(root);
  } else {
    onScreen = true;
    start();
  }

  if (finePointer.matches) {
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      setPointer(e.clientX, e.clientY, 1);
    }, { passive: true });

    // Cursor off the page, or the window lost focus: ease back to neutral.
    document.documentElement.addEventListener('mouseleave', function () {
      strengthTarget = 0;
    });
    window.addEventListener('blur', function () {
      strengthTarget = 0;
    });
  } else {
    // Touch devices lean on scroll; this only adds a whisper of pointer follow
    // and never calls preventDefault, so the gesture stays the page's.
    var hero = document.getElementById('hero-section') || root;
    hero.addEventListener('touchmove', function (e) {
      var t = e.touches && e.touches[0];
      if (t) setPointer(t.clientX, t.clientY, T.touchStrength);
    }, { passive: true });
    hero.addEventListener('touchend', function () {
      strengthTarget = 0;
    }, { passive: true });
  }

  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', sync);
  else if (reduceMotion.addListener) reduceMotion.addListener(sync);

  sync();
})();
