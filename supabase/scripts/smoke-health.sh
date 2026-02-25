#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/_common.sh"

load_supabase_status_env
HEALTH_URL="$(health_url)"

RESPONSE="$(curl_health)"
echo "${RESPONSE}" | grep -q '"ok":true'
echo "${RESPONSE}" | grep -q '"apiSurface":"edge-function-health-smoke"'

echo "[supabase] health smoke passed: ${HEALTH_URL}"
echo "${RESPONSE}"
