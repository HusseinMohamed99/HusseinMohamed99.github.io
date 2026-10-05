# Projects and screenshots

Case studies live in `data/projects/<slug>.md`. Edit them in the dashboard (`/admin/`) or by
hand. Dashboard saves commit straight to `main`, and `.github/workflows/build-site-data.yml`
then regenerates `data/projects/index.json` and `sitemap.xml`. After a hand edit, run
`node scripts/build-site-data.js` yourself. Never edit those two generated files directly.

## Arabic screenshots

Each item in `mockups` can carry an Arabic version of the same screen:

```yaml
mockups:
  - image: images/<folder>/home.png        # English, required
    caption: Home                           # English, required
    image_ar: images/<folder>/ar/home.png   # optional
    caption_ar: الرئيسية                    # optional
```

- **When the switch appears:** the case study shows an English | العربية switch above the
  screenshots as soon as one item has `image_ar`. Without it the page renders exactly as
  before: no switch, no layout change.
- **Fallback:** an item without `image_ar` shows its English screenshot in Arabic mode, and
  one without `caption_ar` keeps its English caption. If an Arabic file fails to load, the
  page falls back to the English one instead of showing a broken image.
- **Behaviour:** English by default. The choice is remembered per browser, and
  `?lang=ar` in the URL opens the Arabic set (for deep links). The zoomed view follows the switch.
- **Naming:** put the Arabic file in an `ar/` folder next to the English one, using the same
  filename (`images/<folder>/en/x.png` → `images/<folder>/ar/x.png`, or
  `images/<folder>/x.png` → `images/<folder>/ar/x.png`).
- **Dashboard:** the "Screenshot — Arabic" field uploads into `images/<upload folder>/ar/`
  for you, so nothing else is needed.
- **Image shape:** the page draws each screenshot inside a 9:19.5 phone frame and crops to
  fill it. Raw phone screenshots fit as they are. Store graphics that already contain a
  phone frame or a headline look wrong in it, so use plain screens.

## Where dashboard uploads land

`media_folder: "/images/{{slug}}"` uses the slug of the project's **name**, not the
filename: a project named `StudyFlow (مذاكرتي)` uploads to `images/studyflow-مذاكرتي/`.
Files added by hand can live anywhere under `images/`, because each `.md` stores the full
path. A project's hand-added and dashboard-added images can therefore end up in two different
folders. Both work.
