---
name: SportyMate
category: Sports Tech · iOS, Android & Web
badge: Company Project
short_description: Cross-platform sports management platform connecting players,
  trainers, and clubs across iOS, Android & web. Smart bookings, real-time chat,
  performance tracking, and analytics dashboards — built with BLoC and deployed
  via Fastlane CI/CD.
icon: images/sportymate/sporty_icon.png
order: 3
overview: >
  SportyMate is a sports management platform that connects players, trainers,
  and clubs across iOS, Android, and web from a single Flutter codebase.
  Trainers manage their schedules and rosters, players book sessions and track
  progress, and clubs get a shared space to run it all.


  My focus was on the booking and real-time communication layers, plus getting the whole pipeline building reliably across three platforms at once — which turned out to be the harder half of the job.
stats:
  - number: "3"
    label: Platforms from one codebase (iOS, Android, Web)
  - number: Real-time
    label: Chat between players, trainers & clubs
  - number: CI/CD
    label: Automated via GitHub Actions + Fastlane
capabilities:
  - icon: 📅
    title: Smart booking
    description: Players book sessions against trainer availability, with conflict
      checks handled before a slot is confirmed.
  - icon: 💬
    title: Real-time chat
    description: Direct messaging between players, trainers, and clubs, built on
      Firebase-backed real-time data.
  - icon: 🔑
    title: Secure auth
    description: REST-backed authentication with session persistence across app restarts.
  - icon: 📊
    title: Role-based views
    description: Distinct dashboards for players, trainers, and club admins from the
      same shared component library.
architecture_text: >
  SportyMate uses BLoC for state management, with feature modules kept
  independent so the web build doesn't drag in mobile-only dependencies.
  Firebase handles auth, real-time chat data, and push notifications, while REST
  APIs power bookings and profile data. The CI/CD pipeline builds and tests all
  three platforms on every push, with Fastlane driving signing and store
  delivery for iOS and Android.
architecture_flow:
  - step: UI (BLoC)
  - step: Repository
  - step: REST API + Firebase
  - step: iOS / Android / Web build targets
mockups:
  - image: /images/uploads/splash-5.png
    caption: Splash Screen
  - image: /images/uploads/onboarding-1.png
    caption: OnBoarding 1
  - image: /images/uploads/onboarding-2.png
    caption: OnBoarding 2
  - image: /images/uploads/onboarding-3.png
    caption: OnBoarding 3
  - image: /images/uploads/onboarding-4.png
    caption: OnBoarding 4
  - image: /images/uploads/choose-role.png
    caption: Choose Role
  - image: /images/uploads/sporty-mate-home.png
    caption: Sporty Mate Home
  - image: /images/uploads/all-categories.png
    caption: All Categories
  - image: /images/uploads/club-when-selected.png
    caption: Club Details
  - image: /images/uploads/request-details.png
    caption: Request Details
  - image: /images/uploads/home-coach.png
    caption: Home Coach
  - image: /images/uploads/all-clubs.png
    caption: All Clubs
  - image: /images/uploads/create-session.png
    caption: Create Session
  - image: /images/uploads/request-details-for-coach.png
    caption: Request Details For Coach
  - image: /images/uploads/requests-screen-coach.png
    caption: Requests Screen Coach
  - image: /images/uploads/coach-profile.png
    caption: Coach Profile
challenges:
  - label: Multi-platform CI
    title: Getting iOS, Android, and web green in the same pipeline
    body: Set up GitHub Actions + Fastlane so a single push runs automated tests and
      builds for all three targets, instead of maintaining three separate manual
      release processes.
  - label: Build stability
    title: AGP mismatches & CocoaPods issues across contributors
    body: Debugged recurring Android Gradle Plugin version mismatches and iOS
      CocoaPods dependency conflicts that only showed up on certain machines,
      and locked toolchain versions to make builds reproducible.
tech_tags:
  - tag: Flutter
  - tag: BLoC
  - tag: Firebase
  - tag: REST APIs
  - tag: Fastlane
  - tag: GitHub Actions
links: {}
---
