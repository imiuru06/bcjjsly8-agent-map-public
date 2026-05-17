# RALF / Ralph Loop

RALF means **Review → Act → Learn → Feedback**.

In current Codex, the native "Ralph loop" appears as the experimental
**`/goal` slash command**, guarded by the `goals` feature flag. This repository
keeps deterministic `ralf:*` commands for CI/schedules and provides `ralph:*`
aliases so humans and session agents can use either spelling without breaking
automation.

It is the working rhythm for Codex/다알고 and cooperating agents when a task
should produce real service improvement instead of page-only activity.

## Codex autonomous coding guide mapping

For product/code work, use Ralph as a staged workflow, not merely as a retry
loop.

1. **Analysis**
   - Inspect the existing code, current artifacts, issue context, and project
     conventions before editing.
   - Prefer generated deltas and runtime reports over rereading the whole repo.

2. **Deep Interview**
   - Resolve ambiguity before execution: data source, UI location, exception
     handling, success criteria, security/privacy boundary, and human gates.
   - If the user delegates decisions, make them from the latest repo policies
     and record the decision evidence.

3. **Ralph Plan**
   - Produce a bounded implementation plan before autonomous execution.
   - In interactive Codex, this is the objective and success criteria supplied
     to `/goal`.
   - In non-interactive repo automation, this is represented by
     `runtime/improvement-execution-plan.json` and
     `runtime/ralf-loop-report.json`.

4. **Ralph Run / Execute & Vision**
   - Execute the plan, edit files, run tests/lint/build, and iterate on failures.
   - For UI work, use browser/Playwright evidence and screenshots when useful;
     do not rely only on code inspection.

5. **Finalize**
   - Summarize changed evidence, remaining decisions, and verification results.
   - Update issues/PRs/runtime artifacts and stop at approval gates for close,
     merge, deploy, publish, spend, or private-data exposure.

## Stage contract

1. **Review**
   - Read the smallest relevant runtime evidence set.
   - Prefer delta scripts and generated artifacts over rereading everything.
   - Identify the current bottleneck and primary action.

2. **Act**
   - Execute the smallest bounded safe action.
   - Prefer runtime evidence, checks, routing, and deterministic scripts.
   - Stop at hard human gates.

3. **Learn**
   - Convert the result into reusable evidence:
     - runtime JSON
     - life-agent run log
     - knowledge/Graphify artifact
     - verification report
     - issue/PR evidence comment

4. **Feedback**
   - Report only meaningful deltas.
   - Update improvement plan, issue, and PR evidence.
   - Feed the next cycle.

## Commands

Interactive Codex session:

```text
/goal <bounded objective>
```

Recommended objective shape:

```text
/goal Analysis → Deep Interview if needed → Ralph Plan → Ralph Run with tests/browser evidence → Finalize with evidence and gates for: <bounded objective>
```

Enable the Codex goal/Ralph feature when available:

```bash
codex features enable goals
```

Non-interactive, CI, scheduled, or session-agent fallback:

```bash
npm run improvement:suggest
npm run improvement:plan
npm run ralf:loop
npm run ralf:loop:check
npm run ralph:loop
npm run ralph:loop:check
npm run ralph:drive
npm run ralph:drive:check
npm run improvement:review
npm run policy:check
```

## Output

- `runtime/ralf-loop-report.json`
- `runtime/ralph-role-drive-report.json`
- `/api/runtime/ralf-loop-report`
- `/api/runtime/ralph-role-drive-report`
- Agent Map v10 Ralph Role Drive section

## Ralph Role Drive

Use `npm run ralph:drive` when existing roles need stronger pressure. It turns
agent performance, stale issue load, and improvement direction into per-role
`must_act` directives so runtime agents, CLI reviewers, and session agents do
not stay passive when work exists.

Before an agent replies "no work" or exits a watcher cycle, it should verify
whether `runtime/ralph-role-drive-report.json` contains a `must_act` directive
for its role, or run `npm run ralph:drive` when the report is stale.

See `docs/RALPH_ROLE_DRIVE.md`.

## Guardrails

RALF is not an unrestricted autonomous loop. It must not:

- merge, close, deploy, publish, upload, spend, or mutate external systems
  without explicit approval;
- expose secret values or raw private data;
- count page-only additions as life-agent replacement progress;
- claim real-world autonomy unless replacement evidence proves it.

## Why this exists

The project already has multiple loops (`issue:workloop`, `life:loop:*`,
`improvement:plan`). RALF ties them into a single work discipline so each task
has a visible feedback loop:

```text
evidence → bounded action → reusable learning → next cycle
```
