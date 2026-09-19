// HSM Software mascot — the character that travels with the visitor.
//
// Desktop (fine pointer): it IS the visual cursor. The pointer drives a target,
// the body glides to it, and dedicated flying-left / flying-right art plays
// while it moves. The native cursor is hidden and a small accent hotspot marks
// the real click point (restored over text fields and embeds).
// Touch (coarse pointer): scrolling drives a journey through responsive
// waypoints beside the real sections.
// Both: when the Send Message button scrolls into view the mascot stops
// following, approaches, lands and docks on it; scrolling away takes off.
//
// One controller, one rAF loop, one transform. Each frame composes the active
// target (pointer | waypoint | dock | takeoff hop), eased position, velocity
// lean, speed scale and idle float into one translate3d on #hsm-mascot. Glow
// and trail are children with their own small transforms; the hotspot is a
// sibling so it never inherits the character's lag.
//
// Poses are twelve separate images (no sprite sheet), one <img> each,
// crossfaded by class. POSES normalises them: `unit` is the source-pixel length
// that maps to --hsm-size, so every pose renders the character at the same
// perceived size, and (ax, ay) is the same landmark — the chest — in every
// image, so a pose switch never makes the character jump.
//
// Phases:  free → approaching → landing → docked → takeoff → free
// Poses:   idle, flyingRight, flyingLeft, landing, docked, wave, pointing,
//          thinking, idea, surprised, excited, coding
(function () {
  'use strict';

  var root = document.getElementById('hsm-mascot');
  if (!root || !window.requestAnimationFrame || !window.matchMedia) return;

  var ASSETS = root.getAttribute('data-assets') || 'images/mascot/';

  // ---------------------------------------------------------------------------
  // Pose metadata, in the ORIGINAL artwork's pixels (the shipped WebPs are
  // proportional downscales, so only ratios are used).
  //   w, h   canvas size            unit  source px that render as --hsm-size
  //   ax, ay chest (the anchor)     feet  lowest row of the character
  // HOT is the pointer → chest offset (× size) in desktop cursor mode.
  // ---------------------------------------------------------------------------
  var POSES = {
    idle:        { file: 'hsm-mascot-idle.webp',         w: 1160, h: 1355, unit: 1301, ax: 615, ay: 860, feet: 1342 },
    flyingRight: { file: 'hsm-mascot-flying-right.webp', w: 1536, h: 1024, unit: 1230, ax: 820, ay: 600, feet: 968 },
    flyingLeft:  { file: 'hsm-mascot-flying-left.webp',  w: 1536, h: 1024, unit: 1230, ax: 716, ay: 600, feet: 974 },
    landing:     { file: 'hsm-mascot-landing.webp',      w: 1374, h: 1145, unit: 1230, ax: 820, ay: 730, feet: 1080 },
    docked:      { file: 'hsm-mascot-docked.webp',       w: 1254, h: 1254, unit: 1260, ax: 672, ay: 780, feet: 1215 },
    wave:        { file: 'hsm-mascot-wave.webp',         w: 1145, h: 1374, unit: 1318, ax: 640, ay: 860, feet: 1317 },
    pointing:    { file: 'hsm-mascot-pointing.webp',     w: 1145, h: 1374, unit: 1272, ax: 552, ay: 860, feet: 1301 },
    thinking:    { file: 'hsm-mascot-thinking.webp',     w: 1145, h: 1374, unit: 1343, ax: 562, ay: 870, feet: 1324 },
    idea:        { file: 'hsm-mascot-idea.webp',         w: 1145, h: 1374, unit: 1326, ax: 560, ay: 880, feet: 1315 },
    surprised:   { file: 'hsm-mascot-surprised.webp',    w: 1145, h: 1374, unit: 1318, ax: 571, ay: 855, feet: 1308 },
    excited:     { file: 'hsm-mascot-excited.webp',      w: 1145, h: 1374, unit: 1233, ax: 598, ay: 845, feet: 1311 },
    coding:      { file: 'hsm-mascot-coding.webp',       w: 1145, h: 1374, unit: 1276, ax: 600, ay: 845, feet: 1297 }
  };
  // The experience starts once these five are decoded; the rest load after.
  var ESSENTIAL = ['idle', 'flyingRight', 'flyingLeft', 'landing', 'docked'];
  var HOT = { x: 0.30, y: 0.36 }; // chest sits below-right of the pointer, like an arrow tip

  // ---------------------------------------------------------------------------
  // Tunables. Speeds are px per 60fps frame; eases are the per-frame fraction.
  // ---------------------------------------------------------------------------
  var FOLLOW_POINTER = 0.26;   // tight: it must still read as the cursor
  var FOLLOW_TRAVEL = 0.085;   // gentle glide between scroll waypoints
  var FOLLOW_APPROACH = 0.075; // slows down on the way to the button
  var FOLLOW_LAND = 0.11;
  var FOLLOW_DOCK = 0.2;
  var FOLLOW_TAKEOFF = 0.12;
  var FOLLOW_REDUCED = 0.22;   // short simple transition for reduced motion
  var FLY_ON = 1.2, FLY_OFF = 0.5, SETTLE_MS = 420;   // flying hysteresis + stop delay
  var DIR_DEAD = 0.5, DIR_MIN_MS = 160;                // no flips on pixel noise
  var LEAN_MAX = 5, LEAN_PER_PX = 0.22, SCALE_MAX = 0.06, SPEED_REF = 30;
  var BOB_AMP = 3, BOB_DOCK_AMP = 1.2, BOB_PERIOD = 2600;
  var DOCK_GAP = 4;            // px between the feet and the button's top edge
  var DOCK_MARGIN = 40;        // button top must be this far above the fold to dock
  var UNDOCK_SLACK = 10;       // ...and this far below it to release (hysteresis)
  var LAND_DIST = 0.9;         // × size: switch to the landing pose this close
  var DOCK_SNAP = 2.5;         // px: close enough to count as landed
  var TAKEOFF_MS = 340, TAKEOFF_LIFT = 0.55;
  var INTRO_MS = 1600, CONTEXT_DELAY = 900, CONTEXT_MS = 2200;
  var HOVER_DELAY = 260, HOVER_MS = 1800, HOVER_COOLDOWN = 6000, IDEA_COOLDOWN = 12000;
  var REACT_MS = 2600;
  var NAV_H = 64;
  var TAU = Math.PI * 2;

  // Journey through the real sections (missing ids are skipped, so the same
  // file serves the sub-pages). Sides alternate so the character crosses the
  // screen — and turns — between stops; y is a viewport fraction (yNarrow when
  // the layout stacks, ≤960px). `pose` plays once, when the visitor settles.
  var PLAN = [
    { id: 'hero-section',   side: 'right', y: 0.30, yNarrow: 0.56, pose: null },
    { id: 'about',          side: 'left',  y: 0.50, pose: 'thinking' },
    { id: 'skills',         side: 'right', y: 0.42, pose: 'idea' },
    { id: 'experience',     side: 'left',  y: 0.58, pose: 'coding' },
    { id: 'projects',       side: 'right', y: 0.40, pose: 'pointing' },
    { id: 'certifications', side: 'left',  y: 0.46, pose: 'thinking' },
    { id: 'contact',        side: 'dock',  y: 0.55, pose: null },
    { id: 'all-projects',   side: 'right', y: 0.30, pose: 'coding' },
    { id: 'project-root',   side: 'right', y: 0.30, pose: 'pointing' }
  ];
  var CONTENT_W = 1280; // .sec-wrap / #hero max-width: the margins beside it are safe
  var DOCK_SELECTOR = '#ct-form-submit';
  var HOVER_CTX = [
    ['project', '.proj-card, .proj-x-card'],
    ['code',    'a[href*="github.com"], .pl-store, .cs-walk-tab'],
    ['skill',   '.skill-card'],
    ['text',    'input, textarea, select, [contenteditable]']
  ];
  var TEXT_FIELDS = HOVER_CTX[3][1];
  var INTERACTIVE = 'a, button, [role="button"], label, summary, .sp-color, .sp-toggle';
  // Where styles.css hands the native cursor back; the hotspot hides there.
  var NATIVE_CURSOR = TEXT_FIELDS + ', iframe, embed, object, video, .cs-lightbox';

  // ---------------------------------------------------------------------------
  // Layers
  // ---------------------------------------------------------------------------
  function el(tag, cls) { var n = document.createElement(tag); n.className = cls; return n; }
  function pct(n) { return (n * 100).toFixed(3) + '%'; }

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
  var hot = el('div', 'hsm-hotspot');
  hot.setAttribute('aria-hidden', 'true');
  root.parentNode.insertBefore(hot, root.nextSibling);

  var imgs = {}, loaded = {};
  function addPose(name) {
    // <span> carries size, anchor, crossfade and the accent shadow; the <img>
    // inside just draws the artwork at 100% of that height.
    var p = POSES[name], box = el('span', 'hsm-pose'), img = document.createElement('img');
    img.alt = '';
    img.draggable = false;
    img.decoding = 'async';
    img.width = p.w; img.height = p.h;
    box.style.height = pct(p.h / p.unit);
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

  var size = 120;                     // --hsm-size in px (rendered idle height)
  var vw = window.innerWidth, vh = window.innerHeight, maxScroll = 0;
  var waypoints = [];                 // [{id, key, x, y, pose}] sorted by key
  var dock = null;                    // {top, cx} of the Send Message button, document coords

  var phase = 'free';                 // free | approaching | landing | docked | takeoff
  var pose = null;
  var override = null;                // {pose, until, cancelOnMove, sticky, intro}
  var started = false;

  var x = 0, y = 0, tx = 0, ty = 0;   // chest position / target (viewport px)
  var vx = 0, vy = 0, spd = 0;
  var flying = false, dir = 1, dirAt = 0, slowSince = 0, settledAt = 0;
  var lean = 0, scale = 1, glowA = 0, trailA = 0, trailAng = 0, trailLen = 0.5;
  var gx = 0, gy = 0;                 // lagging glow position
  var phaseAt = 0, lastNow = 0;
  var liftX = 0, liftY = 0;           // where the takeoff hop aims

  var pointer = { x: 0, y: 0, active: false, over: false };
  var hover = { ctx: null, since: 0, lastPointAt: -1e9, lastIdeaAt: -1e9, lastCodeAt: -1e9 };
  var focusedField = false;
  var played = {};                    // contextual poses already shown per section
  var lastTf = '', lastGlowTf = '', lastGlowA = -1, lastTrailTf = '', lastTrailA = -1;
  var lastHotTf = '', cursorMode = false;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function decay(ease, kf) { return 1 - Math.pow(1 - ease, kf); }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function kOf(name) { var p = POSES[name] || POSES.idle; return size / p.unit; }
  function feetDy(name) { var p = POSES[name] || POSES.idle; return (p.feet - p.ay) * kOf(name); }
  function charW(name) { var p = POSES[name] || POSES.idle; return p.w * kOf(name); }
  function cursorFollow() { return fine.matches && pointer.active && !reduce.matches; }

  // ---------------------------------------------------------------------------
  // Measurement — cached; refreshed on resize / orientation / layout changes
  // ---------------------------------------------------------------------------
  function edgeX(side) {
    // Prefer the empty margin beside the centred content. On narrow screens
    // keep the whole character on screen, hugging the edge, so it overlaps as
    // little of the (full-width) content as it can while staying visible.
    var w = charW('idle');
    var margin = Math.max(0, (vw - CONTENT_W) / 2) + (vw > 960 ? 48 : 16);
    var inset = margin >= w * 1.1 ? margin / 2 : w * 0.5 + 4;
    return side === 'left' ? inset : vw - inset;
  }

  function measure() {
    size = root.offsetHeight || size;
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

    var yLo = NAV_H + size * 0.5, yHi = vh - 110 - size * 0.45;
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

  function pointerTarget(out) {
    out.x = clamp(pointer.x + size * HOT.x, size * 0.34, vw - size * 0.34);
    out.y = clamp(pointer.y + size * HOT.y, size * 0.42, vh - size * 0.38);
  }

  var wp = { x: 0, y: 0 };
  function freeTarget(sy, out) {
    if (cursorFollow()) return pointerTarget(out);
    if (reduce.matches) { var s = sectionAt(sy); out.x = s.x; out.y = s.y; return; }
    waypointAt(sy, out);
  }

  function pickTarget(sy) {
    if (phase === 'approaching' || phase === 'landing' || phase === 'docked') {
      tx = dock.cx; ty = dockFeetY(sy) - feetDy(pose || 'docked');
      return;
    }
    if (phase === 'takeoff') { tx = liftX; ty = liftY; return; }
    freeTarget(sy, wp); tx = wp.x; ty = wp.y;
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
    if (p === 'takeoff') {
      // Hop up, already facing wherever the journey continues.
      liftX = x; liftY = y - size * TAKEOFF_LIFT;
      freeTarget(window.scrollY, wp);
      if (Math.abs(wp.x - x) > 4) { dir = wp.x > x ? 1 : -1; dirAt = now; }
    }
    if (p === 'approaching') {
      if (Math.abs(dock.cx - x) > 4) { dir = dock.cx > x ? 1 : -1; dirAt = now; }
    }
  }

  function play(name, ms, cancelOnMove, sticky, now) {
    if (!loaded[name]) return false;
    override = { pose: name, until: now + ms, cancelOnMove: cancelOnMove, sticky: sticky };
    return true;
  }

  function setPose(name) {
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
    if (override) return override.intro ? 'intro' : override.pose;
    if (phase === 'free' || phase === 'approaching' || phase === 'takeoff') {
      return flying ? (dir > 0 ? 'flying-right' : 'flying-left') : 'idle';
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
        if (phase === 'docked' && !still) setPhase('takeoff', now);
        else setPhase('free', now);
      }
    } else if (phase !== 'free') setPhase('free', now);
    if (phase === 'takeoff' && now - phaseAt > TAKEOFF_MS) setPhase('free', now);

    // --- target + ease -------------------------------------------------------
    pickTarget(sy);
    var ease = still ? FOLLOW_REDUCED
      : phase === 'approaching' ? FOLLOW_APPROACH
      : phase === 'landing' ? FOLLOW_LAND
      : phase === 'docked' ? FOLLOW_DOCK
      : phase === 'takeoff' ? FOLLOW_TAKEOFF
      : cursorFollow() ? FOLLOW_POINTER : FOLLOW_TRAVEL;
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

    // --- flying / direction (hysteresis + dead zone + persistence) ----------
    var moving = spd > FLY_ON && !still;
    if (Math.abs(vx) > DIR_DEAD && now - dirAt > DIR_MIN_MS) {
      var nd = vx > 0 ? 1 : -1;
      if (nd !== dir) { dir = nd; dirAt = now; }
    }
    if (phase === 'free' || phase === 'approaching' || phase === 'takeoff') {
      if (moving) { flying = true; slowSince = 0; }
      else if (flying && spd < FLY_OFF) {
        if (!slowSince) slowSince = now;
        else if (now - slowSince > SETTLE_MS) { flying = false; slowSince = 0; settledAt = now; }
      } else slowSince = 0;
      if ((phase === 'approaching' || phase === 'takeoff') && !still) flying = true;
    } else flying = false;

    // --- overrides: expiry, cancellation, contextual triggers ----------------
    if (override) {
      if (now > override.until || (override.cancelOnMove && moving)) override = null;
    }
    if (!override && phase === 'free' && !flying && now - settledAt > CONTEXT_DELAY) {
      var sec = sectionAt(sy);
      var hovered = fine.matches && now - hover.since > HOVER_DELAY;
      if (hovered && hover.ctx === 'project' && now - hover.lastPointAt > HOVER_COOLDOWN) {
        if (play('pointing', HOVER_MS, true, false, now)) hover.lastPointAt = now;
      } else if (hovered && hover.ctx === 'code' && now - hover.lastCodeAt > HOVER_COOLDOWN) {
        if (play('coding', HOVER_MS, true, false, now)) hover.lastCodeAt = now;
      } else if (hovered && hover.ctx === 'skill' && now - hover.lastIdeaAt > IDEA_COOLDOWN) {
        if (play('idea', HOVER_MS, true, false, now)) hover.lastIdeaAt = now;
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
    else if (flying) want = dir > 0 ? 'flyingRight' : 'flyingLeft';
    else want = 'idle';
    setPose(want);

    // --- effects: lean, scale, float, glow, trail ----------------------------
    var speedN = clamp(spd / SPEED_REF, 0, 1);
    var grounded = phase === 'docked' || phase === 'landing';
    var leanT = (still || grounded || !flying) ? 0 : clamp(vx * LEAN_PER_PX, -LEAN_MAX, LEAN_MAX);
    lean += (leanT - lean) * decay(0.14, kf);
    var scaleT = (still || grounded) ? 1 : 1 + speedN * SCALE_MAX;
    scale += (scaleT - scale) * decay(0.14, kf);
    var bob = 0;
    if (!still) {
      if (phase === 'docked') bob = Math.sin(now / BOB_PERIOD * TAU) * BOB_DOCK_AMP;
      else if (!flying && phase === 'free') bob = Math.sin(now / BOB_PERIOD * TAU) * BOB_AMP;
    }
    var glowT = phase === 'docked' ? 1 : phase === 'landing' ? 0.9 : flying ? 0.6 + speedN * 0.4 : 0.5;
    glowA += (glowT - glowA) * decay(0.1, kf);
    var trailOn = !still && !override && (flying || phase === 'takeoff') && !grounded;
    var trailT = trailOn ? clamp(spd / 16, 0, 1) * 0.95 : 0;
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

    // --- cursor mode: hide the native cursor only while the mascot is the
    // cursor (free phase, fine pointer, inside the window, motion allowed) ---
    var cm = cursorFollow() && pointer.over && phase === 'free';
    if (cm !== cursorMode) {
      cursorMode = cm;
      document.documentElement.classList.toggle('hsm-cursor', cm);
    }
    if (cm) {
      var htf = 'translate3d(' + pointer.x + 'px,' + pointer.y + 'px,0)';
      if (htf !== lastHotTf) { hot.style.transform = htf; lastHotTf = htf; }
    }
  }

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.active = true; pointer.over = true;
  }, { passive: true });
  function pointerGone() { pointer.over = false; }
  document.documentElement.addEventListener('mouseleave', pointerGone);
  document.documentElement.addEventListener('mouseenter', function () { pointer.over = true; });
  window.addEventListener('blur', pointerGone);

  // Hover context (desktop): project cards invite a point, code links a coding
  // pose, skill cards an idea; text fields make the character step back so it
  // never covers what's typed. Interactive elements light up the hotspot.
  document.addEventListener('pointerover', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var ctx = null;
    for (var i = 0; i < HOVER_CTX.length; i++) if (t.closest(HOVER_CTX[i][1])) { ctx = HOVER_CTX[i][0]; break; }
    if (ctx !== hover.ctx) { hover.ctx = ctx; hover.since = performance.now(); }
    if (fine.matches) {
      root.classList.toggle('is-quiet', ctx === 'text' || focusedField);
      hot.classList.toggle('is-link', !!t.closest(INTERACTIVE));
      hot.classList.toggle('is-off', !!t.closest(NATIVE_CURSOR));
    }
  }, { passive: true });
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
      if (status.classList.contains('ok')) play('excited', REACT_MS, false, true, now);
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
  function onModeChange() { pointer.active = false; pointer.over = false; queueMeasure(); }
  [fine, reduce].forEach(function (mq) {
    if (mq.addEventListener) mq.addEventListener('change', onModeChange);
    else if (mq.addListener) mq.addListener(onModeChange);
  });

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
    document.documentElement.classList.add('hsm-active'); // makes room above the button
    measure();
    var sy = window.scrollY, now = performance.now();
    var s = sectionAt(sy);
    x = tx = gx = s.x; y = ty = gy = s.y;
    var feet = dockFeetY(sy);
    if (feet !== null && feet <= vh - DOCK_MARGIN) {
      // Loaded straight onto Contact (hash / restored scroll): already home.
      phase = 'docked'; phaseAt = now;
      x = tx = gx = dock.cx; y = ty = gy = feet - feetDy('docked');
      setPose('docked');
    } else {
      setPose('idle');
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
    state: function () {
      return { phase: phase, pose: pose, state: stateName(), x: x, y: y, flying: flying, dir: dir, size: size, cursor: cursorMode, over: pointer.over, active: pointer.active, hover: hover.ctx };
    }
  };
})();
