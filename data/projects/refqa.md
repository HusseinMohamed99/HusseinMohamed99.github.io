---
name: Refqa (رِفقة)
category: Islamic Lifestyle · Offline-First · Arabic/English
badge: Personal Project
short_description: "A comprehensive Islamic companion app: dual-mode Quran
  reading (browsable index + a full 604-page Madani Mushaf renderer), live
  Qur'an radio and per-reciter profiles, on-device speech-recognition recitation
  checking with zero audio leaving the device, per-prayer adhan and alert styles
  via a custom Kotlin AlarmManager + ForegroundService pipeline with a tilt-free
  Qibla light beam, the Prophet's ﷺ Seerah and lineage, the Ten Promised
  Paradise, the 99 Names of Allah, Hadith, Tafsir, Duas, khatm tracking,
  streaks, and a full stats dashboard with time-spent-per-category tracking —
  all privacy-first, with location and PII scrubbed before any crash report."
icon: images/refqa/refqa_logo.png
order: 2
accent_color: "#2d6e96"
overview: >
  Refqa is a comprehensive Islamic companion app I designed and built end to end
  — Quran, Hadith, Tafsir, prayer times, adhan, duas, and daily spiritual
  habit-tracking, all in one bilingual (Arabic/English), offline-first Flutter
  app. It's the kind of app where "it mostly works" isn't good enough: the adhan
  has to fire at the exact second, five times a day, without launching the app
  UI, and a user's location and recitation audio can never leave their device.


  I own the full stack: the Flutter/Riverpod app layer, a custom native Kotlin pipeline for unattended background adhan playback, and every architectural decision around privacy, offline resilience, and real-device verification. Since the first release, the app has grown to cover the Prophet's ﷺ Seerah and lineage, the Ten Promised Paradise, the 99 Names of Allah, live Qur'an radio, and per-prayer alert styles — each shipped with the same bar: real-device verification, not just code review.
stats:
  - number: "604"
    label: Page Mushaf renderer with authentic RTL page-turn
  - number: 0 bytes
    label: Of recitation audio or location ever leave the device
  - number: Native
    label: Kotlin adhan pipeline, independent of the Flutter engine
capabilities:
  - icon: 📖
    title: Dual-mode Quran reading
    description: A browsable Surah/Juz'/Hizb index with search, plus a full 604-page
      Madani Mushaf renderer with authentic RTL page-swipe direction and inline
      ayah markers, multiple reciters, and khatm (completion) tracking.
  - icon: 🕌
    title: Unattended native adhan
    description: A custom Kotlin AlarmManager + ForegroundService pipeline plays the
      full call to prayer at the exact computed time — no Activity launch, no
      Flutter engine involved at fire time.
  - icon: 🎙️
    title: On-device recitation checking
    description: Tasmee' compares spoken recitation against the Quran text using
      entirely on-device speech recognition — audio never touches a server, with
      a graceful fallback message on hardware that lacks offline Arabic support.
  - icon: 🧭
    title: Prayer times & Qibla light beam
    description: Multiple calculation methods with automatic, location-aware method
      selection, plus a tilt-free light beam on the Qibla screen that points
      along the bearing as you turn — anchored to the dial's measured centre.
  - icon: 🔔
    title: Per-prayer alert styles
    description: Each of the five prayers is independently set to adhan,
      notification tone, vibrate-only, or silent, with its own muezzin — one
      notification channel per style, because Android freezes a channel's sound
      and vibration at creation and ignores every later edit.
  - icon: 📻
    title: Live Qur'an radio & reciter profiles
    description: Browse and play live Qur'an radio stations with automatic retry on
      flaky streams, or browse reciters as profiles and play any surah in a
      chosen voice — all coordinated with the adhan pipeline so only one audio
      source ever plays at a time.
  - icon: 🕋
    title: Seerah, Nasab & the Ten Promised Paradise
    description: The Prophet's ﷺ full Seerah in chapters and his lineage (Nasab) as
      a visual chain, plus profiles of the ten companions given the glad tidings
      of Paradise — the historically certain portion of the lineage visually
      distinct from the traditionally held extension.
  - icon: 📿
    title: 99 Names of Allah
    description: Asma Allah al-Husna, each with its meaning and an explanation,
      bundled offline and shareable as an image card like any verse.
  - icon: 📊
    title: Stats dashboard
    description: Range-scoped activity summaries, a time-spent-per-category donut
      breakdown, Hijri/Gregorian monthly calendars, streaks, and a GitHub-style
      contribution heatmap driven by real engagement, not just opening a screen.
  - icon: 🔎
    title: Full bilingual search
    description: One search box across surah names, verse text, and hadith, with
      number-aware jump-to (Western or Arabic-Indic digits) and
      Arabic-normalized matching that ignores diacritics and spelling variants.
  - icon: 🔒
    title: Privacy by architecture
    description: Coordinates are scrubbed before any crash report is sent; no
      accounts, no ads, no third-party analytics SDKs.
banner: images/refqa-رِفقة/refqa_cover.png
tech_tags:
  - tag: Flutter
  - tag: Riverpod
  - tag: Clean Architecture
  - tag: Freezed
  - tag: sqflite
  - tag: Kotlin (native)
  - tag: go_router
  - tag: just_audio
  - tag: audio_service
  - tag: speech_to_text
  - tag: easy_localization
  - tag: hijri
  - tag: Sentry
architecture_flow_2:
  - step: Exact AlarmManager
  - step: BroadcastReceiver
  - step: Kotlin ForegroundService
  - step: Adhan plays, no UI, no Flutter engine
architecture_text: >
  The Flutter layer follows a strict feature-first data/domain/presentation
  split, with Riverpod (freezed union states for real async lifecycles) managing
  everything above the repository boundary and sqflite backing structured local
  data. But the adhan feature couldn't live in Dart alone: Android kills the
  Flutter engine when the app isn't foregrounded, and the adhan has to fire
  exactly on time regardless. So the unattended path drops to native Kotlin
  entirely — an exact AlarmManager alarm wakes a BroadcastReceiver, which starts
  a mediaPlayback ForegroundService that reads the audio file and plays it, with
  zero Dart execution required at fire time.
architecture_flow:
  - step: Riverpod (Presentation)
  - step: Repository Interface
  - step: sqflite + REST
  - step: AlQuran.cloud / AlAdhan / Sunnah.com
mockups:
  - image: images/refqa-رِفقة/rifqa_01_home.png
    caption: الصفحة الرئيسية
  - image: images/refqa-رِفقة/rifqa_02_tasmee.png
    caption: تسميع
  - image: images/refqa-رِفقة/rifqa_05_qibla_times.png
    caption: القبلة
  - image: images/refqa-رِفقة/rifqa_10_tasbih.png
    caption: تسبيح
  - image: images/refqa-رِفقة/rifqa_15_achievements.png
    caption: الإنجازات
  - image: images/refqa-رِفقة/rifqa_07_tafsir.png
    caption: تفسير القرآن
  - image: images/refqa-رِفقة/rifqa_11_hadith.png
    caption: الأحاديث النبوية
  - image: images/refqa-رِفقة/rifqa_06_quran.png
    caption: القرآن الكريم
  - image: images/refqa-رِفقة/rifqa_09_radio.png
    caption: الراديو
  - image: images/refqa-رِفقة/rifqa_04_azkar.png
    caption: الأذكار
  - image: images/refqa-رِفقة/rifqa_03_more.png
    caption: المزيد
  - image: images/refqa-رِفقة/rifqa_12_seerah.png
    caption: السيرة النبوية
  - image: images/refqa-رِفقة/rifqa_08_qurra.png
    caption: القرأ
  - image: images/refqa-رِفقة/rifqa_13_asharah.png
    caption: العشرة المبشرون بالجنة
  - image: images/refqa-رِفقة/rifqa_14_asmaa.png
    caption: أسماء الله الحسني
challenges:
  - label: Android Resource Shrinking
    title: Notification sounds worked in debug, went silent in release
    body: R8's resource shrinker was stripping the adhan/salawat audio files from
      release APKs because they were referenced dynamically by name at runtime,
      not by a static R.raw reference the shrinker could trace. Fixed with a
      res/raw/keep.xml rule and verified by unzipping the actual shipped APK to
      confirm the files survived.
  - label: Android Channel Immutability
    title: A notification channel permanently silent, from before its sound file
      even existed
    body: Git history traced a channel to a commit that created it pointing at a
      sound resource added in a later commit — any device that ran that window
      cached the channel as permanently silent, since Android fixes a channel's
      sound at creation. Fixed by bumping the channel id and making the sound
      state part of the id, so toggling it in-app actually takes effect.
  - label: Binder Transaction Limit
    title: A "play the whole Qur'an" range would have crashed the app
    body: Honoring a full custom recitation range built a 6,236-item playlist queue;
      publishing that to Android's platform MediaSession crosses a Binder
      transaction capped near 1MB, which would throw
      TransactionTooLargeException. Caught it before it shipped by capping what
      gets published to the media session while keeping the full queue in memory
      for playback logic.
  - label: Full-Screen Intent Removal
    title: The "auto-play full adhan" feature was launching the app UI as its entire
      mechanism
    body: An earlier unattended-adhan implementation used a full-screen intent — but
      launching an Activity is that primitive's literal definition, so the app
      UI popped over the lock screen at every prayer. Replaced it with the
      native AlarmManager → ForegroundService pipeline described above, which
      plays audio with no Activity involved at all, and removed the
      now-unnecessary USE_FULL_SCREEN_INTENT permission (avoiding an unnecessary
      Play Console alarm-functionality declaration).
  - label: Signal Indistinguishability
    title: '"Vibrate only" was reported broken — it was firing perfectly'
    body: A user-selectable vibrate-only prayer alert read as doing nothing. The
      platform's own vibration history proved it was firing to the millisecond —
      but a notification channel created with vibration enabled and no explicit
      pattern inherits Android's stock waveform, the identical buzz every other
      app plays. Nothing distinguished it but the absence of a sound, which is
      not a cue a user can perceive. Fixed with a deliberate long-short-long
      waveform, and the channel id bumped because Android freezes a channel's
      vibration at creation. A later "still not working" report turned out to be
      a different diagnosis entirely - two build flavours were installed side by
      side, and the one carrying the fix had its notification permission revoked
      by a reinstall, caught by reading the permission grant state rather than
      trusting the report's premise.
  - label: Cross-Surah Playback
    title: A saved custom recitation range was silently never read by the player
    body: Users could configure a range spanning two surahs, but the audio players
      built their playlists from the currently open surah and ignored the saved
      range entirely — a same-surah range only ever "worked" by coincidence.
      Fixed by expanding any range into global ayah numbers and building both
      readers' playlists from that, with a regression test specifically covering
      a boundary that crosses two surahs.
links: {}
---
