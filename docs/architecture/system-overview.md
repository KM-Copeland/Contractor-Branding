# System overview

This is a client-only React prototype for selecting product families, preparing a shared imprint, configuring it per product, and reviewing the result. It uses React 19, TypeScript, Vite, CSS Modules, CSS custom properties, local product data/assets, and Playwright. It has no backend, router library, UI kit, persistence layer, or external state package.

## Source map

| Path | Owns |
| --- | --- |
| `src/app` | Application composition, hash navigation, shell, and workflow provider |
| `src/components` | Shared controls, workflow progress, responsive action footer |
| `src/features/landing` | Step 0 entry screen |
| `src/features/selection` | Product catalog, filters, selection rail/list, completion screen |
| `src/features/branding` | Imprint editing, logo validation, per-product controls, desktop preview, responsive carousel, Step 2 composition |
| `src/domain/workflow` | Pure reducer, initial state, action union, and configuration-readiness rules |
| `src/data` | Product catalog, image mapping, category and imprint capability rules |
| `src/types` | Shared product and workflow types |
| `src/styles` | Font faces, global rules, and the single runtime token source |
| `docs/architecture` | Current architecture guides and retained phase-by-phase evidence |

## State and navigation flow

`App.tsx` translates hash routes into screens and navigation callbacks. `WorkflowProvider` in `WorkflowContext.tsx` owns one reducer-backed `WorkflowState`; the hash is navigation state, not storage for selection or imprint content. Refreshing resets the prototype to its initial state. The Step 1 screen remains mounted while hidden so its local search query and category filter survive navigation to Step 2 and back.

User events flow from a feature component to a narrow context callback, then to `workflowReducer`. The reducer updates selected IDs, active preview family, shared logo/text, bold flags, per-product settings, and workflow step. Product data and capability metadata are read from `src/data`. Pure validation in `domain/workflow/workflowValidation.ts` is the single completion-readiness rule. UI switches also derive disabled/visible state for immediate feedback; the reducer remains the final rule enforcer.

Step 2 upload orchestration stays in `BrandReview`: it validates the chosen local file, creates/revokes preview object URLs, and passes the result and callbacks down. `logoValidation.ts` checks file characteristics in the browser. It does not submit the logo or establish production approval.

## Screen composition

```text
App
└─ WorkflowProvider
   └─ Workflow
      ├─ AppShell (navigation + WorkflowProgress)
      ├─ LandingScreen
      ├─ StepOneScreen
      │  └─ SelectionPanel → SelectedProductsSidebar → SelectedProductsList → SelectedProductRow
      ├─ BrandReview (state integration, upload lifecycle, responsive mode)
      │  ├─ DesktopStep2 → ImprintForm + ProductPreviewPanel + SelectedProductsSidebar
      │  └─ ResponsiveStep2 → ImprintTextFields / ProductConfigurationCard / ProductPreviewCarousel
      └─ CompletionScreen (current completion screen)
```

The desktop Step 2 workspace contains the imprint panel, preview panel, and selected-products rail. At widths below 1280 CSS pixels, Step 2 switches to Imprint and Configure Products views; Configure Products has List and Preview tabs. Responsive Step 1 and Step 2 use the fixed shared action footer and full-width workflow progress. The desktop selected-products rail stays integrated at the right edge; its product groups scroll independently while the heading and actions stay visible.

## Styling ownership

Global reset, font declarations, and design custom properties live in `src/styles`. Shared controls own `Controls.module.css`; shared progress and action components each own their styles. Feature components use colocated CSS Modules. `BrandReview.module.css` still owns important parent-level Step 2 workspace and responsive composition constraints. `PreviewArtwork.module.css` owns artwork and imprint overlays shared by desktop preview and carousel. Product-specific overlay coordinates remain in the product records because those values describe each artwork's imprint mapping, not a reusable page style.

## Boundaries to preserve

- Keep React orchestration in `src/app`, reusable shell controls in `src/components`, and page-specific behavior in feature folders.
- Keep pure workflow rules outside React and CSS.
- Keep the product catalog as static local data until an actual service requirement exists.
- Keep desktop preview and responsive carousel as distinct interactions; share artwork and domain inputs where they already agree.
- Do not move files into Atomic Design folders just to satisfy a taxonomy. Atomic labels are documented in the [component reference](component-reference.md).
