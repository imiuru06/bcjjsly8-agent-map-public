# Stitch Life Graph Redesign Brief

Issue: #20

## Diagnosis

The Life Graph is correctly deployed as the public Agent Map route, but the current graph still feels closer to a raw diagnostic graph than the earlier Stitch Refresh product concept.

The user is not misreading the page. The current implementation lost several strengths from the previous design:

- category grouping is present in data but not visually dominant;
- graph modes exist but do not communicate their purpose quickly enough;
- long labels compete with graph readability;
- the visual system has a light theme, but not enough product-level hierarchy or theme token structure;
- cards and graph nodes show data, but do not yet guide a user through life domains, agents, processes, and pipelines as a coherent service map.

Important correction: visual polish alone is not enough. The design pass must follow the foundation review in `docs/LIFE_GRAPH_FOUNDATION_REVIEW.md`, which defines the purpose, data/currentness gaps, node/edge taxonomy, evidence model, and service-operating requirements.

## Stitch-oriented design direction

Design the Agent Map as a bright, modern service dashboard for life/process orchestration.

Use the following product framing:

> "A living Life Graph that shows what parts of Noah's life are being tracked, which agents own them, how signals move through pipelines, and where human decisions are still required."

## Required visual hierarchy

1. **Life Graph public route**
   - `/` is the canonical product page.
   - It should not expose the internal v9 diagnostics page through public navigation.

2. **Category-first graph**
   - Group domains and agents by purpose, not only by node type.
   - Required visual groups:
     - Core / Decision
     - Life Ops
     - Money / Info
     - Content / Growth
     - Meta Process

3. **Graph modes**
   - Force: overall relationship overview.
   - Domain Cluster: purpose/category grouping.
   - Process Flow: meta-process ownership.
   - Pipeline Trace: execution chains.
   - Phase Lane: operational stage view.

4. **Text safety**
   - Labels should truncate in graph nodes.
   - Cards should wrap descriptions but clamp or truncate compact metadata.
   - Long agent IDs should not overflow card boundaries.

5. **Theme system**
   - Default should be bright and modern.
   - Theme tokens should allow at least:
     - Bright
     - Mint
     - Studio
     - Sunset

## Implementation status — 2026-05-15

The Stitch handoff must be evaluated at the product-UX level, not by checking
whether a shared banner script exists.

Applied in the Life Graph product surface:

- `Force`, `Domain Cluster`, `Process Flow`, `Pipeline Trace`, and `Phase Lane`
  are now first-class graph modes in `frontend/life-graph/src/main.jsx`.
- `Domain Cluster` is the default public graph mode so the page opens with a
  category-first mental model instead of a generic service map.
- Category lens cards expose `Core / Decision`, `Life Ops`, `Money / Info`,
  `Content / Growth`, `Agent Ops`, `Meta Process`, and supporting service/evidence
  groups as visible filters.
- `Stitch Process Handoff` summarizes how `Process Flow`, `Pipeline Trace`, and
  `Phase Lane` map to the runtime `metaProcess` and `pipelines` data.
- `scripts/check-uiux-review-contract.mjs` now verifies these handoff markers so
  a shell-only rollout cannot be counted as full Stitch handoff implementation.

## Implementation constraints

- Keep the runtime contract JSON-first.
- Do not require Neo4j or external graph DB for this pass.
- Do not place private life data or secrets in public runtime JSON.
- Keep `agent-map-v9.html` as internal diagnostics only.
- Do not treat visual grouping as final unless source/evidence/currentness semantics are also modeled.
- Validate with `npm run policy:check` and `npm run build:static`.

## Stitch prompt

Use this prompt in Google Stitch or another design/prototype agent.

For the repo-managed Stitch SDK/MCP path, see
`docs/STITCH_MCP_INTEGRATION.md`. The Agent Map v10 prompt is maintained in
`docs/STITCH_AGENT_MAP_V10_PROMPT.md` and can be sent through:

```bash
npm run stitch:agent-map-v10
```

```text
Create a bright modern Life Graph dashboard for a multi-agent personal operating system.

The dashboard shows life domains, AI agents, meta-process steps, and execution pipelines as a node graph. It should feel like a polished service product, not a raw admin panel.

Primary goal:
Help the user understand which life/process areas are tracked, which agents are responsible, how data and decisions flow, and what is still planned or active.

Visual groups:
- Core / Decision: human decision, Codex coordination, knowledge graph
- Life Ops: health, relationship, time, logistics, reflection
- Money / Info: finance, information diet, learning, insight analysis
- Content / Growth: trend-to-video, content planning, legal check, publishing
- Meta Process: problem definition, collection, analysis, implementation, verification, monitoring

Style:
- light, spacious, modern, clean
- soft gradients, rounded cards, category color chips
- graph canvas with subtle background lanes/clusters
- readable labels with truncation
- responsive layout
- theme-ready token system with Bright, Mint, Studio, Sunset

Key screens/components:
- hero summary with runtime source and theme switcher
- graph mode toolbar
- category focus filter
- graph legend
- node detail panel
- category lens cards
- domain cards with category and priority chips
- pipeline cards that do not overflow with long IDs

Avoid:
- dark-only interface
- raw database feel
- overflowing text
- exposing internal ops diagnostics as a public nav item
```
