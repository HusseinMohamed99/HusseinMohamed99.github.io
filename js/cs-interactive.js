/**
 * Interactive controller for static case-study pages (projects/<slug>/index.html).
 * Handles:
 *  - Screenshot language switch (English / العربية)
 *  - Screenshot theme switch (Light / Dark)
 *  - Walkthrough tabs (Screenshots / Video Demo)
 *  - Click-to-zoom Lightbox
 *  - Graceful fallback for missing screenshot variants
 */
(function () {
  const SHOT_LANG_KEY = "cs-shot-lang";
  const SHOT_THEME_KEY = "cs-shot-theme";
  const SHOT_FIELD = {
    en: { light: "image", dark: "image_dark" },
    ar: { light: "image_ar", dark: "image_ar_dark" },
  };

  const rawDataEl = document.getElementById("cs-mockups-data");
  let items = [];
  try {
    items = rawDataEl ? JSON.parse(rawDataEl.textContent || "[]") : [];
  } catch (_) {
    items = [];
  }

  const shots = items.map(m => ({ m, dead: new Set() }));
  const hasAr = items.some(m => m.image_ar || m.image_ar_dark);
  const hasDark = items.some(m => m.image_dark || m.image_ar_dark);

  const readSaved = (key) => {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  };

  const params = new URLSearchParams(window.location.search);
  let shotLang = "en";
  if (hasAr) {
    const asked = params.get("lang");
    shotLang = (asked === "ar" || asked === "en") ? asked : (readSaved(SHOT_LANG_KEY) === "ar" ? "ar" : "en");
  }

  const siteTheme = () => document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  let shotTheme = "light", followSite = false;
  if (hasDark) {
    const asked = params.get("theme"), saved = readSaved(SHOT_THEME_KEY);
    if (asked === "dark" || asked === "light") shotTheme = asked;
    else if (saved === "dark" || saved === "light") shotTheme = saved;
    else { shotTheme = siteTheme(); followSite = true; }
  }

  function shotView(i) {
    const { m, dead } = shots[i];
    const chain = [[shotLang, shotTheme], [shotLang, "light"], ["en", shotTheme], ["en", "light"]]
      .map(([l, t]) => m[SHOT_FIELD[l][t]]).filter(Boolean);
    const ar = shotLang === "ar" && !!m.caption_ar;
    return {
      src: chain.find(s => !dead.has(s)) || m.image,
      cap: (ar ? m.caption_ar : m.caption) || "",
      ar,
    };
  }

  const root = document.getElementById("project-root");
  if (!root) return;

  const lightbox = document.getElementById("cs-lightbox");
  const lightboxImg = document.getElementById("cs-lightbox-img");

  function showShot(i) {
    const item = root.querySelector(`[data-shot="${i}"]`);
    if (!item) return;
    const v = shotView(i);
    const src = "../../" + v.src;
    const frame = item.querySelector(".cs-phone-mini");
    const img = item.querySelector("img");
    const cap = item.querySelector(".cs-mockup-cap");
    if (frame) frame.setAttribute("data-lightbox-src", src);
    if (img && img.getAttribute("src") !== src) img.setAttribute("src", src);
    if (img) img.alt = v.cap;
    if (cap) cap.textContent = v.cap;
    for (const el of [img, cap]) {
      if (!el) continue;
      if (v.ar) { el.lang = "ar"; el.dir = "rtl"; }
      else { el.removeAttribute("lang"); el.removeAttribute("dir"); }
    }
    if (lightbox && lightbox.classList.contains("open") && lightbox.dataset.openShot === String(i)) {
      if (lightboxImg) lightboxImg.src = src;
    }
  }

  // Fallback on image load error
  root.querySelectorAll("[data-shot] img").forEach(img => {
    img.addEventListener("error", () => {
      const parent = img.closest("[data-shot]");
      if (!parent) return;
      const i = parseInt(parent.dataset.shot, 10);
      if (isNaN(i) || !shots[i]) return;
      const failed = img.getAttribute("src").replace(/^\.\.\/\.\.\//, "");
      if (failed === shots[i].m.image) return;
      shots[i].dead.add(failed);
      showShot(i);
    });
  });

  const shotStatus = document.getElementById("cs-shot-status");
  const LANG_NAME = { en: "English", ar: "Arabic" };

  function applyShots(changed) {
    root.querySelectorAll("[data-shot-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.shotLang === shotLang)));
    root.querySelectorAll("[data-shot-theme]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.shotTheme === shotTheme)));
    shots.forEach((_, i) => showShot(i));
    if (shotStatus) {
      shotStatus.textContent = changed === "theme"
        ? `Showing ${shotTheme} screenshots.`
        : `Showing ${LANG_NAME[shotLang]} screenshots.`;
    }
  }

  // Language switch clicks
  root.querySelectorAll("[data-shot-lang]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.shotLang === shotLang) return;
      shotLang = btn.dataset.shotLang;
      try { localStorage.setItem(SHOT_LANG_KEY, shotLang); } catch (_) {}
      applyShots("lang");
    });
  });

  // Theme switch clicks
  root.querySelectorAll("[data-shot-theme]").forEach(btn => {
    btn.addEventListener("click", () => {
      followSite = false;
      try { localStorage.setItem(SHOT_THEME_KEY, btn.dataset.shotTheme); } catch (_) {}
      if (btn.dataset.shotTheme === shotTheme) return;
      shotTheme = btn.dataset.shotTheme;
      applyShots("theme");
    });
  });

  if (followSite) {
    new MutationObserver(() => {
      if (!followSite || siteTheme() === shotTheme) return;
      shotTheme = siteTheme();
      applyShots("theme");
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  // Walkthrough tab toggle
  document.querySelectorAll(".cs-walk-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".cs-walk-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-walk");
      document.querySelectorAll("[data-walk-panel]").forEach(panel => {
        panel.style.display = panel.getAttribute("data-walk-panel") === target ? "" : "none";
      });
    });
  });

  // Lightbox
  if (lightbox && lightboxImg) {
    document.querySelectorAll("[data-lightbox-src]").forEach(el => {
      el.addEventListener("click", () => {
        lightboxImg.src = el.getAttribute("data-lightbox-src");
        lightbox.dataset.openShot = el.closest("[data-shot]")?.dataset.shot ?? "";
        lightbox.classList.add("open");
      });
    });

    function closeLightbox() {
      lightbox.classList.remove("open");
      lightboxImg.src = "";
      lightbox.dataset.openShot = "";
    }

    const closeBtn = document.getElementById("cs-lightbox-close");
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
  }

  // If initial lang or theme differs from default English light, apply it
  if (shotLang !== "en" || shotTheme !== "light") {
    applyShots("init");
  }
})();
