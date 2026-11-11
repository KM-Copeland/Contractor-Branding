# Developer guide

## Start and validate

Use Node 22.12+ or Node 24 with npm, per the root README. From the project directory:

| Task | Command |
| --- | --- |
| Clean install from the supported lockfile | `npm ci` |
| Start local Vite server | `npm run dev` then open `http://127.0.0.1:5173` |
| TypeScript check + production build | `npm run build` |
| Run all Playwright tests | `npm run test:e2e` |
| Explore component stories | `npm run storybook` at `http://127.0.0.1:6006` |
| Build static Storybook | `npm run build-storybook` |
| Run one spec | `npx playwright test tests/selection.spec.ts` |
| Run one test by name | `npx playwright test tests/selection.spec.ts -g "search field fills"` |
| Install Playwright Chromium if absent | `npx playwright install chromium` |

The package scripts bind Vite to `127.0.0.1`, and Playwright uses a local Vite server at the same address. For access from another device on a trusted LAN, start Vite with `npm run dev -- --host 0.0.0.0`, then use the host computer's LAN address. This is a development server, not a production deployment. A shell without npm should use its approved Node/npm installation or project setup instructions; don't edit package scripts to compensate for a machine-specific PATH issue.

## Where to change behavior

| Change | Owning code |
| --- | --- |
| Route/hash, step guard, global navigation | `src/app/App.tsx`, `AppShell.tsx` |
| Shared workflow state or transition | `src/domain/workflow/workflowReducer.ts`, validation module and workflow tests; keep React Context as adapter |
| Product name/image/category/capability or preview placement | `src/data/products.ts`, `src/data/imprintCapabilities.ts`, `src/types/workflow.ts` |
| Catalog search/filter/card/sidebar | `src/features/selection` |
| Shared selected row or sidebar contract | `SelectedProductRow`, `SelectedProductsList`, `SelectedProductsSidebar` and their CSS Modules |
| Logo validation/upload lifetime | `BrandReview.tsx`, `logoValidation.ts`, related tests |
| Shared imprint form fields | `ImprintTextFields`, `ImprintForm`, `LogoValidationMessage` |
| Desktop Step 2 preview | `ProductPreviewPanel` and `PreviewArtwork.module.css` |
| Responsive configure list/preview and gestures | `ResponsiveStep2`, `ProductConfigurationCard`, `ProductPreviewCarousel` |
| Shared design value/control | `tokens.css` or `src/components`, only when a real cross-feature role exists |

## Component and state decisions

Create a component when it has a clear responsibility, a stable interface, or a real reuse/interaction boundary. Keep short page-specific composition in its feature. Do not extract just because a file is long or because an Atomic Design category suggests another folder. Prefer data and callbacks over a child reaching into unrelated state. Keep global workflow decisions in the reducer; avoid keeping a second copy of derived values in component state.

For a new responsive state, identify its owner first. Keep responsive mode state in `BrandReview` when it coordinates both compositions; keep local transient gesture state inside the carousel. Add the smallest CSS Module rule to the component that owns the visual behavior. Preserve the 1280px desktop split, fixed responsive footer, full-width progress track, rail/list scrolling, and safe-area spacing unless the task explicitly changes them.

## Product preview mapping

Product image and imprint overlay placements use percentages in the product catalog. `PreviewArtwork.module.css` positions logo and text overlays relative to a product artboard. Keep dynamic text, visibility, and bold values tied to imprint/workflow state. When changing an artwork, verify the product in desktop and responsive preview at the same aspect ratio; never treat these prototype coordinates as manufacturing specifications.

## Accessibility and responsive contracts

- Use native buttons, inputs, and checkboxes; use `aria-pressed` for toggle-style buttons, `role="switch"` only for the desktop preview switches that expose that contract, and tab semantics for the Configure Products tabs. Preserve visible focus styles and names tied to product/action labels.
- Keep headings and live status/alert roles intact; preserve focus movement on route changes and focus restoration after keyboard removal.
- The product grid supports keyboard selection; responsive tabs support arrow/Home/End keys; the carousel supports keyboard navigation and pointer/touch swipe without swallowing vertical scrolling.
- Below 1280px, Step 1 and Step 2 use responsive compositions. Progress spans the viewport; the action footer stays fixed and accounts for the safe area. Step 2 has Imprint and Configure modes and a List/Preview tab pair.
- The shared desktop rail keeps its heading and actions visible while selected-product groups scroll. Responsive List mode scrolls above the fixed footer; Preview preserves a 24px footer clearance and keeps product identity/status controls stationary while the artwork area adapts.
- Editable text inputs stay at least 16px on mobile to prevent iOS Safari's automatic focus zoom. Intentional pinch zoom remains enabled.
- Reduced-motion preferences suppress progress and preview motion. Preserve this when changing animation timing or transition state.
- Chromium assertions cover geometry, keyboard semantics and interaction behavior. They do not establish native iOS Safari rendering or assistive-technology usability. Use a real iPhone/Safari pass for those claims.

## Figma and visual verification

Use the latest approved Figma frame, not a historical validation PNG as the design source. Match viewport, DPR, browser zoom, route, selected product IDs, active product, logo/text settings, and field content. Wait for document fonts and visible images. Compare corresponding regions. Use bounding-box/computed-style assertions for exact spacing and dimensions, and screenshots for overall hierarchy and raster differences. Keep known device/browser rendering differences separate from layout findings. Existing capture scripts and phase evidence are linked from the [architecture index](README.md); follow a specific script's own usage notes before running it.

## Test layout

`tests/workflow-domain.spec.ts` covers pure reducer/readiness rules. Feature specs cover route guards, search/selection, upload validation, branding settings, and completion. Responsive specs cover several viewport widths, fixed footer/progress, scroll behavior, safe areas, carousel gestures, reduced motion, and control-token contracts. Visual specs capture deterministic Step 1/Step 2 states. Playwright is configured serially with one worker, Chromium, DPR 1, and local Vite. Full suite is the final regression gate; focused tests are faster during iteration.

## Known test caveat

`tests/selection.spec.ts` awaits `document.fonts.ready` before checking Aileron weights 300, 400, 600 and 700, matching the four declared `@font-face` weights. One historical intermittent failure therefore cannot be attributed to a missing font-readiness wait. The cause remains unverified; asset availability or the specific weight checks may still warrant investigation if the failure recurs. Phase 5B left the test, font files, declarations, typography and Playwright configuration unchanged.

## Safe worktree practice

Before editing a checkout with existing user changes, inspect `git status` and protect the baseline. Never overwrite, stage, commit, stash, reset, or clean unrelated work. Keep visual evidence and generated outputs attributable to the current change. The architecture history is useful evidence, but current behavior should be verified from code and tests.
