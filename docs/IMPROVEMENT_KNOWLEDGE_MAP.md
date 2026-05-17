# Improvement Knowledge Map

This file is generated from `config/improvement-knowledge-ontology.json` and runtime evidence.

## Summary

- status: `ok`
- concepts: 8
- suggestions: 4
- service surfaces: 14
- topology: 97 nodes / 160 edges
- missing artifacts: 0

## Canonical concepts

- **Agent system interface** (`agent_system_interface`) — governance/agent_ops; owner: `agent_system_interface_assessor_cli`
- **Human decision governance** (`decision_governance`) — decision/workflow; owner: `codex`
- **External signal briefing** (`external_signal_briefing`) — input/information; owner: `external_information_triage_loop`
- **Improvement governor accountability** (`improvement_governor_accountability`) — governance/workflow; owner: `improvement_governor_performance_cli`
- **Infrastructure visibility** (`infrastructure_visibility`) — verification/infrastructure_ops; owner: `infrastructure_visibility_cli`
- **Knowledge OS / LLM-Wiki** (`knowledge_os`) — learning/learning; owner: `knowledge_graphify`
- **Life process agentization** (`life_agentization`) — action/agent_ops; owner: `codex`
- **Service UX integration** (`service_ux_integration`) — surface/ux; owner: `uiux_cli`

## Current improvement suggestions

- **P2** · LLM-Wiki 검색/재사용 ROI evidence 늘리기 → category `knowledge`
- **P1** · 라이프 에이전트화를 scope 단위에서 domain 단위로 승격 → category `agentization`
- **P2** · Needs Human 결정 묶음을 더 줄이고 자동 위임 후보를 분리 → category `workflow`
- **P2** · 외부 기술/경제 신호를 KST 일일 이슈 브리프로 승격 → category `briefing`

## Sync contract

- write: `npm run improvement:knowledge`
- check: `npm run improvement:knowledge:check`
- runtime: `runtime/improvement-knowledge-map.json`
- pre-commit hook: `.githooks/pre-commit`

## Rule

When a task touches improvement suggestions, service surfaces, runtime evidence,
agent roles, UX, infra, or knowledge management, agents must check this map
before treating the task as isolated.
