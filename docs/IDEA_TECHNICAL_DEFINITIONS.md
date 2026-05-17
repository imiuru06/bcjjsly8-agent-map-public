# Idea Technical Definition Agent

`idea_technical_definition_cli` closes the gap between signal collection and
implementation planning.

It converts public-safe collected artifacts into reviewable technical
definition drafts:

```text
collected issue/info signals
  -> idea candidates
  -> technical definition draft
  -> candidate GitHub issue payload
  -> human/Codex review before creation
```

## Purpose

The agent team already collects and triages:

- GitHub Issue/Project operational signals;
- external public technology/economy signals;
- processed Kakao aggregate signals;
- Improvement Governor suggestions;
- knowledge/retrieval and content replacement artifacts.

This agent turns those inputs into ticket-ready technical definitions without
pretending that every signal is already implementation work.

## Command

```bash
npm run idea:define
npm run idea:define:check
```

## Inputs

- `runtime/external-info-input-snapshot.json`
- `runtime/github-info-input-snapshot.json`
- `runtime/improvement-suggestions.json`
- `runtime/knowledge-retrieval-index.json`
- `runtime/llm-wiki-readiness.json`
- `runtime/content-replacement-scope-verification.json`

## Outputs

- `runtime/idea-technical-definitions.json`
- `runtime/idea-technical-definitions.md`
- `runtime/idea-technical-definitions-verification.json`

Each definition includes:

- goal;
- why-now rationale;
- source signals;
- technical definition bullets;
- input/output contract;
- acceptance criteria;
- safety and non-goals;
- verification commands;
- candidate GitHub issue title/body/labels.

## Safety boundary

The agent is **draft-only** by default.

It must not:

- read raw private data;
- include secret values;
- fetch full article bodies or comments;
- create GitHub issues automatically;
- deploy, publish, upload, pay, message externally, or perform destructive
  actions.

Candidate issues are local draft payloads. Actual issue creation still requires
Codex / 다알고 review or explicit delegation.

## How this improves the agent team

Before this agent, the system could collect information and propose general
improvements, but the step from **idea** to **technical definition** was not a
first-class pipeline stage.

With this agent, the team can now show evidence for:

1. issue/information collection;
2. signal triage;
3. idea synthesis;
4. technical definition;
5. ticket-ready drafting;
6. review gate before execution.
