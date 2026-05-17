# Target Personal Agent System Blueprint

Issue: #81

This document defines the target agent system that should emerge from the stabilized session-agent channel, Life Graph Agent Map, Infrastructure Visibility Map, and the user's long-term goal of building practical substitute/assistant agents for life processes.

## 1. Product thesis

The Agent Map should become the user's **life and operations control-plane**.

It is not just:

- a pretty graph;
- a static dashboard;
- a list of agents;
- a GitHub issue viewer;
- an infrastructure map.

It should answer, at any moment:

1. What parts of the user's life/work are modeled?
2. Which agents, services, repositories, workflows, and schedules are responsible?
3. What is current, stale, blocked, or unknown?
4. What evidence supports that state?
5. What can agents do autonomously?
6. What still requires the user's decision?
7. If one agent/session/service breaks, what fallback path keeps work moving?

## 2. North-star architecture

```text
User intent / life process
  └─ Mission / issue / decision
      └─ GitHub Issue + Project state
          ├─ Session agents via agent:queue
          ├─ Runtime/service agents via Registry events
          ├─ Project-specific repos via cross-repo links
          ├─ Schedules / health checks / provider collectors
          └─ Evidence-backed graph snapshots
              ├─ Life Graph main surface
              ├─ Infrastructure Visibility private/public ops surface
              └─ Agent collaboration / session health surface
```

Principle:

- **Life Graph** is the main service-facing surface.
- **Infrastructure Visibility** is the ops/private topology surface.
- **GitHub Issues/Projects** are the durable work queue and state ledger.
- **Registry events** are the runtime event bus.
- **Session agents** are work/review/coordination participants.
- **Service agents** are runtime components, not independent live sessions unless they leave session markers.
- **Codex / 다알고 and the user** remain the final responsibility pair for issue closing and strategic direction.

## 3. Current baseline

Confirmed in the repo:

- `docs/LIFE_GRAPH_FOUNDATION_REVIEW.md` already defines the Life Graph as the future decision and operations surface.
- `runtime/life-process-graph.json` already has first-pass sections for `metaProcess`, `tracks`, `lifeDomains`, `agents`, `pipelines`, and `relationships`.
- `docs/INFRA_VISIBILITY_PLATFORM_ARCHITECTURE.md` already defines public/private infrastructure visibility, credential redaction, resource state, and Worker/API direction.
- `runtime/infrastructure-map.json` already models public resource nodes, edges, checks, credential refs, and visibility.
- `docs/SESSION_AGENT_CONNECTIONS.md` and `config/session-agents.json` define current session-agent identities and fallback behavior.
- `docs/AGENT_ROLE_MANAGEMENT.md` and `config/agent-role-management.json` define role lanes, assignment, handoff, optimization, and fallback rules for the connected agent system.
- `agent:queue` is now REST-first and can continue in `rest-fallback` mode when GitHub Project v2 / GraphQL is unavailable.

Current confirmed session agents:

- `daalgo`: active user-facing coordinator.
- `daalgo_external_codex_01`: confirmed external Codex watcher.
- `claude_review_01`: confirmed review-only external session.

Current role pools that still need live session status:

- `gemini`: UX/business critique.
- `opencode`: architecture/performance review.
- `stitch`: UI design/prototype support.
- `uiux_cli`: implementation-facing UI/UX CLI review for usability, accessibility, responsive/mobile behavior, IA, copy clarity, and interaction flow.

## 4. Target surfaces

### 4.1 Life Graph — main surface

The Life Graph is the public/product-facing entry point.

It should show:

- life domains;
- active workflows;
- substitute/assistant agents;
- missions/issues/decisions;
- current status and stale state;
- ownership;
- next action;
- evidence links;
- relationship and dependency graph.

It should not expose:

- private raw messages;
- raw personal data;
- secrets;
- credential values;
- private topology details;
- unredacted provider/account identifiers.

### 4.2 Infrastructure Visibility — ops/private surface

The Infrastructure Map should answer:

- what databases/storage exist;
- what is in-memory/local/cloud/external;
- which APIs/providers are connected;
- whether credentials are present, without exposing values;
- which routers/hubs/registries/search engines are active;
- what health state and last check time each resource has;
- which services are public, private, restricted, or internal.

The public map should remain sanitized.

Private ops should eventually require an authenticated API/read model.

### 4.3 Agent Collaboration surface

This surface may be part of Life Graph or an ops panel.

It should show:

- confirmed session agents;
- role pools;
- last heartbeat/status/result/blocker;
- active/stale claims;
- queue mode (`read-only` vs `rest-fallback`);
- schedule cadence and next expected check;
- fallback path.

## 5. Canonical graph model

### 5.1 Node types

Required durable node types:

- `lifeDomain`
- `goal`
- `workflow`
- `process`
- `agent`
- `sessionAgent`
- `serviceAgent`
- `issue`
- `decision`
- `schedule`
- `integration`
- `resource`
- `credentialRef`
- `projectRepo`
- `runtimeEvent`
- `evidence`
- `artifact`
- `healthCheck`
- `deployment`

### 5.2 Edge types

Required durable edge types:

- `owns`
- `supports`
- `delegates_to`
- `routes_to`
- `depends_on`
- `blocked_by`
- `requires_decision`
- `produces`
- `verifies`
- `updates`
- `belongs_to`
- `implemented_by`
- `evidenced_by`
- `deployed_to`
- `uses_credential`
- `observed_by`
- `fallback_to`

### 5.3 Status contract

Important nodes should converge on:

```json
{
  "status": "active|planned|blocked|review|done|stale|unknown",
  "source": "github|registry|schedule|provider|manual|external",
  "visibility": "public|private|restricted|internal",
  "owner": "user|codex|agent:<id>|service:<id>",
  "sourceIssue": 81,
  "sourcePr": null,
  "sourceRepo": "owner/repo",
  "lastVerifiedAt": "ISO-8601",
  "nextAction": "short operational next step",
  "decisionRequired": false,
  "evidence": []
}
```

## 6. Substitute agent model

The system should not pretend to replace the user.

It should create bounded substitute/assistant agents that can:

- observe a domain;
- summarize current state;
- detect drift/staleness;
- propose next action;
- execute low-risk allowed tasks;
- escalate high-risk decisions;
- leave durable evidence.

### 6.1 Core substitute agents

Recommended first-class substitute agents:

1. `self_decision_guardian`
   - protects final user intent and decision boundaries;
   - tracks approvals, delegated close authority, and unresolved decisions.

2. `life_ops_steward`
   - tracks health, time, logistics, relationships, and daily operational loops at a redacted metadata level.

3. `knowledge_curator`
   - organizes notes, insights, inbox summaries, evidence, and knowledge graph updates.

4. `money_business_operator`
   - tracks finance/business workflows and escalates anything involving money movement, billing, or irreversible external action.

5. `content_studio_operator`
   - coordinates trend analysis, script/storyboard/video generation, validation, and upload/publish proposal gates.

6. `infra_ops_steward`
   - tracks DB/storage/providers/router/hub/search/credentials/health/deployment state.

7. `agent_ops_coordinator`
   - tracks session agents, service agents, queues, claims, stale work, and fallback routing.

### 6.2 Authority boundaries

Default authority:

- read;
- summarize;
- classify;
- create issues/proposals;
- run checks;
- draft artifacts;
- request review;
- propose next action.

Requires explicit approval:

- close final issues;
- merge;
- deploy;
- publish/upload;
- read or expose secrets;
- perform destructive data operations;
- make payments or billing changes;
- send messages externally as the user;
- alter private personal records irreversibly.

## 7. Data and evidence flow

### 7.1 Source inputs

- GitHub Issues, PRs, labels, comments, Project status.
- Registry `/agents` and event stream.
- `config/session-agents.json`.
- Cokacdir schedule list.
- Runtime JSON snapshots.
- Provider collectors such as GitHub, Cloudflare, n8n, Notion, Telegram, local pipelines.
- Project-specific repos linked through `projectRepo`.

### 7.2 Derived snapshots

The system should generate:

- `runtime/life-process-graph.json`
- `runtime/infrastructure-map.json`
- `runtime/session-agent-health.json`
- `runtime/decision-queue.json`
- `config/substitute-agent-domains.json`
- future `runtime/evidence-index.json`

### 7.3 Public/private split

Public snapshots may include:

- sanitized graph categories;
- issue/PR links;
- high-level resource categories;
- redacted status;
- public deployment URLs.

Private snapshots may include:

- exact internal topology;
- credentialRef presence;
- private schedules;
- provider account/resource IDs;
- private health detail.

Private snapshots must not be copied into public builds.

## 8. Implementation roadmap

Throughput policy:

- The build-out should follow `config/agent-throughput.json`.
- The goal is fastest safe progress, not unbounded parallelism.
- P1 implementation can accelerate only when GitHub quota, local runtime load, and privacy/safety signals are healthy.
- Degraded mode should still produce route/digest/status/blocker progress.
- Pause mode is reserved for REST issue access failure, repo update failure, or privacy/safety incident.

### Phase 0 — Control-plane stabilization

Status: mostly complete.

- Session identities are in `config/session-agents.json`.
- `agent:queue` has REST fallback.
- Issue #81 routes review to session/role agents.

### Phase 1 — Unified graph contract

Goal: make Life Graph the single product-facing map.

Work:

- Extend `runtime/life-process-graph.json` with source/evidence/owner/nextAction/status fields.
- Add issue/decision/schedule/sessionAgent nodes.
- Add `fallback_to`, `requires_decision`, `evidenced_by`, and `observed_by` edges.
- Add a generated `currentness` layer from issues, session agents, schedules, and Registry.
- Ensure public output is sanitized.

### Phase 2 — Agent collaboration and decision queue

Goal: reduce user bottlenecks while preserving approval boundaries.

Status: first runtime snapshot implemented.

Work:

- Generate action/decision queue nodes from GitHub and Registry.
- Show which agent owns each item.
- Show whether the user must decide, Codex can proceed, or an external agent is expected.
- Add stale claim and missing heartbeat states.

### Phase 3 — Infrastructure/private ops backend

Goal: make infra topology accurate and manageable.

Work:

- Keep public static map sanitized.
- Add private read model proposal for Cloudflare Worker API.
- Add collectors for provider/resource/credential presence.
- Add health history and snapshot IDs.
- Keep mutation actions gated.

### Phase 4 — Substitute agent domain loops

Goal: make assistant agents operate life/work domains safely.

Status: first domain authority contract implemented.

Work:

- Define one issue template per substitute-agent domain.
- Add autonomy tiers per domain.
- Add allowed/blocked action contracts.
- Add domain-specific evidence requirements.
- Add recurring status reports into Life Graph.

### Phase 5 — Graph DB readiness

Goal: prepare for richer querying without premature infrastructure.

Work:

- Keep JSON as canonical contract.
- Add stable IDs and edge taxonomy.
- Add export adapters for D1/Postgres/Neo4j later.
- Introduce graph DB only when queries justify it.

## 9. Review gates

Before implementation beyond Phase 1:

- Safety/privacy review must confirm public/private split and approval gates.
- Architecture review must confirm source-of-truth and data freshness strategy.
- UX/business review must confirm the map reduces user bottlenecks.
- UI/prototype review must confirm grouping, hierarchy, and graph modes support the product thesis.
- UI/UX CLI review must confirm the implemented screen is usable, accessible, responsive, and clear enough before treating the UX as complete.

## 10. Immediate next implementation slices

Recommended follow-up issues:

1. `life-graph-currentness-contract`
   - generate issue/decision/session/schedule currentness into Life Graph.
   - first pass: `runtime/life-process-graph.json` now references session health, decision queue, substitute-agent domains, and throughput policy snapshots.

2. `session-agent-health-snapshot`
   - generate `runtime/session-agent-health.json` from issue comments and `config/session-agents.json`.
   - first pass: public-safe `runtime/session-agent-health.json` tracks confirmed sessions, role pools, stale claims, queue mode, and fallback path.

3. `decision-action-queue-panel`
   - add a visible panel for needs human / needs agent / stale / blocked / next actions.
   - first pass: `runtime/decision-queue.json` is loaded by the Life Graph frontend as the Decision Queue source.

4. `infra-private-ops-read-model`
   - design private Worker/API read model while preserving public redaction.
   - first pass: `npm run agent:system:check` validates that public snapshots do not contain raw session messages, secrets, or executed decisions.

5. `substitute-agent-domain-contracts`
   - define domain contracts for self, life ops, knowledge, money/business, content, infra, and agent ops.
   - first pass: `config/substitute-agent-domains.json` defines the seven bounded substitute-agent domains, approval requirements, and fallback owners.

## 11. Definition of done for the target system

The target system is working when:

- the user can open the Agent Map and understand what is current, blocked, stale, and actionable;
- each important node has owner, status, evidence, and next action;
- session agents can continue from GitHub Issues without relying on Telegram messages;
- service agents report runtime state into Registry or snapshots;
- infrastructure/resource/credential presence is visible without exposing secrets;
- substitute agents can safely operate bounded domains;
- final decisions and issue closes still go through the user + Codex / 다알고 responsibility path.

## 12. Review incorporation notes

CLI reviewers were asked to review #81 from safety/privacy, UX/business, architecture/runtime, and UI/prototype viewpoints. The following requirements are incorporated from those reviews.

### 12.1 Public/private split is a release gate

Every node, edge, event, and artifact must carry or inherit:

```json
{
  "visibility": "public|private|restricted|internal",
  "redactionLevel": "public_safe|metadata_only|private_summary|raw_private_forbidden"
}
```

Public artifacts must be produced from an explicit redacted projection. Do not rely only on frontend filtering.

Never serialize these into public runtime JSON, public HTML, comments, logs, or build artifacts:

- raw secrets or tokens;
- token length, prefixes, suffixes, or partial key material;
- raw env values;
- DSNs and connection strings;
- webhook URLs;
- raw provider error payloads;
- raw request headers;
- raw Telegram/private messages;
- raw health, finance, relationship, or personal-note details;
- internal endpoint paths;
- sensitive topology that would reveal attack paths.

Before public deploy, run artifact checks against:

- `runtime/*.json`
- `dist/`
- public HTML
- generated static assets

If a possible privacy leak is detected:

1. stop deploy/publication;
2. identify artifact/version;
3. purge public cache if already deployed;
4. rotate affected credentials if needed;
5. open a `kind:incident` issue;
6. record remediation evidence;
7. re-run public/private projection checks.

### 12.2 Decision Queue is a first-class product object

The user should not have to read GitHub, Registry events, and Telegram commands separately.

The product should expose one Decision Queue:

```text
decision source
  ├─ GitHub issue labels: needs:human, decision:*, gate:*
  ├─ Registry proposal / proposal.response
  ├─ workloop decisionQueue
  ├─ blocked session-agent comments
  └─ schedule/health incidents that require user approval
```

Each decision item must show:

- title;
- domain;
- owner;
- requested decision;
- options;
- default safe action;
- deadline or stale age;
- affected nodes/edges;
- evidence links;
- approval marker required.

### 12.3 Separate graph contracts, compose in UI

Do not force all concepts into one overloaded graph contract.

Maintain separate versioned contracts:

1. `life-process-graph`
   - user domains;
   - goals;
   - missions;
   - substitute agents;
   - decisions;
   - action queue.

2. `infrastructure-map`
   - services;
   - repos;
   - deployments;
   - providers;
   - resources;
   - credentials;
   - health checks.

3. future `agent-ops-graph`
   - session agents;
   - role pools;
   - queues;
   - claims;
   - heartbeats;
   - blockers;
   - fallback paths.

The UI may compose these, but each contract should remain separately validated and versioned.

### 12.4 Runtime state machines

Session agent state:

```text
unknown
  -> available
  -> claimed
  -> working
  -> result
  -> available

working
  -> blocked
  -> available

claimed|working
  -> stale
  -> reclaimed
```

Issue work item state:

```text
inbox
  -> routed
  -> claimed
  -> in_progress
  -> review
  -> result
  -> done

any
  -> needs_human
  -> blocked
  -> stale
```

Resource health state:

```text
unknown
  -> not_configured
  -> connected
  -> healthy
  -> degraded
  -> unhealthy
  -> stale
```

Unknown, stale, disconnected, and not_configured must never be displayed as healthy.

### 12.5 Idempotency and claim rules

All autonomous comments/events should have an idempotency key.

GraphQL degraded mode must use the explicit warning code `github_project_graphql_unavailable`. This means GitHub Project metadata is degraded, not that the issue queue or agent connection is unavailable.

Recommended key shape:

```text
scope:type:target:issue:number:contentHash[:window]
```

Apply to:

- route request;
- claim;
- heartbeat;
- status report;
- result;
- blocker;
- decision digest;
- fallback notice.

Claim policy:

- default claim TTL: `120` minutes;
- P1 incident TTL may be shorter;
- an agent should not hold multiple active implementation claims unless explicitly allowed;
- stale takeover requires a comment that references the stale claim and reason;
- missing safety/quality review must not silently expand Codex authority.

### 12.6 Event envelope contract

Runtime/audit events should converge on:

```json
{
  "eventId": "stable unique id",
  "eventType": "agent.request|agent.result|decision.required|health.changed",
  "agentId": "agent:<id>",
  "issueNumber": 81,
  "correlationId": "mission or workflow id",
  "idempotencyKey": "scope:type:target:issue:number:hash",
  "createdAt": "ISO-8601",
  "status": "ok|blocked|failed|degraded",
  "visibility": "public|private|restricted|internal",
  "redactionLevel": "public_safe|metadata_only|private_summary"
}
```

Snapshots are for UI; events are for audit and history.

### 12.7 User-readable delegation matrix

Initial delegation matrix:

```text
Self / Decision
  agent: self_decision_guardian
  can read: decision metadata, approvals, issue state
  can draft: decision summaries, approval requests
  can act: no irreversible action
  approval required: all final decisions, close, delegation expansion
  fallback owner: Codex / 다알고 + user

Life Operations
  agent: life_ops_steward
  can read: sanitized schedule/status metadata
  can draft: routines, reminders, summaries
  can act: create proposal/issue only
  approval required: external messages, purchases, commitments, private data changes
  fallback owner: Codex / 다알고

Knowledge / Information
  agent: knowledge_curator
  can read: sanitized notes/evidence metadata
  can draft: summaries, tags, graph links
  can act: update generated artifacts after validation
  approval required: deleting/private publishing/raw data exposure
  fallback owner: Codex / 다알고

Money / Business
  agent: money_business_operator
  can read: redacted account/workflow metadata
  can draft: anomaly reports, proposals, checklists
  can act: no money movement
  approval required: transactions, billing, contracts, public commitments
  fallback owner: user

Content / Publishing
  agent: content_studio_operator
  can read: public trend/content metadata
  can draft: plans, scripts, storyboards, validation reports
  can act: local no-upload package generation and publish-gate verification
  approval required: upload, publish, external posting, copyright/legal risk acceptance
  verified scoped replacement: content_trend_to_video_no_upload_dry_run
  fallback owner: Codex / 다알고 + user

Agent Ops
  agent: agent_ops_coordinator
  can read: issue queues, session markers, registry status
  can draft: routing, status summaries, blocker reports
  can act: safe labels/comments/diagnostics within policy
  approval required: close, merge, deploy, secrets, destructive actions
  fallback owner: Codex / 다알고

Infrastructure Ops
  agent: infra_ops_steward
  can read: public/private resource metadata by view permission
  can draft: topology, health, credential-presence reports
  can act: read-only checks
  approval required: cloud resource mutation, secret rotation, deploy, public topology release
  fallback owner: Codex / 다알고 + user
```

Visualization edges such as `owns`, `supports`, or `routes_to` do not imply permission to mutate. Permission must come from `allowedActions` and `requiresApprovalFor`.

### 12.8 UX and UI direction

Top-level product hierarchy:

1. Decision Queue
2. Life Graph
3. Agent status / delegation
4. Infra health summary
5. Evidence/detail drawer

Separate **what to view** from **how to lay it out**.

View modes:

- `Life`
- `Decision`
- `Agent`
- `Infra Summary`

Layout modes:

- `Force`
- `Domain Cluster`
- `Process Flow`
- `Pipeline Trace`
- `Phase Lane`

Visual IA should be category-first:

- Self / Decision
- Life Operations
- Knowledge / Information
- Money / Business
- Content / Publishing
- Agent Ops

Node cards should stay short:

- owner;
- status;
- next action;
- evidence count/link.

Long IDs, issue labels, credential refs, and detailed evidence belong in a detail drawer.

### 12.9 Stitch/design handoff units

Do not give Stitch one giant vague prompt. Split design requests into:

1. hero + status summary;
2. Life Graph canvas;
3. group/lens cards;
4. Decision Queue panel;
5. node detail drawer;
6. Infra summary strip;
7. theme token sheet.

Design direction:

- public-safe product dashboard;
- bright/light theme by default;
- no dark hacker/admin aesthetic for the user-facing Life Graph;
- graph grouping must communicate life purpose before technical node type;
- Infra Map can keep a more operational/private style.

### 12.10 Metrics

Track whether the system reduces user bottlenecks:

- number of issues the user must manually read;
- approval waiting time;
- auto-routing success rate;
- stale domain detections;
- stale claim recovery time;
- percentage of nodes with owner/status/evidence/nextAction;
- number of proposals brought to a ready decision by agents;
- number of GraphQL/API degraded cycles that still succeeded through fallback.

### 12.11 Retention and deletion policy

The system needs a user-controlled retention policy.

Initial recommendation:

- public snapshots: keep through Git history and deployed artifacts;
- private snapshots: short retention until an authenticated private store exists;
- registry events: retain only metadata needed for audit/currentness;
- raw private inputs: do not ingest into graph evidence by default;
- incident/private data purge: create an issue, remove artifact, purge cache, rotate if needed, record remediation.

### 12.12 Cross-repo boundary

For project-specific repos:

- `bcjjsly8` remains the collaboration/control-plane;
- implementation authority belongs to the project repo only when explicitly linked;
- every cross-repo node should include `projectRepo`, source issue/PR, branch, and authority boundary;
- control-plane approval in `bcjjsly8` does not automatically grant production authority in the target repo.
## REPLACEMENT_FIRST_ENFORCEMENT

The target personal agent system is not a collection of pages. It is a set of
replacement loops that reduce manual work in real life domains. Therefore,
future implementation must prefer:

1. real/current input integration;
2. autonomous analysis;
3. safe action policy;
4. bounded execution;
5. verification;
6. monitoring/fallback;
7. learning feedback;
8. explicit human gates for high-risk actions.

Any page-only expansion that does not support one of these loop steps should be
merged into an existing surface or deprecated.

The current implementation baseline must include at least three verified scoped
replacement units before new page work is accepted:

- processed Kakao aggregate information triage;
- external public technology/economy signal triage;
- content trend-to-video no-upload package generation and gate verification.
