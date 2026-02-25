#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/_common.sh"

load_supabase_status_env

if [[ -z "${API_URL:-}" || -z "${ANON_KEY:-}" ]]; then
  echo "Supabase local status env missing API_URL or ANON_KEY. Start the local stack first." >&2
  exit 1
fi

URL="${API_URL}/rest/v1/dev_fixture_principals?select=fixture_key,subject_uuid,subject_kind&order=fixture_key.asc"
RESPONSE="$(curl --silent --show-error --fail \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  "${URL}")"

echo "${RESPONSE}" | grep -q '"fixture_key":"anonymous"'
echo "${RESPONSE}" | grep -q '"fixture_key":"user_a"'
echo "${RESPONSE}" | grep -q '"fixture_key":"user_b"'

echo "[supabase] seed smoke passed (fixture principals present)"
echo "${RESPONSE}"
