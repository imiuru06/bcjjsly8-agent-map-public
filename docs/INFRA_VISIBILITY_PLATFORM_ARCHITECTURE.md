# Infrastructure Visibility Platform Architecture

Issue: `#36`

## 1. Purpose

Infrastructure Visibility는 예쁜 대시보드가 아니라 Agent Map을 서비스 운영 control-plane으로 키우기 위한 별도 제품 영역이다.

사용자가 말한 기준은 다음을 한 화면에서 파악하고 관리하는 것이다.

- DB가 in-memory인지, local file/SQLite인지, cloud DB인지
- Cloudflare, Vercel, Render, GitHub, Notion, Telegram, n8n 같은 cloud/external resource가 무엇인지
- 실제 연결 상태가 `connected`, `disconnected`, `unknown`, `stale`, `not_configured` 중 무엇인지
- router, hub, registry, event bus가 있는지
- search engine, index, crawler가 있는지
- API key, env var, credentialRef가 등록되어 있는지
- service, agent, workflow, repo, issue, PR, deployment, healthCheck가 어떤 관계인지
- public에 보여도 되는 구조와 private ops에서만 보여야 하는 구조가 분리되는지

## 2. Current implementation assessment

### Frontend today

현재 frontend는 Cloudflare Pages에 배포되는 static HTML/CSS/vanilla JS와 runtime JSON fetch로 구성되어 있다.

장점:

- 배포가 단순하다.
- GitHub PR diff로 변경을 검토하기 쉽다.
- public read-only map에 적합하다.
- Cloudflare Pages와 잘 맞는다.

한계:

- graph mode, filter, detail panel, private ops view가 늘어나면 상태 관리가 복잡해진다.
- service/resource/workflow/credentialRef/health 상태를 컴포넌트 단위로 재사용하기 어렵다.
- auth가 없다.
- public/private view 분리가 없다.
- live inventory나 SSE/streaming update를 붙이기 어렵다.

### Backend today

현재 backend는 단일 서비스라기보다 다음 조각들의 묶음이다.

- GitHub Issues/PR
- Node scripts
- local Registry
- scheduled cokacdir tasks
- static runtime JSON
- Cloudflare Pages build

장점:

- Git 중심 source-of-truth가 명확하다.
- 운영 이력이 issue/PR에 남는다.
- 작은 MVP에는 비용과 복잡도가 낮다.

한계:

- live resource inventory가 없다.
- cloud provider/n8n/GitHub/env/credentialRef를 지속 수집하는 API layer가 없다.
- health state history가 없다.
- secret presence check를 public build에서 안전하게 수행할 수 없다.
- private ops API가 없다.

## 3. Target architecture

### Recommended shape

```text
Cloudflare Pages
  └─ React/Vite SPA or current static HTML during MVP

Cloudflare Worker API
  ├─ /api/infrastructure-map
  ├─ /api/resources
  ├─ /api/health
  ├─ /api/credentials/status
  ├─ /api/search
  └─ /api/snapshots

Collectors
  ├─ GitHub collector
  ├─ Cloudflare collector
  ├─ n8n inventory collector
  ├─ deployment provider collector
  ├─ Kakao Insight pipeline collector
  ├─ credentialRef scanner
  └─ health checker

Storage
  ├─ runtime/infrastructure-map.json as Git snapshot
  ├─ D1 or Postgres for current state/history
  └─ R2 or Git artifacts for archived snapshots
```

## 4. Frontend recommendation

### Phase 0: keep static

Use current static HTML while the schema is unstable.

Good for:

- public read-only architecture map
- schema iteration
- PR review
- Cloudflare Pages preview

### Phase 1: componentize

Move Infrastructure Visibility UI to `Vite + React + TypeScript` when at least two of these become true.

- More than 5 resource node types need custom detail cards.
- Filter/search state becomes complex.
- Private ops view is introduced.
- Graph interactions need selection, grouping, diff, and status overlays.
- Multiple views need shared components.

Recommended graph choices:

- SVG/D3 for full custom visual grammar
- React Flow for workflow/topology interaction
- Cytoscape.js for larger graph exploration

Do not introduce a heavy framework only for the first static snapshot.

## 5. Backend recommendation

### Phase 0: Git snapshot backend

For the first pass, `runtime/infrastructure-map.json` is the contract.

Pros:

- easy PR review
- deterministic build
- simple Cloudflare Pages deployment

Cons:

- stale by default
- no private secret presence check
- no real-time state history

### Phase 1: Cloudflare Worker API

Add Worker API when resource state must be queried dynamically.

Use Worker for:

- serving private ops data
- checking credentialRef presence without exposing values
- reading D1/Postgres snapshots
- gating public/private fields
- exposing latest health state

### Phase 2: storage

Start with D1 if the state model is mostly nodes, edges, health snapshots, and small event history.

Use Postgres/Supabase if:

- history grows quickly
- full-text search matters
- semantic search or pgvector is needed
- complex queries become important

Do not start with Neo4j/graph DB. A graph database can come later after the schema stabilizes and query needs justify it.

## 6. Public/private split

Infrastructure topology itself can be sensitive. Therefore every node and edge must have a visibility level.

Security review conclusion: Public/private split is not a UI preference; it is a release gate.

Allowed public view:

- high-level service/resource categories
- sanitized health summary
- public deployment URLs
- public repo/issue/PR links
- public architecture groups

Private ops only:

- exact internal service names when sensitive
- internal endpoint paths
- env var presence
- credentialRef mappings
- failed auth/check details
- provider account/resource IDs
- deployment secrets/config names when sensitive
- runbook actions that mutate production

Never show:

- API key values
- tokens
- secrets
- raw env values
- key prefix/suffix
- token length
- connection strings
- raw provider error payloads
- request headers
- raw private chat/message data

Recommended API split:

- `/api/public-map`: redacted, cacheable, no credentials, no internal topology detail
- `/api/private-map`: authenticated, audited, `Cache-Control: no-store`

The frontend must not consume the database schema directly. Worker/API should provide separate read models:

- `publicView`
- `privateOpsView`

Schema-level redaction must happen before serialization so private fields cannot leak through a UI rendering mistake.

## 7. Resource state model

Every resource-like node should support these fields.

```json
{
  "connectionStatus": "connected|disconnected|unknown|stale|not_configured",
  "health": "healthy|degraded|unhealthy|unknown",
  "resourceKind": "memory|local_file|sqlite|postgres|supabase|cloudflare|vercel|render|github|notion|telegram|n8n|custom",
  "persistence": "memory|ephemeral|local|cloud|external|unknown",
  "credentialRefs": ["ENV_OR_SECRET_NAME"],
  "secretValuesVisible": false,
  "visibility": "public|private|restricted|internal",
  "lastCheckedAt": "ISO timestamp",
  "lastSeenAt": "ISO timestamp",
  "source": "collector or snapshot source",
  "sourceHash": "stable hash of source payload",
  "snapshotId": "snapshot identifier",
  "ttlSeconds": 3600,
  "stale": false,
  "driftStatus": "in_sync|drifted|missing|unknown"
}
```

`stale`, `unknown`, and `not_configured` must be first-class UI states. They should never be silently hidden.

## 8. Collector boundaries

Collectors must be read-only by default.

Allowed without explicit approval:

- list resources
- list workflows
- read health endpoints
- read deployment status
- read GitHub issue/PR metadata
- check credentialRef presence as boolean
- generate static snapshot

Not allowed without explicit approval:

- mutate production workflow
- deploy
- rotate secrets
- create/delete cloud resources
- expose secret values
- publish private topology publicly

Collectors should write normalized snapshots, not live UI responses.

Recommended flow:

```text
collectors → normalized snapshot → D1/Postgres/Git artifact → Worker projection → UI
```

The UI should not directly call every provider API. Live refresh can exist later, but only as an authenticated private operator action.

## 8.1 Mutation guard

Visibility service and mutation service must be separate.

Mutation-capable actions require:

- explicit mutation intent
- issue or PR reference
- user approval marker
- rollback plan
- audit comment
- production target confirmation

Examples requiring guard:

- n8n workflow enable/disable/import/publish
- Cloudflare deploy
- secret update
- DB migration
- GitHub issue close
- cloud resource create/delete

Default permission for Infrastructure Visibility is read-only.

## 9. Search strategy

Start with simple text search over node names, types, owners, tags, and issue references.

Then evolve in this order:

1. JSON/client-side search for static MVP
2. D1/Postgres full-text search
3. dedicated search engine only if needed
4. vector search only if natural-language infra search becomes a core workflow

Search must support questions such as:

- 이 API key는 어디서 쓰이나?
- 어떤 서비스가 cloud DB를 쓰나?
- 어떤 workflow가 실패 중인가?
- search index가 없는 서비스는 무엇인가?
- router/hub에 연결되지 않은 agent는 무엇인가?

Search index usage itself should also be visible as an infrastructure node. If no search/index exists, it should be represented as `not_configured` rather than omitted.

## 9.1 Topology exposure policy

Infrastructure topology can reveal attack paths. Public view must abstract sensitive topology.

Public examples:

- `Workflow Runtime`
- `Storage`
- `External API`
- `Messaging Channel`
- `Deployment Provider`

Private examples:

- exact registry URL
- webhook URL
- provider account/resource ID
- exact region if sensitive
- private endpoint
- credentialRef raw env name

Private view should eventually support roles:

- `viewer`
- `operator`
- `admin`

## 9.2 Logging and telemetry policy

Do not log:

- request headers
- raw request/response body from providers
- env values
- credentialRef raw object
- DB DSN
- webhook secret
- provider error payload containing secrets or account details

Telemetry resource identifiers should prefer opaque IDs or stable hashes when public exposure is possible.

## 10. Implementation phases

### Phase A: static architecture snapshot

- Add `runtime/infrastructure-map.schema.json`
- Add static `runtime/infrastructure-map.json` later
- Render public Infrastructure Map view
- Mark unknown/not_configured explicitly
- Add artifact drift check between source runtime files and `dist/`
- Add redaction/static artifact secret scan before deployment

### Phase B: collectors

- GitHub collector
- Cloudflare Pages/deployment collector
- n8n inventory collector
- credentialRef scanner
- health checker

### Phase C: backend API

- Cloudflare Worker API
- D1 or Postgres storage
- public/private field filtering
- auth boundary
- separate public/private projections
- no-store private responses

### Phase D: ops console

- private authenticated ops view
- stale/drift warnings
- runbook links
- issue creation from failing resource

### Phase E: guarded actions

- approval-based mutations
- deploy guard
- rollback plan requirement
- audit comments on GitHub issues/PRs

## 11. Review requirements

Architecture/performance review must check:

- whether D1 is enough or Postgres is required
- graph rendering scalability
- live API vs static snapshot tradeoff
- collector freshness and drift handling
- whether graph DB is premature
- whether source runtime and build artifact can drift
- whether snapshot API avoids live provider latency/quota issues

Security/privacy review must check:

- public/private view split
- secret value non-exposure
- credentialRef presence-only design
- private topology leakage risk
- mutation guard and approval boundary
- topology exposure policy
- log/telemetry redaction policy

UX/business review should check:

- whether users can answer “what is connected and what is broken?” quickly
- whether unknown/not_configured resources are visible
- whether graph complexity is manageable

## 12. Immediate recommendation

Do not replace the current Agent Map immediately.

Build Infrastructure Visibility as a new layer:

1. Define schema.
2. Add static snapshot.
3. Add UI view.
4. Add collectors.
5. Add Worker API and private view.

This keeps the current GitHub-centric operating model intact while moving toward a real service-grade control-plane.

## 13. Review incorporation notes

The following review findings are explicitly incorporated into this architecture:

- Cloudflare Pages + Worker + D1 is appropriate for MVP, but Postgres may be needed for high-volume history, complex queries, or multi-role private ops.
- Graph DB is premature until path/impact queries are repeatedly needed.
- Snapshot API should be preferred over direct live provider calls from the UI.
- `lastCheckedAt`, `lastSeenAt`, `source`, `sourceHash`, `snapshotId`, `ttlSeconds`, `stale`, and `driftStatus` are required to prevent stale infrastructure from looking healthy.
- Public and private read models should be separate projections.
- Topology exposure is itself a security risk and must be redacted for public views.
- All collectors are read-only; mutation-capable actions live behind a separate approval guard.
