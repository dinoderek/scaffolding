# UI Pattern Audit (M8 Task 02)

## Purpose

Inventory the current mobile UI patterns from real code (not intended design), identify primitive seeds/candidates, and record refactor priorities for M8 follow-on tasks.

Verified during `T-20260226-02` on `2026-02-26`.

## Inputs and scope

- Baseline discovery doc: `docs/specs/ui/repo-discovery-baseline.md:1`
- Audited user-facing route files:
  - `apps/mobile/app/index.tsx:1`
  - `apps/mobile/app/session-list.tsx:783`
  - `apps/mobile/app/session-recorder.tsx:205`
  - `apps/mobile/app/exercise-catalog.tsx:106`
  - `apps/mobile/app/completed-session/[sessionId].tsx:503`
- Shared UI components/modules reviewed:
  - `apps/mobile/components/navigation/top-level-tabs.tsx:13`
  - `apps/mobile/components/session-recorder/session-content-layout.tsx:40`
  - `apps/mobile/components/session-recorder/types.ts:37`

Constraints for this doc:

- This is an evidence source for Task 03/04/05/06.
- It does not define final token values or final primitive APIs.
- It avoids normalizing one-off patterns into shared primitives prematurely.

## Screen audit (major sections and pattern anchors)

### Route alias and layout (no unique screen UI)

1. `apps/mobile/app/index.tsx`
- Route alias only; re-exports `session-list` as `/`: `apps/mobile/app/index.tsx:1`
- No unique UI patterns beyond the destination screen.

2. `apps/mobile/app/_layout.tsx`
- Navigation/bootstrap shell, not a user-facing screen layout composition.
- Stack registration and titles: `apps/mobile/app/_layout.tsx:15`
- Local data bootstrap side-effect on mount: `apps/mobile/app/_layout.tsx:9`

### `session-list` screen

Route entry and screen shell:

- Route wrapper export (`SessionListRoute`): `apps/mobile/app/session-list.tsx:783`
- Testable screen shell export: `apps/mobile/app/session-list.tsx:249`

Major UI sections:

1. Pinned top region (`Start Session` or active-session card)
- Pinned top container: `apps/mobile/app/session-list.tsx:520`
- Primary action button variant (`Start Session`): `apps/mobile/app/session-list.tsx:522`
- Active session row/card with row-level primary pressable + trailing icon actions: `apps/mobile/app/session-list.tsx:537`
- Trailing icon actions (complete/menu): `apps/mobile/app/session-list.tsx:554`, `apps/mobile/app/session-list.tsx:565`

2. History section header + toggle
- Section header row (`History` + show/hide deleted control): `apps/mobile/app/session-list.tsx:579`
- Pill/toggle action (`Show deleted` / `Hide deleted`): `apps/mobile/app/session-list.tsx:584`

3. Completed-history list and state panels
- History scroll container: `apps/mobile/app/session-list.tsx:596`
- Loading state panel: `apps/mobile/app/session-list.tsx:602`
- Error state panel: `apps/mobile/app/session-list.tsx:608`
- Empty completed-history state panel: `apps/mobile/app/session-list.tsx:614`
- Completed session list rows (pressable main area + kebab action): `apps/mobile/app/session-list.tsx:621`, `apps/mobile/app/session-list.tsx:631`, `apps/mobile/app/session-list.tsx:640`
- Global first-time empty state card: `apps/mobile/app/session-list.tsx:653`

4. Bottom navigation
- Shared `TopLevelTabs` usage: `apps/mobile/app/session-list.tsx:666`

5. Action menus / modal overlays
- Active session action modal: `apps/mobile/app/session-list.tsx:673`
- Completed session action modal (`delete` / `undelete` variants): `apps/mobile/app/session-list.tsx:700`

### `session-recorder` screen

Route entry:

- Route screen export: `apps/mobile/app/session-recorder.tsx:205`

Major UI sections:

1. Main recorder content scaffold (shared layout)
- Main scroll container: `apps/mobile/app/session-recorder.tsx:926`
- Shared `SessionContentLayout` usage: `apps/mobile/app/session-recorder.tsx:927`
- Date/time read-only field slot: `apps/mobile/app/session-recorder.tsx:929`
- Gym selector button slot: `apps/mobile/app/session-recorder.tsx:934`
- Per-set row editor pattern (weight/reps inputs + remove button): `apps/mobile/app/session-recorder.tsx:941`
- Exercise row header menu affordance (`•••`): `apps/mobile/app/session-recorder.tsx:967`
- Exercise footer action (`Add set`): `apps/mobile/app/session-recorder.tsx:975`
- Shared empty-state text override: `apps/mobile/app/session-recorder.tsx:983`

2. Primary screen actions
- `Log new exercise` button: `apps/mobile/app/session-recorder.tsx:986`
- `Submit Session` button: `apps/mobile/app/session-recorder.tsx:993`

3. Confirmation modal
- Cleanup confirmation modal (submit flow): `apps/mobile/app/session-recorder.tsx:997`
- Confirmation card + stacked buttons: `apps/mobile/app/session-recorder.tsx:1008`, `apps/mobile/app/session-recorder.tsx:1012`

4. Gym flow modal (picker/manage/editor modes)
- Modal shell: `apps/mobile/app/session-recorder.tsx:1023`
- Picker mode list rows: `apps/mobile/app/session-recorder.tsx:1036`, `apps/mobile/app/session-recorder.tsx:1041`
- Manage mode row with inline `Edit`/`Archive` actions: `apps/mobile/app/session-recorder.tsx:1062`, `apps/mobile/app/session-recorder.tsx:1079`
- Editor mode text input + primary/secondary action row: `apps/mobile/app/session-recorder.tsx:1109`, `apps/mobile/app/session-recorder.tsx:1112`, `apps/mobile/app/session-recorder.tsx:1120`

5. Exercise flow modal (picker/manage/editor modes)
- Modal shell: `apps/mobile/app/session-recorder.tsx:1133`
- Picker mode list rows: `apps/mobile/app/session-recorder.tsx:1146`, `apps/mobile/app/session-recorder.tsx:1151`
- Manage mode row with inline actions: `apps/mobile/app/session-recorder.tsx:1172`, `apps/mobile/app/session-recorder.tsx:1189`
- Manage-mode empty state text: `apps/mobile/app/session-recorder.tsx:1212`
- Editor mode input + action row: `apps/mobile/app/session-recorder.tsx:1219`, `apps/mobile/app/session-recorder.tsx:1222`, `apps/mobile/app/session-recorder.tsx:1229`

6. Exercise action menu modal
- Action-menu modal with secondary + danger actions: `apps/mobile/app/session-recorder.tsx:1243`, `apps/mobile/app/session-recorder.tsx:1254`

### `exercise-catalog` screen

Route entry:

- Route screen export: `apps/mobile/app/exercise-catalog.tsx:106`

Major UI sections:

1. Shared bottom tabs (prebuilt and reused in loading/error/success paths)
- `bottomTabs` composition: `apps/mobile/app/exercise-catalog.tsx:379`

2. Whole-screen state variants
- Loading state (centered panel): `apps/mobile/app/exercise-catalog.tsx:387`
- Error state (centered panel): `apps/mobile/app/exercise-catalog.tsx:400`

3. Main screen content
- Pinned top region with primary `New Exercise` action + optional success feedback card: `apps/mobile/app/exercise-catalog.tsx:415`, `apps/mobile/app/exercise-catalog.tsx:416`, `apps/mobile/app/exercise-catalog.tsx:423`
- Scrollable exercise list: `apps/mobile/app/exercise-catalog.tsx:432`
- Exercise list row (main pressable + trailing kebab action): `apps/mobile/app/exercise-catalog.tsx:436`, `apps/mobile/app/exercise-catalog.tsx:439`, `apps/mobile/app/exercise-catalog.tsx:452`
- Empty list helper text: `apps/mobile/app/exercise-catalog.tsx:461`

4. Exercise editor modal (complex form)
- Editor modal shell and card: `apps/mobile/app/exercise-catalog.tsx:469`, `apps/mobile/app/exercise-catalog.tsx:480`
- Modal title/header row: `apps/mobile/app/exercise-catalog.tsx:481`
- Text input field + validation messaging: `apps/mobile/app/exercise-catalog.tsx:492`, `apps/mobile/app/exercise-catalog.tsx:508`
- Picker trigger button pattern (primary muscle): `apps/mobile/app/exercise-catalog.tsx:514`, `apps/mobile/app/exercise-catalog.tsx:515`
- Secondary-muscle list rows + remove actions: `apps/mobile/app/exercise-catalog.tsx:534`, `apps/mobile/app/exercise-catalog.tsx:539`, `apps/mobile/app/exercise-catalog.tsx:549`
- Modal footer button row (`Cancel` + primary save): `apps/mobile/app/exercise-catalog.tsx:588`

5. Nested selector overlay (within editor modal)
- Selector overlay layer + backdrop + card: `apps/mobile/app/exercise-catalog.tsx:602`, `apps/mobile/app/exercise-catalog.tsx:603`, `apps/mobile/app/exercise-catalog.tsx:609`
- Selector list row pattern: `apps/mobile/app/exercise-catalog.tsx:616`, `apps/mobile/app/exercise-catalog.tsx:618`
- Selector empty state helper text: `apps/mobile/app/exercise-catalog.tsx:645`

6. Action and delete modals
- Exercise action menu modal: `apps/mobile/app/exercise-catalog.tsx:666`
- Delete confirmation modal: `apps/mobile/app/exercise-catalog.tsx:709`

### `completed-session/[sessionId]` screen

Route entry and mode resolution:

- Dynamic route wrapper parses `sessionId` and `intent` (`view` vs `edit`): `apps/mobile/app/completed-session/[sessionId].tsx:503`

Major UI sections:

1. Whole-screen state variants (all include dynamic stack title)
- Loading state: `apps/mobile/app/completed-session/[sessionId].tsx:293`
- Error state: `apps/mobile/app/completed-session/[sessionId].tsx:304`
- Not-found state: `apps/mobile/app/completed-session/[sessionId].tsx:316`

2. Main detail screen with sticky action bar
- ScrollView with sticky header index: `apps/mobile/app/completed-session/[sessionId].tsx:331`, `apps/mobile/app/completed-session/[sessionId].tsx:333`
- Sticky action bar card (primary/secondary/danger actions): `apps/mobile/app/completed-session/[sessionId].tsx:335`, `apps/mobile/app/completed-session/[sessionId].tsx:338`
- Disabled-state handling + hint text for reopen: `apps/mobile/app/completed-session/[sessionId].tsx:348`, `apps/mobile/app/completed-session/[sessionId].tsx:379`
- Inline action feedback text: `apps/mobile/app/completed-session/[sessionId].tsx:383`

3. Header metrics card
- Header card + metric grid pattern: `apps/mobile/app/completed-session/[sessionId].tsx:387`, `apps/mobile/app/completed-session/[sessionId].tsx:388`

4. Edit mode banner
- Edit mode informational banner: `apps/mobile/app/completed-session/[sessionId].tsx:410`

5. Shared session content layout with view/edit variants
- Shared `SessionContentLayout` usage: `apps/mobile/app/completed-session/[sessionId].tsx:417`
- Slot-level read-only vs editable field pattern for metadata: `apps/mobile/app/completed-session/[sessionId].tsx:420`, `apps/mobile/app/completed-session/[sessionId].tsx:431`, `apps/mobile/app/completed-session/[sessionId].tsx:438`, `apps/mobile/app/completed-session/[sessionId].tsx:448`
- View/edit set-row switch:
  - edit row form pattern: `apps/mobile/app/completed-session/[sessionId].tsx:457`, `apps/mobile/app/completed-session/[sessionId].tsx:459`
  - view table pattern (`setTableHeaderRow` + `setTableRow`): `apps/mobile/app/completed-session/[sessionId].tsx:479`, `apps/mobile/app/completed-session/[sessionId].tsx:489`

## Pattern inventory by category

### Buttons and actions

Observed recurring semantic variants:

1. Primary filled action button (blue fill, white text)
- Session list `Start Session` uses `actionButton + primaryButton`: `apps/mobile/app/session-list.tsx:522`, style seeds at `apps/mobile/app/session-list.tsx:833`, `apps/mobile/app/session-list.tsx:840`
- Recorder uses multiple primary-style buttons (`logExerciseButton`, `submitButton`, `primaryActionButton`, confirmation primary): `apps/mobile/app/session-recorder.tsx:986`, `apps/mobile/app/session-recorder.tsx:993`, `apps/mobile/app/session-recorder.tsx:1123`, styles at `apps/mobile/app/session-recorder.tsx:1329`, `apps/mobile/app/session-recorder.tsx:1413`, `apps/mobile/app/session-recorder.tsx:1567`
- Exercise catalog primary buttons (`primaryButton`, modal save): `apps/mobile/app/exercise-catalog.tsx:416`, `apps/mobile/app/exercise-catalog.tsx:592`, styles at `apps/mobile/app/exercise-catalog.tsx:830`
- Completed session action bar primary (`Edit/View`) button: `apps/mobile/app/completed-session/[sessionId].tsx:338`, styles at `apps/mobile/app/completed-session/[sessionId].tsx:580`, `apps/mobile/app/completed-session/[sessionId].tsx:590`

2. Secondary/outline action button
- Recorder modal/editor flows (`secondaryActionButton`, `confirmationSecondaryButton`, `actionMenuSecondaryButton`): `apps/mobile/app/session-recorder.tsx:1052`, `apps/mobile/app/session-recorder.tsx:1015`, `apps/mobile/app/session-recorder.tsx:1255`, styles at `apps/mobile/app/session-recorder.tsx:1502`, `apps/mobile/app/session-recorder.tsx:1520`, `apps/mobile/app/session-recorder.tsx:1555`
- Exercise catalog modal buttons (`secondaryButton`, action menu): `apps/mobile/app/exercise-catalog.tsx:589`, `apps/mobile/app/exercise-catalog.tsx:684`, styles at `apps/mobile/app/exercise-catalog.tsx:846`, `apps/mobile/app/exercise-catalog.tsx:1046`
- Completed session action bar secondary button (`Reopen`): `apps/mobile/app/completed-session/[sessionId].tsx:348`, styles at `apps/mobile/app/completed-session/[sessionId].tsx:599`

3. Danger/destructive action button
- Session list modal danger action(s): `apps/mobile/app/session-list.tsx:686`, `apps/mobile/app/session-list.tsx:733`, styles at `apps/mobile/app/session-list.tsx:1017`, `apps/mobile/app/session-list.tsx:1024`
- Recorder destructive buttons (`dangerActionButton`, set delete button, archive variants): `apps/mobile/app/session-recorder.tsx:959`, `apps/mobile/app/session-recorder.tsx:1261`, styles at `apps/mobile/app/session-recorder.tsx:1400`, `apps/mobile/app/session-recorder.tsx:1578`
- Exercise catalog delete confirm / remove buttons: `apps/mobile/app/exercise-catalog.tsx:731`, `apps/mobile/app/exercise-catalog.tsx:549`, styles at `apps/mobile/app/exercise-catalog.tsx:862`, `apps/mobile/app/exercise-catalog.tsx:998`
- Completed session action bar danger button: `apps/mobile/app/completed-session/[sessionId].tsx:368`, styles at `apps/mobile/app/completed-session/[sessionId].tsx:619`

4. Icon/kebab action buttons
- Session list row icon actions (`✓`, `⋮`): `apps/mobile/app/session-list.tsx:554`, `apps/mobile/app/session-list.tsx:565`, styles at `apps/mobile/app/session-list.tsx:887`
- Recorder exercise menu button (`•••`): `apps/mobile/app/session-recorder.tsx:968`, style at `apps/mobile/app/session-recorder.tsx:1361`
- Exercise catalog row kebab button (`⋮`): `apps/mobile/app/exercise-catalog.tsx:452`, style at `apps/mobile/app/exercise-catalog.tsx:904`

5. Inline utility buttons/chips
- Session list pill toggle (`Show deleted` / `Hide deleted`): `apps/mobile/app/session-list.tsx:584`, style at `apps/mobile/app/session-list.tsx:965`
- Recorder inline row actions (`Edit`, `Archive`, `Unarchive`): `apps/mobile/app/session-recorder.tsx:1083`, `apps/mobile/app/session-recorder.tsx:1089`, styles at `apps/mobile/app/session-recorder.tsx:1603`, `apps/mobile/app/session-recorder.tsx:1615`

Audit finding:

- A stable semantic button system exists in practice (primary/secondary/danger/icon/inline), but each screen defines variants locally with duplicated tokens and naming.

### Headers and title bars

Observed header patterns:

1. Native stack titles via `expo-router`/`Stack.Screen`
- Root static titles in `_layout`: `apps/mobile/app/_layout.tsx:16`
- Dynamic completed-session title based on mode: `apps/mobile/app/completed-session/[sessionId].tsx:296`, `apps/mobile/app/completed-session/[sessionId].tsx:330`

2. Screen section headers (text + optional trailing action)
- Session list `History` section header row: `apps/mobile/app/session-list.tsx:580`, styles at `apps/mobile/app/session-list.tsx:822`, `apps/mobile/app/session-list.tsx:828`

3. Modal titles
- Recorder modal titles (`Select Gym`, `Manage Gyms`, `Select Exercise`, etc.): `apps/mobile/app/session-recorder.tsx:1038`, `apps/mobile/app/session-recorder.tsx:1064`, `apps/mobile/app/session-recorder.tsx:1148`, style at `apps/mobile/app/session-recorder.tsx:1532`
- Exercise catalog modal titles (editor, selector, action menu, delete): `apps/mobile/app/exercise-catalog.tsx:482`, `apps/mobile/app/exercise-catalog.tsx:611`, `apps/mobile/app/exercise-catalog.tsx:678`, `apps/mobile/app/exercise-catalog.tsx:721`, style at `apps/mobile/app/exercise-catalog.tsx:1075`

4. Sticky action header bar (specialized)
- Completed session sticky action bar pattern: `apps/mobile/app/completed-session/[sessionId].tsx:335`, styles at `apps/mobile/app/completed-session/[sessionId].tsx:567`, `apps/mobile/app/completed-session/[sessionId].tsx:575`

Audit finding:

- Titles exist in multiple scales and contexts, but there is no shared heading/text-role abstraction yet. Modal title patterns are especially duplicated.

### Lists and rows

Observed row/list patterns:

1. Card-like list rows with pressable main area + trailing action(s)
- Session list rows: `apps/mobile/app/session-list.tsx:537`, `apps/mobile/app/session-list.tsx:623`, styles at `apps/mobile/app/session-list.tsx:854`
- Exercise catalog rows: `apps/mobile/app/exercise-catalog.tsx:438`, styles at `apps/mobile/app/exercise-catalog.tsx:876`

2. Compact summary text stacks / metadata rows
- Session list summary line tokens and separators: `apps/mobile/app/session-list.tsx:185`, style anchors at `apps/mobile/app/session-list.tsx:914`, `apps/mobile/app/session-list.tsx:925`
- Exercise catalog row title + subtitle stack: `apps/mobile/app/exercise-catalog.tsx:443`, styles at `apps/mobile/app/exercise-catalog.tsx:890`, `apps/mobile/app/exercise-catalog.tsx:894`

3. Manage-list rows with inline actions (recorder modals)
- Gym/exercise manage rows: `apps/mobile/app/session-recorder.tsx:1079`, `apps/mobile/app/session-recorder.tsx:1189`, style at `apps/mobile/app/session-recorder.tsx:1588`

4. Picker/select rows (modal lists)
- Recorder picker rows: `apps/mobile/app/session-recorder.tsx:1041`, `apps/mobile/app/session-recorder.tsx:1151`, style at `apps/mobile/app/session-recorder.tsx:1540`
- Exercise catalog selector rows: `apps/mobile/app/exercise-catalog.tsx:618`, style at `apps/mobile/app/exercise-catalog.tsx:1111`

5. Set-entry rows / set display rows
- Recorder editable set row (2 inputs + delete icon): `apps/mobile/app/session-recorder.tsx:941`, styles at `apps/mobile/app/session-recorder.tsx:1380`, `apps/mobile/app/session-recorder.tsx:1400`
- Completed session edit set row: `apps/mobile/app/completed-session/[sessionId].tsx:459`, style at `apps/mobile/app/completed-session/[sessionId].tsx:672`
- Completed session view table rows (header/body): `apps/mobile/app/completed-session/[sessionId].tsx:480`, `apps/mobile/app/completed-session/[sessionId].tsx:489`, styles at `apps/mobile/app/completed-session/[sessionId].tsx:699`, `apps/mobile/app/completed-session/[sessionId].tsx:712`

Audit finding:

- Row patterns are a high-duplication area and a strong primitive-extraction target, but at least three row families are semantically distinct (pressable list row, picker row, data-entry row).

### Forms and inputs

Observed input/control patterns:

1. Base text input (outlined, white background, small radius)
- Recorder base `input` style used in set rows and modal editors: `apps/mobile/app/session-recorder.tsx:947`, `apps/mobile/app/session-recorder.tsx:1112`, style at `apps/mobile/app/session-recorder.tsx:1297`
- Exercise catalog `input` + `inputError` validation state: `apps/mobile/app/exercise-catalog.tsx:493`, `apps/mobile/app/exercise-catalog.tsx:497`, styles at `apps/mobile/app/exercise-catalog.tsx:802`, `apps/mobile/app/exercise-catalog.tsx:810`
- Completed session edit fields use a separate but similar input pattern: `apps/mobile/app/completed-session/[sessionId].tsx:421`, `apps/mobile/app/completed-session/[sessionId].tsx:438`, style at `apps/mobile/app/completed-session/[sessionId].tsx:662`

2. Read-only field style
- Recorder read-only date/time field: `apps/mobile/app/session-recorder.tsx:929`, style at `apps/mobile/app/session-recorder.tsx:1305`
- Completed session view-mode read-only field: `apps/mobile/app/completed-session/[sessionId].tsx:431`, `apps/mobile/app/completed-session/[sessionId].tsx:448`, style at `apps/mobile/app/completed-session/[sessionId].tsx:650`

3. Picker trigger / select control
- Recorder gym field uses a button-like select trigger: `apps/mobile/app/session-recorder.tsx:934`, style at `apps/mobile/app/session-recorder.tsx:1317`
- Exercise catalog primary-muscle picker trigger (with chevron and placeholder states): `apps/mobile/app/exercise-catalog.tsx:515`, styles at `apps/mobile/app/exercise-catalog.tsx:940`, `apps/mobile/app/exercise-catalog.tsx:959`, `apps/mobile/app/exercise-catalog.tsx:965`

4. Form labels, helper text, error text
- Exercise catalog has the most explicit labeled-form pattern (`fieldLabel`, helper, error): `apps/mobile/app/exercise-catalog.tsx:492`, `apps/mobile/app/exercise-catalog.tsx:508`, `apps/mobile/app/exercise-catalog.tsx:560`, styles at `apps/mobile/app/exercise-catalog.tsx:797`, `apps/mobile/app/exercise-catalog.tsx:816`, `apps/mobile/app/exercise-catalog.tsx:820`
- Recorder modal editors rely mostly on title + input + action row (minimal labeling): `apps/mobile/app/session-recorder.tsx:1111`, `apps/mobile/app/session-recorder.tsx:1221`

Audit finding:

- Inputs are visually convergent enough for shared primitives, but there are currently at least three near-duplicate implementations (`recorder`, `exercise-catalog`, `completed-session`) with different border colors and text treatments.

### Empty, loading, error, and feedback states

Observed patterns:

1. Whole-screen loading/error centered panels
- Exercise catalog loading/error centered panel: `apps/mobile/app/exercise-catalog.tsx:387`, `apps/mobile/app/exercise-catalog.tsx:400`, style at `apps/mobile/app/exercise-catalog.tsx:767`
- Completed session loading/error/not-found centered state (text-only variant): `apps/mobile/app/completed-session/[sessionId].tsx:293`, `apps/mobile/app/completed-session/[sessionId].tsx:304`, `apps/mobile/app/completed-session/[sessionId].tsx:316`, styles at `apps/mobile/app/completed-session/[sessionId].tsx:522`, `apps/mobile/app/completed-session/[sessionId].tsx:530`

2. In-section empty/error panels
- Session list history loading/error/empty panel uses `emptyPanel`: `apps/mobile/app/session-list.tsx:602`, `apps/mobile/app/session-list.tsx:608`, `apps/mobile/app/session-list.tsx:614`, style at `apps/mobile/app/session-list.tsx:847`
- Session list first-time global empty state uses a more prominent card: `apps/mobile/app/session-list.tsx:653`, style at `apps/mobile/app/session-list.tsx:978`
- Recorder manage-mode empties use inline text only: `apps/mobile/app/session-recorder.tsx:1102`, `apps/mobile/app/session-recorder.tsx:1212`, style at `apps/mobile/app/session-recorder.tsx:1631`
- `SessionContentLayout` default empty text exists as a shared fallback: `apps/mobile/components/session-recorder/session-content-layout.tsx:101`, style at `apps/mobile/components/session-recorder/session-content-layout.tsx:171`

3. Success/info/error feedback messaging
- Exercise catalog success feedback card and text: `apps/mobile/app/exercise-catalog.tsx:423`, styles at `apps/mobile/app/exercise-catalog.tsx:789`, `apps/mobile/app/exercise-catalog.tsx:825`
- Exercise catalog inline validation errors: `apps/mobile/app/exercise-catalog.tsx:508`, style at `apps/mobile/app/exercise-catalog.tsx:820`
- Completed session inline action feedback + disabled hint: `apps/mobile/app/completed-session/[sessionId].tsx:379`, `apps/mobile/app/completed-session/[sessionId].tsx:383`, styles at `apps/mobile/app/completed-session/[sessionId].tsx:615`, `apps/mobile/app/completed-session/[sessionId].tsx:628`
- Recorder confirmation/success flows use modal + success-card conventions: `apps/mobile/app/session-recorder.tsx:1008`, styles at `apps/mobile/app/session-recorder.tsx:1423`, `apps/mobile/app/session-recorder.tsx:1474`

Audit finding:

- State presentation patterns exist across screens but are inconsistent in prominence (panel vs plain text) and style definitions; this is a good target for a small state primitive set.

### Spacing and layout conventions

Observed conventions (with repeated local literals):

1. Screen container spacing
- `16` padding/gap is common in screen-level containers (`session-list`, `exercise-catalog`, completed-session content variant): `apps/mobile/app/session-list.tsx:796`, `apps/mobile/app/exercise-catalog.tsx:750`, `apps/mobile/app/completed-session/[sessionId].tsx:513`
- `20` padding/gap appears in recorder/completed detail content and modal roots: `apps/mobile/app/session-recorder.tsx:1272`, `apps/mobile/app/session-list.tsx:996`, `apps/mobile/app/completed-session/[sessionId].tsx:523`

2. Card/panel spacing and radius
- Repeated `borderRadius` values around `8/10/12/14`: `apps/mobile/app/session-list.tsx:834`, `apps/mobile/app/session-list.tsx:848`, `apps/mobile/app/session-list.tsx:979`, `apps/mobile/app/session-list.tsx:1005`
- Similar pattern in recorder/exercise-catalog/completed-session card styles: `apps/mobile/app/session-recorder.tsx:1467`, `apps/mobile/app/exercise-catalog.tsx:1021`, `apps/mobile/app/completed-session/[sessionId].tsx:540`, `apps/mobile/app/completed-session/[sessionId].tsx:567`

3. Row gaps and compact spacing
- Row/list gaps cluster around `6/8/10/12`: `apps/mobile/app/session-list.tsx:863`, `apps/mobile/app/session-recorder.tsx:1387`, `apps/mobile/app/exercise-catalog.tsx:879`, `apps/mobile/app/completed-session/[sessionId].tsx:551`

4. Modal overlay + centered card pattern
- Session list modal overlay/card: `apps/mobile/app/session-list.tsx:992`, `apps/mobile/app/session-list.tsx:1002`
- Recorder modal overlay/card: `apps/mobile/app/session-recorder.tsx:1458`, `apps/mobile/app/session-recorder.tsx:1467`
- Exercise catalog modal overlay/card: `apps/mobile/app/exercise-catalog.tsx:1012`, `apps/mobile/app/exercise-catalog.tsx:1021`

Audit finding:

- Layout conventions are already relatively coherent (8pt-ish rhythm, rounded cards, bordered surfaces), but the values are repeated as raw literals and need tokenization before refactor churn increases.

### Typography treatments

Observed repeated tiers:

1. Section/screen headings (`16-18`, weight `700`)
- Session list section titles: `apps/mobile/app/session-list.tsx:828`
- Exercise catalog modal titles: `apps/mobile/app/exercise-catalog.tsx:1075`
- Completed session state/header titles: `apps/mobile/app/completed-session/[sessionId].tsx:530`

2. Body/helper/meta text (`12-14`, weights `400-600`)
- Session list meta/toggle/helper text: `apps/mobile/app/session-list.tsx:958`, `apps/mobile/app/session-list.tsx:973`
- Exercise catalog helper/error/secondary rows: `apps/mobile/app/exercise-catalog.tsx:816`, `apps/mobile/app/exercise-catalog.tsx:820`, `apps/mobile/app/exercise-catalog.tsx:899`
- Completed session state body / metric labels / hints: `apps/mobile/app/completed-session/[sessionId].tsx:535`, `apps/mobile/app/completed-session/[sessionId].tsx:557`, `apps/mobile/app/completed-session/[sessionId].tsx:615`

3. Strong action labels and button text (`600-700`)
- Shared top-level tabs: `apps/mobile/components/navigation/top-level-tabs.tsx:68`
- Recorder action button labels: `apps/mobile/app/session-recorder.tsx:1419`, `apps/mobile/app/session-recorder.tsx:1574`
- Exercise catalog button labels: `apps/mobile/app/exercise-catalog.tsx:839`, `apps/mobile/app/exercise-catalog.tsx:858`
- Completed session action-bar labels: `apps/mobile/app/completed-session/[sessionId].tsx:594`, `apps/mobile/app/completed-session/[sessionId].tsx:603`, `apps/mobile/app/completed-session/[sessionId].tsx:623`

4. Dense data text patterns
- Session list summary tokens (tabular nums, compact metadata): `apps/mobile/app/session-list.tsx:925`
- Completed session set table headers/body cells: `apps/mobile/app/completed-session/[sessionId].tsx:723`, `apps/mobile/app/completed-session/[sessionId].tsx:728`

Audit finding:

- Typography is consistent enough to infer text-role tokens (heading, label, body, helper, button, table label), but each screen still hardcodes sizes/weights/colors locally.

## Existing reusable components and classification (specialized vs primitive seed)

### Reusable today

1. `TopLevelTabs` (`apps/mobile/components/navigation/top-level-tabs.tsx:13`)
- Classification: specialized shared component (navigation-specific)
- Why: semantics are app-nav specific (`Sessions`/`Exercises`) even if it can later use shared button/tab primitives.
- Primitive-seed value: high for tab-button styling and pressed/active visual states.

2. `SessionContentLayout` (`apps/mobile/components/session-recorder/session-content-layout.tsx:40`)
- Classification: specialized shared layout template (session-content domain)
- Why: render-prop API is tied to session/exercise/set composition semantics.
- Primitive-seed value: high for section/card/exercise-card/label/list structure patterns (`section`, `exerciseCard`, `label`) at `apps/mobile/components/session-recorder/session-content-layout.tsx:113`

3. `session-recorder/types.ts` (`apps/mobile/components/session-recorder/types.ts:37`)
- Classification: specialized UI-support module (non-visual)
- Why: state and seeded constants support recorder UX but are not primitives.

### Route-level reusable shells (useful for testing, not primitive components)

- `SessionListScreenShell`: `apps/mobile/app/session-list.tsx:249`
- `CompletedSessionDetailScreenShell`: `apps/mobile/app/completed-session/[sessionId].tsx:150`

Recommendation:

- Keep route shells documented in screen-map/navigation docs, not in the primitive catalog (unless later extracted into non-route components).

## Audit-derived primitive candidate list (not final APIs)

Target for later implementation remains a lean set (`10-20` total). The list below is derived from observed repetition and refactor leverage.

### High-confidence candidates (strong repetition across screens)

1. `ScreenContainer` / `ScreenScrollContainer`
- Basis: repeated screen padding/gap/background patterns in `session-list`, `exercise-catalog`, completed-session, recorder.
- Refs: `apps/mobile/app/session-list.tsx:796`, `apps/mobile/app/exercise-catalog.tsx:750`, `apps/mobile/app/completed-session/[sessionId].tsx:513`, `apps/mobile/app/session-recorder.tsx:1272`

2. `SurfaceCard` (base bordered rounded container)
- Basis: repeated card panels across list rows, empty states, modal panels, header cards.
- Refs: `apps/mobile/app/session-list.tsx:847`, `apps/mobile/app/session-list.tsx:854`, `apps/mobile/app/exercise-catalog.tsx:781`, `apps/mobile/app/completed-session/[sessionId].tsx:540`

3. `PrimaryButton`
- Basis: repeated blue filled action buttons.
- Refs: `apps/mobile/app/session-list.tsx:522`, `apps/mobile/app/session-recorder.tsx:1123`, `apps/mobile/app/exercise-catalog.tsx:416`, `apps/mobile/app/completed-session/[sessionId].tsx:338`

4. `SecondaryButton` (outline/neutral variant)
- Basis: repeated bordered neutral actions across modals/action bars.
- Refs: `apps/mobile/app/session-recorder.tsx:1052`, `apps/mobile/app/exercise-catalog.tsx:589`, `apps/mobile/app/completed-session/[sessionId].tsx:348`

5. `DangerButton`
- Basis: repeated destructive affordances with red styling.
- Refs: `apps/mobile/app/session-list.tsx:733`, `apps/mobile/app/session-recorder.tsx:1261`, `apps/mobile/app/exercise-catalog.tsx:731`, `apps/mobile/app/completed-session/[sessionId].tsx:368`

6. `TextField`
- Basis: repeated outlined input control shape with local variants.
- Refs: `apps/mobile/app/session-recorder.tsx:1297`, `apps/mobile/app/exercise-catalog.tsx:802`, `apps/mobile/app/completed-session/[sessionId].tsx:662`

7. `ReadOnlyField`
- Basis: repeated read-only field treatment in recorder/detail flows.
- Refs: `apps/mobile/app/session-recorder.tsx:1305`, `apps/mobile/app/completed-session/[sessionId].tsx:650`

8. `PickerTrigger` / `SelectTrigger`
- Basis: repeated button-like form selector pattern (`gym`, muscle selector).
- Refs: `apps/mobile/app/session-recorder.tsx:934`, `apps/mobile/app/exercise-catalog.tsx:515`, styles at `apps/mobile/app/exercise-catalog.tsx:940`

9. `EmptyState` (panel/text variants)
- Basis: repeated empty/loading/error scaffolds with similar text roles and card shells.
- Refs: `apps/mobile/app/session-list.tsx:602`, `apps/mobile/app/session-list.tsx:653`, `apps/mobile/app/exercise-catalog.tsx:387`, `apps/mobile/app/completed-session/[sessionId].tsx:293`

10. `ModalSurface` + `ModalBackdrop`
- Basis: repeated fade/slide transparent modal wrappers with backdrop + rounded card.
- Refs: `apps/mobile/app/session-list.tsx:992`, `apps/mobile/app/session-recorder.tsx:1458`, `apps/mobile/app/exercise-catalog.tsx:1012`

11. `SectionTitle` / heading text roles
- Basis: repeated section/modal/action headings with local hardcoded text styles.
- Refs: `apps/mobile/app/session-list.tsx:828`, `apps/mobile/app/session-recorder.tsx:1532`, `apps/mobile/app/exercise-catalog.tsx:1075`, `apps/mobile/app/completed-session/[sessionId].tsx:530`

12. `HelperText` / `ErrorText` / `SuccessText` text roles
- Basis: repeated semantic message styles.
- Refs: `apps/mobile/app/exercise-catalog.tsx:816`, `apps/mobile/app/exercise-catalog.tsx:820`, `apps/mobile/app/exercise-catalog.tsx:825`, `apps/mobile/app/session-list.tsx:958`

### Medium-confidence candidates (needs careful scoping to avoid overfitting)

13. `PressableRowCard` (main content + optional trailing action slot)
- Basis: repeated in session list and exercise catalog, but content density differs.
- Refs: `apps/mobile/app/session-list.tsx:623`, `apps/mobile/app/exercise-catalog.tsx:438`

14. `IconActionButton` (small square/circular icon action)
- Basis: repeated kebab/action icon patterns with local size/color differences.
- Refs: `apps/mobile/app/session-list.tsx:887`, `apps/mobile/app/session-recorder.tsx:1361`, `apps/mobile/app/exercise-catalog.tsx:904`

15. `FormField` composition helper (label + control + helper/error)
- Basis: strongest in exercise catalog, partial adoption elsewhere.
- Refs: `apps/mobile/app/exercise-catalog.tsx:492`, `apps/mobile/app/exercise-catalog.tsx:508`, `apps/mobile/app/exercise-catalog.tsx:514`

16. `InlineActionChip` / small utility button
- Basis: pill toggle, inline edit/archive, selector action labels may share semantics but differ by context.
- Refs: `apps/mobile/app/session-list.tsx:584`, `apps/mobile/app/session-recorder.tsx:1083`, `apps/mobile/app/session-recorder.tsx:1089`

### Likely specialized components (should not be forced into generic primitives yet)

- `TopLevelTabs` remains specialized navigation: `apps/mobile/components/navigation/top-level-tabs.tsx:13`
- `SessionContentLayout` remains specialized session-content scaffold: `apps/mobile/components/session-recorder/session-content-layout.tsx:40`
- Completed-session metric header card and sticky action bar likely remain feature-specific wrappers that consume shared primitives: `apps/mobile/app/completed-session/[sessionId].tsx:387`, `apps/mobile/app/completed-session/[sessionId].tsx:335`
- Completed-session set table (`view` mode) may stay specialized unless another table-like pattern appears: `apps/mobile/app/completed-session/[sessionId].tsx:480`

### Task 03 implementation snapshot (foundation actually shipped)

Task `T-20260226-03` implemented a bounded foundation subset from the candidate list:

- `uiTokens` source of truth (colors/spacing/radius/typography/border): `apps/mobile/components/ui/tokens.ts:66`
- `UiText`: `apps/mobile/components/ui/text.tsx:24`
- `UiSurface`: `apps/mobile/components/ui/surface.tsx:13`
- `UiButton`: `apps/mobile/components/ui/button.tsx:20`

Proof integrations (without full screen refactor):

- `TopLevelTabs` migrated to primitives/tokens: `apps/mobile/components/navigation/top-level-tabs.tsx:13`
- `SessionContentLayout` migrated to primitives/tokens: `apps/mobile/components/session-recorder/session-content-layout.tsx:40`

Deferred-for-now candidates (Task 03 scope cut, not design rejection):

- `ScreenContainer`
- `EmptyState`
- `ModalSurface` / `ModalBackdrop`
- `FormField`
- `PressableRowCard`
- `IconActionButton`
- Reason: Task 03 prioritized a small primitive base plus proof integrations over broad screen migration

## Duplication hotspots and Task 06 refactor priorities

### Duplication hotspots (highest leverage first)

1. Button variants and semantic action styling
- Repeated `primary/secondary/danger` patterns across all four user-facing screens with local style names and raw literals.
- Refs: `apps/mobile/app/session-list.tsx:833`, `apps/mobile/app/session-recorder.tsx:1567`, `apps/mobile/app/exercise-catalog.tsx:830`, `apps/mobile/app/completed-session/[sessionId].tsx:580`

2. Modal backdrop + surface scaffolding
- All major screens use transparent modal overlays with similar backdrop/card structure.
- Refs: `apps/mobile/app/session-list.tsx:673`, `apps/mobile/app/session-recorder.tsx:997`, `apps/mobile/app/exercise-catalog.tsx:469`

3. Inputs / picker triggers / read-only field variants
- Multiple near-duplicate form controls diverge only in colors/sizes and naming.
- Refs: `apps/mobile/app/session-recorder.tsx:1297`, `apps/mobile/app/exercise-catalog.tsx:802`, `apps/mobile/app/exercise-catalog.tsx:940`, `apps/mobile/app/completed-session/[sessionId].tsx:650`, `apps/mobile/app/completed-session/[sessionId].tsx:662`

4. Card/list-row surfaces
- Bordered rounded containers and row shells are repeated in list rows, panels, and cards.
- Refs: `apps/mobile/app/session-list.tsx:847`, `apps/mobile/app/session-list.tsx:854`, `apps/mobile/app/exercise-catalog.tsx:876`, `apps/mobile/app/completed-session/[sessionId].tsx:540`

5. Typography roles and message text styles
- Text scales/weights/colors are semantically stable but repeated in local style objects.
- Refs: `apps/mobile/app/session-list.tsx:828`, `apps/mobile/app/exercise-catalog.tsx:797`, `apps/mobile/app/session-recorder.tsx:1532`, `apps/mobile/app/completed-session/[sessionId].tsx:530`

6. Raw literal tokens
- Frequent repeated colors support token extraction before broad UI refactoring (example snapshot from audit scan shows repeated `#ffffff`, `#0f5cc0`, `#d7deea`, `#d6dbe2` across screens).
- Example refs: `apps/mobile/app/session-recorder.tsx:1301`, `apps/mobile/app/session-list.tsx:841`, `apps/mobile/app/completed-session/[sessionId].tsx:543`, `apps/mobile/app/exercise-catalog.tsx:774`

### Recommended refactor ordering for Task 06 (after Task 03 primitives exist)

1. Update shared components first to consume tokens/primitives
- `TopLevelTabs`: `apps/mobile/components/navigation/top-level-tabs.tsx:13`
- `SessionContentLayout`: `apps/mobile/components/session-recorder/session-content-layout.tsx:40`
- Reason: highest cross-screen leverage with low behavior risk.

2. Refactor `exercise-catalog` next (high pattern density, relatively isolated data flow)
- Route entry: `apps/mobile/app/exercise-catalog.tsx:106`
- Reason: touches many button/form/modal/list patterns and validates primitive breadth early.

3. Refactor `session-list` (rows/state panels/modals/tabs)
- Route entry: `apps/mobile/app/session-list.tsx:783`
- Reason: strong reuse of row/card/button/state primitives and good signal on list/history patterns.

4. Refactor `completed-session/[sessionId]` (view/edit dual-mode detail)
- Route entry: `apps/mobile/app/completed-session/[sessionId].tsx:503`
- Reason: validates specialized wrappers consuming primitives (sticky action bar, metric cards, table/edit field variants).

5. Refactor `session-recorder` last (highest complexity / modal-mode surface area)
- Route entry: `apps/mobile/app/session-recorder.tsx:205`
- Reason: many modal modes and interactions increase regression risk; defer until primitives are stable from prior screens.

## Open notes for Task 03 / Task 05 / Task 06

1. Primitive extraction should start with semantic roles and tokenization, not visual one-offs from recorder modal subflows.
2. The audit suggests a small base set plus specialized wrappers, not a large generic design-system surface.
3. `SessionContentLayout` should likely be documented as a domain-specific composition component in the future components catalog, alongside primitives it consumes.
4. Completed-session set-table view mode is currently unique; treat as specialized unless another table-like presentation emerges.
