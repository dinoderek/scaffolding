# Mobile App Development Guide

This guide is the human-operator entrypoint for local mobile validation.

For the authoritative Maestro runtime/testing policy, use [`docs/specs/11-maestro-runtime-and-testing-conventions.md`](../../docs/specs/11-maestro-runtime-and-testing-conventions.md). For the operational Maestro commands, use [`apps/mobile/README-maestro.md`](./README-maestro.md).

## Run location

Run commands from `apps/mobile`.

## Prerequisites

1. Install JavaScript dependencies:

```bash
npm install
```

2. Install CocoaPods if `pod --version` is missing:

```bash
brew install cocoapods
```

3. Copy the Maestro sample config for this worktree:

```bash
cp .maestro/maestro.env.sample .maestro/maestro.env.local
```

Notes:

- The local shared dev-client build does not require Expo/EAS login.
- If you choose to use hosted EAS builds later, log in with `npx eas-cli login`.

## Workflow A: Instant local loop

Use this for the normal JS/TS iteration loop.

```bash
npx expo start
```

Open the app in:

- Expo Go for standard managed Expo work.
- A development client once a native dev build exists.

## Workflow B: Shared iOS dev-client foundation

Use this once per machine or when native inputs changed.

Build or reuse the shared simulator-compatible development client:

```bash
./scripts/maestro-ios-dev-client-build.sh
```

Useful variants:

```bash
./scripts/maestro-ios-dev-client-build.sh --status
./scripts/maestro-ios-dev-client-build.sh --print-app-path
./scripts/maestro-ios-dev-client-build.sh --force
```

Contract summary:

- Shared build root: `$HOME/.cache/boga/maestro/ios-dev-client`
- Default `.app` path: `$HOME/.cache/boga/maestro/ios-dev-client/mobile-dev-client.app`
- Rebuild inputs: `app.json`, `eas.json`, `package.json`, `package-lock.json`

Install the shared dev client into the currently booted simulator:

```bash
open -a Simulator
xcrun simctl boot "iPhone 17 Pro" || true
xcrun simctl install booted "$HOME/.cache/boga/maestro/ios-dev-client/mobile-dev-client.app"
xcrun simctl launch booted com.dinoderek.mobile
```

If you want the script to print the exact current `.app` path first:

```bash
xcrun simctl install booted "$(./scripts/maestro-ios-dev-client-build.sh --print-app-path)"
```

After the app is installed, start Metro for the dev client:

```bash
npx expo start --dev-client
```

Then open the installed app in Simulator and connect it to the local bundler.

## Workflow C: Real iPhone dev build

Use this when you need the development client on a physical device instead of the simulator.

Hosted EAS build path:

```bash
npx eas-cli login
npx eas-cli init
npx eas-cli build -p ios --profile development
```

Notes:

- `npx eas-cli init` is only needed if the app has not been linked to an EAS project yet.
- The `development` profile builds a real-device development client; the local simulator `.app` from Workflow B cannot be installed on a phone.
- EAS will prompt for Apple signing/device-registration setup if it is not already configured for your account/project.

When the build finishes:

1. Open the build page/link from the EAS output.
2. Install the generated iOS development build onto the phone.
3. On the Mac, start Metro with `npx expo start --dev-client`.
4. Open the installed dev client on the phone and connect it to the local bundler.

## Workflow D: Preview publish loop

Use this when you want a stable installable preview build and remote updates.

One-time setup:

```bash
npx eas-cli login
npx eas-cli init
npx eas-cli update:configure
npx eas-cli channel:create preview --branch preview
```

If the `preview` channel already exists:

```bash
npx eas-cli channel:edit preview --branch preview
```

Build a preview app:

```bash
npx eas-cli build -p ios --profile preview
```

Day-to-day preview update:

```bash
npx eas-cli update --branch preview --message "ui: <short note>"
```

## Workflow E: Maestro smoke commands

These commands are still on the current Expo Go runtime until later M10 tasks migrate them to the shared development client:

```bash
npm run test:e2e:ios:smoke
npm run test:e2e:ios:data-smoke
```

## Local data lane-1 canary

```bash
npm run db:generate:canary
```
