# Service Integration and Deprecation Contract

Agent Map must not grow as a set of disconnected pages, scripts, and runtime files. This document defines the service-level integration contract.

## Canonical surface model

- **Primary home:** Life Graph (`/`, `/agent-map-life.html`)
- **Integration/control hub:** Agent Map v10 (`/agent-map-v10.html`)
- **Feature surfaces:** infrastructure, daily brief, Kakao public analysis, knowledge map, retrieval pilot, LLM-Wiki readiness
- **System surfaces:** 404/private runtime denial page
- **Deprecated surfaces:** pages that remain reachable only to guide users to a replacement route

## Rules

1. Every public HTML route must be declared in `config/service-integration.json`.
2. Active feature pages must link back to Agent Map v10 or Life Graph.
3. Deprecated pages must render a visible deprecation marker and replacement route.
4. Private or raw runtime paths must remain blocked by `_redirects` or Worker logic.
5. Removal requires a separate issue after the notice period; do not delete ad hoc.
6. Runtime/data generators may create many artifacts, but user-facing navigation must remain integrated through the canonical surfaces.

## Current planned deprecation

- `public/dashboard.html`
  - Status: deprecated
  - Replacement: `/agent-map-v10.html`
  - Reason: old standalone VoC demo dashboard with stale static counts
  - Earliest removal: 2026-05-27, through a separate issue

- `public/agent-map-v9.html`
  - Status: deprecated compatibility route
  - Replacement: `/agent-map-v10.html`
  - Reason: large static HTML/inline JS control hub has been replaced by the React/Vite Agent Map v10 control hub
  - Earliest removal: 2026-06-14, through a separate issue

## Guard command

Run:

```bash
npm run service:integration:check
```

This command is also part of `npm run policy:check`.

The check is read-only. It does not deploy, delete files, read secrets, or expose private raw data.
## REPLACEMENT_FIRST_ENFORCEMENT

Service integration must now be replacement-first. A page is not a feature by
itself; it is only allowed when `config/service-integration.json` declares
`replacementImpact` with loop stages, linked domains, evidence, and
`pageOnlyProgressAccepted: false`.

This means a new dashboard cannot be treated as progress unless it replaces
manual work, verifies a runtime/life-agent loop, routes work to another agent,
or manages a hard human/safety gate. The policy gate is:

```bash
npm run replacement:enforce:check
```

As of issue #201, the minimum accepted replacement evidence includes three
verified scoped loops: Kakao aggregate information triage, external public
signal triage, and the content trend-to-video no-upload package loop. New
service surfaces should improve one of these loops or add another
replacement-ready scope instead of creating a detached page.
