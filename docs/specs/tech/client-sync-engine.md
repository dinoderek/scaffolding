# Client Sync Engine (M13)

## Purpose

Document the mobile client sync runtime introduced in M13 so future tasks can extend it safely.

Source-of-truth implementation files:

- `apps/mobile/src/sync/**`
- event emission write boundaries under `apps/mobile/src/data/**`

## 1) Components, file mappings, and roles

1. `apps/mobile/src/sync/types.ts`
- M13 envelope/request/response types.
- Locked entity-event compatibility map (`SYNC_ENTITY_EVENT_TYPES`).

2. `apps/mobile/src/sync/outbox.ts`
- Persistent queue + delivery state behavior.
- Backoff constants/policy and retry state transitions.
- Batch-response application semantics (`SUCCESS` full clear, `FAILURE` prefix clear + failed suffix retained).

3. `apps/mobile/src/sync/engine.ts`
- Flush orchestrator.
- In-flight guard (`inFlightFlushPromise`) to prevent concurrent sends.
- Transport invocation + normalization + error mapping.

4. `apps/mobile/src/sync/bootstrap.ts`
- Remote projection fetch from `app_public` tables.
- Deterministic local-vs-remote merge planning (`updated_at` winner with local tie-break).
- Atomic local projection apply + post-merge local convergence event enqueue.

5. `apps/mobile/src/sync/runtime.ts`
- Persisted sync runtime state (`enabled` + bootstrap completion metadata).
- Auth-gated ingest transport wiring (`sync_events_ingest`).
- First-enable bootstrap trigger and logged-out-then-login bootstrap trigger.
- Convergence loop helper (`flushSyncOutboxUntilSettled`).

6. `apps/mobile/src/sync/scheduler.ts`
- Foreground cadence scheduler (`60s` general, `10s` recorder).
- Online/offline toggling and immediate eligible flush on offline->online.
- Route-context mapping (`syncCadenceContextFromPathname`).

7. `apps/mobile/src/sync/index.ts`
- Public sync API surface for app/data layers.

8. `apps/mobile/src/data/schema/sync-outbox-events.ts`
- Persistent outbox table schema.

9. `apps/mobile/src/data/schema/sync-delivery-state.ts`
- Persistent delivery state schema.

10. `apps/mobile/src/data/schema/sync-runtime-state.ts`
- Persistent sync enable/bootstrap state.

11. `apps/mobile/src/data/migrations/index.ts`
- `m0007_sync_outbox_delivery_state`: outbox + delivery-state persistence.
- `m0008_sync_runtime_state`: runtime enable/bootstrap persistence.

12. Event emission integration points (`apps/mobile/src/data/**`)
- `local-gyms.ts`
- `session-drafts.ts`
- `session-list.ts`
- `exercise-catalog.ts`
- `exercise-tags.ts`

## 2) Typical flows

### A. Domain write -> queued event

1. Repository write runs in DB transaction.
2. Same transaction calls `enqueueSyncEventsTx` or `enqueueSyncEvent`.
3. Outbox rows receive monotonic `sequence_in_device`.

### B. Scheduler tick -> flush

1. Scheduler tick calls `flushSyncOutbox`.
2. Engine checks transport configured, network online, retry-block, backoff window.
3. Engine reads up to `SYNC_BATCH_MAX_SIZE` events.
4. Engine sends ingest envelope.
5. Outbox applies response semantics and updates delivery state.

### C. Offline resume

1. Scheduler receives `setOnline(false)` while offline.
2. Flushes return `offline` and queue is retained.
3. On `setOnline(true)`, scheduler triggers immediate flush + continues cadence loop.

### D. First enable bootstrap + convergence

1. User enables sync (persisted in `sync_runtime_state`).
2. Runtime checks auth session + enablement, configures ingest transport, and runs bootstrap when required for the current user.
3. Bootstrap fetches remote projection state, merges with local state deterministically, and enqueues local convergence events for local winners.
4. Runtime flushes until terminal state (`idle` = converged; non-idle terminal statuses remain retryable/non-blocking).
5. On convergence success, runtime records bootstrap completion metadata for the authenticated user.

## 3) Interactions with the rest of the application

1. Root layout (`apps/mobile/app/_layout.tsx`)
- Starts/stops default scheduler.
- Updates cadence context from pathname.

2. Data repositories (`apps/mobile/src/data/**`)
- Emit sync events at mutation boundaries.
- Keep local-first behavior even when sync transport is unavailable.

3. Auth/profile/runtime integration (current M13 state)
- Runtime subscribes to auth state changes and only enables transport/bootstrap when sync is enabled and a valid session exists.
- Runtime transport calls `POST /rest/v1/rpc/sync_events_ingest` (schema `app_public`) and consumes the locked `SUCCESS | FAILURE` envelope shape.
- Sync enable/bootstrap metadata is persisted locally in `sync_runtime_state`, so bootstrap completion is tracked per authenticated user.

4. Navigation contract coupling
- Recorder cadence depends on route segment `session-recorder`.
- If recorder route path changes, update:
  - `apps/mobile/src/sync/scheduler.ts` (`SESSION_RECORDER_ROUTE_SEGMENT`)
  - `docs/specs/ui/navigation-contract.md` (route contract)
  - this doc

## 4) Failure modes and handling

1. Transport missing
- `flushSyncOutbox` returns `disabled`; queue remains intact.

2. Offline
- `flushSyncOutbox` returns `offline`; no dequeue.

3. Retry blocked (`should_retry=false`)
- delivery state marks `retryBlocked=true`.
- subsequent flushes return `blocked` until state reset by explicit logic.

4. Retryable failure (`should_retry=true` or transport error)
- prefix commit may be removed based on `error_index`.
- failed suffix remains queued.
- next eligible attempt scheduled via locked backoff policy.

5. Non-retryable failure (`should_retry=false`)
- delivery state sets `retryBlocked=true`; queue remains for explicit follow-up handling.
- current backend examples include duplicate `event_id` with changed payload and stale sequence errors.

6. Invalid ingest response contract
- treated as transport failure path; retry backoff applied.

7. In-flight contention
- second concurrent flush returns `in_flight`, preventing duplicate send races.

8. Bootstrap fetch/merge failure
- remote projection fetch/parse failures do not mutate local domain tables because merge apply is transactional.
- runtime records inline bootstrap error metadata and keeps local-first usage unblocked.

## 5) Test overview

1. Engine/outbox behavior
- `apps/mobile/app/__tests__/sync-outbox-engine.test.ts`
- coverage: in-flight guard, backoff constants, success/failure mapping, offline/disabled/blocked states.

2. Scheduler behavior
- `apps/mobile/app/__tests__/sync-scheduler.test.ts`
- coverage: 60s vs 10s cadence and offline->online immediate trigger.

3. Domain emission wiring
- `apps/mobile/app/__tests__/sync-domain-event-emission.test.ts`
- coverage: repository write boundaries enqueue expected entity events.

4. Root wiring
- `apps/mobile/app/__tests__/root-layout-auth-bootstrap.test.tsx`
- coverage: scheduler/runtime bootstrap + pathname context update wiring.

5. Bootstrap + runtime orchestration
- `apps/mobile/app/__tests__/sync-bootstrap-merge.test.ts`
- coverage: deterministic merge decisions and convergence-loop terminal behavior.
- `apps/mobile/app/__tests__/sync-runtime-bootstrap.test.ts`
- coverage: first-enable bootstrap trigger and logged-out-then-login bootstrap trigger.

6. Backend ingest/projection contract
- `supabase/tests/sync-events-ingest-contract.sh`
- coverage: success projection, duplicate replay idempotency, duplicate-with-drift rejection, strict ordering + prefix commit, and auth/RLS denial paths.

## Maintenance rule for follow-up tasks

Tasks `M13-T03`, `M13-T04`, and `M13-T05` must update this document in the same session when they change:

- sync flow control/state transitions,
- ingest/ack handling assumptions at the client boundary,
- cadence/context mapping behavior,
- event emission boundaries,
- verification/test strategy for sync runtime behavior.
