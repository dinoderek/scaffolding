# Components Catalog (Seed, M8 Task 03)

## Purpose

Seed the authoritative UI components/primitives catalog with the initial token/primitives foundation introduced in `T-20260226-03`.

This is a partial draft. `T-20260226-05` owns final catalog structure/coverage.

## Canonical locations (current)

- UI tokens source of truth: `apps/mobile/components/ui/tokens.ts:1`
- UI primitives barrel exports: `apps/mobile/components/ui/index.ts:1`
- UI primitives folder (canonical): `apps/mobile/components/ui/`

## Implemented in Task 03 (foundation set)

### Tokens

1. `uiTokens` + token groups (`colors`, `space`, `radius`, `typography`, `border`)
- File: `apps/mobile/components/ui/tokens.ts:66`
- Notes:
  - Semantic token naming (for example `actionPrimary`, `surfaceDefault`, `textSecondary`)
  - Derived from audited current literals/patterns, not a redesign

### Primitives

1. `UiText`
- File: `apps/mobile/components/ui/text.tsx:24`
- Current role:
  - semantic text variants for labels/titles/subtitles/button/tab text
- Notes:
  - Variants are intentionally lightweight and may be consolidated/renamed in Task 05 docs after broader adoption

2. `UiSurface`
- File: `apps/mobile/components/ui/surface.tsx:13`
- Current role:
  - bordered card/panel surface primitive (`card`, `panelMuted`)
- Notes:
  - Base for panel/card convergence without forcing screen-specific wrappers into generic primitives

3. `UiButton`
- File: `apps/mobile/components/ui/button.tsx:20`
- Current role:
  - semantic button primitive (`primary`, `secondary`, `danger`, `tab`)
- Notes:
  - Includes tab selected-state accessibility wiring for `TopLevelTabs`
  - Prop surface is intentionally small for the first iteration

## Proof integrations completed in Task 03

1. `TopLevelTabs` now consumes `UiButton` + `UiSurface` + tokens
- File: `apps/mobile/components/navigation/top-level-tabs.tsx:13`

2. `SessionContentLayout` now consumes `UiSurface` + `UiText` + tokens
- File: `apps/mobile/components/session-recorder/session-content-layout.tsx:40`

## Specialized shared components (remain specialized)

1. `TopLevelTabs`
- File: `apps/mobile/components/navigation/top-level-tabs.tsx:13`
- Status:
  - specialized navigation component using primitives (not itself a generic primitive)

2. `SessionContentLayout`
- File: `apps/mobile/components/session-recorder/session-content-layout.tsx:40`
- Status:
  - specialized session/exercise/set layout scaffold using primitives

3. `session-recorder/types.ts`
- File: `apps/mobile/components/session-recorder/types.ts:1`
- Status:
  - UI-supporting state/types/constants module (non-visual)

## Deferred primitive candidates (tracked from audit)

These remain audit-approved candidates but are not implemented in Task 03 to keep scope bounded:

- `ScreenContainer` / `ScreenScrollContainer`
- `EmptyState` / state panels
- `ModalSurface` / `ModalBackdrop`
- `FormField` composition helper
- `PressableRowCard`
- `IconActionButton`

Reference source: `docs/specs/ui/ui-pattern-audit.md:402`
