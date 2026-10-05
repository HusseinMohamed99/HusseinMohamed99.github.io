---
period: Sep 2026 – Oct 2026
name: StudyFlow (مذاكرتي)
category: Education & Productivity · Offline-First · Bilingual Arabic/English
badge: Coming Soon
short_description: An offline study planner and focus timer for students —
  subjects with weekly targets, focus sessions, tasks and exam countdowns,
  flashcards with spaced review, and weekly statistics. No account, no ads, and
  no internet permission at all.
icon: images/study-flow/logo.png
order: 5
accent_color: "#155E75"
overview: >
  StudyFlow turns study effort into measurable progress: subjects, tasks,
  focused study sessions, exam countdowns and spaced review, in one app that
  works entirely on the phone. Statistics are progress-oriented, never
  guilt-based, and every screen works in Arabic and English, right-to-left and
  left-to-right.


  Privacy is a property of the build, not a promise in a policy. The release app has no internet permission, no account, no analytics and no advertising ID, and that is checked in the compiled manifest of every release build rather than in the source. Study data lives in a local database; the only ways it leaves the device are a backup file the user saves themselves, or an event they choose to save in their own calendar app.
stats:
  - number: "0"
    label: Network permissions in the release build, checked in the compiled manifest by CI
  - number: "5"
    label: Spaced-review boxes, due again after 1, 3, 7, 16 and 35 days
  - number: AR / EN
    label: The whole app in both languages, RTL and LTR
capabilities:
  - icon: 📚
    title: Subjects with weekly targets
    description: Each subject has its own colour and an optional weekly study
      target; Home, the subject list and each subject's page show how much of
      this week's target is filled.
  - icon: ⏱️
    title: Focus sessions
    description: Study in focused stretches with breaks. Elapsed time is always
      computed from the session's start, so the timer stays accurate even if the
      app is closed or the phone restarts.
  - icon: 🗓️
    title: Tasks and exams
    description: Assignments and exam dates tied to their subject, with what is
      due today on Home. An exam, or a task with a due date, can be sent to the
      phone's calendar app.
  - icon: 🃏
    title: Flashcards and spaced review
    description: Question-and-answer cards per subject, or a pasted list added at
      once. Cards you know come back less and less often; a card you miss comes
      back tomorrow.
  - icon: 📊
    title: Statistics and weekly review
    description: Study time by day and by subject, the days you studied, your
      sessions and where your cards stand — plus a short look back and ahead at
      the start of each week.
  - icon: 🔒
    title: Your data stays yours
    description: No sign-up, no analytics, no advertising ID, no third-party
      tracking. Save a backup file whenever you like and restore it yourself on
      a new phone.
architecture_text: >
  StudyFlow is feature-first (each feature split into data, domain and
  presentation), with business rules only in domain use-cases. The domain layer
  is pure Dart and notifiers never import Flutter; an architecture test fails
  the build if a layer reaches where it shouldn't. Riverpod manages state above
  the repositories, GoRouter uses typed routes, and Drift (SQLite) is the local
  store, with versioned migrations now at schema v4.


  Backups are a versioned JSON file that mirrors the database row for row, so a new table needs no per-table export code — and a test fails if any table is neither backed up nor deliberately excluded. Restoring replaces everything and never merges.
architecture_flow:
  - step: Riverpod (Presentation)
  - step: Domain Use-Cases
  - step: Repositories
  - step: Drift / SQLite
mockup_frame: none
mockups:
  - image: images/study-flow/en/studyflow_play_en_01.png
    caption: Pomodoro
    image_ar: images/study-flow/ar/studyflow_play_ar_01.png
    caption_ar: بومودورو
  - image: images/study-flow/en/studyflow_play_en_02.png
    caption: Subjects
    image_ar: images/study-flow/ar/studyflow_play_ar_02.png
    caption_ar: المواد
  - image: images/study-flow/en/studyflow_play_en_03.png
    caption: Tasks
    image_ar: images/study-flow/ar/studyflow_play_ar_03.png
    caption_ar: المهام
  - image: images/study-flow/en/studyflow_play_en_04.png
    caption: Exams
    image_ar: images/study-flow/ar/studyflow_play_ar_04.png
    caption_ar: الاختبارات
  - image: images/study-flow/en/studyflow_play_en_05.png
    caption: Settings
    image_ar: images/study-flow/ar/studyflow_play_ar_05.png
    caption_ar: الإعدادات
challenges:
  - label: Release Manifest
    title: The internet permission came back, and the source looked fine
    body: A build-script commit brought INTERNET back into the release build, and
      nobody noticed for four days because the source manifest looked right —
      and a library can merge in a permission no source file mentions. The fix
      reads the compiled manifest inside every built AAB and APK and fails on
      any network or advertising-ID permission. It also fails if it cannot find
      the package name, so a broken read can never pass silently, and CI runs
      a self-test against fake bundles before trusting it.
  - label: Calendar Without Permission
    title: Adding an exam to the calendar without ever reading the calendar
    body: Calendar plugins ask for calendar access the app doesn't need. Instead,
      a small platform channel opens the calendar app's own pre-filled new-event
      screen — an insert intent on Android, the system event editor on iOS 17+
      — so nothing is added unless the user saves it there, and StudyFlow
      requests no calendar permission at all.
  - label: Spaced Review
    title: '"Due in 3 days" has to mean a date, not 72 hours'
    body: Most review happens in the evening, so a card graded at 21:00 and due
      "in three days" would only reappear at 21:00. Due dates are midnight of
      the target calendar day instead, which also keeps daylight-saving changes
      from ever shifting a card.
tech_tags:
  - tag: Flutter
  - tag: Riverpod
  - tag: GoRouter
  - tag: Drift / SQLite
  - tag: Freezed
  - tag: gen-l10n
links: {}
---
