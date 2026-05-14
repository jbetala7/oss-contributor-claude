# Gstack repo profile

Use this profile when the target repo is `garrytan/gstack`.

## Repo identity

- Upstream repo: `garrytan/gstack`
- Default branch: `main`
- Preferred local checkout: `~/.gstack/repos/gstack`

If that checkout exists, prefer it over cloning a new copy.

## Contribution strategy

Optimize for small, test-backed PRs.

Prefer:
- contained bug fixes
- docs mismatches that are clearly wrong in repo state
- setup, browse, codex, or generated-skill issues with a tight repro

Avoid as first picks:
- brand-new large skills
- broad product expansion proposals
- work that depends on hidden local credentials or private environments

## Required issue triage checks

Before choosing any issue:
- search open PRs by issue number
- search open PRs by title keywords
- inspect upstream `main` in the relevant files

This repo gets fast community contributions, so duplicate fixes are common.
Do not trust issue state alone.

Reject a target if:
- there is already an open PR for it
- upstream `main` already contains the fix even if the issue is still open
- the issue writeup is stale relative to current code

## Local verification habits

- inspect `git status --short --branch` before branching
- run a fresh `git fetch origin` before branching or opening a PR
- verify remotes before publishing
- branch from fresh `origin/main` or upstream `main`

## Project-specific implementation notes

If you touch templates or generators:
- inspect `*.tmpl`
- inspect `scripts/resolvers/*.ts`
- check whether generated `SKILL.md` files or golden fixtures are expected to update

If you touch `browse/`:
- inspect nearby tests first
- look for narrow `bun test <path>` options before running wider suites

If you touch docs:
- verify the docs against actual shipped skills, commands, or files in the repo

## PR style

Keep PRs to one issue.

PR summary should cover:
- repro or observed problem
- root cause
- fix
- testing

Do not bundle follow-up cleanup unless it is required to land the fix.
