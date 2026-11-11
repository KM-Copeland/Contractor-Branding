# Copeland Contractor Branding prototype

React/TypeScript prototype for selecting product families, adding shared imprint artwork/text, setting logo/text visibility per family, and reviewing product previews. The implementation uses React 19, TypeScript, Vite, CSS Modules, CSS custom properties and local product assets. It has no backend or persistence; refreshing resets the workflow.

## Run locally

Use Node 22.12+ or Node 24 with npm.

1. Run `npm install`.
2. Run `npm run dev` and open `http://127.0.0.1:5173`.
3. Run `npm run build` for the TypeScript check and production build.
4. Run `npx playwright install chromium` once if needed, then `npm run test:e2e`.

For detailed focused-test commands, component ownership, responsive contracts, and visual-check workflow, see the [Developer guide](docs/architecture/developer-guide.md).

## Component workshop

Run `npm run storybook` to explore the complete component catalog at `http://127.0.0.1:6006`, or `npm run build-storybook` to build the static workshop. See the [Storybook guide](docs/architecture/storybook-guide.md) and [component coverage matrix](docs/architecture/storybook-component-coverage.md) for navigation, scenarios, and accessibility/responsive inspection. npm is the supported package manager; use `npm ci` for a clean install from the checked-in lockfile.

## Workflow

- Step 0 introduces the imprint workflow.
- Step 1 provides product search, category filters, multi-selection, removal, and Clear All.
- Step 2 edits one shared logo and two 30-character text lines, then configures supported imprint types per selected product. Continue requires every selected product to have at least one present, supported imprint type enabled.
- The local completion screen provides a final review and return path; it does not submit an order.

Logo checks run locally in the browser and provide preliminary file feedback. They do not establish production approval. Preview positions are prototype mappings, not manufacturing specifications.

## Architecture and design

Start with the [architecture documentation](docs/architecture/README.md): system overview, component reference, design-system guide, developer guide, and final Phase 5A readiness report. The linked phase records retain implementation and visual evidence. The [UX behavior specification](docs/ux-behavior-spec.md), [Figma reconciliation](docs/figma-reconciliation.md), and [responsive audit](docs/responsive-audit.md) provide broader design context.
