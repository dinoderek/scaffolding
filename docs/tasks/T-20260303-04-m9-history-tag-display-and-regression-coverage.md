---
task_id: T-20260303-04
milestone_id: "M9"
status: planned
ui_impact: "yes"
areas: "frontend,docs"
runtimes: "node,expo,maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/ui/screen-map.md,docs/specs/ui/ux-rules.md,docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260303-04`
- Title: M9 history tag display and regression coverage
- Status: `planned`
- Session date: `2026-03-03`
- Session interaction mode: `interactive (default)`

## Parent references (required)

- Project directives: `docs/specs/README.md`
- Milestone spec: `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- UX standard: `docs/specs/08-ux-delivery-standard.md`
- UI docs bundle index: `docs/specs/ui/README.md`

## Context Freshness (required at session start; update before edits)

- Verified current branch + HEAD commit: `TBD at execution start`
- Start-of-session sync completed per `docs/specs/04-ai-development-playbook.md` git sync workflow?: `TBD`
- Parent refs opened in this session:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md`
  - `docs/specs/08-ux-delivery-standard.md`
  - `docs/specs/ui/README.md`
  - `docs/specs/ui/screen-map.md`
  - `docs/specs/ui/ux-rules.md`
- Code/docs inventory freshness checks run:
  - completed-session/session-list UI read-path inventory
  - recorder draft restore/edit inventory
- Known stale references or assumptions:
  - assumes rollback, tag data model, and recorder tag UI tasks landed first
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260303-04-m9-history-tag-display-and-regression-coverage.md`

## Objective

Finalize how logged exercise tags are shown after logging and add regression coverage that proves tags survive autosave, reload, completion, and historical read paths.

## Scope

### In scope

- Ensure completed-session detail and any scoped history surfaces render logged tags readably.
- Ensure draft reload, reopen/edit, and completed-session read paths preserve tags correctly.
- Add regression tests for:
  - autosave/reload,
  - complete/reopen/edit flows,
  - historical display of stored tags,
  - duplicate/normalization edge behavior where relevant to read paths.
- Update milestone/UI docs to reflect final historical tag behavior.

### Out of scope

- Analytics UI or analytics materialization implementation.
- Backend sync/API implementation.
- Global tag rename or alias workflows.

## UI Impact (required checkpoint)

- UI Impact?: `yes`
- If `yes`:
  - keep UI/UX parent references.
  - keep the `UX Contract` section and fill it before implementation.
  - include tokens/primitives compliance statement in `Docs touched` / implementation notes.
  - include a UI docs update plan in `Docs touched`.
  - include screenshots/artifacts expectations in `Evidence`.

## UX Contract (UI/UX tasks only)

### Key user flows (minimal template)

1. Flow name: Reopen a draft and retain tags
   - Trigger: User leaves and returns to an in-progress session.
   - Steps: Add tags -> autosave -> reload recorder -> inspect exercise card.
   - Success outcome: Tags are restored exactly as logged.
   - Failure/edge outcome: Missing or malformed tag data never crashes the recorder; user sees a stable fallback state.

2. Flow name: View tags on completed history
   - Trigger: User opens a completed session from history.
   - Steps: Complete a tagged session -> open completed detail -> inspect logged exercises.
   - Success outcome: Logged tags are visible and readable as historical data.
   - Failure/edge outcome: If no tags exist, the UI remains clean and does not show empty tag chrome.

3. Flow name: Edit completed session and preserve tags
   - Trigger: User reopens or edits a completed session that already has tags.
   - Steps: Open completed detail -> edit/reopen -> inspect tags -> save.
   - Success outcome: Tags survive the edit cycle unless the user explicitly changes them.
   - Failure/edge outcome: Tag persistence does not regress when other exercise fields are changed.

### Interaction + appearance notes (lightweight)

- Keep historical tag display compact and secondary to the core exercise/set data.
- Empty-tag states should not add visual noise.
- Historical tags should look like immutable recorded data, not editable catalog metadata.

## Acceptance criteria

1. Tagged exercises restore correctly after autosave/reload.
2. Completed-session detail renders persisted tags readably.
3. Reopen/edit flows preserve tags unless the user explicitly changes them.
4. Regression tests cover the main read/write persistence cycle for tags.
5. UI docs and milestone docs reflect the finalized historical tag behavior.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md` - closeout behavior details
  - `docs/specs/ui/screen-map.md` - history/detail state notes if changed
  - `docs/specs/ui/ux-rules.md` - historical tag display semantics
- UI docs update required?: `yes`
- Tokens/primitives compliance statement:
  - Reuse plan: reuse existing session-list/detail typography and row primitives
  - Exceptions: `TBD during implementation; document file + rationale if introduced`
- UI artifacts/screenshots expectation:
  - Required by UX/task scope?: `yes`
  - Planned captures: recorder reload with tags, completed detail with tags, empty/no-tag historical state

## Testing and verification approach

- Planned checks/commands:
  - targeted history/detail integration tests
  - recorder persistence/edit-cycle tests for tags
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh frontend` (required due user-facing history + persistence-sensitive behavior)
- Test layers covered:
  - route integration tests
  - draft/completed persistence tests
  - iOS smoke checks via slow gate
- Execution triggers:
  - always for fast gate
  - slow gate required due persistence-sensitive UI rendering changes
- Slow-gate triggers:
  - changes to recorder persistence, completed-session detail rendering, or history tag display paths
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: CI absent; local + artifact evidence required

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/src/data/**`
  - `apps/mobile/app/session-list.tsx`
  - `apps/mobile/app/completed-session/[sessionId].tsx`
  - related tests under `apps/mobile/app/__tests__/**`
  - `docs/specs/ui/**`
- Project structure impact: no structure changes expected
- Constraints/assumptions:
  - tags remain historical session data and should not resolve through retroactive catalog metadata

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260303-04-m9-history-tag-display-and-regression-coverage.md`

## Evidence

- Persistence/regression test summary for autosave, reload, complete, and edit paths.
- UI/UX artifacts for required flows.
- Manual verification summary (CI absent).

## Completion note (fill at end per `docs/specs/04-ai-development-playbook.md`)

- What changed:
- What tests ran:
- What remains:

## Status update checklist (mandatory at closeout)

- Update `Status` to `completed` or `blocked`.
- Ensure completion note is filled before handoff.
- For UI/UX tasks, update relevant `docs/specs/ui/*.md` files (or record explicit no-update rationale).
- If significant project-structure changes were made, update `docs/specs/09-project-structure.md` and mention it in completion note.
- Update parent milestone task breakdown/status in the same session.
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260303-04-m9-history-tag-display-and-regression-coverage.md` (or document why `N/A`) before handoff.
