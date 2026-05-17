# Obsidian Graph View Guide for Agent Map

This guide explains how to view the Agent Map knowledge graph and derived
Graphify/retrieval artifacts in Obsidian without confusing generated indexes
with the source of truth.

## Recommended vaults

### Option A — focused atomic vault

Open this folder as an Obsidian vault:

```text
<bcjjsly8 repo>/knowledge
```

Use this when you want the cleanest graph of reusable atomic notes. This view
shows the links between principles, roles, protocols, runbooks, decisions, and
indexes.

Start from:

- `README.md`
- `00-maps/agent-knowledge-map.md`
- `00-maps/derived-graph-index.md`
- `90-indexes/agent-lookup-index.md`

### Option B — repo-wide operating vault

Open the whole repo as an Obsidian vault:

```text
<bcjjsly8 repo>
```

Use this when you also want to open generated graph reports, docs, runtime
contracts, and project files from the same sidebar.

Recommended Obsidian search/exclusion filters for repo-wide use:

```text
path:knowledge
path:docs
path:graphify-out
```

Avoid using broad raw-data folders as the working graph context. The repo keeps
raw/private data out of public artifacts, and the Obsidian workflow should follow
the same boundary.

## What to view where

- Obsidian Graph View:
  - best for `knowledge/**/*.md` wikilinks;
  - use local graph around `derived-graph-index`;
  - use local graph around `agent-knowledge-map`.
- Browser graph:
  - open `graphify-out/graph.html`;
  - this shows the deterministic Graphify-compatible fallback graph.
- Machine-readable graph:
  - open `graphify-out/graph.json`;
  - use it for tooling or Agent Map derived views.
- Retrieval evidence:
  - open `runtime/knowledge-retrieval-index.json`;
  - open `runtime/retrieval-service-health.json`;
  - open `runtime/llm-wiki-search-roi.json`.

## Obsidian workflow

1. Open the focused vault `knowledge/`.
2. Open `00-maps/agent-knowledge-map.md`.
3. Open the graph view and enable arrows if desired.
4. Open `00-maps/derived-graph-index.md`.
5. Use local graph depth `2` to see how derived graph outputs relate to:
   - source-of-truth;
   - llm-wiki-adoption-gates;
   - knowledge-lookup-before-work;
   - weekly-knowledge-synthesis;
   - zero-friction-capture.
6. When a note or generated artifact conflicts with source docs, follow
   `source-of-truth`: canonical docs/config win.

## Safe interpretation

Graphify/retrieval outputs are **derived indexes**. They help orientation and
search, but they do not replace:

1. `AGENTS.md`
2. `docs/*`
3. `config/*.json`
4. `knowledge/*.md`

The current graph/retrieval baseline is public-safe by design:

- no raw private messages;
- no secrets;
- no `local env file` values;
- source docs win on conflict.

## Useful commands

```bash
npm run knowledge:check
npm run knowledge:graphify
npm run knowledge:graphify:check
npm run knowledge:retrieval
npm run knowledge:retrieval:check
npm run knowledge:search -- --query "Graphify retrieval readiness"
```

To record a public-safe ROI event:

```bash
npm run knowledge:search -- \
  --query "Graphify retrieval readiness" \
  --actor codex \
  --write-event \
  --cited-answer
```

Raw query text is not stored in the public-safe event log by default. Add
`--public-safe-query-confirmed` only when the query itself is deliberately safe
to publish.

## Current status

At the time this guide was added:

- Graphify-compatible fallback graph: built;
- graph nodes: 20;
- graph edges: 80;
- unresolved links: 0;
- retrieval pilot: healthy;
- retrieval entries: 21;
- search/citation/reuse events: 1 / 1 / 1;
- remaining LLM-Wiki blocker: no replacement-ready life domain yet.
