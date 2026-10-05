---
period: Sep 2026 – Present
name: Vaulta (فولتا)
category: Personal Finance · Offline-First · Bilingual Arabic/English
badge: Coming Soon
short_description: A money and receipt manager that works on the phone without
  an account — accounts and transactions, a receipt vault with on-device
  Arabic/English scanning you review before saving, warranties, bills,
  subscriptions, budgets, goals, debts and reports, in Arabic and English.
order: 6
accent_color: "#334F88"
overview: >
  Vaulta is built around one idea: your financial memory, not just your
  expense list. A receipt can be scanned, itemized, linked to the expense it
  paid for and to the warranty it proves, while bills, subscriptions, budgets,
  savings goals and debts sit on the same local ledger. Every screen works in
  Arabic and English, right-to-left and left-to-right, in light and dark.


  Core use needs no account and no connection: money, receipts and their files live in the app's private storage on the phone, receipt text is read on the device, and data leaves it only as a backup or CSV file the user saves. Sign-in, cloud sync and shared household spaces are already built against a provider-independent contract, but no server is connected yet — those screens say so rather than pretending. The app is in active development and not yet released.
stats:
  - number: "0"
    label: Floating-point numbers in money math — every amount is checked integer minor units
  - number: "16"
    label: Local database schema versions so far, each migrated in place, never silently recreated
  - number: AR / EN
    label: The whole app in both languages, RTL and LTR, captured light and dark on Android and iOS
capabilities:
  - icon: 🧾
    title: Receipt vault
    description: Receipts with merchant, date, total and reference, plus photos
      from the camera or gallery, image files or PDFs kept in private storage,
      each one linkable to the transaction it paid for.
  - icon: 🔍
    title: Scan receipts on the device
    description: Tesseract reads Arabic and English receipts on the phone itself.
      Every value lands in a review screen and stays editable; nothing is saved
      until you confirm it, and manual entry is always available.
  - icon: 🧮
    title: Itemize and split
    description: Line items, tax, service and discount are reconciled against the
      printed total, and a mismatch has to be reviewed before saving. A receipt
      can then be split between people.
  - icon: 🛡️
    title: Warranties, bills and subscriptions
    description: Warranties linked to their receipt, bills with due dates and
      subscriptions with renewals, with reminders delivered as local
      notifications on the phone.
  - icon: 💰
    title: Accounts, budgets, goals and debts
    description: Expenses, income and transfers — including between currencies
      at a rate you enter — with balances derived from the ledger, plus budgets,
      savings goals, money borrowed or lent, reports and global search.
  - icon: 💾
    title: Backup and export, no account
    description: Save a full backup file or CSV exports wherever you choose, and
      restore a backup yourself. Android cloud backup and device transfer are
      switched off for the app's data.
architecture_text: >
  Vaulta is feature-first: each feature is split into domain, data,
  application and presentation layers, with money rules in plain Dart. Riverpod
  composes the app, GoRouter handles routes, and Drift (SQLite) opens the
  private database on a background isolate before the first screen, now at
  schema v16 with versioned migrations.


  Receipt files go through a managed store: picked files are staged first, signatures and checksums are verified, and every start-up reconciles the store against the database before any screen appears, keeping every referenced file and removing only orphaned staging copies. Restoring a backup commits in one step, without swapping the live database file.
architecture_flow:
  - step: Riverpod (Presentation)
  - step: Application Services
  - step: Repositories
  - step: Drift / SQLite + Private File Store
challenges:
  - label: Exact Money
    title: An amount is never a double
    body: Every amount is an integer number of minor units with its own currency,
      parsed exactly from what the user typed. A transfer between currencies
      stores both amounts and the rate the user entered, and dashboards and
      reports group by currency instead of inventing one combined total or a
      historical exchange rate.
  - label: Arabic OCR
    title: Reading Arabic receipts without trusting the result
    body: The usual on-device text recognizer does not read Arabic script, and
      the Flutter Tesseract wrappers that were reviewed had gaps — incomplete iOS
      error paths, one that logged image paths, and one whose iOS side used a
      different engine than advertised. Vaulta ships its own small native
      adapter instead. Recognition of Arabic-Indic digits is still imperfect, so
      the design treats OCR output as untrusted — review before save is the
      trust boundary, and raw OCR text is never stored.
  - label: Cloud Without a Server
    title: Sync that fails honestly until a provider exists
    body: Sign-in, sync and shared spaces are built against a provider-independent
      contract and tested with test remotes. The release composition can only
      use an unconfigured remote that fails closed, so the app never reports a
      cloud success that did not happen, and local data keeps working exactly as
      before.
tech_tags:
  - tag: Flutter
  - tag: Riverpod
  - tag: GoRouter
  - tag: Drift / SQLite
  - tag: Tesseract OCR
  - tag: gen-l10n
links: {}
---
