# Technical Architecture Decisions (High-Level)

## Purpose

Capture top-level architecture decisions for MVP, with clear `Adopted` vs `Planned` status.

## System map

`Expo React Native UI`
-> `Session domain + autosave orchestration`
-> `Local repository layer (Drizzle + SQLite)`
-> `Sync outbox (planned)`
-> `Supabase backend (planned)`

## Decision register

| Decision | Status | Why | Source |
| --- | --- | --- | --- |
| `Expo + React Native + TypeScript` for mobile frontend | `Adopted` | Fastest path to a phone-first app with one codebase and strong AI-assisted delivery. | `apps/mobile/package.json` |
| `Expo Router` for app navigation | `Adopted` | File-based routing keeps structure simple and predictable for AI and humans. | `apps/mobile/package.json`, `apps/mobile/app/` |
| `SQLite (on-device) + Drizzle ORM` for local persistence | `Adopted` | Reliable offline-first data with typed schema and migrations. | `apps/mobile/package.json`, `apps/mobile/src/data/schema/`, `apps/mobile/drizzle/` |
| Continuous local autosave is implemented as a domain/data-layer contract before UI wiring | `Adopted` | Enables isolated verification of persistence behavior before screen integration. | `apps/mobile/src/session-recorder/draft-autosave.ts`, `docs/specs/milestones/M3-session-domain-local-autosave.md` |
| React Native lifecycle integration uses adapter contracts | `Adopted` | Maps RN lifecycle events to flush triggers without coupling persistence logic to UI components. | `apps/mobile/src/session-recorder/lifecycle-helpers.ts` |
| Session completion persists `completedAt` and materialized `durationSec` | `Adopted` | Keeps completion reads/sorts deterministic without recomputing duration for completed sessions. | `apps/mobile/src/data/schema/sessions.ts`, `apps/mobile/src/data/session-drafts.ts` |
| Autosave policy is explicit and testable; precise timing constants are defined in milestone/task specs | `Adopted` | Preserves high-level architecture stability while allowing milestone-level tuning details. | `docs/specs/milestones/M3-session-domain-local-autosave.md`, `docs/tasks/T-20260220-03-m3-continuous-autosave-and-draft-lifecycle.md` |
| Sync contract uses client outbox pattern from local store to cloud | `Planned` | Maintains offline-first guarantees while enabling reliable deferred sync when online. | `docs/specs/00-mvp-deliverables.md#4-session-sync-between-fe-and-backend` |
| Backend platform is `Supabase (Postgres + Auth + RLS)` | `Planned` | Delivers auth + data primitives quickly on a free-tier-friendly stack. | `docs/specs/00-mvp-deliverables.md#2-backend-foundation-and-basic-auth` |
| Social/group features are layered after tracker and sync foundations | `Planned` | Prevents premature complexity while keeping extension path explicit in delivery order. | `docs/specs/00-mvp-deliverables.md#5-first-groups-prototype` |
