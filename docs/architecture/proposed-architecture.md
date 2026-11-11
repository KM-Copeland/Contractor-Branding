# Proposed architecture

The current feature-first structure is a sound base. The proposal clarifies boundaries without rebuilding the app or imposing folders for the sake of a pattern.

## Target responsibilities

- `src/app`: app composition, hash routing, shell coordination, and workflow provider.
- `src/components`: genuinely shared controls and cross-feature interaction patterns, with their CSS Modules.
- `src/features/landing`: home content and entry action.
- `src/features/selection`: catalog filtering/selection UI and selection-specific composition.
- `src/features/branding`: imprint form, product configuration, live preview, and responsive Step 2 compositions.
- `src/domain/workflow`: currently owns the pure workflow reducer, initial state/action definitions, and completion validation. These modules consume shared types from `src/types` plus the product catalog and capability helper from `src/data`; those files remain in their existing locations for now.
- `src/data`: product catalog and local asset mapping; later, a repository/API boundary only if a backend is introduced.
- `src/styles`: global reset, font faces, and CSS semantic tokens.

The initial `domain/workflow` boundary is implemented without moving shared types, catalog data, or capability helpers. Keep React Context as the app's small state container; the current scope does not justify a new state library. Move other files only when a later phase establishes a concrete ownership need.

## Data flow

User actions enter feature components. Components call narrow context actions. The reducer validates and applies workflow transitions. Feature views derive display state from the selected product, capability data, and shared imprint. Validation helpers remain pure and testable. Hash routing stays at the app boundary and translates navigation to screen state; it should not become a second source of product/imprint state.

## Component organization

Use Atomic Design as an inventory and decomposition aid, while keeping files feature-first. Phase 4A extracted `ImprintForm`, `ImprintTextFields`, and `LogoValidationMessage` into feature-owned files with narrow prop contracts. Phase 4B extracted the desktop `ProductPreviewPanel` into its own feature-owned file with a narrow data-and-callback interface; its private switch control moved with it. Phase 4C extracted `ProductPreviewCarousel` into its own feature-owned file, moving gesture, slide-summary, and animation state with the responsive interaction while keeping a narrow input/callback contract. Phase 4G gives the desktop and responsive Step 2 screen compositions separate feature-owned files; `BrandReview` remains their orchestrator and owner of shared upload and workflow integration. Shared presentation values and contracts live in `step2Presentation.ts`. The desktop panel and responsive carousel remain separate experiences with separate components. Keep shared products sidebar/rows where they are unless a demonstrated cross-feature interface requires change.

## Design tokens

Keep `tokens.css` as the one runtime source. Add semantic aliases with exact values first, then migrate shared components incrementally. Figma may remain the design source, but don’t create a second machine-readable token pipeline until an actual sync/client requirement exists.

## Error and accessibility boundaries

Keep file parsing/validation outside visual form composition. Keep keyboard behavior, accessible labels, focus restoration, carousel gestures, and responsive view state explicit at the component that owns each interaction. Step 1 and Step 2 currently use a fixed responsive action footer and do not have a selected-products drawer. The reducer remains the final guard for invalid per-product configurations.
