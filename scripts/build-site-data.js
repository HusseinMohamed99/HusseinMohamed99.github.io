#!/usr/bin/env node
/**
 * Regenerates the files that must stay in sync with data/projects/*.md:
 *
 *   data/projects/index.json     — card-level data for homepage and archive grids
 *   projects/<slug>/index.html   — static, crawlable case study pages with meta & JSON-LD
 *   sitemap.xml                  — index with canonical clean URLs
 *   static-projects blocks       — prerendered fallback lists in index.html & all-projects.html
 *
 * Decap CMS writes the .md files but knows nothing about the derived files, so
 * .github/workflows/build-site-data.yml reruns this on every push touching data/projects/.
 * Run it by hand after editing a .md locally:
 *
 *     node scripts/build-site-data.js
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data", "projects");
const PROJECTS_DIR = path.join(ROOT, "projects");
const ORIGIN = "https://husseinmohamed99.github.io";

const jsyaml = require(path.join(ROOT, "js", "js-yaml.min.js"));

/** Fields the project-card renderers read (js/render-projects.js). */
const CARD_FIELDS = [
  "name", "category", "badge", "period", "short_description",
  "icon", "order", "accent_color", "tech_tags", "links",
];

function parseFrontmatter(raw, file) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: no YAML frontmatter`);
  const data = jsyaml.load(m[1]);
  if (!data || typeof data !== "object") throw new Error(`${file}: frontmatter is not a mapping`);
  return data;
}

/** Last commit date for a file, for <lastmod>. Falls back to today outside git. */
function lastModified(file) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (out) return out.slice(0, 10);
  } catch (_) { /* not a git checkout, or file never committed */ }
  return new Date().toISOString().slice(0, 10);
}

const xmlEscape = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const htmlEscape = (v) => String(v ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Warn-only check for frontmatter keys not registered in admin/config.yml. */
function checkSchemaDrift(rawProjects) {
  const configPath = path.join(ROOT, "admin", "config.yml");
  if (!fs.existsSync(configPath)) return;
  try {
    const config = jsyaml.load(fs.readFileSync(configPath, "utf8"));
    const fields = config?.collections?.[0]?.fields || [];
    const cmsKeys = new Set(fields.map((f) => f.name));
    const unknown = new Map();
    for (const { file, data } of rawProjects) {
      for (const k of Object.keys(data)) {
        if (!cmsKeys.has(k)) {
          if (!unknown.has(k)) unknown.set(k, []);
          unknown.get(k).push(file);
        }
      }
    }
    if (unknown.size) {
      console.warn("\n⚠️  [WARN] Frontmatter keys missing from admin/config.yml (data-loss risk on CMS save):");
      for (const [k, flist] of unknown.entries()) {
        console.warn(`    • ${k} in: ${flist.join(", ")}`);
      }
      console.warn("   Register them in admin/config.yml to preserve them across dashboard saves.\n");
    }
  } catch (e) {
    console.warn("⚠️  Could not check schema drift:", e.message);
  }
}

function normalizeApplicationCategory(category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("fintech") || cat.includes("finance") || cat.includes("expense")) return "FinanceApplication";
  if (cat.includes("fitness") || cat.includes("health")) return "HealthApplication";
  if (cat.includes("sport")) return "SportsApplication";
  if (cat.includes("education") || cat.includes("study")) return "EducationalApplication";
  if (cat.includes("travel")) return "TravelApplication";
  if (cat.includes("entertainment") || cat.includes("media") || cat.includes("movie")) return "EntertainmentApplication";
  if (cat.includes("lifestyle") || cat.includes("islamic")) return "LifestyleApplication";
  if (cat.includes("real estate") || cat.includes("business")) return "BusinessApplication";
  return "MobileApplication";
}

/** Generates the static HTML page for a single project (projects/<slug>/index.html) */
function renderStaticProjectPage(slug, p) {
  const stats = (p.stats || []).map(s => `
    <div class="cs-stat"><span class="cs-stat-n">${htmlEscape(s.number)}</span><span class="cs-stat-l">${htmlEscape(s.label)}</span></div>
  `).join("");

  const caps = (p.capabilities || []).map(c => `
    <div class="cs-cap"><div class="cs-cap-ico">${htmlEscape(c.icon || "")}</div><div class="cs-cap-tx"><b>${htmlEscape(c.title)}</b><p>${htmlEscape(c.description)}</p></div></div>
  `).join("");

  const flow = (p.architecture_flow || []).map((step, i, arr) => {
    const label = (step && typeof step === "object") ? (step.step || "") : step;
    const arrow = i < arr.length - 1 ? `<span class="cs-flow-arrow">→</span>` : "";
    return `<span class="cs-flow-step">${htmlEscape(label)}</span>${arrow}`;
  }).join("");

  const flow2 = (p.architecture_flow_2 || []).map((step, i, arr) => {
    const label = (step && typeof step === "object") ? (step.step || "") : step;
    const arrow = i < arr.length - 1 ? `<span class="cs-flow-arrow">→</span>` : "";
    return `<span class="cs-flow-step">${htmlEscape(label)}</span>${arrow}`;
  }).join("");

  const banner = p.banner ? `
    <div style="grid-column:1/-1">
      <img src="../../${htmlEscape(p.banner)}" alt="${htmlEscape(p.name)} Screenshots Banner" style="width:100%;border-radius:18px;display:block;">
    </div>` : "";

  const items = p.mockups || [];
  const hasAr = items.some(m => m.image_ar || m.image_ar_dark);
  const hasDark = items.some(m => m.image_dark || m.image_ar_dark);

  const mockups = items.map((m, i) => `
    <div class="cs-mockup" data-shot="${i}">
      <div class="cs-phone-mini" role="button" tabindex="0" aria-label="${htmlEscape(m.caption || 'Enlarge screenshot')}" data-lightbox-src="../../${htmlEscape(m.image)}">
        <div class="cs-phone-mini-inner"><img src="../../${htmlEscape(m.image)}" alt="${htmlEscape(m.caption || '')}" loading="lazy" decoding="async"/></div>
      </div>
      <span class="cs-mockup-cap">${htmlEscape(m.caption || '')}</span>
    </div>`
  ).join("");

  const shotSwitch = (hasAr ? `
    <div class="cs-shot-lang" role="group" aria-label="Screenshot language">
      <button type="button" data-shot-lang="en" aria-pressed="true">English</button>
      <button type="button" data-shot-lang="ar" aria-pressed="false" lang="ar">العربية</button>
    </div>` : "") + (hasDark ? `
    <div class="cs-shot-lang cs-shot-theme" role="group" aria-label="Screenshot theme">
      <button type="button" data-shot-theme="light" aria-pressed="true" aria-label="Light screenshots" title="Light"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg></button>
      <button type="button" data-shot-theme="dark" aria-pressed="false" aria-label="Dark screenshots" title="Dark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>
    </div>` : "");

  const hasVideo = !!p.video;
  const hasMockups = items.length > 0;
  const walkTabs = hasVideo && hasMockups ? `
    <div class="cs-walk-tabs">
      <div class="cs-walk-tab active" data-walk="mockups"><span class="cs-walk-tab-dot"></span><span class="cs-walk-tab-nm">Screenshots</span></div>
      <div class="cs-walk-tab" data-walk="video"><span class="cs-walk-tab-dot"></span><span class="cs-walk-tab-nm">Video Demo</span></div>
    </div>` : "";
  const walkNote = hasVideo && hasMockups ? `<p class="cs-walk-note">Static mockups shown by default — no live merchant data. Toggle to Video Demo for the full emulator walkthrough.</p>` : "";

  const challenges = (p.challenges || []).map(c => `
    <div class="cs-challenge"><div class="cs-ch-label">${htmlEscape(c.label)}</div><div class="cs-ch-body"><b>${htmlEscape(c.title)}</b><p>${htmlEscape(c.body)}</p></div></div>
  `).join("");

  const techTags = (p.tech_tags || []).map(t => `<span class="tag hi">${htmlEscape(t.tag || t)}</span>`).join("");

  const links = p.links || {};
  const linkButtons = [
    links.github ? `<a href="${htmlEscape(links.github)}" target="_blank" class="pl pl-store">GitHub ↗</a>` : "",
    links.app_store ? `<a href="${htmlEscape(links.app_store)}" target="_blank" class="pl pl-store">App Store ↗</a>` : "",
    links.google_play ? `<a href="${htmlEscape(links.google_play)}" target="_blank" class="pl pl-store">Google Play ↗</a>` : "",
  ].join("");

  const pageTitle = `${p.name} — Case Study | Hussein Mohamed`;
  const pageDesc = p.short_description || "";
  const canonicalUrl = `${ORIGIN}/projects/${slug}/`;
  const ogImageUrl = `${ORIGIN}/images/og/${slug}.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": p.name,
    "description": pageDesc,
    "applicationCategory": normalizeApplicationCategory(p.category),
    "operatingSystem": "iOS, Android",
    "author": {
      "@type": "Person",
      "name": "Hussein Mohamed",
      "url": `${ORIGIN}/`
    },
    "url": canonicalUrl,
    "image": ogImageUrl
  };

  if (p.links && (p.links.google_play || p.links.app_store)) {
    jsonLd.installUrl = p.links.google_play || p.links.app_store;
  }

  return `<!DOCTYPE html>
<!-- GENERATED FILE: Do not edit directly. Regenerate with node scripts/build-site-data.js. Source: data/projects/${slug}.md -->
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title id="page-title">${htmlEscape(pageTitle)}</title>
<meta name="description" content="${htmlEscape(pageDesc)}"/>
<link rel="canonical" href="${canonicalUrl}"/>
<link rel="icon" type="image/png" sizes="32x32" href="../../favicon.png"/>
<link rel="icon" type="image/png" sizes="512x512" href="../../images/brand/hsm-icon-512.png"/>
<link rel="apple-touch-icon" sizes="180x180" href="../../apple-touch-icon.png"/>
<meta name="theme-color" content="#0A6EF5"/>

<meta property="og:type" content="article"/>
<meta property="og:title" content="${htmlEscape(pageTitle)}"/>
<meta property="og:description" content="${htmlEscape(pageDesc)}"/>
<meta property="og:url" content="${canonicalUrl}"/>
<meta property="og:image" content="${ogImageUrl}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${htmlEscape(p.name)} Case Study Preview"/>

<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${htmlEscape(pageTitle)}"/>
<meta name="twitter:description" content="${htmlEscape(pageDesc)}"/>
<meta name="twitter:image" content="${ogImageUrl}"/>

<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="preconnect" href="https://api.fontshare.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;1,9..144,400&family=Geist+Mono:wght@400;500&family=Noto+Naskh+Arabic:wght@400;500&display=swap" rel="stylesheet"/>
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,600,700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="../../styles.css"/>
<script defer data-domain="husseinmohamed99.github.io" src="https://plausible.io/js/script.js"></script>

<style>
  .cs-mockup-grid{
    grid-column: 1 / -1;
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(170px,1fr));
    gap:1.75rem;
    padding:2.5rem 0;
  }
  .cs-walk-in{ max-width: 1400px !important; }
  .cs-mockup{display:flex;flex-direction:column;align-items:center;gap:1rem}
  .cs-phone-mini{
    position:relative;
    width:100%;
    max-width:230px;
    aspect-ratio:9/19.5;
    border-radius:32px;
    padding:6px;
    background:linear-gradient(160deg,#2a2a2a,#0a0a0a);
    box-shadow:0 4px 10px rgba(0,0,0,.08), 0 20px 45px -12px rgba(0,0,0,.35);
    cursor:zoom-in;
    transition:transform .25s ease, box-shadow .25s ease;
  }
  .cs-phone-mini:hover{
    transform:translateY(-6px);
    box-shadow:0 8px 16px rgba(0,0,0,.12), 0 28px 55px -12px rgba(0,0,0,.45);
  }
  .cs-phone-mini:focus-visible{
    outline:2px solid var(--hsm-blue);
    outline-offset:4px;
  }
  .cs-phone-mini::before{
    content:"";
    position:absolute;
    top:14px;
    left:50%;
    transform:translateX(-50%);
    width:10px;
    height:10px;
    background:#0a0a0a;
    border-radius:50%;
    z-index:2;
    box-shadow:0 0 0 2px rgba(255,255,255,.06);
  }
  .cs-phone-mini-inner{width:100%;height:100%;border-radius:26px;overflow:hidden;background:#000;transform:translateZ(0)}
  .cs-phone-mini img{width:100%;height:100%;object-fit:cover;background:#000;display:block;image-rendering:auto;backface-visibility:hidden}
  .cs-mockup-grid.is-bare .cs-phone-mini{aspect-ratio:9/16;padding:0;border-radius:18px;background:none}
  .cs-mockup-grid.is-bare .cs-phone-mini::before{display:none}
  .cs-mockup-grid.is-bare .cs-phone-mini-inner{border-radius:18px;background:var(--surface)}
  .cs-mockup-grid.is-bare .cs-phone-mini img{background:var(--surface)}
  .cs-mockup-cap{
    font-family:'Geist Mono',monospace;
    font-size:.68rem;
    letter-spacing:.04em;
    color:var(--muted);
    text-align:center;
    padding:.3rem .8rem;
    border:1px solid var(--border,rgba(0,0,0,.08));
    border-radius:100px;
  }
  .cs-walk-tab{cursor:pointer}
  .cs-walk-title{display:flex;flex-wrap:wrap;align-items:center;gap:.75rem 1.25rem}
  .cs-shot-lang{
    display:inline-flex;gap:2px;padding:3px;
    background:var(--surface);border:1px solid var(--border2);border-radius:999px;
  }
  .cs-shot-lang button{
    display:inline-flex;align-items:center;justify-content:center;
    min-height:34px;padding:4px 15px;border-radius:999px;
    font-family:'Geist Mono',monospace;font-size:12px;font-weight:500;letter-spacing:.06em;line-height:1.2;
    background:transparent;color:var(--muted);border:1px solid transparent;cursor:pointer;
    transition:background .16s,color .16s,box-shadow .16s;
  }
  .cs-shot-lang button:hover{color:var(--hsm-blue-text)}
  .cs-shot-lang button[aria-pressed="true"]{
    background:var(--hsm-blue);color:#fff;
    box-shadow:0 1px 2px rgba(var(--hsm-blue-rgb),.35),0 2px 8px rgba(var(--hsm-blue-rgb),.28);
  }
  .cs-shot-lang button:focus-visible{outline:2px solid var(--hsm-blue);outline-offset:2px}
  .cs-shot-lang button[lang="ar"],
  .cs-mockup-cap[lang="ar"]{font-family:'Noto Naskh Arabic',serif;letter-spacing:0}
  .cs-shot-lang button[lang="ar"]{font-size:13.5px}
  .cs-shot-theme button{padding:4px 11px;min-width:40px}
  .cs-shot-theme svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .cs-mockup-cap[lang="ar"]{font-size:.8rem}
  .cs-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  .cs-lightbox{
    position:fixed;inset:0;z-index:999;
    background:rgba(10,10,10,.88);
    display:none;
    align-items:center;justify-content:center;
    padding:3rem 1.5rem;
    cursor:zoom-out;
  }
  .cs-lightbox.open{display:flex}
  .cs-lightbox img{
    max-width:min(420px,90vw);
    max-height:85vh;
    border-radius:28px;
    box-shadow:0 30px 80px rgba(0,0,0,.5);
  }
  .cs-lightbox-close{
    position:absolute;top:1.5rem;right:1.5rem;
    width:42px;height:42px;border-radius:50%;
    background:rgba(255,255,255,.1);
    color:#fff;border:1px solid rgba(255,255,255,.25);
    font-size:1.3rem;line-height:1;cursor:pointer;
  }
  .cs-walk-tabs{
    display:flex !important;
    flex-direction:row !important;
    flex-wrap:nowrap !important;
    align-items:center !important;
    justify-content:flex-start !important;
    width:fit-content !important;
    max-width:100% !important;
    gap:.35rem !important;
    background:rgba(0,0,0,.045);
    padding:.3rem !important;
    border-radius:100px !important;
    margin:0 !important;
  }
  .cs-walk-tab{
    display:flex !important;
    flex-direction:row !important;
    flex:0 0 auto !important;
    align-items:center !important;
    justify-content:center !important;
    width:auto !important;
    height:auto !important;
    padding:.45rem 1rem !important;
    margin:0 !important;
    font-size:.78rem !important;
    line-height:1.2 !important;
    border-radius:100px !important;
    border:none !important;
    background:transparent !important;
    color:var(--muted);
    font-weight:600;
    white-space:nowrap;
    gap:.4rem;
  }
  .cs-walk-tab .cs-walk-tab-dot{
    width:6px;height:6px;border-radius:50%;
    background:currentColor;
    opacity:.5;
    flex:0 0 auto;
  }
  .cs-walk-tab.active{
    background:#fff !important;
    color:var(--text,#111);
    box-shadow:0 2px 6px rgba(0,0,0,.1);
  }
  .cs-walk-tab.active .cs-walk-tab-dot{
    background:var(--hsm-blue);
    opacity:1;
  }
</style>
</head>
<body>

<a href="#main" class="skip-link">Skip to content</a>

<div class="hsm-mascot" id="hsm-mascot" data-assets="../../images/mascot/" aria-hidden="true"></div>

<nav id="nav">
  <a class="nav-logo" href="../../index.html" aria-label="Hussein Mohamed — HSM Software, home">
    <img class="brand-mark brand-mark--light" src="../../images/brand/hsm-mark-light.png" alt="HSM Software" width="381" height="160"/>
    <img class="brand-mark brand-mark--dark" src="../../images/brand/hsm-mark-dark.png" alt="" aria-hidden="true" width="417" height="160"/>
    Hussein Mohamed
  </a>
  <div class="nav-right">
    <ul class="nav-links" id="nav-links">
      <li><a href="../../index.html#hero-section">Home</a></li>
      <li><a href="../../index.html#about">About</a></li>
      <li><a href="../../index.html#skills">Skills</a></li>
      <li><a href="../../index.html#experience">Experience</a></li>
      <li><a href="../../index.html#projects" class="active">Projects</a></li>
      <li><a href="../../index.html#certifications">Certifications</a></li>
      <li><a href="https://github.com/HusseinMohamed99" target="_blank">GitHub</a></li>
      <li><a href="../../index.html#contact" class="nav-hire">Hire me</a></li>
    </ul>
    <div class="nav-actions">
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme"><svg viewBox="0 0 24 24" class="icon-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg><svg viewBox="0 0 24 24" class="icon-sun"><circle cx="12" cy="12" r="5"/></svg></button>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</nav>

<div class="mobile-menu" id="mobile-menu">
  <a href="../../index.html#hero-section">Home</a>
  <a href="../../index.html#about">About</a>
  <a href="../../index.html#skills">Skills</a>
  <a href="../../index.html#experience">Experience</a>
  <a href="../../index.html#projects" class="active">Projects</a>
  <a href="../../index.html#certifications">Certifications</a>
  <a href="https://github.com/HusseinMohamed99" target="_blank">GitHub ↗</a>
  <a href="../../index.html#contact" class="m-hire">Hire me</a>
</div>

<main id="main">
<div class="cs-back">
  <a href="../../index.html#projects">← Back to Portfolio</a>
</div>

<div id="project-root">
  <div class="cs-hero">
    ${p.icon ? `<div class="cs-icon"><img src="../../${htmlEscape(p.icon)}" alt="${htmlEscape(p.name)} icon"/></div>` : ""}
    <div>
      <div class="cs-tag">${htmlEscape(p.badge || "Project")}${p.category ? " · " + htmlEscape(p.category) : ""}${p.period ? " · " + htmlEscape(p.period) : ""}</div>
      <h1 class="cs-title">${htmlEscape(p.name || "")}</h1>
    </div>
    <div class="cs-links">${linkButtons}</div>
  </div>

  ${p.overview || stats ? `
  <div class="cs-band">
    <div class="cs-overview">
      <div>
        <div class="cs-h2">Overview</div>
        <p>${(p.overview || "").replace(/\n\n/g, "<br><br>")}</p>
      </div>
      ${stats ? `<div class="cs-stats">${stats}</div>` : ""}
    </div>
  </div>` : ""}

  ${caps ? `
  <section class="cs-caps">
    <div class="sec-tag">Core Capabilities</div>
    <h2 class="cs-h2" style="font-size:1.75rem;margin-bottom:2rem">What the app does</h2>
    <div class="cs-cap-grid">${caps}</div>
  </section>` : ""}

  ${p.architecture_text || flow ? `
  <div class="cs-arch">
    <div class="cs-arch-in">
      <div class="sec-tag">Architecture</div>
      <h2 class="cs-h2" style="font-size:1.75rem">How it's built</h2>
      <p>${(p.architecture_text || "").replace(/\n\n/g, "<br><br>")}</p>
      ${flow ? `<div class="cs-flow">${flow}</div>` : ""}
      ${flow2 ? `<div class="cs-flow" style="margin-top:1rem">${flow2}</div>` : ""}
    </div>
  </div>` : ""}

  ${(hasMockups || hasVideo) ? `
  <div class="cs-walk">
    <div class="cs-walk-in">
      <div class="cs-walk-head">
        <div>
          <div class="sec-tag">Walkthrough</div>
          <div class="cs-walk-title">
            <h2 class="cs-h2" style="font-size:1.75rem">See it in action</h2>
            ${shotSwitch}
          </div>
        </div>
        ${walkTabs}
      </div>
      ${(hasAr || hasDark) ? `<p class="cs-sr" id="cs-shot-status" aria-live="polite"></p>` : ""}
      ${walkNote}
      ${hasMockups ? `<div class="cs-mockup-grid${p.mockup_frame === "none" ? " is-bare" : ""}" data-walk-panel="mockups">${banner}${mockups}</div>` : ""}
      ${hasVideo ? `
      <div class="cs-phone-wrap" data-walk-panel="video" style="${hasMockups ? "display:none" : ""}">
        <span class="cs-phone-lbl">Emulator</span>
        <div class="cs-phone">
          <div class="cs-phone-screen">
            <video controls playsinline preload="metadata">
              <source src="../../${htmlEscape(p.video)}" type="video/mp4">
            </video>
          </div>
        </div>
      </div>` : ""}
    </div>
  </div>` : ""}

  ${challenges ? `
  <section class="cs-challenges">
    <div class="sec-tag">Problems Solved</div>
    <h2 class="cs-h2" style="font-size:1.75rem;margin-bottom:2rem">Real engineering challenges</h2>
    ${challenges}
  </section>` : ""}

  ${techTags ? `
  <div class="cs-tech-band">
    <div class="cs-tech-in">
      <div class="sec-tag" style="justify-content:center">Technologies Employed</div>
      <h2 class="cs-h2" style="font-size:1.5rem">Built with</h2>
      <div class="cs-tech-tags">${techTags}</div>
    </div>
  </div>` : ""}
</div>
</main>

<div class="cs-lightbox" id="cs-lightbox">
  <button class="cs-lightbox-close" id="cs-lightbox-close" aria-label="Close">✕</button>
  <img id="cs-lightbox-img" src="" alt="Screenshot preview"/>
</div>

<footer>
  <div class="footer-brand">
    <img src="../../images/brand/hsm-logo-dark.png" alt="HSM Software" width="443" height="240"/>
    <div class="footer-brand-tx">
      <span>© <span id="copy-year"></span> Hussein Mohamed</span>
      <small>An HSM Software portfolio</small>
    </div>
  </div>
  <a href="mailto:hussein.mohamed.software@gmail.com?subject=Let's%20talk%20%E2%80%94%20from%20your%20portfolio" id="em-link-footer" style="font-family:'Geist Mono',monospace;font-size:.73rem;color:var(--contact-label);text-decoration:none">hussein.mohamed.software@gmail.com</a>
  <span style="font-family:'Geist Mono',monospace">Flutter Developer · Cairo, Egypt</span>
</footer>

<a href="https://wa.me/201034442174" target="_blank" rel="noopener noreferrer" class="wa-fab" id="wa-fab" aria-label="Contact on WhatsApp">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>
<button class="btt" id="btt" aria-label="Back to top"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg></button>

<script src="../../script.js"></script>
<script src="../../js/hsm-mascot.js"></script>
<script type="application/json" id="cs-mockups-data">${JSON.stringify(p.mockups || [])}</script>
<script src="../../js/cs-interactive.js"></script>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error("No data/projects directory — nothing to build.");
    process.exit(1);
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".md")).sort();
  if (!files.length) {
    console.error("No .md files in data/projects — refusing to write an empty manifest.");
    process.exit(1);
  }

  const projects = [];
  const rawProjects = [];
  const problems = [];

  for (const file of files) {
    const full = path.join(DATA_DIR, file);
    const slug = file.replace(/\.md$/, "");
    let data;
    try {
      data = parseFrontmatter(fs.readFileSync(full, "utf8"), file);
    } catch (e) {
      problems.push(e.message);
      continue;
    }
    if (!data.name) problems.push(`${file}: missing required field "name"`);

    const card = { slug };
    for (const k of CARD_FIELDS) if (data[k] !== undefined) card[k] = data[k];
    card.lastmod = lastModified(path.join("data", "projects", file));
    projects.push(card);
    rawProjects.push({ slug, file, data });
  }

  checkSchemaDrift(rawProjects);

  if (problems.length) {
    console.error("Refusing to write — fix these first:");
    problems.forEach((p) => console.error("  • " + p));
    process.exit(1);
  }

  projects.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // ---- data/projects/index.json ----
  const manifest = {
    generated: new Date().toISOString(),
    count: projects.length,
    projects,
  };
  fs.writeFileSync(path.join(DATA_DIR, "index.json"), JSON.stringify(manifest, null, 2) + "\n");

  // ---- static project pages (projects/<slug>/index.html) ----
  for (const item of rawProjects) {
    const dir = path.join(PROJECTS_DIR, item.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const pageHtml = renderStaticProjectPage(item.slug, item.data);
    fs.writeFileSync(path.join(dir, "index.html"), pageHtml, "utf8");
  }

  // ---- static project list in the grid pages ----
  const withRtl = (v) => htmlEscape(v).replace(/[\u0600-\u06FF][\u0600-\u06FF\s]*[\u0600-\u06FF]|[\u0600-\u06FF]/g,
    (ar) => `<span dir="rtl" lang="ar">${ar}</span>`);
  const staticPages = [
    { file: "index.html", caseBase: "projects/", limit: 4, allHref: "projects/all-projects.html" },
    { file: path.join("projects", "all-projects.html"), caseBase: "", limit: 0 },
  ];
  for (const pg of staticPages) {
    const full = path.join(ROOT, pg.file);
    const html = fs.readFileSync(full, "utf8");
    const re = /(<!-- static-projects:start[^>]*-->)[\s\S]*?(\n[ \t]*<!-- static-projects:end -->)/;
    if (!re.test(html)) { console.error(`${pg.file}: static-projects markers missing`); process.exit(1); }
    const shown = pg.limit ? projects.slice(0, pg.limit) : projects;
    const items = shown.map((p) =>
      `        <li style="margin-bottom:.9rem"><a href="${pg.caseBase}${encodeURIComponent(p.slug)}/"><strong>${withRtl(p.name)}</strong></a>` +
      ` <span style="color:var(--muted)">— ${htmlEscape([p.badge, p.category, p.period].filter(Boolean).join(" · "))}</span><br>` +
      `${htmlEscape(p.short_description)}</li>`
    ).join("\n");
    const more = pg.limit && projects.length > pg.limit
      ? `\n      <p style="margin:0"><a href="${pg.allHref}">See all ${projects.length} projects →</a></p>` : "";
    const block = `\n      <div class="proj-static" style="grid-column:1/-1;line-height:1.55">\n      <ul style="list-style:none;padding:0;margin:0 0 1rem">\n${items}\n      </ul>${more}\n      </div>`;
    fs.writeFileSync(full, html.replace(re, (_, start, end) => start + block + end));
  }

  // ---- sitemap.xml ----
  const newest = projects.map((p) => p.lastmod).sort().pop();

  const privacyPages = [
    "/privacy/",
    "/privacy/refqa/",
    "/privacy/qisma/",
    "/privacy/qisma/account-deletion.html",
    "/privacy/x5-fitness/",
    "/privacy/x5-fitness/account-deletion.html",
    "/privacy/studyflow/",
    "/privacy/vaulta/",
  ];

  const urls = [
    { loc: `${ORIGIN}/`, lastmod: newest, changefreq: "monthly", priority: "1.0" },
    { loc: `${ORIGIN}/projects/all-projects.html`, lastmod: newest, changefreq: "monthly", priority: "0.8" },
    ...projects.map((p) => ({
      loc: `${ORIGIN}/projects/${encodeURIComponent(p.slug)}/`,
      lastmod: p.lastmod,
      changefreq: "yearly",
      priority: "0.7",
    })),
    ...privacyPages.map((page) => ({
      loc: `${ORIGIN}${page}`,
      lastmod: lastModified(page.replace(/^\//, "").replace(/\/$/, "/index.html")),
      changefreq: "yearly",
      priority: "0.3",
    })),
  ];

  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) =>
      "  <url>\n" +
      `    <loc>${xmlEscape(u.loc)}</loc>\n` +
      `    <lastmod>${u.lastmod}</lastmod>\n` +
      `    <changefreq>${u.changefreq}</changefreq>\n` +
      `    <priority>${u.priority}</priority>\n` +
      "  </url>\n"
    ).join("") +
    "</urlset>\n";

  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);

  console.log(`✓ data/projects/index.json  (${projects.length} projects)`);
  console.log(`✓ projects/<slug>/index.html (${rawProjects.length} static case studies)`);
  console.log(`✓ static project lists in index.html, projects/all-projects.html`);
  console.log(`✓ sitemap.xml               (${urls.length} URLs)`);
  projects.forEach((p) => console.log(`    ${String(p.order ?? 0).padStart(2)}  ${p.slug.padEnd(14)} ${p.lastmod}`));
}

main();
