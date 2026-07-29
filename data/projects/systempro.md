---
name: "SystemPro"
category: "Real Estate · Saudi Market"
badge: "Company Project"
short_description: "Advanced real estate platform for the Saudi market with property search, smart filters, bookmarks, real-time updates, and offline access via Hive. Scalable BLoC architecture with pagination, dependency injection, and 30% performance boost from profiling."
icon: "images/systempro/systempro_icon.png"
order: 4
overview: |
  SystemPro is a real estate platform built for the Saudi market, letting buyers and renters search properties with smart filters, bookmark listings, and keep browsing even without a connection. It was one of my earlier deep dives into performance work — profiling the app under real usage rather than guessing at bottlenecks.
stats:
  - number: "30%"
    label: "Performance improvement from profiling"
  - number: "Offline"
    label: "Full property browsing via Hive cache"
  - number: "BLoC"
    label: "Pagination + dependency injection throughout"
capabilities:
  - icon: "🔍"
    title: "Property search & filters"
    description: "Location, price range, and property-type filters that compose without needing a full re-fetch for every change."
  - icon: "🔖"
    title: "Bookmarks"
    description: "Saved listings persist locally and sync back once the user is online again."
  - icon: "📡"
    title: "Real-time updates"
    description: "New listings and price changes propagate to the browsing list without a manual refresh."
  - icon: "📴"
    title: "Offline access"
    description: "Hive-backed local caching means a spotty connection in the field doesn't stop a broker from showing listings."
architecture_text: |
  The listing feed uses cursor-based pagination through BLoC, backed by dependency injection so repositories can be swapped for tests without touching UI code. Hive stores the last-known property set locally, which is what keeps search usable offline. The 30% performance gain came from profiling widget rebuilds and network calls under real scrolling behavior, not from a single fix — mostly trimming unnecessary rebuilds in the list and batching image loads.
architecture_flow:
  - step: "UI (BLoC)"
  - step: "Repository (DI)"
  - step: "Dio (remote)"
  - step: "Hive (offline cache)"
mockups: []
video: "videos/systempro/demo.mp4"
challenges:
  - label: "Build failure"
    title: "A missing .env file silently broke the build"
    body: "Recently resolved a build failure traced back to an empty .env file — the app compiled but crashed on launch because required config values were never injected. Added a startup check that fails loudly instead of shipping a silently broken build."
tech_tags:
  - tag: "Flutter"
  - tag: "BLoC"
  - tag: "Dio"
  - tag: "Hive"
  - tag: "Freezed"
links: {}
---
