# Idea Technical Definitions

- agentId: `idea_technical_definition_cli`
- generatedAt: `2026-05-17T00:19:23.837Z`
- sourceHash: `sha256:3a680913ebc78dae3f9159c50a89c792129c06ecf6a8d0628dab8d2ee3ab82cb`
- definitionCount: `3`

This artifact converts public-safe collected signals into reviewable technical definition drafts. It does not create GitHub issues by default.

## Convert collected signals into ticket-ready technical definitions

- id: `idea-to-technical-definition-loop`
- priority: `P1`
- category: `workflow`

### Goal

Turn collected external/GitHub/runtime signals into reviewable idea candidates and technical definition drafts before implementation work starts.

### Why now

The agent team can collect and triage signals, but the idea -> technical definition -> ticket-ready spec step was not a first-class agent.

### Technical definition

- Add a deterministic CLI agent that reads public-safe runtime artifacts.
- Produce idea candidates with goal, why-now, input/output contracts, acceptance criteria, safety gates, and candidate GitHub issue payloads.
- Default behavior must write local artifacts only; issue creation requires a later explicit gate.

### Candidate issue

- title: Convert collected signals into ticket-ready technical definitions
- labels: priority:P1, kind:enhancement, phase:platform, agent:codex, owner:user, owner:codex, needs:agent, agent:improvement_governor_cli

## Convert external tech/economy signals into daily technical brief candidates

- id: `external-signal-to-daily-technical-brief`
- priority: `P2`
- category: `briefing`

### Goal

Use the external public signal route to create daily technical opportunity briefs that can be routed into implementation or watchlist tickets.

### Why now

A current external signal was collected: OpenAI and Malta partner to bring ChatGPT Plus to all citizens.

### Technical definition

- Group external public signals by project relevance: agentization, infrastructure, privacy, cost, knowledge, and content.
- Generate one daily brief section per group with why-it-matters, affected Agent Map component, and suggested safe next action.
- Route only repeated/high-score signals to candidate issue drafts; single low-confidence signals stay as watchlist items.

### Candidate issue

- title: Convert external tech/economy signals into daily technical brief candidates
- labels: priority:P2, kind:enhancement, phase:analyze, agent:codex, owner:user, owner:codex, needs:agent, agent:external_information_triage_loop

## Add privacy-boundary technical guard for life-agent serviceization

- id: `privacy-boundary-technical-guard`
- priority: `P2`
- category: `platform`

### Goal

Convert privacy-sensitive public signals and existing safety policy into a technical guard that prevents private raw data exposure while agentization expands.

### Why now

Recent external signals include privacy/data-sharing risk, while the project is moving toward serviceized life-agent workflows.

### Technical definition

- Define a reusable public-safe artifact contract with fields allowed, redacted, and forbidden.
- Add a verification step that scans candidate public artifacts for secret/private/raw-data markers before build/deploy.
- Integrate the guard with life-agent replacement scopes and service-integration evidence.

### Candidate issue

- title: Add privacy-boundary technical guard for life-agent serviceization
- labels: priority:P2, kind:enhancement, phase:platform, agent:codex, owner:user, owner:codex, needs:agent, agent:collaboration_auditor_cli

