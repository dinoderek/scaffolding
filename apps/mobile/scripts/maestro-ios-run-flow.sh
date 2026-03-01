#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/maestro-ios-runtime.sh"
maestro_source_env

FLOW_SOURCE=""
SCENARIO_NAME=""

usage() {
  cat <<'EOF'
Usage: ./scripts/maestro-ios-run-flow.sh --flow <flow-file> --scenario <name>
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --flow)
      FLOW_SOURCE="$2"
      shift 2
      ;;
    --scenario)
      SCENARIO_NAME="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      maestro_fail "Unknown option: $1"
      ;;
  esac
done

[[ -n "$FLOW_SOURCE" ]] || maestro_fail "Missing --flow argument."
[[ -n "$SCENARIO_NAME" ]] || maestro_fail "Missing --scenario argument."
[[ -f "$FLOW_SOURCE" ]] || maestro_fail "Missing Maestro flow file: $FLOW_SOURCE"

maestro_require_command maestro "Install Maestro from https://maestro.mobile.dev."

MAESTRO_RUNNER_PID="$$"
MAESTRO_IOS_SLOT_OWNER_PID="$$"
IFS=' ' read -r MAESTRO_IOS_SLOT_ID MAESTRO_IOS_SLOT_INDEX <<< "$(MAESTRO_IOS_SLOT_OWNER_PID="$MAESTRO_IOS_SLOT_OWNER_PID" "$SCRIPT_DIR/maestro-ios-slot-lock.sh" acquire)"

[[ -n "$MAESTRO_IOS_SLOT_ID" && -n "$MAESTRO_IOS_SLOT_INDEX" ]] || maestro_fail "Unable to acquire an iOS Maestro slot."

MAESTRO_SESSION_TIMESTAMP="$(date +"%Y%m%d-%H%M%S")-$$"
MAESTRO_SCENARIO_NAME="$SCENARIO_NAME"
MAESTRO_ARTIFACT_ROOT="$(maestro_runtime_artifact_root "$MAESTRO_SESSION_TIMESTAMP")"
MAESTRO_RUNTIME_ENV_FILE="$MAESTRO_ARTIFACT_ROOT/runtime.env"
MAESTRO_FLOW_SOURCE_FILE="$FLOW_SOURCE"
MAESTRO_OUTPUT_DIR="$MAESTRO_ARTIFACT_ROOT/maestro-output"
MAESTRO_DEBUG_DIR="$MAESTRO_ARTIFACT_ROOT/maestro-debug"
MAESTRO_JUNIT_FILE="$MAESTRO_ARTIFACT_ROOT/maestro-junit.xml"
PROVISION_LOG_FILE="$MAESTRO_ARTIFACT_ROOT/provision.log"
LAUNCH_LOG_FILE="$MAESTRO_ARTIFACT_ROOT/launch.log"
TEARDOWN_LOG_FILE="$MAESTRO_ARTIFACT_ROOT/teardown.log"
EXPO_LOG_FILE="$MAESTRO_ARTIFACT_ROOT/expo-start.log"

mkdir -p "$MAESTRO_OUTPUT_DIR" "$MAESTRO_DEBUG_DIR"

slot_udid="$(maestro_slot_udid "$MAESTRO_IOS_SLOT_INDEX")"
if [[ -n "$slot_udid" ]]; then
  IOS_SIM_UDID="$slot_udid"
fi
IOS_SIM_DEVICE="$(maestro_slot_device "$MAESTRO_IOS_SLOT_INDEX")"
EXPO_DEV_SERVER_PORT="$(maestro_slot_port "$MAESTRO_IOS_SLOT_INDEX")"

maestro_write_runtime_env "$MAESTRO_RUNTIME_ENV_FILE"

cleanup() {
  local exit_code=$?
  trap - EXIT
  if [[ -f "$MAESTRO_RUNTIME_ENV_FILE" ]]; then
    "$SCRIPT_DIR/maestro-ios-teardown.sh" "$MAESTRO_RUNTIME_ENV_FILE" || true
  elif [[ -n "${MAESTRO_IOS_SLOT_ID:-}" ]]; then
    "$SCRIPT_DIR/maestro-ios-slot-lock.sh" release "$MAESTRO_IOS_SLOT_ID" >/dev/null 2>&1 || true
  fi
  exit "$exit_code"
}
trap cleanup EXIT

"$SCRIPT_DIR/maestro-ios-provision.sh" "$MAESTRO_RUNTIME_ENV_FILE"
"$SCRIPT_DIR/maestro-ios-launch.sh" "$MAESTRO_RUNTIME_ENV_FILE"
maestro_load_runtime_env "$MAESTRO_RUNTIME_ENV_FILE"

flow_basename="$(basename -- "$FLOW_SOURCE")"
MAESTRO_FLOW_FILE="$MAESTRO_ARTIFACT_ROOT/$flow_basename"
maestro_prepare_flow_copy "$FLOW_SOURCE" "$MAESTRO_FLOW_FILE" "$MAESTRO_IOS_DEV_CLIENT_BUNDLE_ID"
maestro_write_runtime_env "$MAESTRO_RUNTIME_ENV_FILE"

set +e
maestro test "$MAESTRO_FLOW_FILE" \
  --udid "$IOS_SIM_UDID" \
  --format junit \
  --output "$MAESTRO_JUNIT_FILE" \
  --debug-output "$MAESTRO_DEBUG_DIR" \
  --test-output-dir "$MAESTRO_OUTPUT_DIR"
maestro_exit_code=$?
set -e

echo "${SCENARIO_NAME} run complete."
echo "Artifacts: $MAESTRO_ARTIFACT_ROOT"
echo "Slot: $MAESTRO_IOS_SLOT_ID (index=$MAESTRO_IOS_SLOT_INDEX, port=$EXPO_DEV_SERVER_PORT, device=$IOS_SIM_DEVICE, udid=$IOS_SIM_UDID)"

exit "$maestro_exit_code"
