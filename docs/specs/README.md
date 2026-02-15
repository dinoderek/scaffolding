# Gym Tracker Project Specs

This folder is the source of truth for product and technical decisions.

## File map

- `docs/specs/00-mvp-deliverables.md`: Agreed high-level MVP deliverables and exit criteria.
- `docs/specs/01-product-brief.md`: Vision, goals, personas, core value. (planned)
- `docs/specs/02-mvp-requirements.md`: MVP features, user stories, acceptance criteria. (planned)
- `docs/specs/03-technical-architecture.md`: Top-level architecture decisions and rationale.
- `docs/specs/04-ai-development-playbook.md`: AI-first workflow, task hierarchy, and context rules.
- `docs/specs/05-delivery-plan.md`: Milestones and execution order. (planned)
- `docs/specs/06-testing-strategy.md`: Top-level testing stack and practices.
- `docs/specs/07-escalation-policy.md`: Human-in-the-loop escalation rules for blocked execution tasks.
- `docs/specs/templates/milestone-spec-template.md`: Template for milestone deep dives.
- `docs/specs/templates/task-card-template.md`: Template for per-session AI task execution.
- `docs/specs/templates/escalation-note-template.md`: Template for blocked-task escalation handoff.

## How to use in future AI sessions

1. Share this file and `docs/specs/04-ai-development-playbook.md` first.
2. For execution sessions, also share `docs/specs/07-escalation-policy.md`.
3. Share active milestone spec and task card.
4. Include only changed sections from other specs for focused context.
5. Capture new decisions directly in these docs after each major session.

## Decision log convention

When a major decision changes:

1. Update the relevant spec.
2. Add a short note at the bottom:
   - `Date`
   - `Decision`
   - `Reason`
   - `Impact`
