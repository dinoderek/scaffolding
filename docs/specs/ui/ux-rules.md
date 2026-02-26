# UX Rules (Seed, M8 Task 04)

## Purpose

Seed the authoritative UI rules doc with the first practical enforcement rule introduced in `T-20260226-04`.

This is a partial draft. `T-20260226-05` owns final structure/coverage.

## Related UI docs (current)

- Repo discovery baseline: `docs/specs/ui/repo-discovery-baseline.md`
- UI pattern audit: `docs/specs/ui/ui-pattern-audit.md`
- Components catalog (seed): `docs/specs/ui/components-catalog.md`

## Guardrail rules (current, enforced)

1. Do not add raw color literals (`#hex`, `rgb(...)`, `rgba(...)`) directly in screen/component `.tsx` files.
2. Use UI tokens from `apps/mobile/components/ui/tokens.ts` (directly or through primitives).
3. Raw color literals are only allowed in the token source of truth and explicitly allowlisted legacy files during incremental migration.

## Guardrail command

- Run from `apps/mobile/`:
  - `npm run lint:ui-guardrails`
- Audit mode (includes allowlisted legacy files in output without treating them as blocking):
  - `npm run lint:ui-guardrails -- --include-allowlisted`

### What the command checks

- Scans `app/**/*.tsx` and `components/**/*.tsx`
- Excludes tests/snapshots (`__tests__`, `__snapshots__`, `*.test.tsx`, `*.spec.tsx`)
- Flags raw color literals
- Skips explicit allowlisted legacy files by default

## Exceptions / allowlist process

Use exceptions only for temporary legacy migration scope or unavoidable platform/runtime edge cases.

### How to add an exception

1. Add the file path + reason to `apps/mobile/scripts/ui-guardrails.config.js`.
2. Keep the reason specific (what is blocked and which task will remove it).
3. Record the exception in the active task card `Completion note` if introduced/expanded.

### Current allowlisted files (Task 04 baseline)

- `app/session-list.tsx` - pending `T-20260226-06` screen refactor to tokens/primitives.
- `app/session-recorder.tsx` - pending `T-20260226-06` screen refactor to tokens/primitives.
- `app/exercise-catalog.tsx` - pending `T-20260226-06` screen refactor to tokens/primitives.
- `app/completed-session/[sessionId].tsx` - pending `T-20260226-06` screen refactor to tokens/primitives.

## Reviewer usage (M8)

1. Run `npm run lint:ui-guardrails` for UI-affecting changes.
2. If it fails, replace raw literals with tokens/primitives or add a narrowly scoped temporary exception with rationale.
3. Use audit mode when evaluating remaining migration work in allowlisted legacy screens.
