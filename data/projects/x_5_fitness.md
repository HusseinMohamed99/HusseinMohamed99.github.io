---
name: 5X Fitness
category: Fitness & Habit Tracking · Flutter · Firebase
badge: Coming Soon
short_description: A bilingual (Arabic/English) fitness companion built on
  Flutter and Firebase — gym attendance streaks, a daily plank habit, workout
  logging against a 42-exercise reference library, body progress charted
  against InBody figures, and a plain-language privacy screen that exports
  everything the app holds about you.
order: 3
overview: >
  5X Fitness is a fitness habit-tracker I'm building end to end on Flutter and
  Firebase — gym attendance, a daily plank habit, workout logging, and body
  progress, all bilingual from day one. It's not a workout-video app; it's
  built around the boring, high-leverage habits that actually compound: did
  you show up, did you log the set, is the plank target still climbing.


  The app runs on three fully isolated Firebase projects (dev/staging/prod), each with its own application id and its own App Check enforcement — production gets Play Integrity / App Attest even if a release build is accidentally compiled in debug mode, so a stray debug token can never reach it.
stats:
  - number: "42"
    label: Exercises in the bundled reference library, 32 with instructional artwork
  - number: AR / EN
    label: Bilingual from the ground up, RTL-checked on every screen
  - number: "3"
    label: Isolated Firebase environments (dev / staging / production)
capabilities:
  - icon: 🏋️
    title: Gym attendance
    description: Check-ins against a weekly target, with streaks and history —
      the habit the rest of the app is built to reinforce.
  - icon: ⏱️
    title: Daily plank habit
    description: A timed daily plank whose target climbs on its own as you keep
      showing up, until you set one yourself.
  - icon: 📋
    title: Workout logging
    description: Exercises, sets, and weights in kg or lb, picked from the
      bundled library or typed freehand.
  - icon: 📚
    title: Exercise library
    description: 42 movements across Push/Pull/Legs/Upper/Lower, each with
      bilingual instructions and suggested sets/reps/rest, and 32 with a
      reference drawing that crossfades between the start and end of the lift.
  - icon: 📈
    title: Body progress
    description: Measurements and InBody figures charted over time, feeding
      recommendations read directly off your own record.
  - icon: 🔐
    title: Privacy-first by design
    description: A plain-language privacy screen that also exports everything
      the app holds about you as a file you can share out — not just a policy
      link.
tech_tags:
  - tag: Flutter
  - tag: Riverpod
  - tag: GoRouter
  - tag: Firebase Auth
  - tag: Firestore
  - tag: Firebase Storage
  - tag: Cloud Messaging
  - tag: Firebase Analytics
  - tag: Crashlytics
  - tag: App Check
links: {}
---
