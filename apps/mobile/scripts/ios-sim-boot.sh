#!/usr/bin/env bash
set -euo pipefail

IOS_SIM_DEVICE="${IOS_SIM_DEVICE:-iPhone 17 Pro}"
IOS_SIM_UDID="${IOS_SIM_UDID:-}"
MODE="${1:-boot}"

find_udid() {
  xcrun simctl list devices available \
    | sed -n "s/^[[:space:]]*${IOS_SIM_DEVICE//\//\\/} (\\([^)]*\\)).*/\\1/p" \
    | head -n 1
}

SIM_UDID="$IOS_SIM_UDID"

if [[ -z "$SIM_UDID" ]]; then
  SIM_UDID="$(find_udid)"
fi

if [[ -z "$SIM_UDID" ]]; then
  echo "Unable to find iOS simulator device '${IOS_SIM_DEVICE}'." >&2
  echo "Available devices:" >&2
  xcrun simctl list devices available >&2
  exit 1
fi

if [[ "$MODE" == "--udid-only" ]]; then
  echo "$SIM_UDID"
  exit 0
fi

xcrun simctl boot "$SIM_UDID" >/dev/null 2>&1 || true

BOOT_READY=false
for _ in 1 2 3 4 5 6; do
  if xcrun simctl bootstatus "$SIM_UDID" -b >/dev/null 2>&1; then
    BOOT_READY=true
    break
  fi
  sleep 2
done

if [[ "$BOOT_READY" != true ]]; then
  echo "Simulator '$IOS_SIM_DEVICE' ($SIM_UDID) did not report boot-ready status." >&2
  xcrun simctl list devices | sed -n '1,120p' >&2
  exit 1
fi

echo "$SIM_UDID"
