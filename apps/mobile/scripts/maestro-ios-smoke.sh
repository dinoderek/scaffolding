#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

exec "$SCRIPT_DIR/maestro-ios-run-flow.sh" \
  --scenario "Smoke" \
  --flow "$APP_DIR/.maestro/flows/smoke-launch.yaml"
