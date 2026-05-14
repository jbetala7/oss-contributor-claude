#!/usr/bin/env bash
set -euo pipefail

PACKAGE_REF="${OSS_CONTRIBUTOR_CLAUDE_PACKAGE:-oss-contributor-claude@latest}"

if ! command -v node >/dev/null 2>&1; then
  echo "error: node is required" >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "error: npx is required; install Node.js/npm first" >&2
  exit 1
fi

exec npx --yes "$PACKAGE_REF" install "$@"
