# Escalation Note Template

## Escalation metadata

- Escalation ID: `E-<task-id>-<YYYYMMDD-HHMM>`
- Task ID: (or `unknown` if no active task card)
- Milestone ID:
- Date/time:
- Owner:
- Session interaction mode: `interactive | non_interactive`
- Trigger type: `missing-prereq | verify-failed-3x | repeated-failure-no-new-hypothesis | external-blocker`

## Objective being attempted

Describe the task objective and acceptance criteria at the time of escalation.

## Blocking condition

Describe the exact blocker and why execution cannot proceed safely.

## Preconditions check

- Active task card present: `yes | no`
- Active milestone spec present: `yes | no`
- Context packet complete: `yes | no`
- Environment baseline available: `yes | no`

## Attempts log

1. Attempt #1
   - Change summary:
   - Commands run:
   - Result/error summary:
   - Hypothesis:
2. Attempt #2
   - Change summary:
   - Commands run:
   - Result/error summary:
   - Hypothesis:
3. Attempt #3
   - Change summary:
   - Commands run:
   - Result/error summary:
   - Hypothesis:

## Evidence

- Failure signature(s):
- Minimal reproduction steps:
- Relevant file paths:

## Options for human decision

1. Option A (recommended):
   - Impact:
2. Option B:
   - Impact:
3. Option C:
   - Impact:

## Human decision (required to resume)

- Selected option:
- Decision date:
- Constraints/scope updates:
- Resume instruction:

## Follow-up updates

- Task card status updated to `blocked`: `yes | no`
- Escalation link added to task card: `yes | no`
- If no active task card, mark both fields above as `n/a`.
- Additional notes:
