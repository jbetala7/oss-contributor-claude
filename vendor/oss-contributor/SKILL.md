---
name: oss-contributor
description: |
  Use when the user wants a repeatable open-source contribution workflow:
  finding unclaimed issues, checking whether an issue already has an open PR
  or is already fixed on upstream main, ranking mergeable contribution targets,
  implementing and testing a fix in a local checkout, pushing to a fork,
  opening a clean PR, and then tracking the PR through review, comments,
  merge, or closure. Especially useful when the user wants to become a
  regular contributor to the same repo over time, starting with gstack and
  later expanding to other repositories.
---

# OSS Contributor

Run a contribution loop that optimizes for merged upstream PRs, not just local fixes.

## Quick start

0. Before choosing new work, refresh prior contribution state for recurring repos.
1. Resolve the target repo, upstream, fork, default branch, and local checkout.
2. Scan open issues and open PRs before choosing work.
3. Filter to issues that are still broken on upstream `main`, unclaimed, and small enough for one PR.
4. Verify the issue locally before editing.
5. Implement narrowly, test, push, and open a clean PR.
6. Record the result so the next contribution starts faster.
7. Clear local build artifacts or temporary worktrees after a PR push/update.
8. Track the PR until it is merged, closed, or needs follow-up.

## Modes

### Scan

Use when the user wants a shortlist, not code yet.

Deliver:
- 3-7 ranked issue candidates
- whether an open PR already exists
- whether the issue already looks fixed on upstream `main`
- expected scope and testability
- a recommended first pick

### Ship

Use when the user wants a full contribution from issue to PR.

Deliver:
- chosen issue
- proof it is still real on upstream `main`
- implementation and tests
- branch name
- PR URL
- any residual risks or follow-ups

### Track

Use when the user wants to monitor previously opened contributions and decide
what to do next.

Deliver:
- current PR state (`open`, `ready`, `merged`, `closed`)
- linked issue and branch
- CI or mergeability status when available
- whether new review comments, requested changes, or unresolved threads exist
- a recommended next action (`wait`, `reply`, `fix comments`, `rebase`, `close out`, `pick next issue`)

### Expand

Use when moving to a new repo after a streak in one repo.

Deliver:
- repo onboarding notes
- build and test commands
- contribution hotspots
- first shortlist of candidate issues

## Workflow

### 0. Prior contribution preflight

Before scanning for new work in any recurring repo, refresh previous PRs first.
This is mandatory for `garrytan/gstack` and `warpdotdev/warp`.

Always do all of these:
- read `~/.codex/memories/oss-contributor.json`
- check every tracked PR for the target repo
- also list authored PRs in the target repo, including closed PRs, so older or
  missing ledger entries are not silently skipped
- check live PR state, merge state, latest top-level comments, latest reviews,
  requested changes, unresolved review threads when available, and whether a
  closed PR was merged or closed without merge
- update the structured ledger and markdown log with the refreshed status

If any prior PR has actionable feedback, requested changes, a failing required
check, merge conflicts, or a closed-unmerged outcome that needs follow-up:
- stop before picking a new issue unless the user explicitly says to skip it
- report the blocker first
- recommend the next action (`fix comments`, `reply`, `rebase`, `rerun check`,
  `accept closed duplicate`, or `pick next issue`)

For Warp specifically:
- expect the CLA bot on external PRs
- after the user signs the CLA, comment `@cla-bot check`
- verify the `cla-signed` label or `verification/cla-signed` status before
  considering the PR ready for maintainer review

For OpenClaw specifically:
- expect the repository's proof gate to reject test-only or mock-only evidence
- before opening or counting a PR, capture real behavior proof from the actual
  CLI, gateway, browser UI, or service integration path when credentials are
  required and available
- if live proof needs private credentials or infrastructure you do not have,
  skip the issue or mark the PR blocked instead of treating it as ready
- include the exact commands, redacted output, and user-visible behavior in the
  first PR body so the proof gate is satisfied without review back-and-forth

### 1. Resolve repo context

- Prefer an existing local checkout if one is already configured.
- Confirm the upstream repo, fork remote, and default branch before doing any work.
- Fetch the upstream default branch before choosing an issue, starting a fix branch, or publishing a PR.
- Treat local `main` or `origin/main` as advisory until a fresh fetch confirms they match upstream.
- If the repo has a profile in `references/`, read it before scanning.
- If the user wants code changes, make sure the local checkout is clean enough to branch safely.

### 2. Scan issue and PR state before choosing work

Always do all of these:
- search open issues
- search open PRs
- search open PRs by issue number when one exists
- search open PRs by keywords from the issue title and problem area

Reject candidates if:
- an open PR clearly covers the same fix
- upstream `main` already contains the fix
- the issue is stale and contradicted by current code
- the scope is too broad for one clean PR
- the issue depends on private infrastructure or hidden env that you cannot reproduce

### 3. Rank candidates

Score candidates by:
- still broken on upstream `main`
- no active competing PR
- small and contained diff
- clear repro or code-path verification
- obvious test surface
- visible maintainer value
- low need for product or design decisions

Prefer:
- bug fixes over broad feature work
- one issue per PR
- issues with nearby tests or clear verification paths
- changes that can be explained in one short PR summary

### 4. Verify before coding

Before editing, gather evidence from:
- the issue text
- the relevant source files on upstream `main`
- any open or recently closed PRs in the same area
- a local repro, failing test, or convincing code-path inspection

If you cannot establish that the issue still exists, do not code. Return it as a weak target and move on.

### 5. Implement narrowly

- branch from the freshly fetched upstream default branch
- keep scope tied to one issue
- add or update tests whenever reasonable
- avoid opportunistic refactors unless they are required for the fix
- if the repo has generated files or templates, update generated artifacts only when project conventions require it

### 6. Verify the fix

- run the narrowest convincing test set first
- expand to broader checks only when they are fast enough or clearly required
- capture the exact commands run and whether they passed
- explicitly note anything you could not verify

### 7. Publish cleanly

Open a PR only after:
- the issue link is explicit
- the root cause is understood
- the branch contains one issue's worth of work
- a fresh upstream fetch confirmed the branch still sits on the current default-branch tip, or you have rebased/rebranched accordingly
- no unrelated changes remain in scope

If a GitHub publish workflow or helper skill exists, prefer it for the final commit, push, and PR steps.

PR readiness policy:
- default to a ready-for-review PR when the task is finished and validation is complete
- use draft PRs only when checks are still pending, scope is intentionally incomplete, or the user explicitly asks for draft

Issue linkage policy:
- when shipping against a GitHub issue, include an issue-closing reference such as `Fixes #123` in the PR body when appropriate
- after opening the PR, add a short comment on the issue linking to the PR unless the issue thread already has that link from you

### 8. Persist contribution state

Maintain two local records:

- `~/.codex/memories/oss-contributor.md` for a short human-readable streak log
- `~/.codex/memories/oss-contributor.json` for structured contribution state

For every shipped contribution, keep this structured state:
- repo
- issue number and issue URL
- PR number and PR URL
- branch name
- latest pushed commit SHA
- status (`open`, `ready`, `merged`, `closed`, `changes_requested`, `rebase_needed`, `blocked`)
- draft flag
- mergeable state when known
- last checked timestamp
- last comment timestamp seen
- last review timestamp seen
- a short next-action field

Append a short entry to the markdown log with:
- date
- repo
- issue
- PR
- outcome
- why the target was good or bad

Use the JSON file for active tracking and the markdown log for long-term pattern memory.

### 9. Track and respond after publish

When the user asks about an existing contribution, or when a new PR has just been opened:
- read the structured contribution state first
- refresh the live PR state from GitHub before answering
- check for:
  - merged or closed state changes
  - new top-level PR comments
  - new review submissions
  - actionable inline review comments or unresolved threads
  - requested changes
  - base-branch drift that may require a rebase
- update both local records after every check

If actionable review feedback exists:
- summarize only the new actionable items
- distinguish comments that require code changes from comments that only need a reply
- if a GitHub review-comment helper skill exists, prefer it for implementing and resolving review feedback
- after fixes are pushed, re-check the PR state and update the ledger again

### 10. Clear local repo space after push/update

After every completed contribution process, including opening a PR, pushing a
review fix, resolving merge conflicts, or updating a PR branch, reclaim local
disk space before moving on.

Default cleanup means:
- keep source, commits, branch names, remotes, and the local contribution ledger
- verify tracked files are clean or intentionally committed before deleting
  anything
- remove project-native build outputs and ignored generated artifacts that are
  safe to recreate, such as Rust `target/` via `cargo clean`
- remove temporary clean worktrees/checkouts only after confirming the branch
  was pushed and no uncommitted tracked or untracked user files remain
- prefer `git clean -ndX` as a preview before any ignored-file cleanup; never
  delete non-ignored untracked files unless the user explicitly approves that
  exact deletion
- run `git gc` or `git worktree prune` when useful, but do not rewrite history
  or remove remote branches as part of cleanup

For `warpdotdev/warp`:
- run `cargo clean` after the final successful push or PR update unless more
  local Rust verification is immediately needed
- this usually removes the large `target/` directory while preserving the repo

For `garrytan/gstack`:
- after a PR branch is pushed, remove any dedicated clean worktree for that PR
  if no further local work is expected in the same turn
- keep the main checkout unless the user asks to remove the whole repo

## Output contract

### For `scan`

For each candidate, report:
- issue
- why it is promising
- why it may fail
- PR collision status
- recommendation level

### For `ship`

Report:
- chosen issue
- validation evidence
- concise change summary
- tests run
- PR link
- next-best candidate if the user wants to continue the streak

### For `track`

Report:
- PR and issue
- latest status
- new comments or review events since the last check
- whether action is required
- the exact next step you recommend

## Repo profiles

Read a repo profile before scanning or shipping when one exists.

Available references:
- `references/gstack.md`
- `references/repo-profile-template.md`

If a repo has no profile yet:
- create temporary working notes during the run
- continue anyway
- if the repo becomes recurring, add a proper profile reference file later
