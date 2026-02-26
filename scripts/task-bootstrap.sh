#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/task-bootstrap.sh <task-card-path>

Prints a lightweight task bootstrap/context-freshness report:
- git branch + HEAD + dirty status
- task metadata/frontmatter (if present)
- parent references and missing-path checks
- verify-gates snippet

This helper is intended to support filling the task card "Context Freshness" section.
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
  echo "[task-bootstrap] task card not found: $1" >&2
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
  if [[ -z "${line}" ]]; then
    return 0
  fi
  raw="$(printf '%s\n' "${line}" | grep -oE '`[^`]+`' | head -n1 | tr -d '`' || true)"
  if [[ -z "${raw}" ]]; then
    return 0
  fi
  raw="${raw%%#*}"
  printf '%s' "${raw}"
}

section_block() {
  local heading="$1"
  awk -v heading="${heading}" '
    $0 == heading { in_section=1; print; next }
    in_section && /^## / { exit }
    in_section { print }
  ' "${TASK_PATH}"
}

path_should_check() {
  local path="$1"
  case "${path}" in
    docs/*|apps/*|supabase/*|scripts/*|AGENTS.md)
      ;;
    *)
      return 1
      ;;
  esac

  case "${path}" in
    *'*'*|*'<'*|*'>'*|*'...'*)
      return 1
      ;;
  esac
  return 0
}

collect_parent_refs() {
  section_block "## Parent references (required)" \
    | grep -oE '`[^`]+`' \
    | tr -d '`' \
    | awk '!seen[$0]++'
}

git_branch="$(git -C "${REPO_ROOT}" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")"
git_head="$(git -C "${REPO_ROOT}" rev-parse --short HEAD 2>/dev/null || echo "unknown")"
git_dirty_count="$(git -C "${REPO_ROOT}" status --short | wc -l | tr -d ' ')"

task_id="$(frontmatter_value task_id || true)"
if [[ -z "${task_id}" ]]; then
  task_id="$(printf '%s' "$(md_value_by_label 'Task ID')" | tr -d '`' || true)"
fi

task_status="$(frontmatter_value status || true)"
if [[ -z "${task_status}" ]]; then
  task_status="$(printf '%s' "$(md_value_by_label 'Status')" | sed -E 's/^`([^`]*)`.*/\1/' || true)"
fi

ui_impact="$(frontmatter_value ui_impact || true)"
if [[ -z "${ui_impact}" ]]; then
  ui_line="$(grep -m1 '^- UI Impact?:' "${TASK_PATH}" || true)"
  if [[ -n "${ui_line}" ]]; then
    ui_impact="$(printf '%s' "${ui_line}" | sed -E 's/.*`([^`]*)`.*/\1/' || true)"
  fi
fi

echo "[task-bootstrap] repo: ${REPO_ROOT}"
echo "[task-bootstrap] task: ${TASK_PATH}"
echo "[task-bootstrap] git: branch=${git_branch} head=${git_head} dirty_entries=${git_dirty_count}"
echo "[task-bootstrap] metadata: task_id=${task_id:-unknown} status=${task_status:-unknown} ui_impact=${ui_impact:-unknown}"

if [[ "$(head -n1 "${TASK_PATH}")" == "---" ]]; then
  echo
  echo "[task-bootstrap] frontmatter (detected)"
  frontmatter_block | sed 's/^/  /'
else
  echo
  echo "[task-bootstrap] frontmatter: not present (supported but recommended for new task cards)"
fi

echo
echo "[task-bootstrap] parent references"
missing_refs=0
while IFS= read -r ref; do
  [[ -n "${ref}" ]] || continue
  ref_no_anchor="${ref%%#*}"
  if path_should_check "${ref_no_anchor}"; then
    if [[ -e "${REPO_ROOT}/${ref_no_anchor}" ]]; then
      echo "  [ok] ${ref}"
    else
      echo "  [missing] ${ref}"
      missing_refs=$((missing_refs + 1))
    fi
  else
    echo "  [skip] ${ref}"
  fi
done < <(collect_parent_refs || true)

milestone_path="$(md_code_path_by_label 'Milestone spec' || true)"
if [[ -n "${milestone_path}" ]]; then
  if [[ -f "${REPO_ROOT}/${milestone_path}" ]]; then
    milestone_status_line="$(grep -m1 '^- Status:' "${REPO_ROOT}/${milestone_path}" || true)"
    echo "[task-bootstrap] milestone: ${milestone_path} ${milestone_status_line:+(${milestone_status_line#- })}"
  fi
fi

echo
echo "[task-bootstrap] context freshness section"
if grep -q '^## Context Freshness ' "${TASK_PATH}"; then
  section_block "## Context Freshness (required at session start; update before edits)" | sed 's/^/  /'
  if section_block "## Context Freshness (required at session start; update before edits)" | grep -q '<path>'; then
    echo "  [warn] placeholders detected in Context Freshness section"
  fi
else
  echo "  [warn] no Context Freshness section (older task card or not yet migrated)"
fi

echo
echo "[task-bootstrap] mandatory verify gates snippet"
if grep -q '^## Mandatory verify gates' "${TASK_PATH}"; then
  section_block "## Mandatory verify gates" | sed 's/^/  /'
else
  echo "  [warn] missing Mandatory verify gates section"
fi

echo
echo "[task-bootstrap] suggested Context Freshness entries"
parent_ref_preview="$(collect_parent_refs | head -n 3 | tr '\n' '; ' || true)"
parent_ref_preview="$(trim "${parent_ref_preview}")"
if [[ -z "${parent_ref_preview}" ]]; then
  parent_ref_preview="<list paths>"
fi
echo "  - Verified current branch + HEAD commit: ${git_branch} @ ${git_head}"
echo "  - Start-of-session sync completed per playbook git sync workflow?: <yes|no|N/A> (fill after sync)"
echo "  - Parent refs opened in this session: ${parent_ref_preview}"
echo "  - Known stale references or assumptions: none"

if [[ "${missing_refs}" -gt 0 ]]; then
  echo
  echo "[task-bootstrap] FAIL: missing parent reference path(s): ${missing_refs}" >&2
  exit 1
fi

echo
echo "[task-bootstrap] done"
