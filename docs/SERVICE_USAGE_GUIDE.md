# Service Usage Guide

This guide fixes a recurring UX problem: the system may collect useful outputs,
but the user may not know where to see them inside the service.

## Current public access list

Verified on Cloudflare Pages, 2026-05-15 KST. Use the Cloudflare URL as the
primary user-facing route:

- **Agent Map v10 / control hub**  
  https://bcjjsly8-agent-map.pages.dev/agent-map-v10.html  
  Purpose: primary Life Agent OS cockpit, role drive, runtime confidence, and
  service guidance.
- **Life Graph / main process map**  
  https://bcjjsly8-agent-map.pages.dev/agent-map-life.html  
  Purpose: life process graph and replacement-progress home.
- **Daily Brief**  
  https://bcjjsly8-agent-map.pages.dev/daily-brief.html  
  Purpose: readable daily brief from Kakao/GitHub/external inputs.
- **Kakao Public Analysis**  
  https://bcjjsly8-agent-map.pages.dev/kakao-analysis.html  
  Purpose: public-safe Kakao aggregate analysis; raw messages stay excluded.
- **External Trends**  
  https://bcjjsly8-agent-map.pages.dev/external-trends.html  
  Purpose: public technology/economy signal reading surface.
- **Knowledge Map**  
  https://bcjjsly8-agent-map.pages.dev/knowledge-map.html  
  Purpose: Obsidian-style vault index and Graphify bridge.
- **Knowledge Retrieval Pilot**  
  https://bcjjsly8-agent-map.pages.dev/knowledge-retrieval.html  
  Purpose: public-safe retrieval baseline before heavier RAG/MCP.
- **LLM-Wiki Readiness**  
  https://bcjjsly8-agent-map.pages.dev/llm-wiki-readiness.html  
  Purpose: readiness gate for capture, search ROI, and knowledge compounding.
- **Ops Environment Audit**  
  https://bcjjsly8-agent-map.pages.dev/ops-environment-audit.html  
  Purpose: operating environment, agents, schedules, queues, and infra health.
- **Infrastructure Map**  
  https://bcjjsly8-agent-map.pages.dev/infrastructure-map.html  
  Purpose: connected resources, routers, hubs, provider state, and topology.

The eight legacy/static service pages above are now aligned with the shared
Stitch-inspired service shell: Life Agent OS context, operating loop,
Runtime Evidence CTA, mobile-safe layout, and public/private boundary hint.

## External trend information

External technology/economy signals are visible in these places:

- **External Trends**: `./external-trends.html`
  - readable page for current public technology/economy signals;
  - shows priority, source, why it matters, and suggested next action;
  - preferred first-stop page when the user asks where to see latest trends.
- **Agent Map v10**: `./agent-map-v10.html#external-signals`
  - first-stop summary for priority signals;
  - shows why each signal matters and the suggested next action.
- **Daily Brief**: `./daily-brief.html`
  - user-friendly daily summary surface.
- **Live JSON**: `./api/runtime/external-info-input-snapshot`
  - current public RSS/Atom metadata read model.
- **Brief Markdown**: `./runtime/external-info-input-brief.md`
  - build artifact for quick reading.
- **Triage Report**: `./runtime/external-information-triage-report.md`
  - bounded local analysis result.

## In-service guidance contract

`runtime/service-usage-guide.json` is the machine-readable contract for service
guidance. It is built by:

```bash
npm run service:guide
npm run service:guide:check
```

The Agent Map v10 control hub reads it through:

- live API: `./api/runtime/service-usage-guide`
- static fallback: `./runtime/service-usage-guide.json`

## Periodic guide / nudge behavior

The service may remind the user where important outputs live, but it must not
silently add invasive analytics.

Current default:

- uses browser `localStorage`;
- key: `agent-map-v10-service-guide-seen-at`;
- shows guidance on first visit or when the guide has not been marked as seen
  for 7 days;
- does **not** send usage events to a server;
- does **not** include private raw data or secrets.

This means “is the feature under-used?” is inferred conservatively from local
visibility, not measured as cross-device analytics.

## If stronger usage analytics are needed later

Add an explicit decision before enabling server-side analytics:

1. define a public-safe `service.usage` registry event;
2. record only page id, timestamp bucket, and action id;
3. never record raw Kakao data, article bodies, secrets, or personal message
   text;
4. expose aggregate counts in Agent Map v10 and Ops Environment Audit.

Until then, improve discoverability before adding more pages.
