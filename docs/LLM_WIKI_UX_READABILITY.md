# LLM-Wiki UX Readability Contract

Agent Map is not only a dashboard. It is the user-facing workbench for a
personal agent system. The UX must reduce the user's cognitive load before it
adds more data, pages, or charts.

## Purpose

This contract defines how Agent Map surfaces should respect human preference,
convenience, visibility, and readability while still serving LLM-Wiki style
knowledge retrieval and agent operations.

The goal is:

```text
scan quickly → understand priority → inspect evidence → route or act
```

## Human-centered UX principles

1. **Preference-aware reading**
   - Users can choose comfortable or compact density.
   - Users can choose normal or large text.
   - Users can choose soft or high contrast.
   - Preferences should persist locally when browser storage is available.

2. **Visibility before detail**
   - The first screen should answer: "What should I look at first?"
   - Raw metrics should not be the only entry point.
   - Priority summaries should be derived from runtime evidence.

3. **Progressive disclosure**
   - Default view should show a short operational summary.
   - Detailed modernization status, JSON artifacts, and legacy routes should be
     available but not visually dominate the page.

4. **Readability and overflow safety**
   - Long issue titles, agent IDs, URLs, and generated actions must not cross
     card boundaries.
   - Cards must use wrapping and responsive layout.
   - Mobile width is a first-class requirement, not an afterthought.

5. **LLM-Wiki compatibility**
   - Each visible claim should be traceable to runtime evidence or a documented
     source route.
   - The UX should support future ask/retrieve/cite/create-action loops.
   - The page must avoid exposing private raw data, secrets, raw Kakao content,
     or unredacted source material.

## Agent Map v10 implementation

Agent Map v10 implements this contract in:

```text
frontend/agent-map-control/src/main.jsx
frontend/agent-map-control/src/styles.css
```

Current UX affordances:

- `Human UX Summary`: a first-screen priority panel.
- Reading density controls: comfortable / compact.
- Text size controls: normal / large.
- Contrast controls: soft / high contrast.
- Local preference persistence through `localStorage`.
- Skip link for keyboard users.
- Responsive layout and overflow-safe text wrapping.
- Modernization details behind a `<details>` disclosure.

## Guardrails

Run:

```bash
npm run uiux:audit
npm run service:integration:check
npm run policy:check
```

The UI/UX audit should verify that the v10 control hub:

- exists as a React/Vite source surface,
- exposes preference controls,
- keeps legacy v9 visibly deprecated,
- links to Life Graph, Infra Map, and knowledge surfaces,
- uses live/static runtime fetches,
- protects mobile viewport and overflow behavior.

## What this is not

This is not a request to add more decorative pages.

A UX improvement counts only when it improves one of:

- faster first decision,
- lower reading fatigue,
- clearer operational priority,
- safer evidence inspection,
- more reliable routing or action,
- lower chance of misreading stale/legacy information.
