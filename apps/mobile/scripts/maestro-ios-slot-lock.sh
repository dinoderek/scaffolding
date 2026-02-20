#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-acquire}"
SLOT_ID_TO_RELEASE="${2:-}"

LOCK_ROOT="${MAESTRO_IOS_SLOT_LOCK_ROOT:-/tmp/scaffolding2-maestro-ios-slots}"
SLOT_IDS_RAW="${MAESTRO_IOS_SLOT_IDS:-slot-1,slot-2,slot-3}"
WAIT_SECONDS="${MAESTRO_IOS_SLOT_WAIT_SECONDS:-120}"
POLL_SECONDS="${MAESTRO_IOS_SLOT_POLL_SECONDS:-1}"

IFS=',' read -r -a SLOT_IDS <<< "$SLOT_IDS_RAW"

trim() {
  local value="$1"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

slot_lock_dir() {
  local slot_id="$1"
  local safe_slot_id="${slot_id//[^A-Za-z0-9._-]/_}"
  echo "$LOCK_ROOT/$safe_slot_id.lock"
}

release_slot() {
  local slot_id="$1"
  local lock_dir
  lock_dir="$(slot_lock_dir "$slot_id")"
  rm -rf "$lock_dir"
}

acquire_slot() {
  mkdir -p "$LOCK_ROOT"

  local started_at now elapsed index slot_id lock_dir existing_pid
  started_at="$(date +%s)"

  while true; do
    index=0
    for raw_slot_id in "${SLOT_IDS[@]}"; do
      slot_id="$(trim "$raw_slot_id")"
      if [[ -z "$slot_id" ]]; then
        index=$((index + 1))
        continue
      fi

      lock_dir="$(slot_lock_dir "$slot_id")"
      if mkdir "$lock_dir" 2>/dev/null; then
        echo "$$" > "$lock_dir/pid"
        echo "$slot_id $index"
        return 0
      fi

      existing_pid=""
      if [[ -f "$lock_dir/pid" ]]; then
        existing_pid="$(cat "$lock_dir/pid" 2>/dev/null || true)"
      fi

      if [[ -n "$existing_pid" ]] && ! kill -0 "$existing_pid" >/dev/null 2>&1; then
        rm -rf "$lock_dir"
        if mkdir "$lock_dir" 2>/dev/null; then
          echo "$$" > "$lock_dir/pid"
          echo "$slot_id $index"
          return 0
        fi
      fi

      index=$((index + 1))
    done

    now="$(date +%s)"
    elapsed=$((now - started_at))
    if (( elapsed >= WAIT_SECONDS )); then
      echo "Timed out waiting ${WAIT_SECONDS}s for a free iOS Maestro slot." >&2
      echo "Configured slots: ${SLOT_IDS_RAW}" >&2
      exit 1
    fi

    sleep "$POLL_SECONDS"
  done
}

case "$MODE" in
  acquire)
    acquire_slot
    ;;
  release)
    if [[ -z "$SLOT_ID_TO_RELEASE" ]]; then
      echo "Usage: $0 release <slot-id>" >&2
      exit 1
    fi
    release_slot "$SLOT_ID_TO_RELEASE"
    ;;
  *)
    echo "Usage: $0 <acquire|release> [slot-id]" >&2
    exit 1
    ;;
esac
