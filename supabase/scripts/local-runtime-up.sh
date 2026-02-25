#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/_common.sh"

ensure_tmp_dir

echo "[supabase] starting local stack (CLI ${SUPABASE_CLI_VERSION})"
run_supabase start

load_supabase_status_env
HEALTH_URL="$(health_url)"

if curl_health --max-time 2 >/dev/null; then
  echo "[supabase] health function already responding at ${HEALTH_URL}"
  exit 0
fi

stop_functions_serve_if_running

echo "[supabase] starting local edge function server (health)"
if [[ -f "${FUNCTION_ENV_FILE}" ]]; then
  (
    cd "${REPO_ROOT}"
    nohup npx -y "supabase@${SUPABASE_CLI_VERSION}" functions serve \
      --no-verify-jwt \
      --env-file "${FUNCTION_ENV_FILE}" \
      health \
      >"${FUNCTIONS_LOG_FILE}" 2>&1 &
    echo $! > "${FUNCTIONS_PID_FILE}"
  )
else
  (
    cd "${REPO_ROOT}"
    nohup npx -y "supabase@${SUPABASE_CLI_VERSION}" functions serve \
      --no-verify-jwt \
      health \
      >"${FUNCTIONS_LOG_FILE}" 2>&1 &
    echo $! > "${FUNCTIONS_PID_FILE}"
  )
fi

START_TS="$(date +%s)"
until curl_health --max-time 2 >/dev/null; do
  NOW_TS="$(date +%s)"
  if (( NOW_TS - START_TS >= 45 )); then
    echo "Timed out waiting for health endpoint: ${HEALTH_URL}" >&2
    if [[ -f "${FUNCTIONS_LOG_FILE}" ]]; then
      echo "--- functions log tail ---" >&2
      tail -n 40 "${FUNCTIONS_LOG_FILE}" >&2 || true
    fi
    exit 1
  fi
  sleep 1
done

echo "[supabase] local runtime ready"
echo "  api: ${API_URL}"
echo "  health: ${HEALTH_URL}"
echo "  functions log: ${FUNCTIONS_LOG_FILE}"
