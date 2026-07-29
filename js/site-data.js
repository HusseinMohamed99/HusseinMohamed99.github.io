/**
 * site-data.js
 * Loads project data written by the Decap CMS dashboard (data/projects/*.md)
 * directly from GitHub — no build step needed for GitHub Pages.
 */
(function (window) {
  const REPO = "HusseinMohamed99/HusseinMohamed99.github.io";
  const BRANCH = "main";
  const DATA_DIR = "data/projects";

  const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DATA_DIR}`;
  const LIST_URL = `https://api.github.com/repos/${REPO}/contents/${DATA_DIR}?ref=${BRANCH}`;

  // Minimal YAML frontmatter parser (loads js-yaml from CDN if not present)
  function ensureYamlLib() {
    if (window.jsyaml) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.umd.min.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function parseFrontmatter(raw) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!match) return { data: {}, body: raw };
    const data = window.jsyaml.load(match[1]) || {};
    return { data, body: (match[2] || "").trim() };
  }

  async function listProjectFiles() {
    const res = await fetch(LIST_URL);
    if (!res.ok) throw new Error("Could not list data/projects (" + res.status + ")");
    const files = await res.json();
    return files
      .filter((f) => f.name.endsWith(".md"))
      .map((f) => ({ name: f.name, slug: f.name.replace(/\.md$/, "") }));
  }

  async function fetchProject(slug) {
    const res = await fetch(`${RAW_BASE}/${slug}.md`, { cache: "no-store" });
    if (!res.ok) throw new Error("Project not found: " + slug);
    const raw = await res.text();
    await ensureYamlLib();
    const { data, body } = parseFrontmatter(raw);
    return { slug, ...data, body };
  }

  async function fetchAllProjects() {
    const files = await listProjectFiles();
    await ensureYamlLib();
    const projects = await Promise.all(
      files.map(async (f) => {
        const res = await fetch(`${RAW_BASE}/${f.name}`, { cache: "no-store" });
        const raw = await res.text();
        const { data, body } = parseFrontmatter(raw);
        return { slug: f.slug, ...data, body };
      })
    );
    projects.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return projects;
  }

  window.SiteData = { fetchAllProjects, fetchProject };
})(window);
