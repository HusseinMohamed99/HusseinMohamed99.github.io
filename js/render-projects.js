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

  const PALETTE = ["#1D5CFF", "#0EA5E9", "#7C3AED", "#059669", "#DB2777", "#D97706", "#0F766E", "#DC2626"];

  // Inject our own compact card styles once (self-contained, doesn't touch styles.css)
  if (!document.getElementById("proj-x-styles")) {
    const style = document.createElement("style");
    style.id = "proj-x-styles";
    style.textContent = `
      .proj-x-card{
        display:flex;flex-direction:column;
        border-radius:20px;overflow:hidden;
        background:var(--card-bg,#fff);
        border:1px solid var(--border,rgba(0,0,0,.06));
        box-shadow:0 1px 2px rgba(0,0,0,.04);
        transition:transform .2s ease, box-shadow .2s ease;
        height:100%;
      }
      .proj-x-card:hover{
        transform:translateY(-4px);
        box-shadow:0 16px 32px -8px rgba(0,0,0,.16);
      }
      .proj-x-visual{
        position:relative;
        height:120px;
        display:flex;align-items:center;justify-content:space-between;
        padding:1.1rem 1.3rem;
        background-size:16px 16px;
      }
      .proj-x-icon{
        width:52px;height:52px;border-radius:14px;background:#fff;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 6px 18px rgba(0,0,0,.2);overflow:hidden;flex:0 0 auto;
      }
      .proj-x-live{
        font-family:'Geist Mono',monospace;font-size:.62rem;font-weight:700;
        color:#fff;background:rgba(255,255,255,.18);
        border:1px solid rgba(255,255,255,.3);
        padding:.25rem .6rem;border-radius:100px;white-space:nowrap;
      }
      .proj-x-body{padding:1.3rem 1.4rem 1.5rem;display:flex;flex-direction:column;flex:1}
      .proj-x-badge{
        font-family:'Geist Mono',monospace;font-size:.6rem;letter-spacing:.06em;
        text-transform:uppercase;color:var(--muted);margin-bottom:.5rem;
      }
      .proj-x-nm{font-family:'Fraunces',serif;font-size:1.25rem;font-weight:700;line-height:1.15;margin-bottom:.2rem}
      .proj-x-cat{font-size:.78rem;color:var(--muted);margin-bottom:.7rem}
      .proj-x-desc{font-size:.85rem;line-height:1.55;color:var(--text-secondary,#555);margin-bottom:1rem;flex:1;
        display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
      .proj-x-tech{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:1.1rem}
      .proj-x-tech span{
        font-family:'Geist Mono',monospace;font-size:.65rem;
        border:1px solid var(--border,rgba(0,0,0,.1));
        color:var(--muted);padding:.2rem .55rem;border-radius:100px;
      }
      .proj-x-links{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:auto}
    `;
    document.head.appendChild(style);
  }

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
        ? `<img src="${escapeHtml(p.icon)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;border-radius:12px"/>`
        : `<span style="font-family:'Fraunces',serif;font-size:1.3rem;font-weight:700;color:${color}">${escapeHtml((p.name || "?").charAt(0))}</span>`;

      const techTags = (p.tech_tags || []).slice(0, 5).map(t => `<span>${escapeHtml(t.tag || t)}</span>`).join("");

      const links = p.links || {};
      const storeLinks = [
        links.github ? `<a href="${escapeHtml(links.github)}" target="_blank" class="pl pl-store">GitHub ↗</a>` : "",
        links.app_store ? `<a href="${escapeHtml(links.app_store)}" target="_blank" class="pl pl-store">App Store ↗</a>` : "",
        links.google_play ? `<a href="${escapeHtml(links.google_play)}" target="_blank" class="pl pl-store">Google Play ↗</a>` : "",
      ].join("");

      const href = `projects/project.html?slug=${encodeURIComponent(p.slug)}`;

      return `
      <div class="proj-x-card">
        <div class="proj-x-visual" style="background:${color};background-image:radial-gradient(circle,rgba(255,255,255,.18) 1px,transparent 1px)">
          <div class="proj-x-icon">${iconBox}</div>
          <span class="proj-x-live">${isLive ? "🟢 Live" : "✓ Shipped"}</span>
        </div>
        <div class="proj-x-body">
          <div class="proj-x-badge">${badgeIcon} ${escapeHtml(badgeLabel)}</div>
          <div class="proj-x-nm">${escapeHtml(p.name || "")}</div>
          <div class="proj-x-cat">${escapeHtml(p.category || "")}</div>
          <p class="proj-x-desc">${escapeHtml(p.short_description || "")}</p>
          ${techTags ? `<div class="proj-x-tech">${techTags}</div>` : ""}
          <div class="proj-x-links">
            <a href="${href}" class="pl pl-case">📄 Read Case Study</a>
            ${storeLinks}
          </div>
        </div>
      </div>`;
    }).join("");
  } catch (e) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;font-family:'Geist Mono',monospace;color:var(--muted)">Couldn't load projects (${escapeHtml(e.message)})</div>`;
  }
})();
