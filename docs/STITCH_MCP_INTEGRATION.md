# Google Stitch MCP/SDK Integration

This repo treats Google Stitch as a UI design/prototype provider for Agent Map
and Life Graph surfaces. Stitch should support design direction, theme variants,
visual hierarchy, and prototype screens. It should not own production code
changes directly.

## Current status

- Official SDK/MCP path exists through `@google/stitch-sdk`.
- This repo provides a safe adapter script:

```bash
npm run stitch:tools
npm run stitch:mcp
npm run stitch:agent-map-v10
npm run stitch:check
npm run service:shell
npm run service:shell:check
```

- Secrets are not committed. Use environment variables only.
- If Stitch is unavailable, use Figma MCP and `uiux_cli` as the implementation
  handoff/review path.

## Required environment

Use one of the following auth modes.

API key mode:

```bash
export STITCH_API_KEY="..."
```

OAuth mode:

```bash
export STITCH_ACCESS_TOKEN="..."
export GOOGLE_CLOUD_PROJECT="..."
```

Optional:

```bash
export STITCH_HOST="https://stitch.googleapis.com/mcp"
export STITCH_PROJECT_ID="<existing Stitch project id>"
```

Do not put real values into committed files.

## Install the official SDK

The adapter intentionally keeps the SDK operator-installed unless the runtime
environment is ready to use live Stitch calls.

```bash
npm install @google/stitch-sdk
```

The official SDK reads `STITCH_API_KEY` by default, exposes `stitchTools()` for
agent frameworks, and exposes `StitchProxy` for MCP stdio proxy use.

## List Stitch MCP tools

```bash
npm run stitch:tools
```

This calls the SDK `listTools()` path and prints tool names/descriptions without
printing secrets.

## Run Stitch as an MCP stdio proxy

```bash
npm run stitch:mcp
```

This starts:

```text
StitchProxy + StdioServerTransport
```

Use this only from an MCP-capable host that can supervise stdio tools. It is not
a long-running app server by itself.

## Generate Agent Map v10 design directions

```bash
npm run stitch:agent-map-v10
```

With an existing project:

```bash
npm run stitch:agent-map-v10 -- --project-id <stitch-project-id>
```

The prompt source is:

```text
docs/STITCH_AGENT_MAP_V10_PROMPT.md
```

Expected output:

- Stitch project id;
- screen id;
- HTML download URL;
- screenshot/image URL;
- next implementation steps.

## Equivalent provider path

If Stitch cannot be used in the current session:

1. Use Figma MCP `generate_figma_design` to capture the deployed Agent Map page.
2. Use Figma MCP `get_design_context` when a Figma URL/node exists.
3. Apply accepted tokens/layouts manually to:
   - `frontend/agent-map-control/src/main.jsx`
   - `frontend/agent-map-control/src/styles.css`
4. For legacy/static service pages, do not redesign each page independently.
   Apply the shared Life Agent OS shell so they inherit the same Stitch
   navigation, operating loop, mobile readability, and runtime evidence CTA:

```bash
npm run service:shell
```

5. Verify with:

```bash
npm run frontend:control:build
npm run service:shell:check
npm run uiux:audit
```

## Guardrails

- Stitch is design/prototype support, not an autonomous production implementer.
- Production code changes remain owned by Codex / 다알고 unless explicitly
  delegated.
- `uiux_cli` validates implemented UI behavior and accessibility.
- Do not expose raw private data or secret values in prompts, exports, or docs.
- Do not count a Stitch image alone as implementation progress.
