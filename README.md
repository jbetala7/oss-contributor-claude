# OSS Contributor for Claude Code

Installer for the OSS Contributor workflow as a Claude Code subagent and slash command.

It installs:

- `~/.claude/agents/oss-contributor.md`
- `~/.claude/commands/oss-contributor.md`
- `~/.claude/oss-contributor/references/*`

## Local test

```bash
cd ~/oss-contributor-claude
npm run check
```

## Install from a local tarball

```bash
cd ~/oss-contributor-claude
npm pack
npm install -g ./oss-contributor-claude-0.1.0.tgz
oss-contributor-claude install --credit "Your Name <your@users.noreply.github.com>" --credit-github yourhandle
```

## Install after npm publish

```bash
npx oss-contributor-claude@latest install --credit "Your Name <your@users.noreply.github.com>" --credit-github yourhandle
```

For Jayesh's preset:

```bash
npx oss-contributor-claude@latest install --jayesh
```

## One-line install for Claude Code

After this package is hosted in a public GitHub repo at `jbetala7/oss-contributor-claude`, your friend can ask Claude Code to run:

```bash
npx --yes github:jbetala7/oss-contributor-claude install --jayesh && gh auth login --web && gh auth status
```

This installs the Claude Code subagent/command with mandatory credit to:

- `Co-authored-by: Jayesh Betala <55358314+jbetala7@users.noreply.github.com>`
- PR body/comment mention: `@jbetala7`

## Curl installer after hosting this repo

Host `install.sh` somewhere public, then:

```bash
curl -fsSL https://raw.githubusercontent.com/YOU/oss-contributor-claude/main/install.sh | bash -s -- --credit "Your Name <your@users.noreply.github.com>" --credit-github yourhandle
```

For Jayesh's preset:

```bash
curl -fsSL https://raw.githubusercontent.com/jbetala7/oss-contributor-claude/main/install.sh | bash -s -- --jayesh && gh auth login --web && gh auth status
```

For a private tarball URL or a different npm package name:

```bash
curl -fsSL https://raw.githubusercontent.com/YOU/oss-contributor-claude/main/install.sh \
  | OSS_CONTRIBUTOR_CLAUDE_PACKAGE="https://example.com/oss-contributor-claude-0.1.0.tgz" \
    bash -s -- --credit "Your Name <your@users.noreply.github.com>" --credit-github yourhandle
```

## Friend setup

Your friend should authenticate their own GitHub account:

```bash
gh auth login --web
gh auth status

git config --global user.name "Friend Name"
git config --global user.email "friend@users.noreply.github.com"
```

Then use Claude Code:

```text
> /oss-contributor scan owner/repo
> /oss-contributor ship owner/repo#123
> /oss-contributor track owner/repo
```

## Attribution

The installer requires your friend to authenticate their own GitHub account with `gh auth login --web`. It does not use your GitHub account, token, OAuth session, SSH key, or personal access token.

Use `--credit` to configure a mandatory `Co-authored-by:` trailer. Use `--credit-github` to configure a mandatory PR body or PR comment mention. When either is configured, the generated Claude subagent is instructed to stop before publishing if it cannot include the configured credit.

```bash
oss-contributor-claude install \
  --credit "Your Name <your@users.noreply.github.com>" \
  --credit-github yourhandle
```

This creates visible credit on every PR shipped through the workflow while keeping GitHub authentication under your friend's account.

Jayesh preset:

```bash
oss-contributor-claude install --jayesh
```

## Commands

```bash
oss-contributor-claude install --help
oss-contributor-claude doctor
oss-contributor-claude print-agent
oss-contributor-claude uninstall
```
