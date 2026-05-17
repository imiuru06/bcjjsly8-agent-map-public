# Stitch Prompt — Agent Map v10

Create a bright, modern Agent Map v10 experience for a multi-agent personal
operating system. Do not treat it as a generic admin dashboard. Treat it as a
life-agent OS that helps one person understand which parts of their life,
knowledge, infrastructure, and content workflows are being replaced by agents.

The product should help the user understand:

- which agents are currently available;
- which role pools are optional only;
- what requires human decision;
- what Ralph Loop says must act next;
- which service pages and runtime artifacts are healthy;
- how life/process replacement progress is moving.
- how collected information becomes decisions, bounded actions, verification,
  and learning rather than just more pages.

## Product philosophy

The service philosophy is:

- Life Graph is the primary home, because the system is ultimately about
  replacing real life processes with reliable agent loops.
- Agent Map v10 is the control hub, because it shows agent health, role drive,
  human gates, evidence, and service navigation.
- External trends, Kakao analysis, GitHub issues, knowledge graphs, and infra
  maps are not separate products. They are input and evidence layers for the
  same life-agent operating system.
- The user should feel: “I know what changed, what matters, what agents will do
  next, and what only I must decide.”
- Avoid page sprawl. Prefer integrated wayfinding, visible pipelines, and
  evidence-backed next actions.

## Screen requirements

Design a responsive web dashboard with these sections:

1. Hero summary
   - title: Life Agent Operating Map
   - subtitle: one place to see life-process agents, evidence, and next actions
   - small status chips: live data, Ralph loop, human gates, replacement progress

2. Human UX Summary
   - 3–4 priority cards
   - clear difference between OK, warning, and blocked states

3. Agent System Interface
   - score card
   - assignable agents
   - optional reviewers
   - role lanes
   - must-act roles
   - needs-human count
   - stale/open pressure

4. Ralph Loop Plan
   - horizontal or vertical stage timeline:
     Research → Design → Implement → Verify → Improve → Re-verify → Deploy
   - each stage should show status and one evidence line

5. Life Graph / Infra / Knowledge / External Signals cards
   - visible but not overwhelming
   - each card should have one next-action CTA

6. Philosophy / operating loop cards
   - Replace real work
   - Keep evidence visible
   - Make human gates explicit
   - Prevent page sprawl

7. Pipeline strip
   - Sense → Prioritize → Act → Verify → Learn
   - Each step should show a live count or evidence source

8. Theme system
   - Bright default
   - Mint
   - Studio
   - Sunset

## Visual style

- light theme first;
- generous spacing;
- rounded panels;
- soft blue/cyan/mint accents;
- modern SaaS cockpit feel;
- readable typography;
- strong overflow protection for long agent ids and issue titles;
- mobile-first responsive layout.
- clear hierarchy: user-facing meaning first, technical evidence second.

## Avoid

- dark-only interface;
- raw JSON/data table look;
- overflowing text;
- too many equal-priority cards;
- hiding human decisions inside technical jargon;
- treating optional reviewers as confirmed live agents.
- adding pages without explaining how they feed the life-agent loop.

## Implementation handoff constraints

The accepted design should map back to the current React/Vite codebase:

- `frontend/agent-map-control/src/main.jsx`
- `frontend/agent-map-control/src/styles.css`

Do not require private data, a graph database, or a new backend for this design
pass.
