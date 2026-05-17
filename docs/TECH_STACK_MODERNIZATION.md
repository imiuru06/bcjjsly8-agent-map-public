# Tech Stack Modernization

This repo should modernize by replacing legacy surfaces with current stack
surfaces instead of adding more pages.

## Current decision

- **Canonical user home**: Life Graph React/Vite app.
- **Canonical control hub**: Agent Map v10 React/Vite app.
- **Deprecated compatibility route**: Agent Map v9 static HTML.

## Why v10 replaces v9

`public/agent-map-v9.html` grew into a large static HTML + inline JavaScript
page. It still works as a compatibility route, but it is not the right base for
new work because it makes component reuse, testing, state isolation, responsive
layout, and progressive migration harder.

`frontend/agent-map-control` is the replacement control hub:

- React 19 rendering model.
- Vite 8 build path.
- Componentized panels for Ralph Role Drive, replacement-first progress,
  infrastructure/runtime, and knowledge readiness.
- Light modern UI with overflow-safe text handling.
- Same public-safe runtime API/fallback contract as the existing service.

## Deprecation rule

When a newer stack surface replaces an older one:

1. add the new surface to `config/service-integration.json`;
2. make it the canonical route when it is safe enough for users;
3. mark the old surface `deprecated`;
4. render a visible `data-deprecated-surface` marker on the old page;
5. update hub links to the new route;
6. keep the old route temporarily as a compatibility surface;
7. remove only through a separate issue after the notice period.

## Next modernization targets

1. Move remaining Agent Map v9 preview sections into React components.
2. Convert feature pages that still use static HTML into Vite-built surfaces
   only when that improves replacement evidence, not merely for aesthetics.
3. Move runtime reads toward live Worker APIs with static artifacts as fallback.
4. Add browser/Playwright evidence for user-visible UI changes.
5. Add stronger typed runtime contracts before expanding more routes.
6. Apply `docs/LLM_WIKI_UX_READABILITY.md` so UI changes improve preference,
   readability, visibility, and evidence-based workbench behavior instead of
   becoming page-only decoration.
