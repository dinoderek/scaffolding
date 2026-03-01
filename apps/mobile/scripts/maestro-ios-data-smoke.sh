#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

MAESTRO_RESET_STRATEGY="data" exec "$SCRIPT_DIR/maestro-ios-run-flow.sh" \
  --scenario "Data runtime smoke" \
  --flow "$APP_DIR/.maestro/flows/data-runtime-smoke.yaml"
