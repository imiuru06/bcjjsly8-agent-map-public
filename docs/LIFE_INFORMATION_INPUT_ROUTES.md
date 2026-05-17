# Life Information Input Routes

This project must not depend on a single information source for life-agentization.
Each input route has to be public-safe, scriptable, checkable, and visible in the
Agent Map runtime.

## Route 1 — Processed Kakao aggregate

- Command: `npm run life:input:kakao`
- Check: `npm run life:input:kakao:check`
- Runtime:
  - `runtime/kakao-insight-input-snapshot.json`
  - `runtime/kakao-insight-input-brief.md`
- Boundary:
  - no raw Kakao messages
  - no room ids or room labels
  - no raw links
  - no private summary text
  - no secret values

## Route 2 — GitHub Issue/Project operational signals

- Command: `npm run life:input:github`
- Check: `npm run life:input:github:check`
- Runtime:
  - `runtime/github-info-input-snapshot.json`
  - `runtime/github-info-input-brief.md`
- Source:
  - `GITHUB_REPO`, default `imiuru06/bcjjsly8`
  - `gh issue list` first
  - public GitHub REST fallback
- Boundary:
  - issue metadata only: number, title, labels, URL, updatedAt
  - no issue bodies
  - no comments
  - no PR diffs
  - no Project mutation
  - no issue mutation
  - no secret values

## Why GitHub is the second route

GitHub Issues/Project is already the control-plane for the multi-agent system.
Using it as an information input route gives the life-agent loop a second current
signal stream without new credentials:

- what changed recently
- what is routeable to agents
- what is blocked by human gates
- which domains are accumulating work
- where replacement loops should be improved next

This is not a substitute for private life data. It is an operational information
source that helps agents find and prioritize work safely.

## Route 3 — External public technology/economy signals

- Command: `npm run life:input:external`
- Check: `npm run life:input:external:check`
- Config: `config/external-info-sources.json`
- Primary runtime: `/api/runtime/external-info-input-snapshot`
- Runtime:
  - `runtime/external-info-input-snapshot.json`
  - `runtime/external-info-input-brief.md`
- Runtime contract:
  - live API is primary
  - generated static snapshot is fallback/cache only
  - Agent Map should prefer `/api/runtime/external-info-input-snapshot`
  - stale static data must not be treated as the current external issue state when the live endpoint is available
- Default source groups:
  - technology/software/cloud/AI: Hacker News, GitHub Blog, Cloudflare Blog, OpenAI News
  - economy/policy/regulation: Federal Reserve, ECB, SEC
- Boundary:
  - public RSS/Atom feeds only
  - title/link/published metadata only
  - no full article bodies
  - no comments
  - no paywalled scraping
  - no private data
  - no secrets
  - no financial/legal/investment decision without human review

## Why external public signals are the third route

Kakao and GitHub are internal/personal or operational signals. They do not tell
the system what is changing in the outside world. The external route gives agents
a low-friction way to notice technology, economy, policy, and regulatory movement
that may affect learning priorities, content opportunities, infrastructure risk,
or business decisions.

This route is for awareness and briefing candidates only. It must not execute
trades, purchases, legal conclusions, public posting, or external commitments.

Because external technology/economy issues change frequently, this route is
**live-first**. The static JSON artifact exists only so builds, mirrors, and
degraded environments still have a public-safe fallback. The service UX and
Cloudflare Worker endpoint should use live fetches whenever available.

## Acceptance rule for new routes

Any future route must provide:

1. `npm run life:input:<name>`
2. `npm run life:input:<name>:check`
3. a runtime JSON snapshot
4. a short runtime brief
5. a privacy/safety contract
6. static build integration
7. public Agent Map visibility
8. no hard-gated action without explicit approval
