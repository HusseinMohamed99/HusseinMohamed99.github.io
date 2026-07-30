---
name: "Quran Kareem"
category: "Islamic · Offline-First"
badge: "Personal Project"
short_description: "A focused, single-purpose reading app — full Arabic Quran text with verse-by-verse navigation and bookmarks, built to work fully offline once installed."
icon: "images/quran-kareem/logo.svg"
order: 8
overview: |
  Quran Kareem is a focused, single-purpose reading app — full Arabic Quran text with verse-by-verse navigation and bookmarks, built to work fully offline once installed.
stats:
  - number: "Offline"
    label: "Full Quran text cached via Hive"
  - number: "Bilingual"
    label: "Arabic reading experience, English UI"
  - number: "Focused"
    label: "Single-purpose app, no distractions"
capabilities:
  - icon: "📗"
    title: "Verse-by-verse navigation"
    description: "Jump directly to a Surah and Ayah without scrolling through the entire text."
  - icon: "🔖"
    title: "Bookmarks"
    description: "Save a reading position and return to it instantly."
  - icon: "📴"
    title: "Offline-first"
    description: "Hive stores the full text locally, so the app works the same with or without a connection."
architecture_text: |
  Where the other apps in this portfolio lean on remote APIs, Quran Kareem is intentionally offline-first: the Quran text ships with the app and lives in Hive, so there's no loading spinner between opening the app and reading. Localization covers the surrounding UI while the Quran text itself stays in Arabic.
architecture_flow:
  - step: "UI"
  - step: "Hive (bundled Quran text)"
  - step: "SharedPreferences (bookmarks)"
mockups: []
challenges: []
tech_tags:
  - tag: "Flutter"
  - tag: "Hive"
  - tag: "Localization"
  - tag: "SharedPreferences"
links:
  github: "https://github.com/HusseinMohamed99/Quran_Kareem"
---
