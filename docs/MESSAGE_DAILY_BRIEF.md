# Message Daily Brief

The message daily brief is the user-facing read view for processed message
signals. It integrates the legacy `daily_brief_visualizer` with the newer
life-agent evidence artifacts.

## Purpose

- Show the current daily message/information state in one HTML page.
- Use processed Kakao insight aggregates, not raw Kakao messages.
- Show bounded next actions from the life-agent triage loop.
- Provide a quick verification path before using the brief as evidence.

## Inputs

- `data/insights/unified.json`
  - legacy aggregate insight source
  - used only as sanitized aggregate metadata
- `runtime/kakao-insight-input-snapshot.json`
  - processed Kakao input snapshot
  - preferred current source
- `runtime/kakao-information-bounded-actions.json`
  - safe local action proposals from the Kakao triage loop
- `runtime/kakao-information-triage-verification.json`
  - verification and safety boundary for the triage loop
- `runtime/life-agent-runs.jsonl`
  - recent life-agent run evidence

## Output

- `public/daily-brief.html`

The rendered page intentionally excludes:

- raw Kakao messages
- raw URLs
- room IDs
- room labels
- summary text from private rooms
- secrets
- external posting, publish/upload, deploy, payment, or destructive actions

## Commands

Generate the HTML once:

```bash
npm run brief:once
```

Verify inputs and safety boundaries:

```bash
npm run brief:check
```

Open locally:

```bash
open public/daily-brief.html
```

Run as the long-lived registry agent:

```bash
npm run brief
```

## Expected interpretation

This brief can support the `information` and `learning` domains by showing
current processed message volume, freshness, health, acceptance, bounded local
actions, and recent life-agent run evidence.

It does **not** claim replacement readiness by itself. Replacement readiness
still requires repeated successful runs, usefulness/reuse metrics, monitoring,
and verified safe execution boundaries.
