# Life Graph Foundation Review

Issue: #20

## Conclusion

The user feedback is correct.

PR #21 improved the surface presentation of the Life Graph, but the foundational question was not yet fully answered:

> What should the Agent Map let the user understand, decide, and operate?

The Life Graph must not be only a pretty graph. It should become a service-facing operating map that connects life domains, agents, workflows, issues, decisions, evidence, and current status.

## What the Life Graph should answer

The main Agent Map should answer these questions at a glance:

1. **What areas of life/work are currently modeled?**
   - domains
   - tracks
   - workflows
   - active/planned scope

2. **What is actually current right now?**
   - GitHub Issue / Project status
   - Registry runtime status
   - schedules
   - recent events
   - last verified timestamp

3. **Who or what owns each part?**
   - user decision owner
   - Codex/mainstream owner
   - supporting agent
   - external/project repo owner

4. **What relationships matter?**
   - owns
   - depends on
   - produces
   - verifies
   - blocked by
   - requires decision
   - routes to

5. **What needs action?**
   - next action
   - needs human
   - needs agent
   - review
   - done
   - stale/unknown

6. **What is the evidence?**
   - source issue
   - source PR
   - source schedule
   - source registry event
   - source repo/workspace

## Current state audit

The current runtime file is a useful first-pass restoration:

```text
runtime/life-process-graph.json
```

But it is still mostly a static snapshot.

Observed gaps:

- `meta.status` is `restored-first-pass`, not a live/currentness indicator.
- Domain statuses such as `planned`, `active`, and `designing` are manually assigned.
- Agent statuses are not derived from GitHub issues, Project fields, Registry heartbeat, or schedule state.
- Pipelines are conceptual and do not show whether a run exists, when it last ran, or whether it produced output.
- Relationships are too few and broad; most graph edges are generated from domain-agent membership rather than meaningful operational semantics.
- The graph includes `trend-to-video`, but its real implementation state lives in GitHub issues/PRs and is not linked as evidence.
- Open review items such as #8, #9, #14, and #20 are not represented as actionable nodes.
- Mission items such as #1, #3, #4, and #12 are not represented as active work nodes.
- Closed items such as #18 affect the graph, but the graph does not show the source issue/PR that made the change.
- `visualGroups` are helpful for readability, but they are not yet a domain taxonomy backed by source data.

## Model gap

The page currently looks like a graph DB-style map, but it is not yet operating as a graph model.

The missing layer is a canonical node/edge taxonomy.

### Required node types

- `domain`
- `agent`
- `workflow`
- `pipeline`
- `issue`
- `decision`
- `evidence`
- `schedule`
- `integration`
- `projectRepo`
- `runtimeEvent`

### Required edge types

- `owns`
- `supports`
- `depends_on`
- `blocked_by`
- `requires_decision`
- `routes_to`
- `produces`
- `verifies`
- `updates`
- `belongs_to`
- `implemented_by`
- `evidenced_by`

### Required status semantics

Each important node should eventually carry:

```json
{
  "status": "active | planned | blocked | review | done | stale | unknown",
  "source": "github | registry | schedule | manual | external",
  "sourceIssue": 20,
  "sourcePr": 21,
  "owner": "user | codex | agent:<name>",
  "nextAction": "...",
  "lastVerifiedAt": "ISO-8601 timestamp"
}
```

## Category model correction

The current categories are a visual convenience, not yet a durable information architecture.

The durable category model should be based on the user's operating intent:

1. **Self / Decision**
   - final judgment
   - approvals
   - delegation
   - personal priorities

2. **Life Operations**
   - health
   - time
   - relationships
   - logistics
   - reflection

3. **Knowledge / Information**
   - inbox
   - notes
   - summaries
   - knowledge graph
   - evidence

4. **Money / Business**
   - personal finance
   - stock automation
   - new services
   - business operations

5. **Content / Publishing**
   - trend detection
   - video planning
   - legal validation
   - upload/publish proposal

6. **Agent Ops**
   - GitHub issue queue
   - Registry events
   - schedules
   - deployment
   - observability

## Product requirement

The Life Graph should become a decision and operations surface.

It should show:

- where the user is waiting;
- where Codex is responsible;
- where another agent is responsible;
- where a workflow is only conceptual;
- where data is stale;
- where a PR or issue changed the map;
- where the next user decision is needed.

## Recommended implementation sequence

### Phase 1 — Foundation before visual polish

- Add source/evidence fields to runtime nodes.
- Add issue/project nodes for active Mission, Review, Needs Human, and Needs Agent items.
- Add `lastVerifiedAt` and `source` fields.
- Add edge taxonomy and stop relying only on generated membership links.
- Render "needs action" and "stale/unknown" states in the main graph.

### Phase 2 — Service UI

- Keep theme/category improvements from PR #21 only after the model layer is corrected.
- Make each visual group answer an operational question.
- Add an "Action Queue" or "Decision Queue" panel.
- Add filters by status, owner, source, and domain.

### Phase 3 — Graph DB readiness

- Keep JSON-first for now.
- Treat JSON as the graph contract.
- Later map the contract to Neo4j/D1/RDF only if query needs justify it.

## Status of PR #21

PR #21 should be treated as a visual draft, not the final solution.

It is still useful because it adds:

- theme tokens;
- visual group rendering;
- category focus controls;
- label overflow handling;
- a Stitch prompt.

But it must be paired with this foundation review before it should be merged as the final Life Graph improvement.

## First foundation implementation in PR #21

After the scope correction, PR #21 adds the first runtime-backed foundation layer:

- `currentness`
  - source repo/project
  - last verified timestamp
  - open/closed/review/needs-human/needs-agent counts
- `nodeTypes` and `edgeTypes`
  - explicit graph contract vocabulary
- `actionNodes`
  - selected GitHub Issue/Project items that represent current missions, reviews, and decisions
  - source issue URLs
  - project status
  - labels
  - owner
  - next action
- `actionLinks`
  - evidence/action edges from issue nodes to agents or the Life Graph core
- UI Action / Decision Queue panel
  - makes the graph show what needs operational attention, not only conceptual domains

This is still a snapshot, not live sync. The next implementation should generate `actionNodes` and `currentness` from GitHub/Registry sources before build.

## Repeatable sync

PR #21 now includes an optional sync helper:

```bash
npm run life:sync
npm run life:sync -- --write
```

Default mode prints the generated `currentness`, `actionNodes`, and `actionLinks` without changing files.

`--write` updates:

```text
runtime/life-process-graph.json
```

The script currently reads GitHub Project items through `gh project item-list`. A later pass should add Registry event and schedule sources to the same generated layer.
