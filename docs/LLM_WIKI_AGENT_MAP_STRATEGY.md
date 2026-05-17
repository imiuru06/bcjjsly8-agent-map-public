# LLM-Wiki Strategy for Agent Map

This document applies the LLM-Wiki lesson to Agent Map without discarding the
project's existing strengths.

## Position

Agent Map should not become a generic note app. Its strength is that it already
has:

- GitHub Issues / Project as the durable work queue and responsibility ledger;
- Registry/runtime events as the agent flow layer;
- static dashboards and runtime JSON as inspectable evidence;
- explicit human gates for secrets, publishing, payments, destructive actions,
  private raw data, and final close;
- Codex / 다알고 as the mainstream integration owner;
- life-process and infrastructure maps as operating context.

The LLM-Wiki layer should sit on top of those strengths.

## What the video changes

The video's main warning is that PKM systems fail when input friction is higher
than search value. For this repo that means:

1. Do not jump straight to vector DB, MCP note writing, or Graph RAG.
2. First prove capture, sanitization, visibility, reuse, and feedback loops.
3. Measure whether knowledge is actually searched, cited, and converted into
   actions.

## Target architecture

1. Capture
   - Kakao processed insights;
   - GitHub issues and comments;
   - session-agent result markers;
   - runtime health and infrastructure snapshots.

2. Sanitize and normalize
   - raw/private data stays out of public artifacts;
   - public-safe summaries carry provenance, timestamps, and source hashes;
   - private/local-only surfaces may exist separately.

3. Promote to knowledge
   - stable outputs become atomic Obsidian-style notes;
   - every generated note must cite its source artifact;
   - generated knowledge is derived, not source of truth.

4. Retrieve
   - start with Graphify as a derived graph/index layer;
   - add BGE-M3 + Qdrant only after search/reuse ROI is measured;
   - use hybrid keyword + vector retrieval for Korean notes.

5. Act
   - agents may run bounded, evidence-producing loops;
   - hard gates remain with the user unless delegated;
   - every action should produce verification and feedback.

6. Synthesize
   - weekly synthesis should connect new captures, recurring themes, knowledge
     gaps, and next actions.

## Current evaluation

Run:

```bash
npm run llmwiki:assess
npm run llmwiki:assess:check
```

Outputs:

- `runtime/llm-wiki-readiness.json`
- `public/llm-wiki-readiness.html`

Abnormal-state improvement artifacts:

```bash
npm run llmwiki:improve
npm run llmwiki:improve:check
```

Outputs:

- `runtime/capture-inbox.json` — normalized public-safe capture inbox;
- `runtime/capture-to-note-promotions.json` — candidate-only atomic note
  promotions;
- `runtime/weekly-knowledge-synthesis.json` — baseline synthesis artifact;
- `runtime/llm-wiki-search-roi.json` — search/reuse ROI baseline counters.

Graph/retrieval baseline:

```bash
npm run knowledge:graphify
npm run knowledge:retrieval
npm run knowledge:graphify:check
npm run knowledge:retrieval:check
npm run knowledge:search -- --query "Graphify retrieval readiness"
```

Outputs:

- `graphify-out/GRAPH_REPORT.md` — public-safe derived graph report;
- `graphify-out/graph.json` — Graphify-compatible fallback graph;
- `graphify-out/graph.html` — visual graph browser;
- `runtime/knowledge-retrieval-index.json` — static retrieval pilot index;
- `runtime/retrieval-service-health.json` — retrieval pilot health contract;
- `public/knowledge-retrieval.html` — public-safe retrieval evidence view.
- `runtime/knowledge-search-events.jsonl` — optional public-safe search/citation
  event log written by `npm run knowledge:search -- --write-event`. Raw query
  text is not stored by default; use `--public-safe-query-confirmed` only for
  deliberately public-safe demo queries.

This baseline removes the "nothing is built" failure mode without pretending a
full vector DB/RAG/MCP stack exists. Official Graphify can still be used later as
a richer derived layer, but the repo now has a deterministic build-safe graph.

The readiness score has a conservative global cap: when search/citation/reuse
events are below the minimum sample size or no life domain is replacement-ready,
the assessment cannot enter the top `ready_for_agentic_knowledge_os` band even
if supporting artifacts are present.

The assessment is intentionally conservative. A high Agent Map control-plane
score does not mean the user has achieved full life-agent replacement. RAG/MCP
readiness should be claimed only after search ROI, citations, and action
conversion are visible.

## Next implementation milestones

1. Unified capture inbox schema.
2. Knowledge ROI metrics:
   - search count;
   - cited answer count;
   - reused note count;
   - issue/action conversion count;
   - stale note reduction.
3. Graphify drift checks and official Graphify comparison.
4. Retrieval MVP with citations and real usage event logging.
5. Weekly synthesis scheduling and review loop.
6. Only then: local vector DB / MCP note writer pilot.
