---
name: SystemPro
category: "Real Estate Marketplace · Valuerythm"
badge: Company Project
short_description: "Bilingual (Arabic/English) real estate marketplace built at Valuerythm for the Saudi market — listings for sale, rent and booking, advanced filters, bilingual location search, and direct agent contact via call or WhatsApp."
icon: images/systempro/systempro_icon.png
order: 4
overview: |
  SystemPro is a bilingual (Arabic/English) real estate marketplace app for the Saudi market, built in Flutter. Property seekers browse listings for sale, rent, and short-term booking, filter them by category, price, size, bedrooms, bathrooms and amenities, search by district/city/region in either language, save favorites, and contact the listing agency directly by phone or WhatsApp. Listings are published by real estate companies, each with its own browsable profile page. The app ships with full RTL support, light/dark theming, offline-capable caching, and an automated Fastlane + GitHub Actions pipeline that distributes builds to testers via Firebase App Distribution.
stats:
  - number: "AR / EN"
    label: "Bilingual with full RTL support"
  - number: "6"
    label: "Advanced filters: price, size, beds, baths, amenities & more"
  - number: "CI/CD"
    label: "Automated release pipeline via Fastlane + GitHub Actions"
capabilities:
  - icon: "🔐"
    title: "Full Authentication Flow"
    description: "Sign-up with email OTP verification, login, forgot-password with OTP resend, and password change — with tokens held in encrypted secure storage."
  - icon: "🏘️"
    title: "Paginated Listing Marketplace"
    description: "Cursor-based infinite scroll across buy, rent and booking listing types, with server-side sorting by newest, oldest, and price."
  - icon: "🎛️"
    title: "Advanced Property Filters"
    description: "Filter by category and property type (including lands), price range, area, floors, bedrooms, bathrooms, and amenities from a dedicated filter screen."
  - icon: "🔎"
    title: "Bilingual Location Search"
    description: "Type-ahead search over a nested region → city → district dataset that matches Arabic or English input against every field, with debouncing."
  - icon: "🕘"
    title: "Recent Searches"
    description: "Previously searched locations are persisted locally and offered as suggestions the next time the search screen opens."
  - icon: "❤️"
    title: "Favorites With Live Sync"
    description: "Saving or unsaving a listing updates the marketplace list, the details screen and the favorites tab together, so no screen shows a stale heart icon."
  - icon: "🖼️"
    title: "Rich Listing Details"
    description: "Swipeable image gallery with pinch-to-zoom full-screen viewer, plus amenities, floor count, bed/bath/area breakdown, location, and lister details."
  - icon: "🏢"
    title: "Company Profiles"
    description: "Each listing links to the publishing company's profile, showing its details alongside its own filtered set of active listings."
  - icon: "📞"
    title: "Direct Agent Contact"
    description: "One-tap phone call and WhatsApp handoff, with runtime permission requests and a fallback that sends the user to app settings when denied."
  - icon: "🔗"
    title: "Deep-Linked Listing Sharing"
    description: "Share any listing as a Branch short link that opens the app directly on that property, with a web fallback for users who don't have it installed."
  - icon: "🌓"
    title: "Theming & Localization"
    description: "Runtime light/dark theme switching and Arabic/English toggling, both persisted locally and applied with correct RTL layout direction."
  - icon: "🚀"
    title: "Automated Release Pipeline"
    description: "GitHub Actions runs code generation, builds via Fastlane, uploads Sentry symbols, ships to Firebase App Distribution, and posts a Telegram notice."
architecture_text: |
  The app uses a feature-first modular architecture. Every feature — Authentication, Home, Search, EditProfile, CompanyProfile — is a self-contained slice with three layers: data (Freezed/json_serializable models plus a repository), logic (a Cubit and its state union), and ui (a view plus its widget folder). Shared concerns live in a core layer: dependency injection with get_it, a networking layer built on Dio and a Retrofit-generated API client, caching split between SharedPreferences and flutter_secure_storage, routing, theming, and localization.

  State management is Bloc's Cubit throughout, chosen per-feature rather than uniformly: most cubits are plain Cubits, while the marketplace cubit extends HydratedCubit so listings survive a cold start. Repositories never throw — every call returns a Freezed ApiResult union of success or failure, so cubits pattern-match on the result and emit a typed state instead of handling exceptions. Errors are normalized once in a central ErrorHandler that maps network exception types and HTTP status codes to localized messages. Crash reporting runs through Sentry, with symbol upload wired into the CI pipeline.
architecture_flow:
  - step: "App initializes Firebase, HydratedBloc storage, and the caching layer, then reads the saved token, locale, and theme before the first frame is built"
  - step: "Dependencies are registered in get_it, and theming/localization cubits are provided above the app"
  - step: "A UI event calls a method on the feature's Cubit, which emits a loading state"
  - step: "The Cubit calls its repository, which invokes the Retrofit-generated API client over the shared Dio client with the auth header attached"
  - step: "The repository wraps the response in an ApiResult union — success, or failure carrying a localized error"
  - step: "The Cubit pattern-matches on that union and emits a typed success or error state; the marketplace cubit also writes its listings to hydrated storage"
  - step: "BlocBuilder/BlocConsumer widgets rebuild against the state union, rendering loading, error, empty, and success cases explicitly"
mockups:
  - image: /images/uploads/real-estate-home.png
    caption: RealEstate Home
  - image: /images/uploads/favorites.png
    caption: Favorites
  - image: /images/uploads/filter.png
    caption: Filter
  - image: /images/uploads/details.png
    caption: RealEstate Details
  - image: /images/uploads/company-profile.png
    caption: Company Profile
  - image: /images/uploads/profile.png
    caption: User Profile
challenges:
  - label: "Pagination"
    title: "Sorting a cursor-paginated list correctly"
    body: "Listings load through cursor-based pagination, so the client only ever holds the pages fetched so far. The original implementation sorted that in-memory list, which meant 'lowest price' only reordered what had already been scrolled past rather than the full result set. Sorting was moved to the server by mapping the sort option to proper query parameters, and the client-side sort was removed entirely. That exposed a second issue: the listings cache was keyed by filter alone, so switching sort order returned the previous ordering from cache. Cache keys became a composite of filter and sort type, and changing either resets the cursor and refetches from the first page."
  - label: "State Persistence"
    title: "Deciding what should and shouldn't be hydrated"
    body: "To get listings on screen instantly at launch, the marketplace cubit persists both its visible listings and its per-filter cache to disk. Applying the same approach to theme and language turned out to be the wrong fit: those need to be resolved before the widget tree is built, not restored asynchronously afterwards, so they were reverted to plain state read from local storage at startup instead. The persisted listing cache also introduced a freshness trade-off — entering a tab could serve indefinitely stale results — so tab initialization now forces a network refresh while the cached data paints the first frame, and the page size was reduced to keep each request light."
  - label: "Search"
    title: "Bilingual location search against a single-language API"
    body: "The location dataset is a nested region → city → district tree where every node has both Arabic and English names, but the backend expects a single English 'District, City' string. A user typing in either language has to resolve to that canonical form. Search matches the query against all six name fields across both languages, and a resolver maps the selection back to its English pair before the request is built. Free text that matches nothing is deliberately rejected rather than forwarded to the API, since an unrecognized location silently returned zero results. The dataset is parsed off the UI thread so opening the search screen doesn't drop frames."
  - label: "Error Handling"
    title: "Localizing API errors from below the widget layer"
    body: "Network and timeout errors are produced in the networking layer, which has no access to the localization system — so every connection failure surfaced in English regardless of the app language. Rather than pushing UI context into the data layer, the resolved language code is threaded through the call chain: cubits read it once and pass it down to the repository, and a central error handler uses it to select the right message when mapping exception types and status codes into a typed, localized error."
  - label: "Deep Linking"
    title: "Handling shared listing links at cold start"
    body: "Sharing a property had to open the app directly on that listing, including when the app isn't running and no screen exists yet. Deep linking was migrated to the Branch SDK, attaching the listing ID as link metadata with a web URL fallback for users without the app installed. The session listener is initialized before the app itself launches and navigates through a global navigator key, so a link that arrives during a cold launch is still routed once the app is ready."
  - label: "CI/CD"
    title: "Getting readable release crash reports"
    body: "Release builds are obfuscated, so crash reports were unusable without the correct symbol mapping — and the upload step in the release pipeline kept failing because it pointed at the wrong generated file. The path was corrected to the one Gradle actually produces, with an explicit check added that fails the build with a clear message if it's missing, so a broken symbol upload surfaces immediately in CI instead of quietly shipping a build whose crash reports can't be read."
tech_tags:
  - tag: Flutter
  - tag: "Bloc / Cubit"
  - tag: HydratedBloc
  - tag: Dio
  - tag: Retrofit
  - tag: Freezed
  - tag: GetIt
  - tag: flutter_secure_storage
  - tag: "Firebase Core"
  - tag: Sentry
  - tag: "Branch SDK"
  - tag: flutter_localizations
  - tag: flutter_screenutil
  - tag: cached_network_image
  - tag: permission_handler
  - tag: url_launcher
  - tag: "Fastlane + GitHub Actions"
links: {}
---
