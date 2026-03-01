# Maestro iOS Runtime Runbook

The authoritative Maestro runtime/testing contract lives in [`docs/specs/11-maestro-runtime-and-testing-conventions.md`](../../docs/specs/11-maestro-runtime-and-testing-conventions.md).

Use this runbook for the operational commands only.

## Current phase boundary

- The shared iOS development-client build foundation is implemented in this repo.
- The committed smoke/data-smoke runner scripts still launch the current Expo Go runtime until later M10 toolkit tasks migrate them.
- Build the shared dev client now so later M10 tasks can assume the simulator artifact already exists.

## Canonical config files

- Checked-in sample: `apps/mobile/.maestro/maestro.env.sample`
- Per-worktree local config: `apps/mobile/.maestro/maestro.env.local`

Create the local config once per worktree:

```bash
cd apps/mobile
cp .maestro/maestro.env.sample .maestro/maestro.env.local
```

## First-time setup

Run from `apps/mobile` unless a command says otherwise.

1. Install JavaScript dependencies:

```bash
npm install
```

2. Install CocoaPods if `pod --version` is missing:

```bash
brew install cocoapods
```

3. Create your local Maestro config:

```bash
cp .maestro/maestro.env.sample .maestro/maestro.env.local
```

4. Build or reuse the shared simulator dev client:

```bash
./scripts/maestro-ios-dev-client-build.sh
```

Notes:

- The default shared build root is `$HOME/.cache/boga/maestro/ios-dev-client`.
- The default shared `.app` path is `$HOME/.cache/boga/maestro/ios-dev-client/mobile-dev-client.app`.
- The local build path does not require Expo/EAS login.
- `eas.json` includes `development-simulator` only as an explicit simulator-capable EAS profile for optional future/manual EAS usage.

## Shared dev-client commands

Check current shared-build status without rebuilding:

```bash
./scripts/maestro-ios-dev-client-build.sh --status
```

Print the resolved `.app` path after ensuring the artifact exists:

```bash
./scripts/maestro-ios-dev-client-build.sh --print-app-path
```

Force a rebuild even when the fingerprint matches:

```bash
./scripts/maestro-ios-dev-client-build.sh --force
```

## Rebuild triggers

The shared dev client rebuilds when any of these are true:

- the `.app` artifact is missing,
- the build metadata file is missing,
- the native-input fingerprint changed,
- `--force` is passed.

The native-input fingerprint currently covers:

- `apps/mobile/app.json`
- `apps/mobile/eas.json`
- `apps/mobile/package.json`
- `apps/mobile/package-lock.json`

## Existing smoke commands

These commands are still valid, but they still use the current Expo Go runtime until later M10 tasks migrate them:

```bash
npm run test:e2e:ios:smoke
npm run test:e2e:ios:data-smoke
```

## Artifact locations

- Shared dev-client root: `$HOME/.cache/boga/maestro/ios-dev-client`
- Shared dev-client metadata: `$HOME/.cache/boga/maestro/ios-dev-client/dev-client-build.env`
- Shared dev-client build log: `$HOME/.cache/boga/maestro/ios-dev-client/build.log`
- Maestro run artifacts: `apps/mobile/artifacts/maestro/<task-id-or-ad-hoc>/<timestamp>/`
