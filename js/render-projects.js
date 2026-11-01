(async function () {
  const grid = document.getElementById("proj-grid");
  if (!grid) return;

  const ICON_BASE = grid.dataset.iconBase || "";
  const CASE_BASE = grid.dataset.caseBase !== undefined ? grid.dataset.caseBase : "projects/";

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  }

  const badgeIcons = {
    "Featured Project": "⭐",
    "Personal Project": "🎮",
    "Graduation": "🎓",
    "Company Project": "🏢",
    "Coming Soon": "🕐",
    "In Google Play Review": "🕐",
  };

  // Unreleased badges: no "Live" chip, dashed neutral pill instead.
  const UNRELEASED = ["Coming Soon", "In Google Play Review"];

  // Cards without their own `accent_color` (the app's own brand colour, set
  // per project in /admin) fall back to HSM Blue — same value as --hsm-blue.
  const HSM_BLUE = "#0A6EF5";

  // Note: .proj-x-* and #proj-grid styles are declared statically in styles.css
  // for performance, CSP compliance, and prevention of flash of unstyled content (FOUC).

  function renderCompactCard(p, i, color) {
    const badgeLabel = p.badge || "Personal Project";
    const badgeIcon = badgeIcons[badgeLabel] || "📱";
    const isComingSoon = UNRELEASED.includes(p.badge);
    const isLive = !isComingSoon && !!(p.links && (p.links.app_store || p.links.google_play));

    const iconBox = p.icon
      ? `<img src="${ICON_BASE}${escapeHtml(p.icon)}" alt="${escapeHtml(p.name || '')} icon" loading="lazy" style="width:100%;height:100%;object-fit:contain;border-radius:12px"/>`
      : `<span style="font-family:'Fraunces',serif;font-size:1.3rem;font-weight:700;color:${color}">${escapeHtml((p.name || "?").charAt(0))}</span>`;

    const techTags = (p.tech_tags || []).slice(0, 5).map(t => `<span>${escapeHtml(t.tag || t)}</span>`).join("");

    const links = p.links || {};
    const storeLinks = [
      links.github ? `<a href="${escapeHtml(links.github)}" target="_blank" class="pl pl-store">GitHub ↗</a>` : "",
      links.app_store ? `<a href="${escapeHtml(links.app_store)}" target="_blank" class="pl pl-store">App Store ↗</a>` : "",
      links.google_play ? `<a href="${escapeHtml(links.google_play)}" target="_blank" class="pl pl-store">Google Play ↗</a>` : "",
    ].join("");

    const href = `${CASE_BASE}${encodeURIComponent(p.slug)}/`;

    return `
    <div class="proj-x-card" style="--dot:${color};animation-delay:${i * 0.05}s">
      <div class="proj-x-visual" style="background:${color};background-image:radial-gradient(circle,rgba(255,255,255,.18) 1px,transparent 1px)">
        <span class="proj-x-idx">${String(i + 1).padStart(2, "0")}</span>
        <div class="proj-x-icon">${iconBox}</div>
        <span class="proj-x-live">${isComingSoon ? `🕐 ${escapeHtml(p.badge)}` : (isLive ? "🟢 Live" : "✓ Delivered")}</span>
      </div>
      <div class="proj-x-body">
        <div class="proj-x-badge${isComingSoon ? " is-soon" : ""}">${badgeIcon} ${escapeHtml(badgeLabel)}</div>
        <div class="proj-x-nm">${escapeHtml(p.name || "")}</div>
        <div class="proj-x-cat">${escapeHtml(p.category || "")}${p.period ? ` · ${escapeHtml(p.period)}` : ""}</div>
        <p class="proj-x-desc">${escapeHtml(p.short_description || "")}</p>
        ${techTags ? `<div class="proj-x-tech">${techTags}</div>` : ""}
        <div class="proj-x-links">
          <a href="${href}" class="pl pl-case">📄 Read Case Study</a>
          ${storeLinks}
        </div>
      </div>
    </div>`;
  }

  function renderHeroCard(p, color) {
    const links = p.links || {};
    const isLive = !!(links.app_store || links.google_play);
    const iconBox = p.icon
      ? `<img src="${ICON_BASE}${escapeHtml(p.icon)}" alt="${escapeHtml(p.name || '')} icon" loading="lazy" style="width:100%;height:100%;object-fit:contain;border-radius:18px"/>`
      : `<span style="font-family:'Fraunces',serif;font-size:1.8rem;font-weight:700;color:${color}">${escapeHtml((p.name || "?").charAt(0))}</span>`;

    const topBadges = (p.tech_tags || []).slice(0, 4).map(t => {
      const tag = t.tag || t;
      return `<span style="background:rgba(255,255,255,.15);color:#fff;font-size:.62rem;font-weight:700;padding:.2rem .6rem;border-radius:100px;border:1px solid rgba(255,255,255,.25)">${escapeHtml(tag)}</span>`;
    }).join("");

    const techTags = (p.tech_tags || []).slice(0, 8).map(t => `<span>${escapeHtml(t.tag || t)}</span>`).join("");

    const storeLinks = [
      links.github ? `<a href="${escapeHtml(links.github)}" target="_blank" class="pl pl-store">GitHub ↗</a>` : "",
      links.app_store ? `<a href="${escapeHtml(links.app_store)}" target="_blank" class="pl pl-store">App Store ↗</a>` : "",
      links.google_play ? `<a href="${escapeHtml(links.google_play)}" target="_blank" class="pl pl-store">Google Play ↗</a>` : "",
    ].join("");

    const href = `${CASE_BASE}${encodeURIComponent(p.slug)}/`;

    return `
    <div class="proj-card proj-feat proj-feat-hero">
      <div class="feat-visual" style="background:${color};background-image:radial-gradient(circle,rgba(255,255,255,.15) 1px,transparent 1px);background-size:20px 20px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;padding:2rem">
          <div style="width:80px;height:80px;background:#ffffff;border-radius:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(0,0,0,.25);overflow:hidden">
            ${iconBox}
          </div>
          ${topBadges ? `<div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center">${topBadges}</div>` : ""}
          <div style="display:flex;gap:1.5rem;margin-top:.5rem">
            <div style="text-align:center">
              <div style="font-family:'Fraunces',serif;font-size:1.5rem;font-weight:700;color:#fff;line-height:1">${isLive ? "Live" : "Delivered"}</div>
              <div style="font-size:.6rem;color:rgba(255,255,255,.7);margin-top:.15rem">${isLive ? "on stores" : "successfully"}</div>
            </div>
            <div style="width:1px;background:rgba(255,255,255,.25)"></div>
            <div style="text-align:center">
              <div style="font-family:'Fraunces',serif;font-size:1.5rem;font-weight:700;color:#fff;line-height:1">iOS+</div>
              <div style="font-size:.6rem;color:rgba(255,255,255,.7);margin-top:.15rem">Android</div>
            </div>
          </div>
        </div>
      </div>
      <div class="proj-body">
        <div class="proj-header" style="padding:1.65rem 1.65rem 0;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.8rem">
          <span style="font-family:'Geist Mono',monospace;font-size:.62rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase">Featured Project</span>
          ${isLive ? `<span class="live-pill">Live App</span>` : ""}
        </div>
        <div style="padding:0 1.65rem 1.65rem;flex:1;display:flex;flex-direction:column">
          <div class="proj-nm" style="font-size:1.5rem">${escapeHtml(p.name || "")}</div>
          <div class="proj-cat">${escapeHtml(p.category || "")}</div>
          <p class="proj-desc">${escapeHtml(p.short_description || "")}</p>
          ${techTags ? `<div class="proj-tech">${techTags}</div>` : ""}
          <div class="proj-links">
            <a href="${href}" class="pl pl-case">📄 Read Case Study</a>
            ${storeLinks}
          </div>
        </div>
      </div>
    </div>`;
  }

  try {
    const allProjects = await SiteData.fetchAllProjects();

    if (!allProjects.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;font-family:'Geist Mono',monospace;color:var(--muted)">No projects yet — add one from /admin</div>`;
      return;
    }

    const limit = parseInt(grid.dataset.limit || "0", 10);
    const showLimited = limit > 0 && allProjects.length > limit;
    const projects = showLimited ? allProjects.slice(0, limit) : allProjects;

    let html = projects.map((p, i) => {
      const color = p.accent_color || HSM_BLUE;
      if (p.badge === "Featured Project") {
        return renderHeroCard(p, p.accent_color || HSM_BLUE);
      }
      return renderCompactCard(p, i, color);
    }).join("");

    if (showLimited) {
      const remaining = allProjects.length - limit;
      html += `
        <a href="${CASE_BASE}all-projects.html" class="proj-x-card" style="align-items:center;justify-content:center;text-decoration:none;min-height:280px;border:2px dashed var(--border,rgba(0,0,0,.12));background:transparent;box-shadow:none">
          <div style="text-align:center;padding:2rem">
            <div style="font-size:1.9rem;margin-bottom:.6rem">＋${remaining}</div>
            <div style="font-family:'Fraunces',serif;font-size:1.15rem;font-weight:700;color:var(--text,#111);margin-bottom:.3rem">See all projects</div>
            <div style="font-size:.8rem;color:var(--muted)">${allProjects.length} shipped and counting</div>
          </div>
        </a>`;
    }

    grid.innerHTML = html;
    // Same tick as the insert, so nothing paints before the reveal classes land
    if (window.SiteFX) window.SiteFX.applyReveals(grid);
  } catch (e) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;font-family:'Geist Mono',monospace;color:var(--muted)">Couldn't load projects (${escapeHtml(e.message)})</div>`;
  }
})();
