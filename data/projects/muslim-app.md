---
name: "Muslim App"
category: "Islamic Lifestyle · Google Play"
badge: "Personal Project"
short_description: "All-in-one Islamic app with Quran, Hadith, Azkar, Zakat calculator, and prayer tools. Published on Google Play with bilingual AR/EN support, light & dark themes, and Firebase sync for cross-device data."
icon: "images/muslim-app/muslim_icon.png"
order: 6
overview: |
  Muslim App bundles the daily tools a practicing Muslim reaches for most — Quran, Hadith, Azkar, and a Zakat calculator — into one bilingual app with Firebase sync, so a user's saved bookmarks and settings follow them across devices.
stats:
  - number: "4-in-1"
    label: "Quran, Hadith, Azkar & Zakat in one app"
  - number: "AR / EN"
    label: "Fully bilingual with light & dark themes"
  - number: "Synced"
    label: "Firebase-backed cross-device data"
capabilities:
  - icon: "📖"
    title: "Quran & Hadith"
    description: "Full text browsing with a clean, distraction-free reading layout."
  - icon: "🕋"
    title: "Azkar"
    description: "Daily remembrance texts organized by time of day and occasion."
  - icon: "🧮"
    title: "Zakat calculator"
    description: "Walks a user through their assets to calculate what's due, without needing outside tools."
  - icon: "🔄"
    title: "Cross-device sync"
    description: "Firebase keeps bookmarks and preferences consistent whether a user opens the app on their phone or a new device."
architecture_text: |
  Prayer tools and reading progress are stored locally first via SharedPreferences for instant access, with Firebase syncing that state in the background so nothing is lost on a new install. Localization covers every screen in Arabic and English, and both light and dark themes were designed rather than left as a default toggle.
architecture_flow:
  - step: "UI"
  - step: "Local cache (SharedPreferences)"
  - step: "Firebase sync"
mockups: []
video: "videos/muslim-app/demo.mp4"
challenges: []
tech_tags:
  - tag: "Flutter"
  - tag: "Firebase"
  - tag: "Localization"
  - tag: "SharedPreferences"
links:
  github: "https://github.com/HusseinMohamed99/Muslim"
---
