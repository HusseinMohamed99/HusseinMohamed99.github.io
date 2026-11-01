#!/usr/bin/env node
/**
 * Generates pixel-perfect 1200x630 Open Graph / Twitter social preview cards
 * for the homepage and all 12 projects using existing brand assets and Chrome headless.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OG_DIR = path.join(ROOT, "images", "og");
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

if (!fs.existsSync(OG_DIR)) {
  fs.mkdirSync(OG_DIR, { recursive: true });
}

const jsyaml = require(path.join(ROOT, "js", "js-yaml.min.js"));

function htmlEscape(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

function generateHtml({ title, subtitle, desc, tags, imagePath, isPhoto = false }) {
  const absImagePath = imagePath.startsWith("http") || imagePath.startsWith("file:")
    ? imagePath
    : `file://${path.resolve(ROOT, imagePath)}`;

  const tagsHtml = (tags || []).slice(0, 4).map(t =>
    `<span class="tag">${htmlEscape(t)}</span>`
  ).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    background: #0B132B;
    color: #F8FAFC;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 60px 80px;
    position: relative;
    overflow: hidden;
  }
  .glow {
    position: absolute;
    width: 650px;
    height: 650px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(10, 110, 245, 0.28) 0%, transparent 70%);
    top: -120px;
    right: -100px;
    pointer-events: none;
  }
  .glow-subtle {
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%);
    bottom: -100px;
    left: -50px;
    pointer-events: none;
  }
  .content {
    max-width: 680px;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #38BDF8;
  }
  .brand-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22C55E;
    box-shadow: 0 0 10px #22C55E;
  }
  .title {
    font-size: 52px;
    font-weight: 800;
    line-height: 1.15;
    color: #FFFFFF;
    letter-spacing: -0.02em;
  }
  .subtitle {
    font-size: 21px;
    font-weight: 600;
    color: #94A3B8;
  }
  .desc {
    font-size: 18px;
    line-height: 1.55;
    color: #CBD5E1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-top: 4px;
  }
  .footer-row {
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .tag {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 600;
    color: #E2E8F0;
  }
  .visual-col {
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .icon-wrap {
    width: 240px;
    height: 240px;
    border-radius: ${isPhoto ? "32px" : "52px"};
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 45px rgba(10, 110, 245, 0.22);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .icon-wrap img {
    width: 100%;
    height: 100%;
    object-fit: ${isPhoto ? "cover" : "contain"};
    padding: ${isPhoto ? "0" : (absImagePath.endsWith(".svg") ? "24px" : "0")};
  }
  .watermark {
    margin-top: 18px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: #64748B;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="glow-subtle"></div>
  <div class="content">
    <div class="brand-badge"><span class="brand-dot"></span><span>${isPhoto ? "Hussein Mohamed · Portfolio" : "Hussein Mohamed · Case Study"}</span></div>
    <h1 class="title">${htmlEscape(title)}</h1>
    <div class="subtitle">${htmlEscape(subtitle)}</div>
    <p class="desc">${htmlEscape(desc)}</p>
    <div class="footer-row">
      <div class="tags">${tagsHtml}</div>
    </div>
  </div>
  <div class="visual-col">
    <div class="icon-wrap">
      <img src="${absImagePath}" alt="${htmlEscape(title)}">
    </div>
    <div class="watermark">husseinmohamed99.github.io</div>
  </div>
</body>
</html>`;
}

function renderCard(htmlContent, outputPath) {
  const tmpHtml = path.join("/tmp", `social_${path.basename(outputPath, ".png")}.html`);
  fs.writeFileSync(tmpHtml, htmlContent, "utf8");
  execFileSync(CHROME_PATH, [
    "--headless=new",
    `--screenshot=${outputPath}`,
    "--window-size=1200,630",
    "--hide-scrollbars",
    `file://${tmpHtml}`,
  ], { stdio: "ignore" });
  try { fs.unlinkSync(tmpHtml); } catch (_) {}
}

function main() {
  console.log("Generating 1200x630 social preview cards...");

  // 1. Home card
  const homeHtml = generateHtml({
    title: "Hussein Mohamed",
    subtitle: "Flutter Developer & Mobile Engineer",
    desc: "Flutter Developer & Mobile Engineer with 3+ years building production iOS & Android apps across fintech payment SDKs, biometric auth, offline-first architectures, and CI/CD.",
    tags: ["Flutter", "iOS & Android", "Clean Architecture", "CI/CD"],
    imagePath: "photo.jpg",
    isPhoto: true,
  });
  const homeOut = path.join(OG_DIR, "home.png");
  renderCard(homeHtml, homeOut);
  fs.copyFileSync(homeOut, path.join(ROOT, "images", "brand", "og-home.png"));
  console.log("✓ images/og/home.png & images/brand/og-home.png");

  // 2. Project cards
  const projectsDir = path.join(ROOT, "data", "projects");
  const files = fs.readdirSync(projectsDir).filter(f => f.endsWith(".md")).sort();

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(projectsDir, file), "utf8");
    const m = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!m) continue;
    const p = jsyaml.load(m[1]);

    const cardHtml = generateHtml({
      title: p.name || slug,
      subtitle: [p.category, p.period].filter(Boolean).join(" · "),
      desc: p.short_description || "",
      tags: (p.tech_tags || []).map(t => t.tag || t),
      imagePath: p.icon || "images/brand/hsm-icon-512.png",
      isPhoto: false,
    });

    const outPath = path.join(OG_DIR, `${slug}.png`);
    renderCard(cardHtml, outPath);
    console.log(`✓ images/og/${slug}.png`);
  }

  // 3. Verification of all cards
  console.log("\nVerifying card dimensions and sizes:");
  const allCards = ["home.png", ...files.map(f => f.replace(/\.md$/, ".png"))];
  for (const card of allCards) {
    const p = path.join(OG_DIR, card);
    const stat = fs.statSync(p);
    const dim = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", p], { encoding: "utf8" });
    const w = dim.match(/pixelWidth:\s*(\d+)/)[1];
    const h = dim.match(/pixelHeight:\s*(\d+)/)[1];
    if (w !== "1200" || h !== "630") {
      throw new Error(`Invalid dimensions for ${card}: ${w}x${h}`);
    }
    console.log(`  • ${card.padEnd(20)} ${w}x${h} (${Math.round(stat.size / 1024)} KB)`);
  }

  console.log("\nAll social cards generated and verified successfully!");
}

main();
