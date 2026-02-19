# AGENTS.md

## Purpose

This file is the session entrypoint.
It defines what to load first and where detailed rules live.

## Always Load (All Session Types)

1. `docs/specs/README.md`
2. `docs/specs/00-mvp-deliverables.md`
3. `docs/specs/03-technical-architecture.md`

Note: product/domain details are maintained in specs. Do not duplicate them here.

## Route by Session Objective

1. Brainstorming (product/architecture/spec ideas):
- Activate with explicit chat phrase: `Mode: Brainstorm`.
- Operate as a principal engineer with strong product sense collaborating with another principal engineer.
- Prioritize clear, lean specifications that progressively converge to a task card precise enough for a strong agent to one-shot implementation.
- Target extreme leanness: include only what is necessary and nothing else, avoid duplication between different documents unless necessary.
- When instructed to generate milestones and tasks use templates in `docs/specs/templates/`.

2. Task execution (implementation/testing/verification):
- Load and follow:
  - `docs/specs/04-ai-development-playbook.md`
  - You should be able to access a milestone card referenced from the task
  - You should have a task card to execute

## Authority Rule

1. `AGENTS.md` provides routing only.
2. Detailed process/policy rules are authoritative in `docs/specs/*`.
3. Resolve spec conflicts using the hierarchy in `docs/specs/04-ai-development-playbook.md`: `Project -> MVP -> Milestone -> Task`.
4. Lower-level docs may add implementation detail but must not override or relax parent-level constraints.

## Ambiguity Rule

If objective is unclear, ask as many clarifying questions as you need before before proceeding.
