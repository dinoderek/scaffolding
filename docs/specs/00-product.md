# What are we building

## Document scope

This document provides an overview of our product and current product-level decisions.

## One paragraph description

A Gym Tracking application with a delightful interface, advanced analytics, AI powered advisor and Social Groups so that no one can cheat on their PRs again!

* Simple, quick, interface that combines depth and delightful golden paths.
* Powerful analytics that allows an incredible level of geek out.
* Exercises support Locations and per-log Tags and are connected to Muscle Groups trained.
* Brotherhoods (Group) concept enables PR certification, Group level competitions, Group sanctioned Exercises. 
* AI integration powers AI coaches and AI analysis of performance trends.

## Product decisions (current)

- Date: `2026-03-03`
- Decision: Exercise log tags are optional, freeform, and attached to a logged exercise instance.
- Notes:
  - no tag is required to log an exercise,
  - tags are created from the recorder flow rather than pre-authored in the catalog,
  - M9 does not ship seeded/system tags.

- Date: `2026-03-03`
- Decision: Recorder tagging is suggestion-driven for M9.
- Notes:
  - recorder shows prior tags used for the same exercise to speed reuse,
  - users can also type and create a new tag inline while logging,
  - M9 does not introduce a separate global tag-management screen.

- Date: `2026-03-03`
- Decision: Exercise catalog metadata remains retroactive, while exercise log tags are historical session data.
- Notes:
  - history views resolve against the latest exercise catalog metadata rather than per-session snapshots,
  - retroactive scope includes exercise labels and exercise-to-muscle mappings,
  - tags persist on the logged exercise and are not resolved through a retroactive catalog metadata layer,
  - future analytics can group by stored tags without introducing variation versioning in M9.
