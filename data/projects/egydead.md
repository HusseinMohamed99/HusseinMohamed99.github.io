---
name: "EGY DEAD"
category: "Entertainment · Google Play"
badge: "Personal Project"
short_description: "Media browser for movies, series, and anime with 10K+ downloads on Google Play. Smart recommendations, trailers, cast details, and categorized search — built with BLoC, Dio, and shimmer loading UX."
icon: "egydead_icon.png"
order: 5
overview: |
  EGY DEAD is a self-published media browser for discovering movies, series, and anime — trailers, cast details, and smart recommendations, wrapped in a shimmer-loading UI that feels fast even on a slow connection. It's crossed 10,000+ downloads on Google Play as a solo side project.
stats:
  - number: "10K+"
    label: "Downloads on Google Play"
  - number: "Solo"
    label: "Designed, built, and published independently"
  - number: "BLoC"
    label: "State management with Dio-powered search"
capabilities:
  - icon: "🎬"
    title: "Media discovery"
    description: "Browse movies, series, and anime with categorized search and smart recommendations."
  - icon: "🎞️"
    title: "Trailers & cast"
    description: "Pulls trailer links and cast details into a single detail view per title."
  - icon: "✨"
    title: "Shimmer loading"
    description: "Content placeholders shimmer while data loads, so the app never shows a blank screen mid-fetch."
architecture_text: |
  A single-developer project meant keeping the architecture simple enough to maintain alone: BLoC for state, Dio for the media API layer, and shimmer placeholders for perceived performance. The whole app was designed, built, tested, and published to Google Play without a team behind it.
architecture_flow:
  - step: "UI (BLoC + Shimmer)"
  - step: "Repository"
  - step: "Dio"
  - step: "Media API"
mockups: []
video: "videos/egydead/demo.mp4"
challenges: []
tech_tags:
  - tag: "Flutter"
  - tag: "BLoC"
  - tag: "Dio"
  - tag: "Shimmer"
links:
  github: "https://github.com/HusseinMohamed99/EGY_DEAD"
---
