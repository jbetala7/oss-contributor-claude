#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const packageJson = require(path.join(rootDir, "package.json"));
const vendorDir = path.join(rootDir, "vendor", "oss-contributor");
const jayeshCredit = {
  coauthor: "Jayesh Betala <55358314+jbetala7@users.noreply.github.com>",
  github: "jbetala7"
};

function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.command === "help" || parsed.options.help) {
    printHelp();
    return;
  }

  if (parsed.command === "version") {
    console.log(packageJson.version);
    return;
  }

  if (parsed.command === "install") {
    install(parsed.options);
    return;
  }

  if (parsed.command === "uninstall") {
    uninstall(parsed.options);
    return;
  }

  if (parsed.command === "doctor") {
    doctor(parsed.options);
    return;
  }

  if (parsed.command === "print-agent") {
    process.stdout.write(buildAgent(parsed.options));
    return;
  }

  if (parsed.command === "print-command") {
    process.stdout.write(buildSlashCommand());
    return;
  }

  fail(`Unknown command: ${parsed.command}`);
}

function parseArgs(argv) {
  const command = argv[0] && !argv[0].startsWith("-") ? argv[0] : "help";
  const startIndex = command === "help" ? 0 : 1;
  const options = {
    scope: "user",
    projectDir: process.cwd(),
    installAgent: true,
    installCommand: true,
    installReferences: true,
    force: false,
    dryRun: false,
    coauthor: null,
    creditGithub: null,
    jayesh: false,
    help: false
  };

  for (let index = startIndex; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--jayesh") {
      options.jayesh = true;
    } else if (arg === "--user") {
      options.scope = "user";
    } else if (arg === "--project") {
      options.scope = "project";
    } else if (arg === "--scope") {
      options.scope = requiredValue(argv, ++index, "--scope");
    } else if (arg === "--project-dir") {
      options.projectDir = path.resolve(requiredValue(argv, ++index, "--project-dir"));
    } else if (arg === "--credit" || arg === "--coauthor") {
      options.coauthor = normalizeCoauthor(requiredValue(argv, ++index, arg));
    } else if (arg === "--credit-github") {
      options.creditGithub = normalizeGithubHandle(requiredValue(argv, ++index, "--credit-github"));
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--no-agent") {
      options.installAgent = false;
    } else if (arg === "--no-command") {
      options.installCommand = false;
    } else if (arg === "--no-references") {
      options.installReferences = false;
    } else {
      fail(`Unknown option: ${arg}`);
    }
  }

  if (!["user", "project"].includes(options.scope)) {
    fail("--scope must be either 'user' or 'project'");
  }

  if (options.jayesh) {
    options.coauthor = options.coauthor || jayeshCredit.coauthor;
    options.creditGithub = options.creditGithub || jayeshCredit.github;
  }

  return { command, options };
}

function requiredValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) {
    fail(`${flag} requires a value`);
  }
  return value;
}

function normalizeCoauthor(input) {
  const trimmed = input.trim();
  const withoutPrefix = trimmed.replace(/^Co-authored-by:\s*/i, "");

  if (!/^[^<>]+ <[^<>]+>$/.test(withoutPrefix)) {
    fail('--coauthor must look like "Name <email@example.com>"');
  }

  return withoutPrefix;
}

function normalizeGithubHandle(input) {
  const handle = input.trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9-]{1,39}$/.test(handle) || handle.startsWith("-") || handle.endsWith("-")) {
    fail("--credit-github must be a valid GitHub username, with or without @");
  }
  return handle;
}

function install(options) {
  const plan = buildPlan(options);
  const writes = [];

  if (options.installAgent) {
    writes.push({
      label: "Claude subagent",
      target: plan.agentPath,
      content: buildAgent(options)
    });
  }

  if (options.installCommand) {
    writes.push({
      label: "Claude slash command",
      target: plan.commandPath,
      content: buildSlashCommand()
    });
  }

  for (const write of writes) {
    writeText(write.target, write.content, options, write.label);
  }

  if (options.installReferences) {
    copyReferences(plan.referencesDir, options);
  }

  console.log("");
  console.log("Installed OSS Contributor for Claude Code.");
  console.log(`Scope: ${options.scope}`);
  if (options.installAgent) console.log(`Subagent: ${plan.agentPath}`);
  if (options.installCommand) console.log(`Slash command: ${plan.commandPath}`);
  if (options.installReferences) console.log(`References: ${plan.referencesDir}`);
  if (options.coauthor || options.creditGithub) {
    console.log(`Credit policy: ${formatCreditSummary(options)}`);
  }
  console.log("");
  console.log("Next:");
  console.log("  1. Run: gh auth login --web");
  console.log("  2. Run: gh auth status");
  console.log("  3. Start Claude Code and use: /oss-contributor scan owner/repo");
}

function uninstall(options) {
  const plan = buildPlan(options);
  const targets = [plan.agentPath, plan.commandPath, plan.referencesDir];

  for (const target of targets) {
    if (!fs.existsSync(target)) {
      console.log(`skip missing ${target}`);
      continue;
    }

    if (options.dryRun) {
      console.log(`[dry-run] remove ${target}`);
      continue;
    }

    fs.rmSync(target, { recursive: true, force: true });
    console.log(`removed ${target}`);
  }
}

function doctor(options) {
  const plan = buildPlan(options);
  console.log(`oss-contributor-claude ${packageJson.version}`);
  console.log("");

  checkCommand("node", ["--version"]);
  checkCommand("claude", ["--version"]);
  checkCommand("gh", ["--version"]);
  checkCommand("gh", ["auth", "status"]);

  console.log("");
  checkPath("Subagent", plan.agentPath);
  checkPath("Slash command", plan.commandPath);
  checkPath("References", plan.referencesDir);
}

function checkCommand(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  const name = [command, ...args].join(" ");

  if (result.error) {
    console.log(`missing ${name}: ${result.error.message}`);
    return;
  }

  const output = `${result.stdout || ""}${result.stderr || ""}`.trim().split(/\r?\n/)[0] || "ok";
  const status = result.status === 0 ? "ok" : `exit ${result.status}`;
  console.log(`${status} ${name}: ${output}`);
}

function checkPath(label, target) {
  console.log(`${fs.existsSync(target) ? "ok" : "missing"} ${label}: ${target}`);
}

function buildPlan(options) {
  const baseDir =
    options.scope === "project"
      ? path.join(options.projectDir, ".claude")
      : path.join(os.homedir(), ".claude");

  return {
    baseDir,
    agentPath: path.join(baseDir, "agents", "oss-contributor.md"),
    commandPath: path.join(baseDir, "commands", "oss-contributor.md"),
    referencesDir: path.join(baseDir, "oss-contributor", "references")
  };
}

function writeText(target, content, options, label) {
  if (fs.existsSync(target) && !options.force) {
    console.log(`skip existing ${label}: ${target}`);
    return;
  }

  if (options.dryRun) {
    console.log(`[dry-run] write ${label}: ${target}`);
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  console.log(`wrote ${label}: ${target}`);
}

function copyReferences(targetDir, options) {
  const sourceDir = path.join(vendorDir, "references");
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const source = path.join(sourceDir, entry.name);
    const target = path.join(targetDir, entry.name);

    if (fs.existsSync(target) && !options.force) {
      console.log(`skip existing reference: ${target}`);
      continue;
    }

    if (options.dryRun) {
      console.log(`[dry-run] write reference: ${target}`);
      continue;
    }

    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(source, target);
    console.log(`wrote reference: ${target}`);
  }
}

function buildAgent(options) {
  const skill = fs.readFileSync(path.join(vendorDir, "SKILL.md"), "utf8");
  const body = stripFrontmatter(skill)
    .replaceAll("~/.codex/memories/oss-contributor.json", "~/.claude/oss-contributor/state.json")
    .replaceAll("~/.codex/memories/oss-contributor.md", "~/.claude/oss-contributor/log.md")
    .trimStart();
  const creditLines = [];
  if (options.coauthor) creditLines.push(`Commit trailer: \`Co-authored-by: ${options.coauthor}\``);
  if (options.creditGithub) creditLines.push(`GitHub mention: \`@${options.creditGithub}\``);

  const coauthorSection = creditLines.length
    ? `
Configured mandatory credit recipient:

${creditLines.map((line) => `- ${line}`).join("\n")}

For every PR created or updated through this workflow:

1. Authenticate GitHub as the operator using \`gh auth status\`. If auth is missing, ask the operator to run \`gh auth login --web\`. Never use the credit recipient's GitHub account, token, SSH key, or OAuth session.
2. Add the configured \`Co-authored-by:\` trailer to every commit made by this workflow when a trailer is configured.
3. Add visible credit in the PR body. Use the GitHub mention if configured; otherwise include the exact \`Co-authored-by:\` line.
4. If the PR body cannot be edited or a repo template would remove the credit, add a PR comment with the same credit before considering the PR shipped.
5. If the workflow cannot include the configured credit, stop before publishing or updating the PR and report the blocker.

Do not make the credit recipient the Git author unless the operator explicitly configures Git that way on their own machine. The normal setup is: operator is the Git author and authenticated GitHub user; configured recipient receives commit and PR-level credit.
`
    : `
No default credit recipient is configured. If the operator asks for co-authorship, collect the exact GitHub-associated email and add one \`Co-authored-by:\` trailer per co-author.
`;

  return `---
name: oss-contributor
description: Use PROACTIVELY for open-source contribution work: scan issues, verify bugs against upstream, implement narrow fixes, open clean PRs, and track review.
---

# OSS Contributor for Claude Code

This is a Claude Code port of the Codex OSS Contributor workflow.

## Claude Code operating notes

- Confirm the operator is authenticated with their own GitHub account using \`gh auth status\`; if not, ask them to run \`gh auth login --web\`.
- Use the operator's Git identity for authored commits. Do not share or reuse another person's GitHub credentials, including the credit recipient's credentials.
- Prefer fork-based PRs unless the upstream repository grants direct branch permission.
- Keep contribution state in \`~/.claude/oss-contributor/state.json\` and \`~/.claude/oss-contributor/log.md\` when tracking prior PRs.
- If repository-specific notes exist in \`~/.claude/oss-contributor/references/\`, read the relevant profile before scanning or shipping work.
- For commit attribution, use GitHub's \`Co-authored-by: Name <email>\` trailer format.
${coauthorSection}
${body}
`;
}

function buildSlashCommand() {
  return `---
description: Run the OSS Contributor workflow for open-source issue scanning, fixing, PR creation, and PR tracking.
argument-hint: "[scan|ship|track|expand] [repo, issue, or PR]"
---

Use the \`oss-contributor\` subagent to handle this request:

\`\`\`
$ARGUMENTS
\`\`\`

If the request is vague, infer the mode:

- \`scan\`: shortlist good issues, without editing code.
- \`ship\`: verify one issue, implement the fix, test it, push a branch, and open a PR.
- \`track\`: check prior PRs for review comments, CI, mergeability, or closure.
- \`expand\`: onboard to a new recurring repository.

Before opening or updating a PR, confirm \`gh auth status\`, the fork/upstream remotes, and the exact commit/PR credit policy. If mandatory credit is configured and cannot be included, stop before publishing.
`;
}

function formatCreditSummary(options) {
  const parts = [];
  if (options.coauthor) parts.push(`Co-authored-by: ${options.coauthor}`);
  if (options.creditGithub) parts.push(`@${options.creditGithub}`);
  return parts.join(" plus ");
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return markdown;

  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return markdown;

  return markdown.slice(end + 4).replace(/^\r?\n/, "");
}

function printHelp() {
  console.log(`oss-contributor-claude ${packageJson.version}

Install the OSS Contributor workflow into Claude Code.

Usage:
  oss-contributor-claude install [options]
  oss-contributor-claude uninstall [options]
  oss-contributor-claude doctor [options]
  oss-contributor-claude print-agent [options]
  oss-contributor-claude print-command

Options:
  --user                         Install to ~/.claude (default)
  --project                      Install to ./.claude in the current project
  --scope user|project           Same as --user or --project
  --project-dir <path>           Project directory for --project installs
  --jayesh                       Use Jayesh Betala's mandatory credit preset
  --credit "Name <email>"        Configure a mandatory co-author trailer
  --coauthor "Name <email>"      Alias for --credit
  --credit-github <username>     Configure a mandatory PR body/comment mention
  --force                        Overwrite existing installed files
  --dry-run                      Show writes without changing files
  --no-agent                     Do not install the Claude subagent
  --no-command                   Do not install the /oss-contributor command
  --no-references                Do not install reference docs
  -h, --help                     Show this help

Examples:
  oss-contributor-claude install --credit "Your Name <your@users.noreply.github.com>" --credit-github yourhandle
  oss-contributor-claude install --jayesh
  oss-contributor-claude install --project --project-dir ~/work/repo
  oss-contributor-claude doctor
`);
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

main();
