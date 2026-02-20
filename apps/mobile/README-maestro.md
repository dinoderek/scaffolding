# Maestro iOS Smoke Runbook

This runbook defines the iOS smoke checks used for UI and local-data runtime validation.

## Scope

- Platform: iOS simulator only.
- Flows:
  - `apps/mobile/.maestro/flows/smoke-launch.yaml` (UI reachability smoke)
  - `apps/mobile/.maestro/flows/data-runtime-smoke.yaml` (runtime migration + smoke record insert/read signal)

## Prerequisites

1. `maestro` is installed and on `PATH`.
2. Xcode simulator runtime is installed and visible via `xcrun simctl list devices available`.
3. Run commands from `/Users/dinohughes/Projects/scaffolding/apps/mobile`.

## Run commands

Run smoke flow:

```bash
npm run test:e2e:ios:smoke
```

Run data runtime smoke flow:

```bash
npm run test:e2e:ios:data-smoke
```

Run smoke flow with task-aware artifact path:

```bash
TASK_ID=T-20260220-01 npm run test:e2e:ios:smoke
```

Run data runtime smoke flow with task-aware artifact path:

```bash
TASK_ID=T-20260220-01 npm run test:e2e:ios:data-smoke
```

Run two agents in parallel with deterministic slot/device mapping:

```bash
MAESTRO_IOS_SLOT_IDS=slot-a,slot-b \
IOS_SIM_DEVICE_POOL="iPhone 17 Pro,iPhone 17 Pro Max" \
EXPO_DEV_SERVER_BASE_PORT=8082 \
npm run test:e2e:ios:smoke
```

Optional environment variables:

- `TASK_ID`: task identifier for artifact grouping. Default: `ad-hoc`.
- `IOS_SIM_DEVICE`: simulator device name. Default: `iPhone 17 Pro`.
- `EXPO_DEV_SERVER_BASE_PORT`: base Expo dev server port for slot mapping. Default: `8082`.
- `EXPO_DEV_SERVER_PORT`: explicit fixed Expo dev server port override (bypasses slot-derived port).
- `EXPO_START_WAIT_SECONDS`: wait before Maestro starts. Default: `30`.
- `MAESTRO_IOS_SLOT_IDS`: comma-separated slot IDs for locking. Default: `slot-1,slot-2,slot-3`.
- `MAESTRO_IOS_SLOT_WAIT_SECONDS`: max wait for slot acquisition. Default: `120`.
- `MAESTRO_IOS_SLOT_POLL_SECONDS`: slot polling interval. Default: `1`.
- `MAESTRO_IOS_SLOT_LOCK_ROOT`: slot lock directory. Default: `/tmp/scaffolding2-maestro-ios-slots`.
- `IOS_SIM_DEVICE_POOL`: comma-separated simulator names mapped by slot index.
- `IOS_SIM_UDID_POOL`: comma-separated simulator UDIDs mapped by slot index (preferred for deterministic parallel mapping).

## Artifacts

Artifacts are stored at:

`apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`

Expected screenshot files under `maestro-output`:

- `01-app-launch.png`
- `02-session-recorder-visible.png`
- `03-data-runtime-smoke-start.png` (when running data smoke flow)
- `04-data-runtime-smoke-success.png` (when running data smoke flow)

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
4. Expo start fails with port conflict:
   - Set `EXPO_DEV_SERVER_PORT` (single run) or adjust `EXPO_DEV_SERVER_BASE_PORT` (slot mapping).
5. Parallel runs block each other:
   - Increase `MAESTRO_IOS_SLOT_IDS` count and provide matching simulator pool values.
   - Or increase `MAESTRO_IOS_SLOT_WAIT_SECONDS` if queueing is acceptable.
