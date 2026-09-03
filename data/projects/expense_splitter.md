---
name: Splitly (قسمة)
category: Shared Expenses · Offline-First · Bilingual Arabic/English
badge: Coming Soon
short_description: An offline-first, guest-first expense-splitting app for
  travel friends, roommates, and work teams — record who paid, split equally
  or custom, and get a deterministic settlement engine that works out the
  minimum number of payments needed to settle the whole group.
order: 4
overview: >
  Splitly starts from a simple promise: every person should know exactly how
  much they paid, how much they owe, and who they need to pay — without
  spreadsheets and without an account wall. A user can create a group, add
  members and expenses, and see balances and settlement suggestions as a
  guest, before ever signing in.


  Money is modeled as integer minor units end to end — never floating-point — so a settlement is exactly reproducible, not "close enough." The settlement engine matches debtors against creditors to minimize the number of transfers needed to zero out a group, while an append-only expense-revision model keeps full history even as expenses are edited or deleted.
stats:
  - number: "0"
    label: Floating-point money values — everything is integer minor units
  - number: Guest-first
    label: Full group + settlement flow works before any sign-in
  - number: AR / EN
    label: Bilingual with intentional LTR/RTL layout throughout
capabilities:
  - icon: 👥
    title: Groups & members
    description: Create groups for a trip, a flat, or a team, and add members
      by name — no accounts required to get started.
  - icon: 🧾
    title: Equal & custom splits
    description: Split an expense evenly across selected members, or assign
      exact custom amounts — both validated to match the expense total
      exactly.
  - icon: ⚖️
    title: Deterministic balance engine
    description: Paid, owed, and net are computed per member from an
      append-only expense-revision ledger, so edits and deletions never lose
      history.
  - icon: 🤝
    title: Settlement suggestions
    description: A debtor/creditor-matching algorithm works out who should pay
      whom, minimizing the number of transfers needed to settle the group.
  - icon: 🔑
    title: Guest-first, account-optional
    description: The full guest flow — groups, expenses, balances, settlement
      — works with zero sign-up; an account is only needed for cloud backup
      and cross-device sync.
  - icon: 🌍
    title: Arabic / English
    description: Fully bilingual with intentional RTL layout, built on
      Flutter's gen-l10n rather than any hard-coded UI strings.
architecture_text: >
  Splitly follows a feature-first Flutter architecture with strict layer
  boundaries: domain services own the financial rules (splitting, balance
  calculation, settlement matching) and stay independent of Flutter, Firebase,
  and the storage layer entirely, so the same rules are testable in isolation
  from the UI. Drift/SQLite is the offline-first local store, with stable IDs
  and versioned, tested migrations. A later V1 layer adds Firebase
  Authentication, idempotent guest-to-account migration, and cloud
  synchronization behind a trusted backend — accepted mutations get a
  server-assigned financial sequence and idempotency key, so a retried sync
  can never double-apply a settlement.
tech_tags:
  - tag: Flutter
  - tag: Riverpod
  - tag: GoRouter
  - tag: Drift / SQLite
  - tag: Firebase Auth
  - tag: Cloud Firestore
  - tag: Cloud Functions
  - tag: gen-l10n
links: {}
---
