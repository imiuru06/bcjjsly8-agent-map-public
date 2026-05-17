# Agent Performance Scorecard

Agent Map needs a way to see whether agents are improving the service or merely accumulating labels. The performance scorecard is a public-safe, read-only report that combines:

- manifest agents from `config/agent-manifest.json`
- connected/session agents from `config/session-agents.json`
- GitHub issue labels such as `agent:*`, `needs:agent`, `needs:human`, `priority:*`
- recent closed issues
- session health from `runtime/session-agent-health.json`
- life-loop evidence from `runtime/life-agent-runs.jsonl`

## Commands

```bash
npm run agent:performance
npm run agent:performance:check
```

`npm run agent:performance` writes:

```text
runtime/agent-performance-report.json
```

The command is read-only with respect to external systems. It never closes issues, merges PRs, deploys, publishes, uploads, reads secrets, or exposes private raw data.

## How to read the status

- `active`: has recent close/evidence, available reviewer signal, or useful runtime evidence
- `attention`: has stale open work, P1 open work, or unconfirmed session risk
- `idle`: no current work and no recent evidence

The score is not a human performance judgment. It is an operational signal for routing, bottleneck removal, and accountability.

## Why this exists

If service improvement feels slow, the question should become measurable:

1. Which agent has open work?
2. Which work is stale?
3. Which agents are only role pools and not confirmed sessions?
4. Which agents produced recent close/evidence?
5. Which bottlenecks need Codex/user intervention?
