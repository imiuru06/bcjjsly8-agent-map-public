# Ralph Role Drive

Ralph Role Drive turns the Codex `/goal` workflow into pressure on existing
agent roles.

The goal is to prevent passive cycles such as "no work found" when the system
still has stale issues, `needs:agent` work, attention agents, or an active
improvement direction.

## Operating rule

If any role is marked `must_act`, agents must do one of the following:

1. claim or route the relevant issue;
2. run the role's verification/health command;
3. produce runtime evidence or an issue/PR evidence comment;
4. emit a concrete blocked reason with evidence.

They should not only reply that there is no work.

When a cycle appears empty, agents should still check Ralph Role Drive before
ending. "No queue items" is not enough if stale issues, attention agents,
active improvement plans, or user-visible regression signals exist.

## Commands

```bash
npm run ralph:drive
npm run ralph:drive:check
```

Ralph Role Drive reads:

- `config/agent-manifest.json`
- `runtime/agent-performance-report.json`
- `runtime/improvement-execution-plan.json`
- `runtime/ralf-loop-report.json`

It writes:

- `runtime/ralph-role-drive-report.json`
- `/api/runtime/ralph-role-drive-report`

## Relationship to Ralph Plan / Run

- **Ralph Plan**: identify which role must act, why, and what evidence is needed.
- **Ralph Run**: execute the role's command/verification and update evidence.
- **Finalize**: update issue/PR/runtime artifacts or stop at a human gate.

## Role mapping

- Codex / 다알고 owns Analysis, implementation coordination, verification, and
  final user-facing summary.
- Claude remains review-only for safety, approval-boundary, requirements, and
  edge-case risk.
- Gemini remains optional UX/business critique until a live session or verified
  command is confirmed.
- OpenCode remains optional architecture/performance critique until a live
  session or verified command is confirmed.
- Stitch remains optional UI design/prototype support; the repo-native
  implementation-facing equivalent is `uiux_cli` plus Codex.
- `uiux_cli` is the available local reviewer for implemented UX evidence via
  `npm run uiux:audit`.

## Safety

This gate is public-safe and read-only except for writing local runtime
artifacts. It must not close, merge, deploy, publish, spend, expose secrets, or
mutate external systems without explicit approval.
