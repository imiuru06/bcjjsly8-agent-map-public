# Agent Knowledge Management

This repo uses an Obsidian-style vault in `knowledge/` to make agent rules,
roles, protocols, runbooks, and decision knowledge searchable and reusable.

The vault does **not** replace canonical source documents such as `AGENTS.md`,
`docs/CHANNELS.md`, `docs/AUTONOMOUS_ISSUE_WORK_LOOP.md`, or
`config/agent-role-management.json`. Instead, each atomic note points back to a
source document through frontmatter and links.

## Why this exists

Before this vault, important knowledge was split across long policy documents,
runtime configs, issue comments, and chat context. That made it easy for a new
or returning agent to miss:

- the current role boundary;
- which channel to use;
- when a user decision is required;
- how to assign another session agent;
- which source document should win if two instructions conflict.

The vault turns those concerns into small notes that can be searched, linked,
and validated.

## Structure

- `knowledge/00-maps/` — high-level maps of content.
- `knowledge/10-principles/` — durable operating principles.
- `knowledge/20-roles/` — role cards for agent families.
- `knowledge/30-protocols/` — communication and work protocols.
- `knowledge/40-runbooks/` — step-by-step operating runbooks.
- `knowledge/50-decisions/` — human decision and approval knowledge.
- `knowledge/90-indexes/` — lookup indexes for agents.

Each note is a Markdown file with YAML frontmatter. It can be opened directly in
Obsidian and uses `[[wikilinks]]` for navigation.

## Atomic note rule

One note should contain one reusable claim or operating action. If a note starts
mixing unrelated concepts, split it.

Good atomic note examples:

- `source-of-truth`
- `human-gates`
- `assign-session-agent-work`
- `agent-routing`

Bad note examples:

- "all agent rules"
- "everything about GitHub"
- "random operations notes"

## LLM-Wiki sustainability gates

The vault should follow the LLM-Wiki caution: most personal knowledge systems
fail because input friction is higher than search value. The solution is not to
immediately add heavy infrastructure. RAG, MCP note-writing agents, local vector
databases, and embedding pipelines are useful only after capture and lookup
habits prove their value.

Before adding heavy knowledge infrastructure, check:

1. Is there at least six months of notes or an equivalent corpus?
2. Are notes searched at least three times per day?
3. Is the knowledge context-dependent enough to benefit from retrieval?
4. Is capture already low-friction?
5. Does retrieval change decisions or prevent repeated work?

If not, prioritize `[[zero-friction-capture]]` and
`[[weekly-knowledge-synthesis]]` over RAG/MCP/vector DB work.

## Graphify derived graph layer

Graphify may be used as a derived knowledge graph/index layer for this repo.
It must not become the source of truth.

Official project:

- Repo: <https://github.com/safishamsi/graphify>
- Official package: `graphifyy`
- CLI/skill command: `graphify`

Expected outputs, when built:

- `graphify-out/GRAPH_REPORT.md` — agent-readable graph summary;
- `graphify-out/graph.json` — machine-readable graph;
- `graphify-out/graph.html` — browser graph view.

Use it for:

- architecture and knowledge orientation before broad search;
- detecting isolated notes, duplicate concepts, and surprising connections;
- feeding `graphify-out/graph.json` into Agent Map / Life Graph as a derived
  index;
- improving `life:loop:information` reuse metrics.

Do **not** use it for:

- raw private exports;
- secrets, API keys, `local env file*`, tokens;
- raw finance values;
- raw private messages from any chat, mail, or personal data source;
- replacing `knowledge/`, docs, or config source files.

Safe commands:

```bash
npm run knowledge:graphify:check
npm run knowledge:graphify
npm run knowledge:retrieval
npm run knowledge:search -- --query "Graphify retrieval readiness"
```

`npm run knowledge:graphify:check` validates the safe corpus boundary and the
presence/shape of generated Graphify-compatible outputs.

`npm run knowledge:graphify` builds a deterministic public-safe fallback graph
from `knowledge/` and selected public-safe runtime contracts. It writes:

- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.json`
- `graphify-out/graph.html`

If the official Graphify CLI is installed and the operator explicitly sets
`ALLOW_GRAPHIFY_RUN=1`, the wrapper may also run optional official maintenance
checks. The deterministic fallback remains the build-safe baseline.

For richer official Graphify assistant analysis, review `.graphifyignore` and
then use:

```text
$graphify .
```

For non-Codex assistants the equivalent command is usually:

```text
/graphify .
```

Conflict rule: Graphify output is a generated/derived index. If it conflicts
with `AGENTS.md`, `docs/*`, `config/*.json`, or `knowledge/*`, the source file
wins.

For Obsidian viewing instructions, see `docs/OBSIDIAN_GRAPH_VIEW_GUIDE.md` and
the vault note `knowledge/00-maps/derived-graph-index.md`.

## Lookup flow for agents

Before work:

1. Read `knowledge/90-indexes/agent-lookup-index.md`.
2. If `graphify-out/GRAPH_REPORT.md` exists, read it before broad grep/search.
3. Follow the relevant role/protocol/runbook notes.
4. Open the canonical `source` file listed in note frontmatter when details or
   conflicts matter.
5. If the issue requires secrets, deploy, publish, destructive operations,
   payments, or final close, use `[[human-gates]]` and stop for approval.
6. If the issue proposes RAG, MCP, embeddings, or vector DB, use
   `[[llm-wiki-adoption-gates]]` to decide whether the system is ready.

## Validation

Run:

```bash
npm run knowledge:check
npm run knowledge:graphify:check
npm run knowledge:retrieval:check
```

The validator checks:

- required frontmatter;
- unique note ids;
- known note types and statuses;
- source files that exist;
- resolvable Obsidian `[[wikilinks]]`;
- required baseline notes from `config/knowledge-vault.json`.

`npm run policy:check` also references the knowledge vault so the control-plane
does not drift away from this knowledge system.

## Conflict rule

If a vault note conflicts with a source file, the source file wins:

1. `AGENTS.md`
2. `docs/*` protocol documents
3. `config/*.json` machine-readable contracts
4. `knowledge/*` atomic notes

After resolving the conflict, update the note and run `npm run knowledge:check`.
