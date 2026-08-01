---
name: Quran Kareem
category: Islamic Education · Personal Project
badge: Personal Project
short_description: Arabic-first Quran app with full mushaf reading, verse and
  surah recitation, live radio, audio tafsir, reciters directory, and riwayat
  browser — published on Google Play.
icon: images/quran-kareem/logo.svg
order: 8
overview: >
  Quran Kareem (moshaf_app) is an Arabic-first Flutter application for Android
  and iOS that bundles a complete Quran reader with a set of Islamic audio and
  video libraries. Users can read the full mushaf surah by surah, play
  individual verses or a whole surah recited by Mishary Alafasy, stream live
  Quran radio stations, browse audio tafsir, explore a directory of reciters and
  their available riwayat, and watch curated video content. It targets
  Arabic-speaking Muslim users who want reading, listening, and study material
  in one offline-aware, RTL-native app, and is shipped on the Play Store.
stats:
  - number: 6-in-1
    label: Quran, radio, tafsir, reciters, riwayat & video
  - number: Cubit
    label: Scoped per-screen state, not global
  - number: Live
    label: Published on Google Play
capabilities:
  - icon: 📖
    title: Full Quran Reader
    description: Lists all surahs from the mushaf index and opens a verse-by-verse
      reading view with Arabic text, revelation type, and verse count.
  - icon: 🔊
    title: Verse & Full-Surah Recitation
    description: Plays the audio for any individual ayah or streams an entire surah
      recited by Mishary Alafasy through a dedicated audio player.
  - icon: 📻
    title: Live Quran Radio
    description: Streams Quran radio stations from the mp3quran API with play/pause
      and previous/next station controls.
  - icon: 🎓
    title: Audio Tafsir Library
    description: Browses tafsir recordings surah by surah with its own transport
      controls for playback and navigation.
  - icon: 🧑‍🏫
    title: Reciters Directory
    description: Lists available reciters and drills into each reciter's individual
      mushaf recordings.
  - icon: 📚
    title: Riwayat Browser
    description: Displays the different narrations (riwayat) of the Quran available
      through the mp3quran catalogue.
  - icon: 🎬
    title: Video Section
    description: Plays Islamic video content inline with custom playback controls.
  - icon: 📤
    title: Share a Verse
    description: Shares any ayah's Arabic text together with a direct link to its
      recitation audio via the native share sheet.
  - icon: 📶
    title: Connectivity-Aware Shell
    description: Watches the device connection and swaps the whole app shell to an
      offline state the moment the network drops.
  - icon: ⬆️
    title: Remote Update Prompt
    description: Compares the installed build against a version published remotely
      and prompts the user toward the Play Store listing when an update exists.
architecture_text: >
  The app uses a feature-per-screen layout — Home, Layout, Onboarding,
  Moshaf/Ayat reading, Radio, Tafasir, Reciters, Riwayat, Video — each with its
  own widget subfolder, alongside separate layers for JSON models, cross-cutting
  shared components, and core helpers.


  State management is Bloc's Cubit layer via flutter_bloc — no events, no HydratedBloc, no Provider. Two cubits carry the app: an InternetCubit, provided once at the root, which listens to the connectivity stream and emits an initial/gained/lost state; and a MainCubit, which owns every data fetch and both audio players. MainCubit is deliberately not global — each home-screen tile constructs a fresh instance, kicks off its fetch, and injects it scoped into the destination route, so a screen's data and playback state die with the screen.


  Networking goes through a static Dio wrapper configured once at startup against the mp3quran API, with the full Quran text and per-ayah audio coming from a second source (alquran.cloud).
architecture_flow:
  - step: App initializes Firebase, boots the networking layer, and locks
      orientation to portrait
  - step: InternetCubit is provided app-wide and gates the entire UI based on
      connection state
  - step: Onboarding fires a remote version check and shows an update dialog when
      needed
  - step: Home screen renders a feature grid; each tile builds a fresh, scoped
      MainCubit
  - step: MainCubit fetches from the mp3quran or alquran.cloud APIs and emits
      Loading/Success/Error
  - step: Feature screens rebuild from that state, falling back to empty models so a
      failed fetch renders instead of crashing
  - step: Playback runs through per-feature audio player instances with explicit
      stop/dispose handling
banner: images/quran-kareem/cover.png
mockups:
  - image: images/quran-kareem/274103048-769c7f72-b776-4d5d-8ac7-e1b39f386d92.jpg
    caption: OnBoarding
  - image: images/quran-kareem/274699446-bf5894ce-9fd3-4f2a-a850-2189faf9f4aa.jpg
    caption: Home
  - image: images/quran-kareem/274699697-85b1d244-f4b9-41fb-8090-e93ad787af10.jpg
    caption: Quran List
  - image: images/quran-kareem/274700243-f8ccea82-07ae-4361-bd8a-c62eba733cbf.jpg
    caption: Sura
  - image: images/quran-kareem/274103321-de4198a2-401d-4aa8-9c6f-9ef9f2ccfc92.jpg
    caption: Radio
  - image: images/quran-kareem/274103419-fa96b51c-68fa-4d4d-8d4e-55868dacd31d.jpg
    caption: Tafsir
  - image: images/quran-kareem/274701740-fa5a1a21-5f52-47f0-a45c-c3cd8a12dcba.jpg
    caption: Videos
challenges:
  - label: Audio
    title: Two independent players fighting over the same output
    body: The radio screen and the tafsir screen each owned a separate audio player
      instance, so starting one while the other was already streaming produced
      two recitations playing over each other, and leaving a screen left its
      stream running in the background. The fix restructured both toggle paths
      so each one explicitly stops the opposite player before starting its own,
      added proper dispose handling so leaving a screen actually stops playback,
      and fixed a genuine copy-paste bug where the radio play button was wired
      to the tafsir player's play function instead of its own.
  - label: Release
    title: Replacing an off-the-shelf upgrader with a Remote Config version gate
    body: "The project originally depended on a third-party upgrader package, later
      removed as unused. The replacement is a hand-rolled check built on
      Firebase Remote Config that compares the installed version against a
      remotely published one and deep-links to the Play Store. Getting it stable
      took several follow-up fixes: the version comparison originally threw on
      non-numeric segments and was made to fail gracefully instead, the config
      fetch was wrapped so a failed check can't block app start, and the update
      check was moved to run after the first frame instead of before it."
tech_tags:
  - tag: Flutter
  - tag: flutter_bloc / Cubit
  - tag: Dio
  - tag: audioplayers
  - tag: video_player
  - tag: connectivity_plus
  - tag: Firebase Core
  - tag: Firebase Crashlytics
  - tag: Firebase Remote Config
  - tag: flutter_screenutil
  - tag: share_plus
  - tag: url_launcher
  - tag: mp3quran API
  - tag: alquran.cloud API
links:
  github: https://github.com/HusseinMohamed99/Quran_Kareem
---
