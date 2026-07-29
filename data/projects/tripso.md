---
name: "Tripso"
category: "Travel Planning · Graduation Project"
badge: "Graduation"
short_description: "Tourism app covering Egypt, UAE, France, and Italy with top attractions, ticket pricing, interactive maps, and historical insights. Graduation project built with Cubit state management, Dio REST integration, and Firebase auth."
icon: "tripso_icon.png"
order: 7
overview: |
  Tripso is a tourism planning app built as my graduation project — covering top attractions, ticket pricing, interactive maps, and historical context across Egypt, the UAE, France, and Italy. It was where I first put Cubit state management and Firebase auth into practice on a full app, end to end.
stats:
  - number: "4"
    label: "Countries covered: Egypt, UAE, France, Italy"
  - number: "Graduation"
    label: "Final year project, built solo"
  - number: "Cubit"
    label: "First full app built with Cubit + Dio"
capabilities:
  - icon: "🗺️"
    title: "Interactive maps"
    description: "Attractions plotted with location context, not just listed in a feed."
  - icon: "🎟️"
    title: "Ticket pricing"
    description: "Up-to-date pricing info surfaced alongside each attraction."
  - icon: "📜"
    title: "Historical insights"
    description: "Short historical context written for each site, not just a photo and a name."
  - icon: "🔐"
    title: "Firebase auth"
    description: "Account creation and login so a user's saved trip plans persist."
architecture_text: |
  Tripso was the first app where I structured state management deliberately rather than reaching for setState — Cubit manages each feature's state, Dio handles the REST integration with attraction and pricing data, and Firebase covers authentication. The patterns from this project (clear state boundaries, a dedicated repository layer) carried directly into the professional work that followed.
architecture_flow:
  - step: "UI (Cubit)"
  - step: "Repository"
  - step: "Dio (REST)"
  - step: "Firebase Auth"
mockups: []
video: "videos/tripso/demo.mp4"
challenges: []
tech_tags:
  - tag: "Flutter"
  - tag: "Cubit"
  - tag: "Dio"
  - tag: "Firebase"
links:
  github: "https://github.com/HusseinMohamed99/Tripso"
---
