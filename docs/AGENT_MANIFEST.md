# Agent Manifest Contract

This repo now treats runtime agents, pipeline agents, reviewer CLI roles,
control-plane jobs, and life-loop agents as explicit operational units.

The source of truth is:

- `config/agent-manifest.json`

The generated public-safe read model is:

- `runtime/agent-manifest-summary.json`
- `/api/runtime/agent-manifest-summary` on the deployed service

## Why this exists

Before this contract, some things were real runtime agents under `agents/*`,
while others were CLI jobs or reviewer roles that only behaved like agents when
scheduled or assigned. That made it too easy to say “agent” without knowing:

- what starts it
- what it reads
- what it writes
- what state it owns
- what events it emits
- when it can act automatically
- when a human/Codex decision is required
- how to verify it

The manifest makes those boundaries explicit.

## Standalone runtime contract

Agents can now be treated as independent operational units. This does **not**
mean every unit is allowed to act autonomously without gates. It means each unit
has an explicit standalone contract:

- whether it is independently launchable
- which mode it runs in (`daemon`, `bounded-job`, `bounded-review-job`, etc.)
- the entrypoint command
- whether Registry is required
- required env names
- optional env names
- state ownership
- supervisor recommendation
- restart policy
- concurrency boundary

This contract is defined once under `standalonePolicy` in:

- `config/agent-manifest.json`

The checker resolves the default policy by type and then applies per-agent
overrides. This avoids repeating noisy boilerplate in every agent entry while
still giving each agent an effective standalone configuration.

Examples:

```bash
npm run agent:standalone -- --list
npm run agent:standalone -- telegram_notifier --dry-run
npm run agent:standalone -- life_information_loop --dry-run
```

Actual launch is also possible:

```bash
npm run agent:standalone -- telegram_notifier
```

The launcher prints env **names** only. It never prints secret values. If a
required env is missing, it fails before launching unless
`--allow-missing-env` is explicitly supplied.

## Required fields

Every entry must define:

- `id`
- `type`
- `role`
- `command`
- `trigger`
- `inputs`
- `outputs`
- `registryEvents`
- `stateFiles`
- `healthCheck`
- `humanNeededWhen`
- `autoRunWhen`
- `verification`

## Agent types

- `runtime-agent`: daemon-like service under `agents/*`.
- `pipeline-agent`: bounded runtime stage such as content dry-run/assets/render/publish.
- `control-plane-cli`: deterministic repo operation, validator, router, or artifact builder.
- `reviewer-cli`: review-only role agent such as Improvement Governor or Collaboration Auditor.
- `life-loop-agent`: bounded life-process replacement loop with collect/analyze/act/verify evidence.

## Commands

Generate the public-safe summary:

```bash
npm run agent:manifest
```

Validate the contract:

```bash
npm run agent:manifest:check
```

Validate that every manifest-declared agent resolves to a concrete
implementation file and that CLI/reviewer/life-loop agents expose their
manifest `agentId` in output or implementation:

```bash
npm run agent:implementation:check
```

Full policy checks also include the manifest check:

```bash
npm run policy:check
```

## Operating rule

If a new agent-like unit is added, do not rely on naming alone. Add or update
the manifest entry and pass `npm run agent:implementation:check` in the same
PR. If the unit is just a script, mark it as a `control-plane-cli` or
`reviewer-cli` instead of pretending it is a runtime daemon.

If the unit must run independently, confirm its effective standalone contract:

```bash
npm run agent:standalone -- <agent_id> --dry-run
```

If it needs a different supervisor, restart policy, required env, or concurrency
boundary, add a `standalonePolicy.overrides.<agent_id>` entry instead of
hard-coding operational assumptions in prose.

The goal is not to make every script autonomous. The goal is to make the actual
automation boundary visible and verifiable.
