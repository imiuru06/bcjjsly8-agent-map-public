# Agent System Interface Ralph Plan

This document defines how Agent Map evaluates and improves the multi-layer
agent system as a user-facing service, not merely as a collection of scripts.

## Objective

Agent Map must let the user quickly understand:

- which runtime/session/CLI agents are actually available;
- which role pools are only optional reviewers;
- what requires human judgment and why;
- what Ralph Role Drive says must happen next;
- whether the system is improving, stable, or drifting into sprawl.

The outcome must be visible in the React/Vite Agent Map v10 control hub and in
public-safe runtime JSON.

## Research basis

The design follows current agent-system operation patterns:

- Trace agent runs, tool calls, handoffs, guardrails, and custom events.
- Treat logs, metrics, traces, and events as correlated observability signals.
- Prefer graph/state debugging for multi-agent flows and handoff reasoning.
- Keep human-in-the-loop gates explicit and compressed into real decisions.

## Ralph loop

### 1. Research

Use external references and local runtime evidence to decide the evaluation
criteria. The current criteria are:

- dynamic agent management;
- observability and runtime evidence;
- user-facing interface clarity;
- Ralph loop drive;
- human gate compression;
- stability and anti-sprawl.

### 2. Design

Create a single public-safe assessment read model:

```text
runtime/agent-system-interface-assessment.json
```

The read model must include:

- score and status;
- summary counts;
- scored dimensions;
- user interface contract;
- Ralph loop plan;
- recommendations;
- guardrails.

### 3. Implement

The implementation entrypoints are:

```bash
npm run agent:interface
npm run agent:interface:check
```

The control hub must expose the same evidence through an `Agent System
Interface` panel and a `Ralph Loop Plan` panel.

### 4. Verify

Run the following checks after code or data contract changes:

```bash
npm run agent:interface:check
npm run frontend:control:build
npm run uiux:audit
npm run service:integration:check
npm run policy:check
```

### 5. Improve

If the score is below `strong`, the next improvement should be selected from
the generated recommendations, not invented ad hoc.

Priority order:

1. reduce stale/attention pressure;
2. compress human decisions into explicit action cards;
3. confirm live session markers or downgrade unavailable role pools;
4. increase runtime-agent replacement evidence;
5. prevent new disconnected pages or unbounded runtime outputs.

### 6. Re-verify and deploy

After improvement, rebuild the static artifact and verify production:

```bash
npm run build:static
npm run deploy:briefing:check
```

The user-facing route is:

```text
https://bcjjsly8-agent-map.pages.dev/agent-map-v10.html
```

The public-safe JSON route is:

```text
https://bcjjsly8-agent-map.pages.dev/api/runtime/agent-system-interface-assessment
```

## Guardrails

- Do not expose raw Kakao messages, private raw data, or secret values.
- Do not treat optional reviewer pools as live workers unless verified.
- Do not let this assessment become another disconnected page.
- Do not count a page-only change as replacement progress.
- User-facing decisions should be few, explicit, and reversible where possible.

