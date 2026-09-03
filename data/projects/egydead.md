---
name: EGY DEAD
category: Entertainment · Google Play
badge: Personal Project
short_description: Media browser for movies, series, and anime with 10K+
  downloads on Google Play. Smart recommendations, trailers, cast details, and
  categorized search — built with BLoC, Dio, and shimmer loading UX.
icon: images/egydead/egydead_icon.png
order: 7
overview: >
  EGY DEAD is a Flutter movie and TV-series discovery app for Android and iOS,
  built on the TMDB API. It lets viewers browse curated rails (now playing,
  popular, top rated, upcoming, on-the-air, airing today), open a full details
  page for any title — cast, reviews, ratings, genres, runtime, seasons, trailer
  — and search across movies, series and people from one field. It ships to the
  Play Store as a real published app, with a dark-only Arabic/English UI,
  offline detection, and a Firebase Remote Config-driven "new version available"
  prompt.
stats:
  - number: 10K+
    label: Downloads on Google Play
  - number: Solo
    label: Designed, built, and published independently
  - number: BLoC
    label: State management with Dio-powered search
capabilities:
  - icon: 🎬
    title: Movie Discovery Rails
    description: Now Playing carousel plus Popular, Top Rated and Upcoming
      horizontal rails, each with a paginated 'see more' screen that loads
      further TMDB pages on scroll.
  - icon: 📺
    title: TV & Series Browsing
    description: A parallel TV module with On The Air, Airing Today, Popular and Top
      Rated sections, plus per-series season listings.
  - icon: ℹ️
    title: Rich Title Details
    description: Details screens pull cast, user reviews, rating, runtime, genres,
      release date, recommendations and similar titles in a single
      append_to_response call.
  - icon: 🔍
    title: Debounced Multi-Search
    description: Searches TMDB's /search/multi endpoint across movies, series and
      people, with a 400ms debounce and switchMap so in-flight requests for
      stale keystrokes are dropped.
  - icon: ▶️
    title: Trailer Playback
    description: Extracts the trailer key from the TMDB videos payload and opens it
      externally via url_launcher, hiding the button when a title has no
      trailer.
  - icon: 📡
    title: Connectivity Gate
    description: An InternetCubit listens to connectivity_plus and holds the app on
      an offline screen with a snackbar until a connection is available.
  - icon: 💀
    title: Skeleton Loading States
    description: Every rail and details section renders a Skeletonizer placeholder
      while loading and a dedicated error widget on failure, instead of a bare
      spinner.
  - icon: 🔄
    title: Remote Update Prompt
    description: Firebase Remote Config publishes the latest version string; the app
      compares it against its own package version and offers an update dialog
      linking to the Play Store.
  - icon: 🖼️
    title: Cached Imagery
    description: A shared CachedImage wrapper handles TMDB poster/backdrop/avatar
      loading with cached_network_image, spinkit placeholders and fallback art.
  - icon: ⚙️
    title: Settings & Support
    description: In-app policy link, support screen and Play Store rating shortcut,
      with the live app version read from package_info_plus.
architecture_text: >
  The app follows Clean Architecture, split by feature rather than by layer:
  movies/, tv/ and search/ each contain their own data (models, remote data
  source, repository implementation), domain (entities, abstract repository, use
  cases) and presentation (bloc, screens, widgets) folders, with everything
  cross-cutting living under core/ and the shell under layout/.


  State management is BLoC — flutter_bloc with plain Bloc/Cubit, not Provider or Hydrated storage. Each feature has a coarse-grained bloc (MoviesBloc, TvsBloc, MoviesDetailsBloc, TvsDetailsBloc, SearchBloc) holding a single Equatable state object with per-section RequestState enums updated through copyWith, so one screen can show four rails in four independent loading states. Dependency injection is get_it, and errors are modelled functionally with dartz — data sources throw ServerException, repositories convert it to Either<Failure, T>, and blocs fold it into loaded or error states.
architecture_flow:
  - step: Widget dispatches an event to its feature Bloc
  - step: Bloc invokes the matching use case from get_it
  - step: Use case calls the abstract repository contract
  - step: Repository delegates to the Dio-backed remote data source
  - step: Data source hits the TMDB endpoint
  - step: JSON parsed into models; non-200 throws ServerException
  - step: Repository wraps the result as Either<Failure, T>
  - step: Bloc folds the Either and emits a new state
  - step: UI renders loaded state, a skeleton placeholder, or an error widget
mockups:
  - image: /images/uploads/275292603-cdc42c1c-5c53-46d0-9873-3b0eeafb5ef7.jpg
    caption: Splash Screen
  - image: /images/uploads/275292618-89d14223-5031-4b00-9490-07fffae91eb2.jpg
    caption: Movies
  - image: /images/uploads/275292630-18affedc-2eda-4ac9-946d-f36b71bc20d3.jpg
    caption: Upcoming Movies
  - image: /images/uploads/275292641-3d5c630a-1c35-4bd1-bfdd-6a9eb9d04aeb.jpg
    caption: Movie Details
  - image: /images/uploads/275292655-b805849d-e0d8-47ac-bb9a-5785a2804bf3.jpg
    caption: Tvs
  - image: /images/uploads/275292648-f69cb8bd-0f7f-4c1b-afd3-d60923f69a6f.jpg
    caption: "Top Rated Tvs "
challenges:
  - label: Connectivity
    title: Offline gate misreporting valid connections
    body: The InternetCubit originally emitted "connected" only when
      connectivity_plus reported mobile or Wi-Fi, and treated everything else as
      lost. Because the whole app is gated behind that state, any other
      connection type fell through to the offline branch. The fix inverted the
      condition to test for ConnectivityResult.none and treat every other result
      as connected.
  - label: Pagination
    title: A failed 'load more' shouldn't wipe the list
    body: The see-more screens page through TMDB by firing a fetch-more event when
      the scroll controller reaches the bottom. Initially a failure on page N
      reused the same error state as the initial load, so one bad request
      replaced an already-populated list with a full-screen error. A distinct
      fetchMoreError value was added to the state, so loaded items stay on
      screen and the error is surfaced in place instead.
  - label: State scoping
    title: Tab switches recreating feature blocs
    body: The TV screen created its own BlocProvider inside the route, which meant
      the bloc was rebuilt every time users moved through the bottom navigation.
      The provider was lifted up to where the movies and TV screens are
      constructed once with their initial events dispatched, so tab switching no
      longer tears down and refetches feature state.
  - label: Bug fix
    title: Carousel taps that did nothing
    body: Tapping a poster in the now-playing carousel silently did nothing. The tap
      handler referenced the navigation function without actually calling it, so
      the route was never pushed. Adding the missing parentheses restored
      navigation to the details screen.
tech_tags:
  - tag: Flutter
  - tag: flutter_bloc
  - tag: get_it
  - tag: Dio
  - tag: dartz
  - tag: equatable
  - tag: TMDB API
  - tag: Clean Architecture
  - tag: Firebase Remote Config
  - tag: connectivity_plus
  - tag: cached_network_image
  - tag: skeletonizer
  - tag: carousel_slider
  - tag: flutter_dotenv
  - tag: url_launcher
  - tag: Shorebird
links:
  github: https://github.com/HusseinMohamed99/EGY_DEAD
---
