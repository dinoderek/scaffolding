#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "usage: $0 <url> [timeout_seconds]" >&2
  exit 2
fi

URL="$1"
TIMEOUT_SECONDS="${2:-30}"
START_TS="$(date +%s)"

while true; do
  if curl --silent --show-error --fail --max-time 2 "${URL}" >/dev/null; then
    exit 0
  fi

  NOW_TS="$(date +%s)"
  if (( NOW_TS - START_TS >= TIMEOUT_SECONDS )); then
    echo "Timed out waiting for HTTP 200 from ${URL}" >&2
    exit 1
  fi

  sleep 1
done
