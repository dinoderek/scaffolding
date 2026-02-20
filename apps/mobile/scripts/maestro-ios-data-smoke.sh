#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

TASK_ID="${TASK_ID:-ad-hoc}"
EXPO_DEV_SERVER_PORT="${EXPO_DEV_SERVER_PORT:-8082}"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
ARTIFACT_ROOT="$APP_DIR/artifacts/maestro/$TASK_ID/$TIMESTAMP"
FLOW_FILE="$APP_DIR/.maestro/flows/data-runtime-smoke.yaml"
MAESTRO_OUTPUT_DIR="$ARTIFACT_ROOT/maestro-output"
MAESTRO_DEBUG_DIR="$ARTIFACT_ROOT/maestro-debug"
EXPO_LOG_FILE="$ARTIFACT_ROOT/expo-start.log"
SIM_LOG_FILE="$ARTIFACT_ROOT/simulator.log"
JUNIT_FILE="$ARTIFACT_ROOT/maestro-junit.xml"

mkdir -p "$MAESTRO_OUTPUT_DIR" "$MAESTRO_DEBUG_DIR"

SIM_UDID="$("$SCRIPT_DIR/ios-sim-boot.sh" 2>"$SIM_LOG_FILE")"

cd "$APP_DIR"
CI=1 npx expo start --ios --non-interactive --port "$EXPO_DEV_SERVER_PORT" >"$EXPO_LOG_FILE" 2>&1 &
EXPO_PID=$!

cleanup() {
  if kill -0 "$EXPO_PID" >/dev/null 2>&1; then
    kill "$EXPO_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

# Give Expo Go time to launch and load the project on the simulator.
sleep "${EXPO_START_WAIT_SECONDS:-30}"
xcrun simctl launch "$SIM_UDID" host.exp.Exponent >/dev/null 2>&1 || true
xcrun simctl openurl "$SIM_UDID" "exp://127.0.0.1:$EXPO_DEV_SERVER_PORT" >/dev/null 2>&1 || true
sleep 3

maestro test "$FLOW_FILE" \
  --udid "$SIM_UDID" \
  --format junit \
  --output "$JUNIT_FILE" \
  --debug-output "$MAESTRO_DEBUG_DIR" \
  --test-output-dir "$MAESTRO_OUTPUT_DIR"

echo "Data runtime smoke run complete."
echo "Artifacts: $ARTIFACT_ROOT"
