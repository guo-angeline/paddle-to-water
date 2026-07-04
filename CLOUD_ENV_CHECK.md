# Cloud Environment Check

- UTC date: 2026-07-04T03:03:07Z

## gh auth status

```
gh: not found in PATH
/bin/bash: line 1: gh: command not found
```

The `gh` CLI is not installed/available in this remote execution environment. GitHub operations here go through an MCP server (`mcp__github__*` tools) instead of the `gh` CLI.

## node / npm versions

- node --version: v22.22.2
- npm --version: 10.9.7

## npm install

Exit code: 0

Last 5 lines of output:

```
npm notice
npm notice New major version of npm available! 10.9.7 -> 11.18.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.18.0
npm notice To update run: npm install -g npm@11.18.0
npm notice
```

`npm install` succeeded (443 packages added, 444 audited; 10 vulnerabilities reported: 8 moderate, 1 high, 1 critical — not remediated as part of this diagnostic run). `npm test`/`npm run build` were intentionally skipped per instructions.
