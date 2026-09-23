# Privacy policies

Every app's policy lives here, one directory per app, so there is a single place
to link from a store listing and a single place to check when something changes.

## Adding one

1. `cp -r _template <slug>` — then replace every `TODO` in `index.html`.
   Keep `privacy-policy.html` only if a store listing points at that filename;
   delete it otherwise.
2. **Source the English from the app repo, never from an older published page.**
   If the app bundles its own policy text (Refqa renders `docs/privacy-policy.md`
   in-app), that bundled file is canonical and this page is generated from it —
   a hand copy in a second repo is how the published Refqa policy silently lost
   a whole section.
3. **Verify each claim against the built artifact** — the merged manifest's
   permissions, the dependency list, the network config — not against what the
   last version of the page said. A compliance statement is a claim about the
   artifact.
4. **Anything translated gets read before it is written.** New or merged Arabic
   goes into a side-by-side preview for a word-for-word pass first; it is not
   written straight to the file.
5. Register it in `index.html` — name, one line on what the app is, one line on
   what its policy actually says.
6. Point the store console's privacy-policy URL at
   `https://husseinmohamed99.github.io/privacy/<slug>/`. **This is manual**, in
   App Store Connect and Play Console, and a redirect from an old URL does not
   do it.

## House rules

- One self-contained HTML file per page: inline `<style>`, no shared stylesheet.
  A store reviewer's fetch has to render with nothing else available.
- Both languages live in one page, in `#policy-en` and `#policy-ar`, switched by
  the inline script. One URL per policy.
- Brand tokens are the portfolio's: HSM Blue `#0A6EF5`, Fraunces / Cabinet
  Grotesk / Geist Mono, light and dark. These pages are one identity, not four
  app brands. Every page carries the HSM mark and wordmark in a sticky top bar,
  the full lockup in the footer, and a gradient masthead.
- **Cabinet Grotesk comes from Fontshare, not Google Fonts.** The original pages
  requested it from `fonts.googleapis.com`, which 400s, so they silently rendered
  in system sans. After any change to the font links, confirm the faces actually
  loaded rather than that the markup looks right:
  `[...document.fonts].filter(f => f.status === 'loaded').map(f => f.family)`
- Never delete a published URL. `studyflow-ar/` and `x5-fitness/privacy-policy.html`
  are redirect stubs for exactly this reason — both were live and indexed.
