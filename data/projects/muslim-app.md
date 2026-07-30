---
name: Muslim App
category: Islamic Lifestyle · Google Play
badge: Personal Project
short_description: All-in-one Islamic app with Quran, Hadith, Azkar, Zakat
  calculator, and prayer tools. Published on Google Play with bilingual AR/EN
  support, light & dark themes, and Firebase sync for cross-device data.
icon: images/muslim-app/muslim_icon.png
order: 6
overview: >
  Muslim App bundles the daily tools a practicing Muslim reaches for most —
  Quran, Hadith, Azkar, and a Zakat calculator — into one bilingual app with
  Firebase sync, so a user's saved bookmarks and settings follow them across
  devices.
stats:
  - number: 4-in-1
    label: Quran, Hadith, Azkar & Zakat in one app
  - number: AR / EN
    label: Fully bilingual with light & dark themes
  - number: Synced
    label: Firebase-backed cross-device data
capabilities:
  - icon: 📖
    title: Quran & Hadith
    description: Full text browsing with a clean, distraction-free reading layout.
  - icon: 🕋
    title: Azkar
    description: Daily remembrance texts organized by time of day and occasion.
  - icon: 🧮
    title: Zakat calculator
    description: Walks a user through their assets to calculate what's due, without
      needing outside tools.
  - icon: 🔄
    title: Cross-device sync
    description: Firebase keeps bookmarks and preferences consistent whether a user
      opens the app on their phone or a new device.
architecture_text: >
  Prayer tools and reading progress are stored locally first via
  SharedPreferences for instant access, with Firebase syncing that state in the
  background so nothing is lost on a new install. Localization covers every
  screen in Arabic and English, and both light and dark themes were designed
  rather than left as a default toggle.
architecture_flow:
  - step: UI
  - step: Local cache (SharedPreferences)
  - step: Firebase sync
banner: images/muslim-app/muslim-cover.png
mockups:
  - image: /images/uploads/275237644-999b5948-7976-4e3d-a23b-e4054bce0db1.png
    caption: Splash Light
  - image: /images/uploads/275237714-869fb410-7843-40e6-91e8-f99c19d4f5bc.png
    caption: Quran List
  - image: /images/uploads/275237809-0d81fb42-5199-40b9-934d-a8d4ce42fa9b.png
    caption: Sura
  - image: /images/uploads/275237917-e12eddc6-505d-4cbc-8d34-e3a456a3184d.png
    caption: Hadith List
  - image: /images/uploads/275237675-d6828593-5b06-4669-81d8-678087c81ca2.png
    caption: Splash Dark
  - image: /images/uploads/275237750-745b340d-6b27-42b8-9940-df363609ce63.png
    caption: Quran List Dark
  - image: /images/uploads/275237825-810ac246-8976-4532-815c-1454f16f2961.png
    caption: Sura Dark
challenges: []
tech_tags:
  - tag: Flutter
  - tag: Firebase
  - tag: Localization
  - tag: SharedPreferences
links:
  github: https://github.com/HusseinMohamed99/Muslim
---
