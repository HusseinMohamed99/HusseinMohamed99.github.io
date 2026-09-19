// HSM Software mascot — a companion character that travels with the visitor
// through the portfolio and lands above the Send Message button.
//
// One controller, one rAF loop, one transform. Every frame composes the motion
// target (pointer, scroll waypoint, or dock), the eased position, velocity lean,
// speed scale and idle float into a single transform on #hsm-mascot. The glow
// and trail are children with their own small transforms (lag / streak) so
// nothing ever fights over the character's transform.
//
// Poses are twelve separate PNGs, one <img> each, crossfaded by class. Each pose
// is scaled against the same reference (the idle character's height) and pinned
// at its visor, so switching poses never changes the character's size or makes
// its face jump. The dock target is computed from the pose's feet instead, so
// whatever pose is showing stands on the button.
//
// Motion phases (authoritative):  FREE → APPROACHING → LANDING → DOCKED → TAKEOFF
// Visual states (derived):        hidden, intro, idle, flying-left/right, wave,
//                                 pointing, thinking, excited, love, surprised,
//                                 landing, docked, takeoff
(function () {
  'use strict';

  var root = document.getElementById('hsm-mascot');
  if (!root || !window.requestAnimationFrame || !window.matchMedia) return;

  var ASSETS = root.getAttribute('data-assets') || 'images/mascot/';

  // ---------------------------------------------------------------------------
  // Pose metadata (source pixels). Every PNG shares one drawing scale, so a
  // single k = size / REF_H maps all of them. ax/ay is the visor centre (the
  // point the controller moves), feet is the lowest row of the character, and
  // crop trims sheet artefacts baked into some exports (label pills, slivers of
  // neighbouring poses) — the files themselves are untouched.
  // ---------------------------------------------------------------------------
  var REF_H = 320; // idle character height in source px
  var POSES = {
    idle:        { file: 'hsm-mascot-idle.png',         w: 230, h: 340, ax: 133, ay: 122, feet: 336 },
    flyingRight: { file: 'hsm-mascot-flying-right.png', w: 385, h: 340, ax: 261, ay: 151, feet: 294, crop: [0, 0, 40, 0] },
    flyingLeft:  { file: 'hsm-mascot-flying-left.png',  w: 380, h: 340, ax: 150, ay: 150, feet: 340, crop: [0, 0, 0, 8] },
    landing:     { file: 'hsm-mascot-landing.png',      w: 250, h: 340, ax: 137, ay: 196, feet: 338, crop: [0, 0, 0, 12] },
    docked:      { file: 'hsm-mascot-docked.png',       w: 321, h: 340, ax: 134, ay: 119, feet: 335, crop: [0, 0, 0, 14] },
    wave:        { file: 'hsm-mascot-wave.png',         w: 260, h: 315, ax: 155, ay: 129, feet: 315, crop: [12, 0, 0, 0] },
    pointing:    { file: 'hsm-mascot-pointing.png',     w: 345, h: 315, ax: 160, ay: 127, feet: 315, crop: [4, 0, 0, 0] },
    thinking:    { file: 'hsm-mascot-thinking.png',     w: 270, h: 315, ax: 131, ay: 140, feet: 315 },
    excited:     { file: 'hsm-mascot-excited.png',      w: 330, h: 315, ax: 180, ay: 125, feet: 313, crop: [12, 0, 0, 0] },
    love:        { file: 'hsm-mascot-love.png',         w: 331, h: 315, ax: 183, ay: 128, feet: 315, crop: [12, 0, 0, 0] },
    surprised:   { file: 'hsm-mascot-surprised.png',    w: 305, h: 310, ax: 192, ay: 132, feet: 280, crop: [28, 0, 29, 0] },
    back:        { file: 'hsm-mascot-back.png',         w: 395, h: 310, ax: 196, ay: 157, feet: 282, crop: [28, 0, 28, 0] }
  };
  // The experience starts once these five are decoded; the rest load after.
  var ESSENTIAL = ['idle', 'flyingRight', 'flyingLeft', 'landing', 'docked'];

  // ---------------------------------------------------------------------------
  // Tunables. Speeds are px per 60fps frame; eases are the per-frame fraction.
  // ---------------------------------------------------------------------------
  var FOLLOW_POINTER = 0.17;   // trails the pointer, never lags
  var FOLLOW_TRAVEL = 0.085;   // gentle glide between scroll waypoints
  var FOLLOW_APPROACH = 0.075; // slows down on the way to the button
  var FOLLOW_LAND = 0.11;
  var FOLLOW_DOCK = 0.2;
  var FOLLOW_REDUCED = 0.22;   // short simple transition for reduced motion
  var FLY_ON = 1.1, FLY_OFF = 0.55, SETTLE_MS = 380;   // flying hysteresis
  var DIR_DEAD = 0.45, DIR_MIN_MS = 140;               // no flips on pixel noise
  var LEAN_MAX = 6, LEAN_PER_PX = 0.3, SCALE_MAX = 0.05, SPEED_REF = 26;
  var BOB_AMP = 3, BOB_DOCK_AMP = 1.5, BOB_PERIOD = 2600;
  var DOCK_GAP = 6;            // px between the feet and the button's top edge
  var DOCK_MARGIN = 40;        // button top must be this far above the fold to dock
  var UNDOCK_SLACK = 10;       // ...and this far below it to release (hysteresis)
  var LAND_DIST = 0.9;         // × size: switch to the landing pose this close
  var DOCK_SNAP = 2.5;         // px: close enough to count as landed
  var TAKEOFF_MS = 340, TAKEOFF_LIFT = 0.55;
  var INTRO_MS = 1500, CONTEXT_DELAY = 1200, CONTEXT_MS = 2200;
  var HOVER_DELAY = 260, HOVER_MS = 1800, HOVER_COOLDOWN = 6000;
  var REACT_MS = 2600;
  var NAV_H = 64;
  var TAU = Math.PI * 2;

  // Journey through the real sections. Sides alternate so the character crosses
  // the screen (and therefore turns) between stops; y is a viewport fraction.
  // `pose` is a contextual pose played once, when the visitor settles there;
  // `yNarrow` replaces y when the layout stacks (≤960px).
  // Missing ids are skipped, so the same file serves the sub-pages.
  var PLAN = [
    { id: 'hero-section',   side: 'right', y: 0.27, yNarrow: 0.5, pose: null },
    { id: 'about',          side: 'left',  y: 0.50, pose: 'wave' },
    { id: 'skills',         side: 'right', y: 0.42, pose: 'thinking' },
    { id: 'experience',     side: 'right', y: 0.58, pose: null },
    { id: 'projects',       side: 'left',  y: 0.40, pose: 'pointing' },
    { id: 'certifications', side: 'right', y: 0.46, pose: null },
    { id: 'contact',        side: 'dock',  y: 0.55, pose: null },
    { id: 'all-projects',   side: 'right', y: 0.30, pose: 'pointing' },
    { id: 'project-root',   side: 'right', y: 0.30, pose: null }
  ];
  var CONTENT_W = 1280; // .sec-wrap / #hero max-width: the margins beside it are safe
  var DOCK_SELECTOR = '#ct-form-submit';
  var PROJECT_HOVER = '.proj-card, .proj-x-card';
  var TEXT_FIELDS = 'input, textarea, select, [contenteditable]';

  // ---------------------------------------------------------------------------
  // Layers
  // ---------------------------------------------------------------------------
  var glow = el('div', 'hsm-mascot__glow');
  var glowCore = el('div', 'hsm-mascot__glow-core');
  var ring = el('div', 'hsm-mascot__ring');
  glow.appendChild(glowCore);
  glow.appendChild(ring);
  var trail = el('div', 'hsm-mascot__trail');
  var poseLayer = el('div', 'hsm-mascot__pose');
  root.appendChild(glow);
  root.appendChild(trail);
  root.appendChild(poseLayer);

  var imgs = {}, loaded = {};
  function el(tag, cls) { var n = document.createElement(tag); n.className = cls; return n; }
  function pct(n) { return (n * 100).toFixed(3) + '%'; }
  function addPose(name) {
    // <span> carries size, anchor, crossfade and the accent shadow; the <img>
    // inside carries the clip, so the shadow is cast by the clipped shape and
    // never by the artefacts that were clipped away.
    var p = POSES[name], box = el('span', 'hsm-pose'), img = document.createElement('img');
    img.alt = '';
    img.draggable = false;
    img.decoding = 'async';
    img.width = p.w; img.height = p.h;
    if (p.crop) {
      img.style.clipPath = 'inset(' + pct(p.crop[0] / p.h) + ' ' + pct(p.crop[1] / p.w) + ' ' +
        pct(p.crop[2] / p.h) + ' ' + pct(p.crop[3] / p.w) + ')';
    }
    // Uniform scale: height relative to the box (= --hsm-size = REF_H source px);
    // pinned so the visor sits on the box origin.
    box.style.height = pct(p.h / REF_H);
    box.style.transform = 'translate(' + pct(-p.ax / p.w) + ',' + pct(-p.ay / p.h) + ')';
    img.onload = function () { loaded[name] = true; };
    img.onerror = function () { loaded[name] = false; };
    img.src = ASSETS + p.file;
    box.appendChild(img);
    poseLayer.appendChild(box);
    imgs[name] = box;
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var size = 120, k = size / REF_H;   // rendered idle height, px per source px
  var vw = window.innerWidth, vh = window.innerHeight, maxScroll = 0;
  var waypoints = [];                 // [{key, x, y, pose, id}] sorted by key
  var dock = null;                    // {top, cx} of the Send Message button, document coords

  var phase = 'free';                 // free | approaching | landing | docked | takeoff
  var pose = null;
  var override = null;                // {pose, until, cancelOnMove, sticky}
  var started = false;

  var x = 0, y = 0, tx = 0, ty = 0;   // visor position / target (viewport px)
  var vx = 0, vy = 0, spd = 0;
  var flying = false, dir = 1, dirAt = 0, slowSince = 0, settledAt = 0;
  var lean = 0, scale = 1, glowA = 0, trailA = 0, trailAng = 0, trailLen = 0.5;
  var gx = 0, gy = 0;                 // lagging glow position
  var phaseAt = 0, lastNow = 0;
  var liftX = 0, liftY = 0;           // where the takeoff hop aims

  var pointer = { x: 0, y: 0, active: false };
  var hover = { ctx: null, since: 0, lastPointAt: -1e9 };
  var played = {};                    // contextual poses already shown per section
  var lastTf = '', lastGlowTf = '', lastGlowA = -1, lastTrailTf = '', lastTrailA = -1;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function decay(ease, kf) { return 1 - Math.pow(1 - ease, kf); }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function feetDy(name) { var p = POSES[name] || POSES.idle; return (p.feet - p.ay) * k; }
  function charW(name) { var p = POSES[name] || POSES.idle; return p.w * k; }

  // ---------------------------------------------------------------------------
  // Measurement — cached; refreshed on resize / orientation / layout changes
  // ---------------------------------------------------------------------------
  function edgeX(side) {
    // Prefer the empty margin beside the centred content; on narrow screens hug
    // the edge with a little overhang so the character covers as little as it can.
    var w = charW('idle');
    var margin = Math.max(0, (vw - CONTENT_W) / 2) + (vw > 960 ? 48 : 24);
    var inset = margin >= w * 0.9 ? margin / 2 : w * 0.27;
    return side === 'left' ? inset : vw - inset;
  }

  function measure() {
    size = root.offsetHeight || size;
    k = size / REF_H;
    vw = window.innerWidth; vh = window.innerHeight;
    var sy = window.scrollY;
    var docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    maxScroll = Math.max(0, docH - vh);

    var dockEl = document.querySelector(DOCK_SELECTOR);
    dock = null;
    if (dockEl) {
      var b = dockEl.getBoundingClientRect();
      if (b.width && b.height) dock = { top: b.top + sy, cx: b.left + b.width / 2 };
    }

    var yLo = NAV_H + size * 0.45, yHi = vh - 120 - size * 0.4;
    var list = [], prevKey = -1;
    PLAN.forEach(function (w) {
      var sec = document.getElementById(w.id);
      if (!sec) return;
      var top = sec.getBoundingClientRect().top + sy;
      var key = list.length ? clamp(top - vh * 0.35, 0, maxScroll) : 0;
      if (key <= prevKey) key = prevKey + 1;
      prevKey = key;
      var wx = w.side === 'dock' && dock ? dock.cx : edgeX(w.side === 'dock' ? 'right' : w.side);
      var fy = (vw <= 960 && w.yNarrow) ? w.yNarrow : w.y;
      list.push({ id: w.id, key: key, x: wx, y: clamp(fy * vh, yLo, Math.max(yLo, yHi)), pose: w.pose });
    });
    if (list.length < 2) {
      // Pages without the journey sections still get a start and an end.
      list = [
        { id: 'top', key: 0, x: edgeX('right'), y: clamp(0.3 * vh, yLo, yHi), pose: null },
        { id: 'end', key: Math.max(1, maxScroll), x: edgeX('left'), y: clamp(0.55 * vh, yLo, yHi), pose: null }
      ];
    }
    waypoints = list;
  }

  var measureQueued = false;
  function queueMeasure() {
    if (measureQueued) return;
    measureQueued = true;
    requestAnimationFrame(function () { measureQueued = false; measure(); });
  }

  // ---------------------------------------------------------------------------
  // Targets
  // ---------------------------------------------------------------------------
  function waypointAt(sy, out) {
    var n = waypoints.length, a, b, t;
    if (sy <= waypoints[0].key || n === 1) { a = waypoints[0]; out.x = a.x; out.y = a.y; return; }
    for (var i = 0; i < n - 1; i++) {
      a = waypoints[i]; b = waypoints[i + 1];
      if (sy < b.key) {
        t = smooth((sy - a.key) / (b.key - a.key));
        out.x = a.x + (b.x - a.x) * t;
        out.y = a.y + (b.y - a.y) * t;
        return;
      }
    }
    a = waypoints[n - 1]; out.x = a.x; out.y = a.y;
  }

  function sectionAt(sy) {
    var cur = waypoints[0];
    for (var i = 1; i < waypoints.length; i++) if (sy >= waypoints[i].key - vh * 0.15) cur = waypoints[i];
    return cur;
  }

  // Feet-on-button y for the current pose, in viewport px. null when no button.
  function dockFeetY(sy) { return dock ? dock.top - sy - DOCK_GAP : null; }

  var wp = { x: 0, y: 0 };
  function pickTarget(sy, still) {
    var feet = dockFeetY(sy);
    if (phase === 'approaching' || phase === 'landing' || phase === 'docked') {
      tx = dock.cx; ty = feet - feetDy(pose || 'docked');
      return;
    }
    if (phase === 'takeoff') { tx = liftX; ty = liftY; return; }
    if (fine.matches && pointer.active && !still) {
      tx = clamp(pointer.x + size * 0.42, size * 0.3, vw - size * 0.3);
      ty = clamp(pointer.y + size * 0.36, size * 0.45, vh - size * 0.35);
      return;
    }
    if (still) { var s = sectionAt(sy); tx = s.x; ty = s.y; return; }
    waypointAt(sy, wp); tx = wp.x; ty = wp.y;
  }

  // ---------------------------------------------------------------------------
  // Phase / pose control
  // ---------------------------------------------------------------------------
  function setPhase(p, now) {
    if (phase === p) return;
    phase = p; phaseAt = now;
    if (override && !override.sticky) override = null;
    root.setAttribute('data-phase', p);
    if (p === 'docked') pulse();
    if (p === 'takeoff') { liftX = x; liftY = y - size * TAKEOFF_LIFT; }
    if (p === 'approaching') {
      if (Math.abs(dock.cx - x) > 4) { dir = dock.cx > x ? 1 : -1; dirAt = now; }
      play('excited', 650, false, false, now);
    }
  }

  function play(name, ms, cancelOnMove, sticky, now) {
    if (!loaded[name]) return false;
    override = { pose: name, until: now + ms, cancelOnMove: cancelOnMove, sticky: sticky };
    return true;
  }

  function setPose(name, now) {
    if (name === pose || !imgs[name]) return;
    if (!loaded[name]) name = loaded[pose] ? pose : 'idle';
    if (name === pose) return;
    if (pose) imgs[pose].classList.remove('is-active');
    imgs[name].classList.add('is-active');
    pose = name;
    root.setAttribute('data-pose', name);
  }

  function pulse() {
    ring.classList.remove('is-pulsing');
    void ring.offsetWidth;
    ring.classList.add('is-pulsing');
  }

  function stateName() {
    if (!started) return 'hidden';
    if (override) {
      if (override.pose === 'wave' && override.intro) return 'intro';
      return override.pose;
    }
    if (phase === 'free' || phase === 'approaching') {
      return flying || phase === 'approaching' ? (dir > 0 ? 'flying-right' : 'flying-left') : 'idle';
    }
    return phase;
  }

  // ---------------------------------------------------------------------------
  // The loop
  // ---------------------------------------------------------------------------
  function frame(now) {
    requestAnimationFrame(frame);
    if (!started) return;
    var dt = lastNow ? Math.min(now - lastNow, 64) : 16.7;
    lastNow = now;
    var kf = dt / 16.7;
    var still = reduce.matches;
    var sy = window.scrollY;

    // --- docking decision (Contact overrides everything) ---------------------
    var feet = dockFeetY(sy);
    if (feet !== null) {
      var canDock = feet <= vh - DOCK_MARGIN && feet - feetDy('docked') >= NAV_H * 0.5;
      var release = feet > vh + UNDOCK_SLACK || feet - feetDy('docked') < 0;
      if (canDock && phase === 'free') setPhase('approaching', now);
      else if (canDock && phase === 'takeoff' && now - phaseAt > TAKEOFF_MS) setPhase('approaching', now);
      else if (release && (phase === 'approaching' || phase === 'landing' || phase === 'docked')) {
        if (phase === 'docked' && !still) { setPhase('takeoff', now); }
        else setPhase('free', now);
      }
    } else if (phase !== 'free') setPhase('free', now);
    if (phase === 'takeoff' && now - phaseAt > TAKEOFF_MS) setPhase('free', now);

    // --- target + ease -------------------------------------------------------
    pickTarget(sy, still);
    var ease = still ? FOLLOW_REDUCED
      : phase === 'approaching' ? FOLLOW_APPROACH
      : phase === 'landing' ? FOLLOW_LAND
      : phase === 'docked' ? FOLLOW_DOCK
      : phase === 'takeoff' ? 0.12
      : (fine.matches && pointer.active) ? FOLLOW_POINTER : FOLLOW_TRAVEL;
    var e = decay(ease, kf);
    var px = x, py = y;
    x += (tx - x) * e;
    y += (ty - y) * e;
    vx = (x - px) / kf; vy = (y - py) / kf;
    var v = Math.sqrt(vx * vx + vy * vy);
    spd += (v - spd) * decay(0.3, kf);
    var dist = Math.sqrt((tx - x) * (tx - x) + (ty - y) * (ty - y));

    // --- landing progression -------------------------------------------------
    if (phase === 'approaching' && dist < size * LAND_DIST) setPhase('landing', now);
    if (phase === 'landing' && (dist < DOCK_SNAP || now - phaseAt > 1400)) setPhase('docked', now);

    // --- flying / direction (hysteresis + dead zone) ------------------------
    var moving = spd > FLY_ON && !still;
    if (Math.abs(vx) > DIR_DEAD && now - dirAt > DIR_MIN_MS) {
      var nd = vx > 0 ? 1 : -1;
      if (nd !== dir) { dir = nd; dirAt = now; }
    }
    if (phase === 'free' || phase === 'approaching') {
      if (moving) { flying = true; slowSince = 0; }
      else if (flying && spd < FLY_OFF) {
        if (!slowSince) slowSince = now;
        else if (now - slowSince > SETTLE_MS) { flying = false; slowSince = 0; settledAt = now; }
      } else slowSince = 0;
      if (phase === 'approaching' && !still) flying = true;
    } else flying = false;

    // --- overrides: expiry, cancellation, contextual triggers ----------------
    if (override) {
      if (now > override.until || (override.cancelOnMove && moving)) override = null;
    }
    if (!override && phase === 'free' && !flying && now - settledAt > CONTEXT_DELAY) {
      var sec = sectionAt(sy);
      if (fine.matches && hover.ctx === 'project' && now - hover.since > HOVER_DELAY &&
          now - hover.lastPointAt > HOVER_COOLDOWN) {
        if (play('pointing', HOVER_MS, true, false, now)) hover.lastPointAt = now;
      } else if (sec.pose && !played[sec.id]) {
        played[sec.id] = true;
        play(sec.pose, CONTEXT_MS, true, false, now);
      }
    }

    // --- derive the pose -----------------------------------------------------
    var want;
    if (override) want = override.pose;
    else if (phase === 'docked') want = 'docked';
    else if (phase === 'landing') want = 'landing';
    else if (phase === 'takeoff') want = 'back';
    else if (flying) want = dir > 0 ? 'flyingRight' : 'flyingLeft';
    else want = 'idle';
    setPose(want, now);

    // --- effects: lean, scale, float, glow, trail ----------------------------
    var speedN = clamp(spd / SPEED_REF, 0, 1);
    var grounded = phase === 'docked' || phase === 'landing';
    var leanT = (still || grounded) ? 0 : clamp(vx * LEAN_PER_PX, -LEAN_MAX, LEAN_MAX);
    lean += (leanT - lean) * decay(0.14, kf);
    var scaleT = still ? 1 : 1 + speedN * SCALE_MAX * (grounded ? 0 : 1);
    scale += (scaleT - scale) * decay(0.14, kf);
    var bob = 0;
    if (!still) {
      if (phase === 'docked') bob = Math.sin(now / BOB_PERIOD * TAU) * BOB_DOCK_AMP;
      else if (!flying && phase === 'free') bob = Math.sin(now / BOB_PERIOD * TAU) * BOB_AMP;
    }
    var glowT = phase === 'docked' ? 1 : phase === 'landing' ? 0.9 : flying ? 0.6 + speedN * 0.4 : 0.5;
    glowA += (glowT - glowA) * decay(0.1, kf);
    var trailT = (still || !(flying || phase === 'takeoff')) ? 0 : clamp(spd / 16, 0, 1) * 0.95;
    trailA += (trailT - trailA) * decay(trailT > trailA ? 0.2 : 0.09, kf);
    if (v > 0.8) {
      var ang = Math.atan2(vy, vx) * 180 / Math.PI;
      var d = ((ang - trailAng + 540) % 360) - 180;
      trailAng += d * decay(0.25, kf);
    }
    trailLen += (0.45 + speedN * 0.95 - trailLen) * decay(0.15, kf);
    gx += (x - gx) * decay(0.5, kf);
    gy += (y - gy) * decay(0.5, kf);

    // --- write: one transform for the character, small ones for the layers ---
    var tf = 'translate3d(' + x.toFixed(1) + 'px,' + (y + bob).toFixed(1) + 'px,0) rotate(' +
      lean.toFixed(2) + 'deg) scale(' + scale.toFixed(3) + ')';
    if (tf !== lastTf) { root.style.transform = tf; lastTf = tf; }
    var gtf = 'translate3d(' + (gx - x).toFixed(1) + 'px,' + (gy - y).toFixed(1) + 'px,0)';
    if (gtf !== lastGlowTf) { glow.style.transform = gtf; lastGlowTf = gtf; }
    var ga = Math.round(glowA * 100) / 100;
    if (ga !== lastGlowA) { glow.style.opacity = ga; lastGlowA = ga; }
    var ta = Math.round(trailA * 100) / 100;
    if (ta !== lastTrailA) { trail.style.opacity = ta; lastTrailA = ta; }
    if (ta > 0) {
      var ttf = 'rotate(' + trailAng.toFixed(1) + 'deg) scaleX(' + trailLen.toFixed(3) + ')';
      if (ttf !== lastTrailTf) { trail.style.transform = ttf; lastTrailTf = ttf; }
    }
    var st = stateName();
    if (st !== root.getAttribute('data-state')) root.setAttribute('data-state', st);
  }

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.active = true;
  }, { passive: true });
  function pointerGone() { pointer.active = false; }
  document.documentElement.addEventListener('mouseleave', pointerGone);
  window.addEventListener('blur', pointerGone);

  // Hover context (desktop): project cards invite a point; text fields make the
  // character step back so it never covers what's being typed.
  document.addEventListener('pointerover', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var ctx = t.closest(PROJECT_HOVER) ? 'project' : t.closest(TEXT_FIELDS) ? 'text' : null;
    if (ctx !== hover.ctx) { hover.ctx = ctx; hover.since = performance.now(); }
    if (fine.matches) root.classList.toggle('is-quiet', ctx === 'text' || focusedField);
  }, { passive: true });
  var focusedField = false;
  document.addEventListener('focusin', function (e) {
    focusedField = !!(e.target && e.target.closest && e.target.closest(TEXT_FIELDS));
    root.classList.toggle('is-quiet', focusedField);
  });
  document.addEventListener('focusout', function () {
    focusedField = false;
    root.classList.toggle('is-quiet', hover.ctx === 'text' && fine.matches);
  });

  // Real form outcome only: the contact script marks #ct-form-status ok / err.
  var status = document.getElementById('ct-form-status');
  if (status && window.MutationObserver) {
    new MutationObserver(function () {
      var now = performance.now();
      if (status.classList.contains('ok')) play('love', REACT_MS, false, true, now);
      else if (status.classList.contains('err')) play('surprised', REACT_MS, false, true, now);
    }).observe(status, { attributes: true, attributeFilter: ['class'] });
  }

  window.addEventListener('resize', queueMeasure);
  window.addEventListener('orientationchange', queueMeasure);
  window.addEventListener('load', queueMeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueMeasure);
  if (window.ResizeObserver) {
    // Project cards render from data/projects/*.md after load; the document
    // height changes and so do the waypoints and the button's position.
    new ResizeObserver(queueMeasure).observe(document.body);
  }
  function onModeChange() { pointer.active = false; queueMeasure(); }
  if (fine.addEventListener) fine.addEventListener('change', onModeChange);
  else if (fine.addListener) fine.addListener(onModeChange);

  // ---------------------------------------------------------------------------
  // Boot: preload, place at the current section, wave once, go.
  // ---------------------------------------------------------------------------
  Object.keys(POSES).forEach(addPose);

  function essentialsReady() {
    for (var i = 0; i < ESSENTIAL.length; i++) if (!loaded[ESSENTIAL[i]]) return false;
    return true;
  }
  function start() {
    if (started) return;
    started = true;
    measure();
    var sy = window.scrollY, now = performance.now();
    var s = sectionAt(sy);
    x = tx = gx = s.x; y = ty = gy = s.y;
    var feet = dockFeetY(sy);
    if (feet !== null && feet <= vh - DOCK_MARGIN) {
      // Loaded straight onto Contact (hash / restored scroll): already home.
      phase = 'docked'; phaseAt = now;
      root.setAttribute('data-phase', phase);
      x = tx = gx = dock.cx; y = ty = gy = feet - feetDy('docked');
      setPose('docked', now);
    } else {
      setPose('idle', now);
      settledAt = now;
      if (play('wave', INTRO_MS, true, false, now)) override.intro = true;
    }
    root.setAttribute('data-phase', phase);
    requestAnimationFrame(function () { root.classList.add('is-ready'); });
  }
  var waited = 0;
  (function poll() {
    if (essentialsReady() || (loaded.idle && waited > 3000)) return start();
    if (loaded.idle === false) return; // asset missing: stay hidden, never error
    waited += 100;
    setTimeout(poll, 100);
  })();
  requestAnimationFrame(frame);

  // Debug handle (read-only) — handy in devtools, harmless otherwise.
  window.HSMMascot = {
    state: function () { return { phase: phase, pose: pose, state: stateName(), x: x, y: y, flying: flying, size: size }; }
  };
})();
