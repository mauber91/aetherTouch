# Repository Guidelines

## Project Structure & Module Organization
- Entry point: `index.html` (loads ES modules and initializes Three.js scene).
- Scripts: `js/` for page-specific modules (e.g., `gemini.js`, `script.js`).
- Shaders: `shaders/` for GLSL (`*.vert.glsl`, `*.frag.glsl`) and JS wrappers exporting shader strings (`glitch.js`, `mesh.js`).
- Config: `.vscode/` contains editor settings; no build system or package manifest.

## Build, Test, and Development Commands
- Serve locally: `python3 -m http.server 8000` then open `http://localhost:8000/index.html`.
- VS Code: use “Live Server” to serve the workspace root.
- No build step: assets are loaded directly in the browser via ES modules and a CDN for Three.js.

## Coding Style & Naming Conventions
- JavaScript: ES modules, 2‑space indentation, semicolons, descriptive names.
- Files: lowercase; shaders follow `name.vert.glsl` / `name.frag.glsl`; shader JS wrappers live in `shaders/`.
- Organization: keep rendering logic in modules under `js/`; keep GLSL and post‑processing in `shaders/`.
- Imports: prefer relative imports; pin CDN versions (e.g., `three@0.150.0`).

## Testing Guidelines
- Manual smoke test in latest Chrome/Firefox:
  - Load the page, confirm WebGL renders, mesh animates, and glitch post‑effect applies.
  - Resize window; verify responsive canvas and no console errors.
  - Interact with mouse; confirm breakup effect near the mesh.
- Optional: add a lightweight checklist in PRs for tested browsers/OS.

## Commit & Pull Request Guidelines
- Commits: small, focused messages in imperative mood (e.g., "add mesh breakup uniform", "fix shader UV seams").
- PRs must include: summary, rationale, screenshots or a short screen capture for visual changes, test steps, and any known limitations.
- Link related issues; keep unrelated refactors in separate PRs.

## Security & Configuration Tips
- CDN dependencies: pin exact versions; avoid mixed content. Prefer local copies for offline reliability.
- Assets: verify CORS when using external textures; prefer bundling local textures in `assets/` if added.
- Paths: use valid relative paths from `index.html` (e.g., `./shaders/mesh.js`).

## Adding New Effects (Quick Recipe)
- Add `yourEffect.vert.glsl` and `yourEffect.frag.glsl` to `shaders/`.
- Export them via a JS wrapper (or import as strings) and wire them in `index.html` or a module in `js/`.
- Test locally using the commands above and attach visuals in your PR.

