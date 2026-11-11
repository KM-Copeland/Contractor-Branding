# Component inventory and Atomic Design classification

Atomic Design is used here as a way to describe component scale, not as a mandate to create global `atoms/`, `molecules/`, and `organisms/` folders. Keep feature-specific compositions near their state and styles. Promote only proven cross-feature primitives to `src/components`.

| Current component or group | Responsibility | Atomic lens | Notes |
| --- | --- | --- | --- |
| `Button`, `BackButton`, `FilterPill` | Actions and filter selection | Atoms | Button and BackButton share an action primitive but have distinct interaction intent. |
| `BrandingToggle`, product capability/status icons | Small state controls and indicators | Atoms / molecules | Semantics differ between editable toggle and read-only status; don’t merge solely because both show logo/text. |
| `SearchInput` | Search icon, editable field, clear affordance | Molecule | Used by product catalog; input behavior belongs to the component contract. |
| `Panel`, `NoticeDialog` | Framing and error/notice presentation | Molecule / organism | Panel is generic but currently thin; avoid a broad design-system abstraction without further consumers. |
| `WorkflowProgress` | Workflow stage and progress track | Molecule | Shared shell-level component with responsive geometry and animation requirements. |
| `ResponsiveActionFooter` | Fixed bottom Back/Continue actions | Molecule | Shared across responsive workflow modes; safe-area behavior is a component responsibility. |
| `ProductCard` + `ProductImprintCapabilities` | Catalog item, selection state, supported imprint indicators | Molecule | Feature-specific; preserve image proportions and keyboard semantics. |
| `SelectionPanel` + `SelectedProductsSidebar` | Selection summary and actions | Organism | Sidebar content is shared with Step 2; scrolling list and fixed header/actions have separate roles. |
| `CompletionScreen` | Final configured-product summary, removal, clear, and return to product editing | Page | Uses the selection feature styles and preserves the existing `#complete` and legacy `#selection-ready` routing behavior. |
| `SelectedProductsList` + `SelectedProductRow` | Categorized selected products and remove/status actions | Organism / molecule | Shared row and grouping behavior should remain the common source. |
| `branding/ImprintTextFields.tsx` | Two optional lines, counters, bold controls; consumes imprint data and line/bold callbacks | Molecule | Used by desktop and responsive imprint views; `ImprintTextFields.module.css` owns internal controls while `BrandReview.module.css` keeps the shared `.fieldGroup`/`.textGroup` wrapper contract. Editable input styling retains the mobile Safari 16px minimum. |
| `branding/ImprintForm.tsx` | Desktop imprint-details panel; receives imprint data, validation state, file input ref, and upload/edit callbacks | Organism | Parent `BrandReview` still owns upload validation and workflow state. `ImprintForm.module.css` owns form interior presentation; `BrandReview.module.css` retains panel framing, shared group layout, hidden input, and validation progress. |
| `branding/LogoValidationMessage.tsx` | Accessible success, warning, and error feedback | Molecule | Shared by desktop and responsive imprint views; consumes only `LogoValidationResult` and owns intrinsic states and responsive success treatment in `LogoValidationMessage.module.css`. |
| `ProductConfigurationCard` | Per-product logo/text settings and configured state | Molecule | Capability and completeness state should agree with reducer validation. |
| `ProductPreviewPanel` | Desktop active-product controls, product artwork, and logo/text overlays | Organism | Receives active/selected products, derived imprint configuration and data, and narrow navigation/branding callbacks. Remains presentational. `ProductPreviewPanel.module.css` owns desktop controls, switches, product identity, stage, and artboard; `PreviewArtwork.module.css` owns artwork and overlays shared with the responsive carousel; `BrandReview.module.css` retains parent framing. |
| `branding/ProductPreviewCarousel.tsx` | Responsive preview carousel, artwork, pointer/touch and keyboard navigation, stationary summary and controls | Organism | Owns gesture and animation state behind a focused data-and-callback interface; `ProductPreviewCarousel.module.css` owns intrinsic styling, `BrandReview.module.css` supplies parent preview-mode constraints, and `PreviewArtwork.module.css` supplies shared artwork. Kept separate from desktop `ProductPreviewPanel`. |
| `branding/BrandReview.tsx` | Workflow integration, selected/active product and configuration derivation, upload lifecycle, and desktop/responsive selection | Template / page orchestrator | Owns shared state and responsive Imprint/Configure/List/Preview state; passes focused contracts to both screen compositions. |
| `branding/DesktopStep2.tsx` | Desktop Step 2 screen composition | Template / page | Assembles imprint form, live preview, selected-products sidebar, and action row; applies the defined `main` CSS Module class while preserving the valid expanded-state modifier on its layout. |
| `branding/ResponsiveStep2.tsx` | Responsive Step 2 screen composition | Template / page | Assembles responsive imprint and configure modes, fixed footer, list/preview tabs, and progress/scroll effects; uses the existing `BrandReview.module.css`. |
| `branding/step2Presentation.ts` | Shared presentation prop contracts and the default per-product branding configuration | Feature contract | Keeps screen dependencies explicit and defaults consistent without creating another state layer. |
| `StepOneScreen` | Search, category filtering, product grid, selection sidebar | Template / page | Product selection remains feature-owned. |
| `LandingScreen` | Entry point and onboarding content | Page | Starts workflow at the actual entry state. |
| `AppShell`, `App` | Navigation chrome, workflow route/state coordination | Shell / application | Keep routing thin and shared layout global. |

## Suggested inventory boundary

Keep page composition in `src/features/{landing,selection,branding}`. Keep `Button`, search, progress, and responsive action primitives in `src/components`. Keep catalog data, workflow state, capability rules, and validation as domain/data modules rather than presenting them as UI atoms. This keeps the classification useful without turning it into a folder reshuffle.

For current prop details and accessibility contracts, see the [component reference](component-reference.md). This inventory is a historical audit artifact; the new reference is the maintained handoff catalog.
