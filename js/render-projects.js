(async function () {
  const grid = document.getElementById("proj-grid");
  if (!grid) return;

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  }

  const badgeIcons = {
    "Featured Project": "⭐",
    "Personal Project": "🎮",
    "Graduation": "🎓",
    "Company Project": "🏢",
  };

  // Creative accent palette — cycles per card unless a project sets its own accent_color
  const PALETTE = ["#1D5CFF", "#0EA5E9", "#7C3AED", "#059669", "#DB2777", "#D97706", "#0F766E", "#DC2626"];

  try {
    const projects = await SiteData.fetchAllProjects();

    if (!projects.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;font-family:'Geist Mono',monospace;color:var(--muted)">No projects yet — add one from /admin</div>`;
      return;
    }

    grid.innerHTML = projects.map((p, i) => {
      const color = p.accent_color || PALETTE[i % PALETTE.length];
      const badgeLabel = p.badge || "Personal Project";
      const badgeIcon = badgeIcons[badgeLabel] || "📱";
      const isLive = !!(p.links && (p.links.app_store || p.links.google_play));

      const iconBox = p.icon
        ? `<img src="${escapeHtml(p.icon)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;border-radius:18px"/>`
        : `<span style="font-family:'Fraunces',serif;font-size:1.8rem;font-weight:700;color:${color}">${escapeHtml((p.name || "?").charAt(0))}</span>`;

      const topBadges = (p.tech_tags || []).slice(0, 4).map(t => {
        const tag = t.tag || t;
        return `<span style="background:rgba(255,255,255,.15);color:#fff;font-size:.62rem;font-weight:700;padding:.2rem .6rem;border-radius:100px;border:1px solid rgba(255,255,255,.25)">${escapeHtml(tag)}</span>`;
      }).join("");

      const techTags = (p.tech_tags || []).slice(0, 6).map(t => `<span>${escapeHtml(t.tag || t)}</span>`).join("");

      const links = p.links || {};
      const storeLinks = [
        links.github ? `<a href="${escapeHtml(links.github)}" target="_blank" class="pl pl-store">GitHub ↗</a>` : "",
        links.app_store ? `<a href="${escapeHtml(links.app_store)}" target="_blank" class="pl pl-store">App Store ↗</a>` : "",
        links.google_play ? `<a href="${escapeHtml(links.google_play)}" target="_blank" class="pl pl-store">Google Play ↗</a>` : "",
      ].join("");

      const href = `projects/project.html?slug=${encodeURIComponent(p.slug)}`;

      return `
      <div class="proj-card proj-feat">
        <div class="feat-visual" style="background:${color};background-image:radial-gradient(circle,rgba(255,255,255,.15) 1px,transparent 1px);background-size:20px 20px">
          <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;padding:2rem">
            <div style="width:80px;height:80px;background:#ffffff;border-radius:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(0,0,0,.25);overflow:hidden">
              ${iconBox}
            </div>
            ${topBadges ? `<div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center">${topBadges}</div>` : ""}
            <div style="display:flex;gap:1.5rem;margin-top:.5rem">
              <div style="text-align:center">
                <div style="font-family:'Fraunces',serif;font-size:1.5rem;font-weight:700;color:#fff;line-height:1">${isLive ? "Live" : "Shipped"}</div>
                <div style="font-size:.6rem;color:rgba(255,255,255,.7);margin-top:.15rem">${isLive ? "on stores" : "& delivered"}</div>
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
            <span style="font-family:'Geist Mono',monospace;font-size:.62rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase">${badgeIcon} ${escapeHtml(badgeLabel)}</span>
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
    }).join("");
  } catch (e) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;font-family:'Geist Mono',monospace;color:var(--muted)">Couldn't load projects (${escapeHtml(e.message)})</div>`;
  }
})();
