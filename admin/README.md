# Projects and screenshots

Case studies live in `data/projects/<slug>.md`. Edit them in the dashboard (`/admin/`) or by
hand. Dashboard saves commit straight to `main`, and `.github/workflows/build-site-data.yml`
then regenerates `data/projects/index.json` and `sitemap.xml`. After a hand edit, run
`node scripts/build-site-data.js` yourself. Never edit those two generated files directly.

## Screenshot variants: Arabic and dark

Each item in `mockups` can carry up to three extra versions of the same screen:

```yaml
mockups:
  - image: images/<folder>/home.png              # English, light (required)
    caption: Home                                 # English (required)
    image_dark: images/<folder>/dark/home.png     # English, dark (optional)
    image_ar: images/<folder>/ar/home.png         # Arabic, light (optional)
    image_ar_dark: images/<folder>/ar/dark/home.png  # Arabic, dark (optional)
    caption_ar: الرئيسية                          # optional
```

- **When the switches appear:** an English | العربية switch appears above the screenshots
  as soon as one item has `image_ar` or `image_ar_dark`. A Light | Dark switch (sun / moon)
  appears as soon as one item has `image_dark` or `image_ar_dark`. Without those fields the
  page renders exactly as before: no switch, no layout change.
- **Fallback:** for the chosen language and theme the page uses the first image that exists:
  (language, theme) → (language, light) → (English, theme) → (English, light). So a missing
  dark shot shows the light one, and a missing Arabic shot shows the English one. A file
  that fails to load falls back along the same chain instead of showing a broken image. An
  item without `caption_ar` keeps its English caption.
- **Language:** English by default. The choice is remembered per browser.
- **Theme:** follows the site's own light/dark toggle until the visitor uses the screenshot
  switch. From then on their choice wins and is remembered per browser.
- **Deep links:** `?lang=ar` opens the Arabic set and `?theme=dark` the dark set; they
  combine (`project.html?slug=<slug>&lang=ar&theme=dark`). The zoomed view follows both
  switches.
- **Naming:** keep the same filename and put the variant in a subfolder next to the English
  light file: `dark/` for English dark, `ar/` for Arabic light, `ar/dark/` for Arabic dark
  (`images/<folder>/en/x.png` → `images/<folder>/en/dark/x.png`, `images/<folder>/ar/x.png`,
  `images/<folder>/ar/dark/x.png`).
- **Dashboard:** the "Screenshot — Dark", "Screenshot — Arabic" and "Screenshot — Arabic,
  dark" fields upload into `dark/`, `ar/` and `ar/dark/` under the upload folder for you,
  so nothing else is needed.
- **Image shape:** the page draws each screenshot inside a 9:19.5 phone frame and crops to
  fill it. Raw phone screenshots fit as they are. Captures without a status bar, or with a
  different ratio, should be padded to 9:19.5 using the screen's own edge colour (a dark
  shot's own dark colour), so the frame's camera dot sits on a plain strip. Store graphics
  that already contain a phone frame or a headline look wrong in it, so use plain screens.

## Where dashboard uploads land

`media_folder: "/images/{{slug}}"` uses the slug of the project's **name**, not the
filename: a project named `StudyFlow (مذاكرتي)` uploads to `images/studyflow-مذاكرتي/`.
Files added by hand can live anywhere under `images/`, because each `.md` stores the full
path. A project's hand-added and dashboard-added images can therefore end up in two different
folders. Both work.
