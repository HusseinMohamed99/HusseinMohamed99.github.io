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

  try {
    const projects = await SiteData.fetchAllProjects();

    if (!projects.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;font-family:'Geist Mono',monospace;color:var(--muted)">No projects yet — add one from /admin</div>`;
      return;
    }

    grid.innerHTML = projects.map(p => {
      const icon = p.icon
        ? `<img src="${escapeHtml(p.icon)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;border-radius:9px"/>`
        : "📱";
      const badgeLabel = p.badge || "Personal Project";
      const badgeIcon = badgeIcons[badgeLabel] || "📱";
      const techTags = (p.tech_tags || []).slice(0, 5).map(t => `<span>${escapeHtml(t.tag || t)}</span>`).join("");
      const href = `projects/project.html?slug=${encodeURIComponent(p.slug)}`;

      return `
      <div class="proj-card">
        <div class="proj-header">
          <div class="proj-ico" style="background:#fff;padding:2px">${icon}</div>
          <span class="dl-pill">${badgeIcon} ${escapeHtml(badgeLabel)}</span>
        </div>
        <div class="proj-body">
          <div class="proj-nm">${escapeHtml(p.name || "")}</div>
          <div class="proj-cat">${escapeHtml(p.category || "")}</div>
          <p class="proj-desc">${escapeHtml(p.short_description || "")}</p>
          <div class="proj-tech">${techTags}</div>
          <div class="proj-links">
            <a href="${href}" class="pl pl-case">📄 Read Case Study</a>
            ${p.links && p.links.github ? `<a href="${escapeHtml(p.links.github)}" target="_blank" class="pl pl-store">GitHub ↗</a>` : ""}
          </div>
        </div>
      </div>`;
    }).join("");
  } catch (e) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;font-family:'Geist Mono',monospace;color:var(--muted)">Couldn't load projects (${escapeHtml(e.message)})</div>`;
  }
})();
