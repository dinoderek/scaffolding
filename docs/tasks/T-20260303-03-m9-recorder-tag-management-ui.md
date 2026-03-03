---
task_id: T-20260303-03
milestone_id: "M9"
status: planned
ui_impact: "yes"
areas: "frontend,docs"
runtimes: "node,expo,maestro"
gates_fast: "./scripts/quality-fast.sh frontend"
gates_slow: "./scripts/quality-slow.sh frontend"
docs_touched: "docs/specs/ui/screen-map.md,docs/specs/ui/navigation-contract.md,docs/specs/ui/components-catalog.md,docs/specs/ui/ux-rules.md,docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md"
---

# Task Card

## Task metadata

- Task ID: `T-20260303-03`
- Title: M9 recorder tag management UI
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
  - `docs/specs/ui/navigation-contract.md`
  - `docs/specs/ui/components-catalog.md`
  - `docs/specs/ui/ux-rules.md`
- Code/docs inventory freshness checks run:
  - recorder route inventory in `apps/mobile/app/session-recorder.tsx`
- Known stale references or assumptions:
  - assumes the tag persistence/query task has landed first
- Optional helper command:
  - `./scripts/task-bootstrap.sh docs/tasks/T-20260303-03-m9-recorder-tag-management-ui.md`

## Objective

Implement an inline recorder tagging flow where logging an exercise stays fast by default and users can optionally add/remove tags using prior same-exercise suggestions or new freeform entry.

## Scope

### In scope

- Keep the default add-exercise flow fast with no required tag step.
- Show current tags compactly on the exercise card.
- Add a recorder affordance to manage tags for the logged exercise.
- Implement add-tag interaction with:
  - substring filtering,
  - same-exercise prior tag suggestions,
  - inline creation of a new tag from the entered text.
- Support removing a tag directly from the exercise card/tag-management flow.
- Add/adjust recorder tests to cover no-tag, suggested-tag, new-tag, and duplicate/error paths.

### Out of scope

- Catalog tag-management UI.
- Analytics implementation.
- Backend sync/API implementation.

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

1. Flow name: Fast add exercise with no tags
   - Trigger: User taps `Log new exercise`.
   - Steps: Open picker -> select exercise -> exercise is added immediately.
   - Success outcome: Exercise row appears with sets editable and no forced tag step.
   - Failure/edge outcome: If exercise source cannot load, user sees actionable error and can retry.

2. Flow name: Add an existing suggested tag
   - Trigger: User wants to reuse a prior tag for the selected exercise.
   - Steps: Open tag manager -> type or browse suggestion list -> tap a suggested tag.
   - Success outcome: Tag is attached immediately and visible on the exercise card.
   - Failure/edge outcome: Duplicate tag selection is blocked with clear inline feedback or disabled state.

3. Flow name: Create a new tag inline
   - Trigger: User needs a tag not present in suggestions.
   - Steps: Open tag manager -> enter text -> tap add -> tag is attached to the exercise.
   - Success outcome: New tag is saved and available for future suggestions on the same exercise.
   - Failure/edge outcome: Empty/whitespace-only input is blocked near the field.

4. Flow name: Remove an attached tag
   - Trigger: User no longer wants a tag on the logged exercise.
   - Steps: Tap tag remove affordance from the card or tag manager.
   - Success outcome: Tag is removed immediately and persistence state updates.
   - Failure/edge outcome: Removing a tag never blocks set editing or other exercise actions.

### Interaction + appearance notes (lightweight)

- Keep tag UI secondary to set logging and exercise actions.
- Render attached tags as compact chips under the exercise title.
- The tag manager should feel lightweight; avoid forcing a full-screen detour for a small edit.
- Suggestions should be easy to scan and clearly distinguishable from the create-new action.

## Acceptance criteria

1. Recorder adds an exercise without requiring tags.
2. Attached tags are visible on the exercise card.
3. User can open a tag-management flow, filter suggestions, select a suggestion, and create a new tag inline.
4. User can remove attached tags from the logged exercise.
5. Duplicate and empty-tag cases are blocked with clear user feedback.
6. Existing tokens/primitives/shared components are reused or exceptions are documented.
7. Relevant `docs/specs/ui/*.md` docs are updated in the same task.

## Docs touched (required)

- Planned docs/spec files to update and why:
  - `docs/specs/milestones/M9-exercise-variations-and-fast-selection-foundation.md` - progress/status update
  - `docs/specs/ui/screen-map.md` - recorder tag-management state/flow updates
  - `docs/specs/ui/navigation-contract.md` - route/query behavior changes if any
  - `docs/specs/ui/components-catalog.md` - reusable tag chip/manager component updates
  - `docs/specs/ui/ux-rules.md` - recorder tagging interaction guardrails
- UI docs update required?: `yes`
- Tokens/primitives compliance statement:
  - Reuse plan: existing recorder layout components + shared UI primitives from `apps/mobile/components/ui/**`
  - Exceptions: `TBD during implementation; document file + rationale if introduced`
- UI artifacts/screenshots expectation:
  - Required by UX/task scope?: `yes`
  - Planned captures: no-tag add flow, tag suggestion flow, new-tag creation flow, duplicate/error state

## Testing and verification approach

- Planned checks/commands:
  - targeted recorder journey tests (no-tag + suggested-tag + new-tag)
  - targeted error-path tests for duplicate/empty tags
- Standard local gate usage:
  - `./scripts/quality-fast.sh frontend` (required)
  - `./scripts/quality-slow.sh frontend` (required due user-facing recorder changes)
- Test layers covered:
  - route-level integration tests
  - autosave/persistence behavior checks
  - iOS smoke checks via slow gate
- Execution triggers:
  - always for fast gate
  - slow gate required for recorder UI behavior changes
- Slow-gate triggers:
  - changes to `apps/mobile/app/session-recorder.tsx`, related recorder components, or recorder persistence contracts
- Hosted/deployed smoke ownership: `N/A`
- CI/manual posture note: CI absent; local + artifact evidence required

## Implementation notes

- Planned files/areas allowed to change:
  - `apps/mobile/app/session-recorder.tsx`
  - recorder shared components in `apps/mobile/components/session-recorder/**`
  - data contracts under `apps/mobile/src/data/**`
  - tests under `apps/mobile/app/__tests__/**`
  - `docs/specs/ui/**`
- Project structure impact: no structure changes expected
- Constraints/assumptions:
  - no catalog tag authoring surface in M9
  - default path must remain low-friction for users who do not use tags

## Mandatory verify gates

- Standard local fast gate: `./scripts/quality-fast.sh frontend`
- Standard local slow gate: `./scripts/quality-slow.sh frontend`
- Optional closeout helper: `./scripts/task-closeout-check.sh docs/tasks/T-20260303-03-m9-recorder-tag-management-ui.md`

## Evidence

- Targeted recorder test results for no-tag, suggested-tag, new-tag, and duplicate/error flows.
- UI/UX visual artifacts for key flows.
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
- Run `./scripts/task-closeout-check.sh docs/tasks/T-20260303-03-m9-recorder-tag-management-ui.md` (or document why `N/A`) before handoff.
