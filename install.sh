#!/usr/bin/env bash
set -euo pipefail

PACKAGE_REF="${OSS_CONTRIBUTOR_CLAUDE_PACKAGE:-https://github.com/jbetala7/oss-contributor-claude/archive/refs/heads/main.tar.gz}"

if ! command -v node >/dev/null 2>&1; then
  echo "error: node is required" >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "error: npx is required; install Node.js/npm first" >&2
  exit 1
fi

exec npx --yes --package "$PACKAGE_REF" oss-contributor-claude install "$@"
