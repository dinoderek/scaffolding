# Project structure and testing strategy post Supabase
As part of M5 we are creating our backend, based on Supabase. 

This introduces
- A completely new "deployment" to test (Supabase DB and Functions). We need to define how we're going to test this new deployment. 
- A new level in the overall pyramid of testing: E2E tests covering both the mobile application and the suapbase backend

This is a good opportunity to:
- Refine and codify our testing strategy. What tests do we write, when do we write them and when do we run them.
- Refine and codify our directory structure. What is written where and why. 
- Improve our documentation of the above and ensure agents always have the relevant context. 

In the current directory strucutre we have (please verify this) 
```
/
  app/                           # UNCERTAIN: this is where the Expo APP lieves
    __tests__/                   # MOBILE tests: unit/component/integration (app-only)                
  src/                         # Non-component, non-expo code, such as database
  components/                  # Component specific code
  drizzle/                     # Mobile database
  scripts/                     # Maestro & Simulator utility scripts
  .maestro/flows               # Unceratin: Maestro flow definitions (these are the Maestro "tests")
```

The structure above is not necessarily the clearest. For example it does not make sense to me that tests are under app. 


Proposed new directory structure (please let's braintorm this)

```
repo/
  supabase/                      # Contains Supabase backend (local environment, seeds, functions, SQL)
    migrations/                  # source-of-truth schema history (RLS, funcs, triggers, indexes)
    tests/                       # DATABASE tests (pgTAP)
      rls/                       # RLS policy tests (critical security + access control)
      functions/                 # SQL function tests (behavioral + edge cases)
      constraints/               # constraints, FK/unique checks, invariants
    functions/                   # EDGE FUNCTIONS (hosted runtime code)
      _shared/                   # shared libs/types/validators/auth helpers for functions
      <fn-name>/                 # each function’s handler + thin wiring code
      <fn-name>_test/            # EDGE UNIT tests (deno test): pure logic + validation

  apps/
    mobile/
      # Unsure about how to organise the application code overall
      app/                       # Expo code
      components/                # Component code
      src/                       # All other code
      tests/                     # App-only tests NOT using simulator
      maestro_tests/             # App-only maestro flows. We will use them as integration tests and to drive UI development drizzle/                   # Mobile database

  e2e/                           # Small set of E2E tests exercising both UI through simulator and backend 

  scripts/                       # dev/ci ergonomics wrappers; includes maestro scripts as they will be used by E2E as well
    dev-up                       # starts local supabase + app deps
    dev-down                     # stops local stack
    db-reset                     # reset + migrate + seed (deterministic baseline)
    gen-types                    # generate typed client defs (optional)
```

In terms of testing pyramid:

- Frontend 
    - Unit: Jest based tests. Write for every change. ALWAYS execute (cheap) 

- Supabase: 
    - Database: pgTAP tests. Cover RLS policies, SQL functions and testing. Write for every change. ALWAYS execute (cheap)
    - Edge: deno tests. 

- Supabase Integration: 
    - Small set of supabase tests focused on Auth, real RLS behavbior. Any depenendencies of the backend mocked out.

- E2E: 
    - Small set of Maestro + Local Supabase tests exercising the full stack. Focused on a few high priority Journeys

In addition to that, we will in the future re-use the E2E tech to do UX focused journeys to take screenshots and accessibiluty trees to help AI generate high quality UIs. 