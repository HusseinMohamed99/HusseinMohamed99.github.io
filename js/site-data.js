/**
 * site-data.js
 * Loads project data written by the Decap CMS dashboard (data/projects/*.md)
 * directly from GitHub — no build step needed for GitHub Pages.
 *
 * Depends on js/js-yaml.min.js being loaded on the page BEFORE this script
 * (self-hosted, no external CDN calls at runtime).
 */
(function (window) {
  const REPO = "HusseinMohamed99/HusseinMohamed99.github.io";
  const BRANCH = "main";
  const DATA_DIR = "data/projects";

  const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DATA_DIR}`;
  const LIST_URL = `https://api.github.com/repos/${REPO}/contents/${DATA_DIR}?ref=${BRANCH}`;

  function parseFrontmatter(raw) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!match) return { data: {}, body: raw };
    if (!window.jsyaml) {
      throw new Error("js-yaml not loaded — make sure js/js-yaml.min.js is included before site-data.js");
    }
    const data = window.jsyaml.load(match[1]) || {};
    return { data, body: (match[2] || "").trim() };
  }

  async function listProjectFiles() {
    const res = await fetch(LIST_URL);
    if (res.status === 404) return []; // folder doesn't exist yet — no projects created
    if (!res.ok) throw new Error("Could not list data/projects (HTTP " + res.status + ")");
    const files = await res.json();
    return files
      .filter((f) => f.name.endsWith(".md"))
      .map((f) => ({ name: f.name, slug: f.name.replace(/\.md$/, "") }));
  }

  async function fetchProject(slug) {
    const res = await fetch(`${RAW_BASE}/${slug}.md`, { cache: "no-store" });
    if (!res.ok) throw new Error("Project not found: " + slug + " (HTTP " + res.status + ")");
    const raw = await res.text();
    const { data, body } = parseFrontmatter(raw);
    return { slug, ...data, body };
  }

  async function fetchAllProjects() {
    const files = await listProjectFiles();
    const projects = await Promise.all(
      files.map(async (f) => {
        const res = await fetch(`${RAW_BASE}/${f.name}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch " + f.name + " (HTTP " + res.status + ")");
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
