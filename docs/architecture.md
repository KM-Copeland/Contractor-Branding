# Architecture — Contractor Branding prototype through Phase 4C

React, TypeScript, Vite, CSS Modules, CSS custom properties and Playwright provide the prototype foundation. The product catalog and original Figma images are typed local mock data. Aileron OTF weights are loaded locally.

## Component hierarchy

`App` owns `WorkflowProvider` and route synchronization. `Workflow` keeps `StepOneScreen` mounted while `BrandReview` is active so search/filter state survives Back navigation. `AppShell` renders the shared header/footer. `BrandReview` composes `WorkflowProgress`, the preview, shared imprint form and selected-product switch list. The local completion panel ends the flow without sending an order or production request.

`BrandReview` uses the same React state for all six Figma combinations. Expansion changes layout, active product changes the image, shared imprint fields change the overlays, and each selected family has its own switches. The desktop preview and responsive carousel are separate feature-owned components with narrow prop contracts; the carousel owns its pointer/keyboard interaction and summary animation state. There are no hardcoded per-frame screens.

The desktop preview's controls, switches, product identity, stage, and artboard now live in `ProductPreviewPanel.module.css`. `BrandReview.module.css` still owns the panel and heading framing plus the artwork and imprint overlay rules shared with the responsive carousel. See the [Phase 4D CSS ownership record](architecture/phase4d-desktop-preview-css-ownership-record.md) for before/after evidence.

## Typed state and data flow

- `ProductFamily` has a stable ID, category, names, local Figma image, source-node reference and structured `imprintCapabilities` (`supportsLogo`, `supportsText`, `supportsSimultaneousImprint`).
- `WorkflowState` stores selected IDs once; shared imprint fields; logo/text switches keyed by product-family ID; active preview family and expansion; and the current step.
- Catalog selectors derive the selected product list and count. The preview reads the active ID and that family's switch configuration.
- Reducer actions update one source of state. Back changes the route and step but retains the selection, imprint, per-family settings, preview target and expansion state. Removing a selected family retains its configuration so reselecting it within the same session restores it.
- Product cards derive compact capability indicators and accessible descriptions from `imprintCapabilities`. Sensi Smart, 80 Series and Sensi Equipment Interface Module support simultaneous logo and text; other products retain the current Step 2 behavior of mutually exclusive logo/text, except Blue Series 12 Inch Touch, which is text-only.
- No catalog product currently has logo-only capability metadata. The reusable indicator handles that combination for future catalog entries without assigning it to a product whose existing capability data does not support the claim.
- Step 2 consumes the same metadata for switch availability, reducer enforcement, valid-imprint checks and preview rendering. Incompatible shared logo/text content is retained; it is not erased when a product cannot use it. No current Step 2 capability-enforcement gap was found for the catalog represented here. Product capability claims still reflect the prototype's existing rules and have not been independently verified against manufacturing specifications.
- Continue requires at least one selected family with enabled, non-empty logo/text content. The selection panel may include other families with both switches off.

`LogoAsset` stores the file name, MIME type, byte size and object URL. PNG/SVG are previewed locally; EPS/PDF can be chosen but have no browser rendering path. Local upload size is capped at 10 MB. The UI explicitly says print criteria have not been checked.

The product PNGs and uploaded logo are rendered as live image layers, with two live text lines, inside a CSS preview artboard. This is dynamic composition rather than a screenshot for each state. Each catalog family can define separate logo and text positions. Six thermostat families now use placements matched to the user's references; models still awaiting reference-to-family mapping retain the Sensi proportional approximation. Product artwork coordinates are prototype placements, not verified manufacturing specifications.

## Navigation

The hash distinguishes `#select-products`, `#brand-review` and the local `#complete` review endpoint. The historical `#selection-ready` hash remains an alias to Step 2 for compatibility. A hash listener supports browser Back/Forward and blocks empty forward routes. The provider persists across both screens; refresh resets the local prototype session.

## Validation

The Phase 3 Playwright suite covers single and multiple selected families, logo/text population, product-specific capability rules, logo removal, preview changes, expansion, Back/Forward state retention, validation and local completion. Six screenshots at 1280px cover the empty, populated and active-switch states in expanded and collapsed layouts. See `validation/phase3/README.md`.
