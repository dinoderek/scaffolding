# Milestone Spec

## Milestone metadata

- Milestone ID: `M9`
- Title: Exercise log tags and fast selection foundation
- Status: `in_progress`
- Owner: `AI + human reviewer`
- Target window: `2026-03` / `2026-04`

## Parent references

- Project directives: `docs/specs/README.md`
- Product overview: `docs/specs/00-product.md`
- Architecture: `docs/specs/03-technical-architecture.md`
- Testing strategy: `docs/specs/06-testing-strategy.md`
- Project structure: `docs/specs/09-project-structure.md`
- UX standard: `docs/specs/08-ux-delivery-standard.md`
- UI docs bundle index: `docs/specs/ui/README.md`
- Related prior milestone: `docs/specs/milestones/M6-exercise-taxonomy-and-muscle-analytics-foundation.md`
- Brainstorm source: `docs/brainstorms/M9-Exercise-Variations-Better.md`

## Milestone objective

Introduce optional per-log exercise tags while preserving a fast and intuitive exercise logging flow, and establish the local data foundation for future tag-based analytics without implementing analytics in this milestone.

## Locked decisions (for M9)

1. Tags are optional for logging (`no tags` is valid).
2. Tags attach to a logged exercise instance, not to individual sets, exercise definitions, or locations.
3. Tags are freeform user-defined labels; M9 does not ship seeded/system tags.
4. Tag creation and selection is recorder-first in M9; there is no catalog-first tag-authoring flow.
5. Recorder fast-selection work still uses canonical exercise definitions as the exercise source; tags replace the discarded variation layer, not canonical exercise identity.
6. Tag suggestions are derived from the user's previously used tags for the same exercise definition; M9 does not introduce a separate global tag-management surface.
7. Exercise catalog metadata semantics remain retroactive for exercise labels and exercise-to-muscle mappings, but tags are historical session data stored on logged exercises.
8. The undeployed key/value variation implementation from prior M9 work is intentionally rolled back rather than migrated forward.
9. Product decisions are tracked in `docs/specs/00-product.md`; technical decisions are tracked in `docs/specs/03-technical-architecture.md`.

## In scope

- Roll back the undeployed variation-specific local schema, repository APIs, seeds, and compatibility/backfill behavior introduced by earlier M9 work.
- Local schema/model support for per-log exercise tags attached to a session exercise.
- Recorder persistence updates so logged session exercises reference canonical exercise identity and `0..n` tags.
- Recorder UX for:
  - fast exercise add with no required tags,
  - viewing current tags on an exercise card,
  - adding/removing tags inline,
  - selecting from prior tags used for the same exercise.
- History/detail UI display of persisted tags on logged exercises.
- Regression coverage for tag persistence, duplicate handling, suggestion behavior, and historical display.
- Product + technical decision alignment across docs for the tag pivot and rollback direction.

## Out of scope

- Key/value variation modeling, exercise-owned variation definitions, or variation-selection UI.
- Catalog UI for creating/managing variations or tags.
- Analytics feature implementation (dashboards, PR/grouping controls, derived metrics).
- Global tag-management UI, tag aliases, or tag rename workflows.
- Backend sync/API rollout for tag model changes.
- Group-level social/competition behavior.

## Deliverables

1. A documented rollback plan for the undeployed variation implementation, with no migration/backfill burden carried into the new tag direction.
2. A local tag data contract (schema + repository contract) that supports `0..n` tags on a logged exercise.
3. Recorder UX where exercise logging remains low-friction and tag management is optional and inline.
4. Same-exercise prior-tag suggestion behavior to accelerate repeat logging.
5. History/detail tag display that preserves logged tags as historical session data.
6. Updated product/technical/milestone docs that lock the tag-based direction and supersede the earlier variation plan.

## Acceptance criteria

1. Logged session exercises persist a stable exercise reference and optional exercise tags; tags are not required to save/complete a session.
2. M9 no longer depends on seeded variation keys/values, exercise-owned variations, or variation identity references.
3. Users can add and remove tags from the recorder flow, including creating a new tag inline.
4. Recorder offers prior tag suggestions based on the same exercise definition.
5. Duplicate tags on the same logged exercise are blocked by the chosen normalization rules.
6. History/detail screens render persisted tags without relying on retroactive catalog metadata semantics.
7. The undeployed variation implementation is rolled back without adding migration/backfill work for released users.
8. Product + architecture docs explicitly lock the tag pivot and the exercise-metadata-vs-tag-history semantics.
9. M9 task specs are detailed enough for implementation without reopening the core model/semantics decision.

## Task breakdown

1. `docs/tasks/complete/T-20260227-01-m9-retroactive-semantics-decision-realignment.md` - align retroactive exercise metadata semantics across product/architecture docs. (`completed`; still valid for exercise metadata, variation-specific wording superseded by this milestone revision)
2. `docs/tasks/complete/T-20260227-02-m9-local-variation-schema-and-session-reference-migration.md` - previously implemented undeployed variation foundation. (`completed`; intentionally superseded by rollback task below and not part of the final M9 deliverable)
3. `docs/tasks/T-20260303-01-m9-rollback-undeployed-variation-foundation.md` - remove undeployed variation-specific schema/runtime/docs assumptions and restore a clean baseline for the tag direction. (`planned`)
4. `docs/tasks/T-20260303-02-m9-exercise-tag-data-model-and-recorder-persistence.md` - implement local tag schema/repository behavior and recorder persistence contracts. (`planned`)
5. `docs/tasks/T-20260303-03-m9-recorder-tag-management-ui.md` - implement recorder tag chips, add-tag flow, and same-exercise tag suggestions. (`planned`)
6. `docs/tasks/T-20260303-04-m9-history-tag-display-and-regression-coverage.md` - finalize tag display in history/detail and regression coverage for persistence/suggestions/duplicates. (`planned`)

## Risks / dependencies

- Current recorder still carries legacy preset flows and pending M6 integration work (`T-20260224-04`); M9 recorder work must either absorb or explicitly sequence that dependency.
- Freeform tags can create entropy; normalization and suggestion rules must keep duplicates manageable without making tag entry frustrating.
- Keeping tags historical while exercise metadata stays retroactive creates a mixed semantic model that must be documented clearly in UI and tests.
- Future analytics may need aliasing or normalization beyond M9 if users create overlapping labels (`neutral`, `neutral grip`, `neutral-grip`).
- Rollback must fully remove the undeployed variation path so future tasks are not dragged down by dead schema/runtime branches.

## Decision log

- Date: 2026-02-27
- Decision: Exercise catalog metadata semantics are retroactive for history and future analytics interpretation.
- Reason: user intent favors "edit once, apply everywhere" for canonical exercise metadata and avoids high model complexity before analytics features exist.
- Impact: exercise labels and exercise-to-muscle mappings continue to resolve from the latest catalog metadata.

- Date: 2026-03-03
- Decision: M9 pivots from exercise-owned key/value variations to per-log exercise tags.
- Reason: the real use cases are better served by lightweight logged annotations than by a heavy variation taxonomy, especially because cross-exercise variation grouping is not a meaningful requirement.
- Impact: planned variation authoring/selection tasks are superseded by rollback, tag persistence, recorder tagging UI, and tag-display/regression tasks.

- Date: 2026-03-03
- Decision: The undeployed variation implementation will be rolled back instead of migrated forward.
- Reason: the variation work has not been released, so complexity can be removed directly without carrying compatibility or backfill obligations into the new M9 plan.
- Impact: rollback becomes an explicit first-class M9 task and prior variation-specific migration/backfill behavior is not part of the final milestone deliverable.

- Date: 2026-03-03
- Decision: Tags are historical session data, not retroactive catalog metadata.
- Reason: tags are lightweight per-log annotations rather than canonical exercise definitions, so changing future tag usage should not rewrite historical sessions.
- Impact: history/detail screens render stored tags as logged, while exercise names/mappings continue to resolve retroactively from the catalog.

## Completion note (fill when milestone closes)

- What changed:
- Verification summary:
- What remains:

## Status update checklist (mandatory during task closeout)

- Keep milestone `Status` current as tasks progress.
- Update task breakdown entries to reflect each task state (`planned | in_progress | completed | blocked | outdated`).
- If milestone remains open after a session, record why in the active task completion note and/or milestone completion note.
