# Maestro iOS Smoke Runbook

This runbook defines the minimal iOS smoke check used for UI-change validation.

## Scope

- Platform: iOS simulator only.
- Flow: `apps/mobile/.maestro/flows/smoke-launch.yaml`.
- Goal: verify app launch and session recorder screen visibility.

## Prerequisites

1. `maestro` is installed and on `PATH`.
2. Xcode simulator runtime is installed and visible via `xcrun simctl list devices available`.
3. Run commands from `/Users/dinohughes/Projects/scaffolding/apps/mobile`.

## Run commands

Run smoke flow:

```bash
npm run test:e2e:ios:smoke
```

Run smoke flow with task-aware artifact path:

```bash
TASK_ID=T-20260220-01 npm run test:e2e:ios:smoke
```

Optional environment variables:

- `TASK_ID`: task identifier for artifact grouping. Default: `ad-hoc`.
- `IOS_SIM_DEVICE`: simulator device name. Default: `iPhone 17 Pro`.
- `EXPO_START_WAIT_SECONDS`: wait before Maestro starts. Default: `30`.

## Artifacts

Artifacts are stored at:

`apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`

Expected screenshot files under `maestro-output`:

- `01-app-launch.png`
- `02-session-recorder-visible.png`

Other outputs:

- `expo-start.log`
- `simulator.log`
- `maestro-junit.xml`
- `maestro-debug/`

## Troubleshooting

1. Device not found:
   - Set `IOS_SIM_DEVICE` to an available name from `xcrun simctl list devices available`.
2. App not visible when Maestro starts:
   - Increase `EXPO_START_WAIT_SECONDS` and rerun.
3. Maestro cannot launch:
   - Verify `maestro --version` and ensure Java is installed.
