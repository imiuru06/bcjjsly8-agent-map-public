# Agent Map Live Data API

Agent Map은 정적 JSON을 직접 읽는 방식에서 벗어나, 가능한 화면부터 Cloudflare Pages Worker의 read-only API를 우선 사용한다.
정적 `runtime/*.json` 파일은 fallback/cache 역할만 한다.

## Public endpoints

- `/api/health`
- `/api/runtime/agent-map`
- `/api/runtime/life-graph`
- `/api/runtime/infrastructure-map`
- `/api/runtime/infrastructure-inventory`
- `/api/runtime/infrastructure-live`
- `/api/runtime/decision-queue`
- `/api/runtime/decision-digest`
- `/api/runtime/session-agent-health`
- `/api/runtime/kakao-insight-input-snapshot`
- `/api/runtime/kakao-information-bounded-actions`
- `/api/runtime/kakao-public-analysis`
- `/api/runtime/knowledge-vault-summary`
- `/api/runtime/retrieval-service-health`
- `/api/runtime/llm-wiki-readiness`
- `/api/runtime/improvement-suggestions`
- `/api/runtime/agent-manifest-summary`

## Live vs fallback

Each API response includes a `liveData` object when the route is a runtime read model.

- `liveData.mode = "live"` means the Worker read a live source.
- `liveData.mode = "live_derived"` means the Worker could not reach the primary live source, but still built a current public-safe read model from another live source such as GitHub Issues REST.
- `liveData.mode = "live_derived"` is also used by `/api/runtime/improvement-suggestions`, which synthesizes Improvement Governor proposals from current public-safe runtime read models.
- `liveData.mode = "live_derived"` is also used by `/api/runtime/decision-digest`, which groups live GitHub `needs:human` issues into decision batches without executing any decision.
- `liveData.mode = "public_mirror"` means the Worker served the latest public-safe runtime artifact from the GitHub Pages public mirror. This is used for Kakao public artifacts while Cloudflare/GitHub deploys can lag behind local collection.
- `liveData.mode = "asset_fallback"` means the Worker served the static runtime artifact.
- `liveData.fallbackReason` explains why live source was not used.

The UI should call API first and only then fallback to static JSON.

Kakao public analysis has an additional freshness rule:

- `npm run build:static` must run Kakao input collection and bounded triage before `kakao-public-analysis.json` is generated.
- `/api/runtime/kakao-insight-input-snapshot`, `/api/runtime/kakao-information-bounded-actions`, and `/api/runtime/kakao-public-analysis` prefer the public mirror artifact first.
- `kakao-analysis.html` loads `./api/runtime/kakao-public-analysis` first, then `./runtime/kakao-public-analysis.json`, then the embedded build fallback.
- Raw Kakao messages, room identifiers, room labels, raw URLs, and secret values remain excluded in all modes.

## Required runtime bindings for true live data

Cloudflare Pages runtime environment variables:

- `GITHUB_REPO=imiuru06/bcjjsly8`
- `GITHUB_TOKEN` in Cloudflare Pages runtime
- `AGENT_MAP_GITHUB_TOKEN` in GitHub repository secrets; the deploy workflow syncs this into Cloudflare Pages runtime as `GITHUB_TOKEN`
- Optional: `AGENT_MAP_REGISTRY_URL`
- Optional: `N8N_BASE_URL`
- Optional: `N8N_API_KEY`
- Optional: `PUBLIC_MIRROR_BASE_URL` (default: `https://imiuru06.github.io/bcjjsly8-agent-map-public`)
- Optional: `DISABLE_PUBLIC_MIRROR_RUNTIME=1` to force static asset fallback during tests.

Important:

- GitHub repo data is private from unauthenticated REST. Without `GITHUB_TOKEN`, GitHub-backed endpoints intentionally fallback to static assets.
- A local registry URL such as `http://localhost:7474` cannot be reached from Cloudflare Worker. If a remote registry is unavailable, `/api/runtime/agent-map` and `/api/runtime/session-agent-health` derive current public-safe status from GitHub Issues labels/timestamps instead of exposing a stale registry snapshot.
- API tokens are never serialized into public responses.

## Safety contract

The Worker is:

- GET-only
- read-only
- public-safe
- no raw Kakao messages
- no secret values
- no private provider payloads
- no comments/labels/close/merge/deploy/publish/upload/payment/destructive actions

Private runtime files remain denied:

- `/runtime/capture-inbox.json`
- `/runtime/capture-to-note-promotions.json`
- `/runtime/knowledge-search-events.jsonl`

## Verification

Run:

```bash
npm run live:api:check
npm run build:static
node scripts/check-public-static-artifact.mjs --dir dist
```
