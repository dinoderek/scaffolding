# Technical Architecture Decisions (High-Level)

## Purpose

Capture only top-level stack decisions for MVP-B.

## Decisions and rationale

1. `Expo + React Native + TypeScript` for frontend.
Reason: fastest path to a phone-first app with one codebase and strong AI-assisted dev support.

2. `Expo Router` for navigation.
Reason: file-based routing keeps app structure simple and easy to scaffold with AI.

3. `SQLite (on-device) + Drizzle ORM` for local data.
Reason: reliable offline-first tracking with typed schema and migrations.

4. `Supabase (Postgres + Auth + RLS)` for backend.
Reason: strong free tier and quick setup for auth + cloud storage without custom backend overhead.

5. `Offline-first sync via client outbox pattern`.
Reason: guarantees logging works without internet while still supporting cloud sync later.

6. `Architecture prepared for groups later`.
Reason: MVP-B ships tracker first, but schema/contracts should avoid rework for social features.

7. `Continuous local autosave is implemented as a domain/data-layer contract first`.
Reason: build and verify autosave behavior in isolation before wiring existing React Native screens.

8. `Autosave SLA contract is explicit and testable`.
Reason: text writes are debounced (`3s`), structural edits write immediately, lifecycle transitions flush immediately, and dirty state has a max flush interval (`10s`) to balance durability and write amplification.

9. `Session completion materializes duration in persistence`.
Reason: persist `completedAt` + `durationSec` at completion time so read/query paths can sort/filter deterministically without recomputing duration for completed sessions.

10. `React Native lifecycle integration is adapter-based`.
Reason: helper contracts map RN events (blur/route/app background) to autosave flush triggers so UI wiring can be added later without changing persistence domain logic.
