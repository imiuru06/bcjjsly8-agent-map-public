# Ops Environment Audit

`ops_environment_auditor_cli` evaluates the operating environment itself.

It is intentionally different from result/content checks. It focuses on whether
the agent system is healthy enough to keep working:

- runtime agents;
- CLI/reviewer agents;
- external/session agents;
- issue and decision queues;
- stale claims;
- schedules;
- infrastructure topology and provider readiness.

## Commands

```bash
npm run ops:audit
npm run ops:audit:check
```

When an orchestrated session can access the cokacdir scheduler, pass a cron-list
JSON export to include real schedule duplicate analysis:

```bash
npm run ops:audit -- --schedule-json /tmp/cokacdir-cron-list.json
```

Without that file, the audit still runs but records a
`schedule_inventory_missing` warning instead of silently pretending schedule
coverage is complete.

## Inputs

- `config/agent-manifest.json`
- `config/session-agents.json`
- `config/agent-role-management.json`
- `runtime/session-agent-health.json`
- `runtime/decision-queue.json`
- `runtime/agent-performance-report.json`
- `runtime/infrastructure-map.json`
- optional external cron-list JSON from cokacdir

## Outputs

- `runtime/ops-environment-audit.json`
- `runtime/ops-environment-audit.md`
- `public/ops-environment-audit.html`

## What it flags

- incomplete agent manifest or implementation evidence;
- high attention-agent load;
- high stale-open-issue load;
- Needs Human queue bottlenecks;
- unconfirmed role pools;
- work lanes whose primary owners are unavailable or optional-only role pools;
- stale session claims;
- duplicate schedules;
- missing schedule inventory;
- unknown/missing/stale infrastructure resources;
- not-configured live providers.

## Safety boundary

The audit is read-only.

It must not:

- read raw private data;
- include secret values;
- mutate GitHub issues, labels, PRs, or Projects;
- remove schedules by itself;
- deploy, publish, upload, merge, close, pay, or perform destructive actions.

The auditor can recommend remediation, but Codex / 다알고 or an explicit
approved workflow performs the actual changes.

## Role-pool availability policy

`role-pool-unconfirmed` should be a temporary state, not a steady operating
mode. If a pool has no live session marker and no verified local command, it
should be downgraded to `optional-reviewer` and moved out of primary work-lane
ownership.

Valid primary capacity should come from at least one of:

- a confirmed external/session agent;
- an available local CLI reviewer;
- Codex / 다알고 fallback.

Optional reviewers may still add critique or design/architecture context, but
they must not block progress or claim work as the sole owner until promoted by
a fresh session marker or verified command.
