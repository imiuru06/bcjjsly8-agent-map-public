# Agent Map v9 Legacy Integration

`agent-map-v9.html` is now a deprecated compatibility route for this repo.

The canonical integration/control hub is now Agent Map v10:

```text
frontend/agent-map-control/
/agent-map-v10.html
```

The canonical user-facing Life Graph entry remains:

```text
frontend/life-graph/
```

Do not expose `agent-map-v9.html` as public product navigation. Keep it reachable by direct URL only for temporary compatibility, deployment debugging, and fallback diagnostics until the removal issue is approved.

## Data source

The page reads:

```text
./runtime/agent-map-runtime.json
```

Generate or refresh that file before building static artifacts:

```bash
npm run runtime:sync
npm run build:static
```

## Build output

`npm run build:static` copies `public/` into `dist/`.

The build makes:

- `dist/agent-map-life.html`
- `dist/agent-map-v10.html`
- `dist/agent-map-v9.html`
- `dist/index.html` as a copy of the life graph view
- `dist/runtime/agent-map-runtime.json`
- `dist/runtime/life-process-graph.json`

## Deployment

Cloudflare Pages uses:

```text
Build command: npm run build:static
Output directory: dist
```

When the repository is private and GitHub Pages cannot deploy, GitHub Actions still uploads `dist/` as an artifact.

## Relationship to Life Graph

`agent-map-life.html` is generated from `frontend/life-graph/` as the main dashboard and deployed `/` route. Agent Map v10 is generated from `frontend/agent-map-control/` as the modern React/Vite control hub.

Use `/agent-map-v9` only when maintainers need to verify the legacy compatibility route before removing it.
