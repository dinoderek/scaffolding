#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
MAESTRO_SAMPLE_ENV_FILE="$APP_DIR/.maestro/maestro.env.sample"
MAESTRO_LOCAL_ENV_FILE="$APP_DIR/.maestro/maestro.env.local"

maestro_fail() {
  echo "$*" >&2
  exit 1
}

maestro_require_command() {
  local command_name="$1"
  local install_hint="${2:-}"

  if command -v "$command_name" >/dev/null 2>&1; then
    return 0
  fi

  if [[ -n "$install_hint" ]]; then
    maestro_fail "Missing required command '$command_name'. $install_hint"
  fi

  maestro_fail "Missing required command '$command_name'."
}

maestro_source_env() {
  local env_file

  for env_file in "$MAESTRO_SAMPLE_ENV_FILE" "$MAESTRO_LOCAL_ENV_FILE"; do
    if [[ -f "$env_file" ]]; then
      set -a
      # shellcheck disable=SC1090
      source "$env_file"
      set +a
    fi
  done

  : "${TASK_ID:=ad-hoc}"
  : "${MAESTRO_IOS_SHARED_BUILD_ROOT:=$HOME/.cache/boga/maestro/ios-dev-client}"
  : "${MAESTRO_IOS_DEV_CLIENT_APP_PATH:=$MAESTRO_IOS_SHARED_BUILD_ROOT/mobile-dev-client.app}"
  : "${IOS_SIM_DEVICE:=iPhone 17 Pro}"
  : "${IOS_SIM_DEVICE_POOL:=iPhone 17 Pro,iPhone 17 Pro Max,iPhone Air}"
  : "${IOS_SIM_UDID_POOL:=}"
  : "${EXPO_DEV_SERVER_BASE_PORT:=8082}"
  : "${EXPO_START_WAIT_SECONDS:=30}"
  : "${MAESTRO_IOS_SLOT_IDS:=slot-1,slot-2,slot-3}"
  : "${MAESTRO_IOS_SLOT_WAIT_SECONDS:=120}"
  : "${MAESTRO_IOS_SLOT_POLL_SECONDS:=1}"
  : "${MAESTRO_IOS_SLOT_LOCK_ROOT:=/tmp/scaffolding2-maestro-ios-slots}"

  export TASK_ID
  export MAESTRO_IOS_SHARED_BUILD_ROOT
  export MAESTRO_IOS_DEV_CLIENT_APP_PATH
  export IOS_SIM_DEVICE
  export IOS_SIM_DEVICE_POOL
  export IOS_SIM_UDID_POOL
  export EXPO_DEV_SERVER_BASE_PORT
  export EXPO_START_WAIT_SECONDS
  export MAESTRO_IOS_SLOT_IDS
  export MAESTRO_IOS_SLOT_WAIT_SECONDS
  export MAESTRO_IOS_SLOT_POLL_SECONDS
  export MAESTRO_IOS_SLOT_LOCK_ROOT
}

maestro_trim() {
  echo "$1" | xargs
}

maestro_current_dev_client_fingerprint() {
  (
    cd "$APP_DIR"
    shasum -a 256 app.json eas.json package.json package-lock.json | shasum -a 256 | awk '{print $1}'
  )
}
