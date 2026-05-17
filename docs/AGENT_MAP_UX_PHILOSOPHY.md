# Agent Map UX Philosophy

Agent Map should not feel like a pile of runtime JSON files or a generic admin
dashboard. It should feel like a personal operating map for life-process agents.

## Core promise

The user should be able to answer four questions quickly:

1. What changed?
2. Why does it matter?
3. What will agents do next?
4. What must only the user decide?

## Product stance

- **Life Graph is the primary home.** It represents the user's life/process
  replacement map.
- **Agent Map v10 is the control hub.** It connects agents, runtime evidence,
  human gates, external trends, knowledge, and infrastructure.
- **Evidence beats page count.** A new page is only useful if it reduces manual
  work, clarifies decisions, or verifies an agent loop.
- **Human gates must be explicit.** `needs:human` should mean a real user
  decision, credential, approval, or irreversible action is needed.
- **External signals are input layers.** They become useful when converted into
  issue briefs, bounded actions, technical definitions, or learning artifacts.

## UX implications

- Start from meaning, not raw data.
- Keep one integrated wayfinding layer.
- Make the operating loop visible:
  - Sense
  - Prioritize
  - Act
  - Verify
  - Learn
- Put service links next to the explanation of why they exist.
- Use progressive disclosure for JSON/evidence details.
- Offer visual themes without changing the underlying information architecture.

## Current v10 design contract

The React/Vite control hub should include:

- human-centered priority summary;
- service usage guide;
- philosophy compass;
- operating loop strip;
- clear cards for Life Graph, agent ops, infrastructure, knowledge, and external
  signals;
- preference controls for density, text size, contrast, and visual theme.

## Verification

Run:

```bash
npm run frontend:control:build
npm run uiux:audit
npm run service:integration:check
```
