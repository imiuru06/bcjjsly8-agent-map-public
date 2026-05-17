# Ops Environment Audit

- agentId: `ops_environment_auditor_cli`
- generatedAt: `2026-05-17T00:19:25.872Z`
- status: `ok`
- score: `76`

This audit evaluates the work environment itself: runtime agents, CLI agents, session agents, schedules, queues, and infrastructure readiness.

## Summary

- manifest completeness: `100%`
- configured agents: `25`
- attention agents: `8`
- stale open issues: `18`
- Needs Human queue: `5`
- assignable session/CLI agents: `5`
- optional reviewers: `3`
- unavailable primary lanes: `0`
- schedules audited: `9`
- duplicate schedule groups: `0`
- infra unknown/missing: `0`
- infra not-configured providers: `0`

## Findings

### Attention agent count is high.

- severity: `warning`
- code: `attention_agent_load`
- recommendation: Split owner labels from active assignee labels and reduce stale/open issue load for coordinator agents.

### Needs Human queue is still a bottleneck.

- severity: `warning`
- code: `decision_queue_bottleneck`
- recommendation: Run decision:sync, decision:digest, and decision:classify to separate true human gates from agent-preparable work.

### Stale open issue load is high.

- severity: `warning`
- code: `stale_open_issue_load`
- recommendation: Batch stale issue review and close/delegate issues that have completed evidence.

