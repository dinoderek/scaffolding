#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/task-closeout-check.sh <task-card-path>

Lightweight pre-handoff validation for task-card closeout:
- task Status is completed|blocked
- completion note fields are filled
- milestone reference exists and milestone task-breakdown line reflects task status
- basic UI-task docs fields are present when UI Impact = yes (best-effort/backward compatible)

Designed to catch common workflow misses before handoff. It is not a full linter.
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if [[ $# -ne 1 ]]; then
  usage >&2
  exit 2
fi

resolve_path() {
  local input="$1"
  if [[ -f "${input}" ]]; then
    echo "$(cd "$(dirname "${input}")" && pwd)/$(basename "${input}")"
    return 0
  fi

  if [[ -f "${REPO_ROOT}/${input}" ]]; then
    echo "${REPO_ROOT}/${input}"
    return 0
  fi

  return 1
}

TASK_PATH="$(resolve_path "$1" || true)"
if [[ -z "${TASK_PATH}" || ! -f "${TASK_PATH}" ]]; then
  echo "[task-closeout] task card not found: $1" >&2
  exit 1
fi

trim() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

frontmatter_block() {
  awk '
    NR==1 && $0=="---" { in_fm=1; next }
    in_fm && $0=="---" { exit }
    in_fm { print }
  ' "${TASK_PATH}"
}

frontmatter_value() {
  local key="$1"
  frontmatter_block | awk -F: -v key="${key}" '
    $1 == key {
      sub(/^[^:]*:[[:space:]]*/, "", $0)
      gsub(/^"|"$/, "", $0)
      print $0
      exit
    }
  '
}

md_value_by_label() {
  local label="$1"
  local line
  line="$(grep -m1 "^- ${label}:" "${TASK_PATH}" || true)"
  if [[ -z "${line}" ]]; then
    return 0
  fi
  line="${line#*- ${label}: }"
  printf '%s' "$(trim "${line}")"
}

md_code_path_by_label() {
  local label="$1"
  local line raw
  line="$(grep -m1 "^- ${label}:" "${TASK_PATH}" || true)"
  [[ -n "${line}" ]] || return 0
  raw="$(printf '%s\n' "${line}" | grep -oE '`[^`]+`' | head -n1 | tr -d '`' || true)"
  [[ -n "${raw}" ]] || return 0
  printf '%s' "${raw%%#*}"
}

section_block() {
  local heading="$1"
  awk -v heading="${heading}" '
    $0 == heading { in_section=1; print; next }
    in_section && /^## / { exit }
    in_section { print }
  ' "${TASK_PATH}"
}

section_block_from_file() {
  local file="$1"
  local heading="$2"
  awk -v heading="${heading}" '
    $0 == heading { in_section=1; print; next }
    in_section && /^## / { exit }
    in_section { print }
  ' "${file}"
}

extract_status() {
  local status
  status="$(frontmatter_value status || true)"
  if [[ -z "${status}" ]]; then
    status="$(printf '%s' "$(md_value_by_label 'Status')" | sed -E 's/^`([^`]*)`.*/\1/' || true)"
  fi
  printf '%s' "${status}"
}

extract_task_id() {
  local id
  id="$(frontmatter_value task_id || true)"
  if [[ -z "${id}" ]]; then
    id="$(printf '%s' "$(md_value_by_label 'Task ID')" | tr -d '`' || true)"
  fi
  printf '%s' "${id}"
}

extract_ui_impact() {
  local ui
  ui="$(frontmatter_value ui_impact || true)"
  if [[ -n "${ui}" ]]; then
    printf '%s' "${ui}"
    return 0
  fi

  local line
  line="$(grep -m1 '^- UI Impact?:' "${TASK_PATH}" || true)"
  if [[ -n "${line}" ]]; then
    printf '%s' "$(printf '%s' "${line}" | sed -E 's/.*`([^`]*)`.*/\1/' || true)"
  fi
}

failures=0
warnings=0

fail() {
  echo "[task-closeout] FAIL: $*" >&2
  failures=$((failures + 1))
}

warn() {
  echo "[task-closeout] WARN: $*" >&2
  warnings=$((warnings + 1))
}

check_line_nonempty_after_colon() {
  local label="$1"
  local line value
  line="$(grep -m1 "^- ${label}:" "${TASK_PATH}" || true)"
  if [[ -z "${line}" ]]; then
    fail "missing line: ${label}"
    return 0
  fi
  value="${line#*:}"
  value="$(trim "${value}")"
  if [[ -z "${value}" ]]; then
    fail "empty value for '${label}'"
  fi
}

task_id="$(extract_task_id)"
task_status="$(extract_status)"
ui_impact="$(extract_ui_impact || true)"
task_basename="$(basename "${TASK_PATH}")"
milestone_path="$(md_code_path_by_label 'Milestone spec' || true)"

echo "[task-closeout] repo: ${REPO_ROOT}"
echo "[task-closeout] task: ${TASK_PATH}"
echo "[task-closeout] metadata: task_id=${task_id:-unknown} status=${task_status:-unknown} ui_impact=${ui_impact:-unknown}"

case "${task_status}" in
  completed|blocked)
    ;;
  "")
    fail "task Status not found"
    ;;
  *)
    fail "task Status must be completed|blocked before handoff (found: ${task_status})"
    ;;
esac

if grep -q '^## Completion note' "${TASK_PATH}"; then
  check_line_nonempty_after_colon "What changed"
  check_line_nonempty_after_colon "What tests ran"
  check_line_nonempty_after_colon "What remains"
else
  fail "missing '## Completion note' section"
fi

if grep -q '^- Manual verification summary (required when CI is absent/partial):$' "${TASK_PATH}"; then
  warn "manual verification summary line exists but is blank"
elif grep -q '^- Manual verification summary (required when CI is absent/partial):' "${TASK_PATH}"; then
  :
else
  warn "manual verification summary line not found"
fi

if grep -q '^## Context Freshness ' "${TASK_PATH}"; then
  freshness_section="$(section_block "## Context Freshness (required at session start; update before edits)" || true)"
  if [[ -n "${freshness_section}" ]]; then
    if printf '%s\n' "${freshness_section}" | grep -q '<path>'; then
      warn "Context Freshness section still contains placeholder '<path>'"
    fi
    if printf '%s\n' "${freshness_section}" | grep -q 'Verified current branch + HEAD commit:[[:space:]]*$'; then
      warn "Context Freshness 'Verified current branch + HEAD commit' is blank"
    fi
  fi
fi

if [[ -n "${milestone_path}" ]]; then
  if [[ "${milestone_path}" == *"<"* || "${milestone_path}" == *"..."* ]]; then
    warn "milestone reference appears to be a template placeholder: ${milestone_path}"
  elif [[ ! -f "${REPO_ROOT}/${milestone_path}" ]]; then
    fail "milestone reference does not exist: ${milestone_path}"
  else
    echo "[task-closeout] milestone: ${milestone_path}"
    milestone_line="$(
      section_block_from_file "${REPO_ROOT}/${milestone_path}" "## Task breakdown" \
        | grep -F "${task_basename}" \
        | head -n1 || true
    )"
    if [[ -z "${milestone_line}" ]]; then
      fail "milestone task breakdown does not reference ${task_basename}"
    else
      echo "[task-closeout] milestone task line: ${milestone_line}"
      if [[ -n "${task_status}" ]]; then
        if [[ "${milestone_line}" != *"(${task_status})"* && "${milestone_line}" != *"(\`${task_status}\`)"* ]]; then
          fail "milestone task breakdown status does not match task status (${task_status})"
        fi
      fi
    fi
  fi
else
  warn "Milestone spec reference not found in task card"
fi

if [[ "${ui_impact}" == "yes" ]]; then
  if ! grep -q '^## Docs touched' "${TASK_PATH}"; then
    fail "UI task marked ui_impact=yes but missing '## Docs touched' section"
  fi

  if ! grep -Fq 'UI docs update required?:' "${TASK_PATH}" && ! grep -q '^## UI docs impact / Docs touched' "${TASK_PATH}"; then
    fail "UI task marked ui_impact=yes but no UI docs update requirement field was found"
  fi

  if ! grep -q 'Tokens/primitives compliance statement' "${TASK_PATH}"; then
    warn "UI task marked ui_impact=yes but no explicit tokens/primitives compliance statement field found (older template or incomplete migration)"
  fi
fi

echo
if [[ "${failures}" -gt 0 ]]; then
  echo "[task-closeout] result: FAIL (${failures} failure(s), ${warnings} warning(s))" >&2
  exit 1
fi

if [[ "${warnings}" -gt 0 ]]; then
  echo "[task-closeout] result: PASS with warnings (${warnings})"
else
  echo "[task-closeout] result: PASS"
fi
