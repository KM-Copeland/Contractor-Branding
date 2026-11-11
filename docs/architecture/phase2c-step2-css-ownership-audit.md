# Phase 2C: Step 2 CSS ownership and redundancy audit

## Scope and decision

This is a read-only audit of the current Step 2 implementation. No application source, stylesheets, or tests were changed for this report. The working tree already contained substantial in-progress changes; a protected copy was made before validation at `C:\Users\welau\.codex\visualizations\2026\10\08\01a11c5d-9825-7c83-8a1d-72a5d2451728\phase2c-protected-before-step2-css-audit-2026-11-09`.

The largest ownership problem is real: `BrandReview.module.css` has 320 lines and styles both the desktop Step 2 workspace and the distinct responsive Step 2 flow. The stylesheet is not all one undifferentiated component, though. Product configuration cards, branding toggles, selected-products rows, sidebar shell, and responsive action footer already have separate modules. The safest next step is small, evidence-backed redundancy cleanup first, then consider matching CSS boundaries to extracted React components in a separately approved phase.

## Runtime composition

`BrandReview` chooses the desktop or responsive React tree using a `matchMedia('(max-width: 1279px)')` state (initially seeded from the current viewport and then subscribed to changes). At steady widths through 1279px, `ResponsiveStep2` renders three views: imprint details, Configure Products/List, and Configure Products/Preview. The List view renders configuration cards; Preview renders a carousel. At 1280px and above, `DesktopStep2` renders the imprint form and live preview side-by-side, with the shared selected-products sidebar at the right. This means desktop selectors overridden in `@media (max-width: 1279px)` can still participate briefly during a resize, between the CSS viewport change and React's media-query state update. They are not safe to remove merely because the settled responsive tree does not use the matching desktop markup.

The shared selected-products sidebar owns the rail header and action area. `SelectedProductsList` owns the group list and row layout; its `.sidebarGroups` element is the scrolling region. `ResponsiveActionFooter` is a separate fixed mobile/tablet footer, hidden at desktop width. These modules share the workflow but not selector ownership.

## Component-to-selector ownership inventory

| React owner | `BrandReview.module.css` selectors it consumes | Notes |
| --- | --- | --- |
| `DesktopStep2` in `BrandReview.tsx` | `.main`, `.pageGrid`, `.primaryColumn`, `.intro`, `.layout`, `.expanded`, `.workspace`, `.actions`, `.actionRow` | Desktop page grid, primary region, form/preview workspace, and desktop action wrapper. `.expanded` is a real layout modifier on `.layout`. |
| `ImprintForm` | `.formPanel`, `.formHeading`, `.hint`, `.fieldGroup`, `.dropzone`, `.uploadIcon`, `.hiddenInput`, `.uploadGuidance`, `.validationProgress`, `.fileCard`, `.logoThumb`, `.removeFile`, `.sharedNote` | Owns desktop logo upload and shared imprint-note presentation. `.validationProgress` is reused by the responsive form. |
| `ImprintTextFields` | `.textGroup`, `.lineField`, `.lineControls`, `.inputWrap`, `.boldButton`, `.boldButtonActive` | Shared by both React compositions. Desktop passes both `.fieldGroup` and `.textGroup`; responsive passes only `.textGroup`, explaining why the repeated small-label styling is not redundant. |
| `LogoValidationMessage` | `.validation`, `.validationIcon`, `.validationContent`, `.validationTitle`, `.validationDetails`, plus dynamic `.validationSuccess`, `.validationWarning`, `.validationError` | The status modifier is computed as `styles[\`validation${CapitalizedStatus}\`]`; absence from a literal `styles.foo` search does not make these selectors unused. Responsive markup intentionally suppresses some successful-result detail while desktop presents the full message. |
| `ProductPreviewPanel` and desktop `Switch` | `.previewPanel`, `.panelHeading`, `.carouselControls`, `.applyBar`, `.switchLabel`, `.switch`, `.switchOn`, `.switchDisabled`, `.previewProduct`, `.previewStage`, `.stageExpanded`, `.artboard`, `.productArt`, `.brandLogo`, `.brandText` | Preview geometry, product-specific toggles, and imprint overlays. Logo/text placement is data-driven with inline product placement styles; that is intentional dynamic geometry. |
| `ResponsiveStep2` | `.responsiveMain`, `.responsiveContent`, `.responsiveIntro`, `.mobileForm`, `.mobileFieldGroup`, `.mobileDropzone`, `.mobileUploadIcon`, `.mobileFileCard`, `.mobileLogoThumb`, `.mobileFileTitle`, `.mobileFileName`, `.mobileRemoveFile`, `.mobileQuality`, `.mobileSharedNote`, `.configureTabs`, `.configureTab`, `.configureTabIcon`, `.configureTabSelected`, `.configurePanel`, `.configurationList`, `.previewMode` | Owns responsive view shell, upload form, Configure Products tabs, and list/preview mode. The `mobile*` names also apply to tablet widths up to 1279px. `.previewMode` means the responsive Configure Products/Preview state, not desktop expanded preview. |
| `ProductPreviewCarousel` | `.previewCarousel`, `.carouselViewport`, `.carouselTrack`, `.carouselDragging`, `.carouselSlide`, `.mobilePreviewStage`, `.mobileArtboard`, `.pagination`, `.paginationActive`, `.previewStationary`, `.mobileProductSummary`, `.summaryFadingOut`, `.summaryFadingIn`, `.mobileProductIdentity`, `.previewStatus`, `.mobileProductType`, `.mobilePreviewActions`, `.previewOptions`, plus shared `.productArt`, `.brandLogo`, `.brandText` | Carousel uses inline transform for its active slide and supports pointer/touch drag. Width and height queries constrain artboard geometry; the static selectors remain necessary even when their modifier classes are not active in every frame. |
| `ProductConfigurationCard` in its own module | `.card`, `.productHeader`, `.thumbnail`, `.identity`, `.statusIcon`, `.options` | This separate module owns card layout and configured-state indicator for responsive List mode. |
| `BrandingToggle` in its own module | `.toggle`, `.selected`, `.disabledIcon` | Shared toggle button used in configuration cards. Disabled states reflect capability and available imprint input. |
| `SelectedProductsSidebar` in its own module | `.sidebar`, `.panel`, `.header`, `.footer`, `.selection`, `.branding` | Shared desktop rail shell, mode treatment, header, and footer; not owned by the Step 2 stylesheet. |
| `SelectedProductsList` / `SelectedProductRow` in their own modules | `.productGroups`, `.sidebarGroups`, `.productGroup`, `.groupHeading`, `.productList`, `.productRow`, `.activeRow`, `.productIdentity`, `.productImage`, `.productDetails`, `.productName`, `.statusGroup`, `.statusIcon`, `.activeVisibility`, `.removeButton`, `.removeText` | The list module owns grouping, scrolling, and selected product row presentation. `SelectedProductRow` adds mode/active classes and capability status. |
| `ResponsiveActionFooter` in its own module | `.footer` | Responsive fixed Back/Continue controls, safe-area padding, and tablet gutter. It is not part of `BrandReview.module.css`. |

The `sr-only` class in the desktop upload markup comes from global CSS, not the Step 2 module. The `data-*` selectors used for accessibility, tests, and focus restoration are contracts separate from CSS Module class ownership.

## Cascade and breakpoint map

| Source range | Role and inheritance |
| --- | --- |
| `BrandReview.module.css:1-155` | Desktop base layout and component rules. This defines the main grid and desktop workspace, form, validation, preview, toggles, overlays, and action wrapper. |
| `:157-176` | Tablet/mobile overrides for the desktop selector family through 1279px. They adjust shell, intro, panels, form, controls, and action wrapper. The responsive React tree normally replaces this composition at these widths; during resize transitions, the media rules can still momentarily affect the previous tree. |
| `:179-207` | Small-screen refinements through 767px for the desktop selector family, with the same transition caveat. |
| `:208-244` | Responsive composition shell and Preview-mode layout, sizing, reduced-height fallback support. `.previewMode` and its descendants activate only in responsive Configure Products/Preview. |
| `:246-304` | Responsive form, configuration tabs/list, carousel, summary, and actions. This block includes a duplicate `.responsiveIntro` declaration at line 246, immediately followed by descendant rules. |
| `:305-316` | Tablet-specific responsive gutters, two-column configuration list, and carousel/artboard sizing for 768–1279px. |
| `:317-320` | `prefers-reduced-motion` disables carousel and summary transitions. |

At 1280px, the media query switches composition. This is a structural breakpoint, not just a card-size adjustment. Keep the JavaScript query and CSS ranges aligned. The CSS also uses `100cqh` behind `@supports` to scale responsive preview art within the available container height, with a short-height fallback for max-height 500px.

## Observed live behavior

One-off Playwright probes ran at 390×844, 768×1140, 1024×768, 1279×800, 1280×900, 1440×900, and 1920×1080. At 390px, responsive imprint panel width was 350px and Line 1 computed to 16px. At 768, 1024, and 1279px the responsive form filled the available content width (728, 984, and 1239px respectively), with the input still 16px. At 1280 and 1440px the desktop form measured 320×752px with a 14px input; at 1920px the fluid desktop form measured 448×752px, also with a 14px input. These are observed computed values, not claims about native Safari itself.

Uploading SVG in the responsive path produced the warning status class in the live DOM. List mode rendered a grid at tablet widths and a flex list at the narrow phone width; Preview mode rendered the 343px carousel viewport, `overflow:hidden`, and `touch-action:pan-y`. Desktop uploaded-logo inspection also exposed the literal `undefined` class token described below. The user interface has no visible expand/collapse preview button; the existing Step 2 tests assert that there is no such button, and `setPreviewExpanded` has no application call site beyond the workflow context. Therefore desktop expanded behavior could not be reached through the current UI. Its stylesheet and state wiring were reviewed statically, but no claim of live expanded-state validation is made.

## Dynamic, conditionally rendered, and externally owned rules

- `.expanded` and `.stageExpanded` are applied from `state.preview.expanded`. They have CSS declarations, but the current UI has no reachable control to set this state. Treat them as inactive/unreachable behavior pending product intent, not as proven dead CSS.
- `.carouselDragging`, `.summaryFadingOut`, and `.summaryFadingIn` are state-dependent transient classes. They are expected to be absent in a resting screenshot.
- `.validationSuccess`, `.validationWarning`, and `.validationError` are selected through a dynamic CSS Module property. The warning path was observed live. The existing upload and branding test suites exercise successful, warning, and error result handling; preserve the shared `.validation*` group when resolving unused-looking names.
- `.brandLogo` and `.brandText` render only when their product supports that imprint type, the corresponding per-product option is enabled, and input exists. Their exact positions come from product data via React inline styles.
- `.mainExpanded` and `.mainHasImprint` are referenced in `BrandReview.tsx` but have no matching selectors in this module. When the corresponding condition is true, CSS Modules resolve the property to `undefined`; JavaScript string interpolation therefore adds the literal `undefined` token to `<main>`'s class attribute. No CSS rule is thereby activated, and no layout effect was observed. This is an implementation defect/candidate to resolve, not a CSS selector to invent without confirming intent.
- `.fileInfo`, `.success`, `.pending`, and `.error` are declared in `BrandReview.module.css` but have no JSX/module references in runtime source. These are confirmed orphan selector candidates. They are distinct from `.validationSuccess`, `.validationWarning`, and `.validationError`, which are live dynamic variants.
- `.actions` sets `gap:0` and `margin-top:0` at line 154, then repeats both declarations at the max-1279px breakpoint. The responsive composition normally does not render this wrapper, so the responsive redeclaration has no steady-state consumer; retain `.actions` desktop structure.
- `.responsiveIntro { margin: 0 0 20px; }` appears once at line 246. There is no second identical adjacent declaration in the current file; the earlier static scan that suggested a duplicate was incorrect. Do not remove it as duplicate.
- `.fieldGroup h3 small` and `.textGroup h3 small` repeat visual values, but are not equivalent selectors at responsive widths: the responsive text fields receive `.textGroup` without `.fieldGroup`. Preserve both unless markup ownership changes.

## Token and inline-style boundary

`BrandReview.module.css` consumes shared layout and color tokens including `--app-page-gutter`, `--sidebar-width`, `--column-gap`, `--space-8`, `--responsive-page-gutter`, `--responsive-action-clearance`, `--color-text`, `--color-muted`, and `--color-primary`. `.configureTabIcon` consumes `--icon-mask`. The selected-products and action-footer modules consume their own semantic surface, border, selected-state, action, and safe-area tokens. Many Step 2 rules still use direct values for spacing, border colors, and status colors; this is an observed migration opportunity, not a reason to change values during an ownership audit. Keep token migration separate from selector cleanup so visual behavior remains attributable.

Inline styles carry state or product data rather than stable appearance: carousel slide translation and drag offset, product-specific logo/text placement, and per-line bold weight. Product placement coordinates belong to product data because they vary by artwork. Do not move these values into broad stylesheet selectors during a CSS organization pass.

## Naming and ownership recommendations

Names such as `.main`, `.layout`, `.workspace`, `.panelHeading`, `.actions`, and `.expanded` are generic within an already large feature stylesheet. Names prefixed `mobile*` describe the original target, but the same styles own tablet composition through 1279px. `.previewMode` is ambiguous because it means responsive Configure Products/Preview, while `.expanded` means a different desktop preview state. If later extraction is approved, use owner/domain names that reflect those distinctions (for example, responsive configuration preview versus desktop expanded workspace). Renaming alone does not improve ownership; pair it with an actual React/CSS boundary.

## Suggested future stylesheet boundaries

1. **Step 2 shell and desktop workspace:** `.main`, `.pageGrid`, `.primaryColumn`, `.intro`, `.layout`, `.workspace`, and desktop action wrapper, co-located with the extracted desktop composition.
2. **Imprint form and upload validation:** desktop and responsive upload surfaces plus the shared validation message, split only if React ownership is also separated. Keep shared input/text-field styles with the shared `ImprintTextFields` component.
3. **Desktop preview:** panel heading, product settings, switches, stage, artboard, and overlays with the desktop preview component.
4. **Responsive configure shell and list:** responsive intro/tabs/panel plus configuration list; retain the already separate `ProductConfigurationCard` and `BrandingToggle` modules.
5. **Responsive preview carousel:** viewport, track, slides, pagination, summary transitions, and preview sizing, co-located with `ProductPreviewCarousel`.

Do not split the stylesheet mechanically by line range: the shared form fields, validation, artboard overlays, and breakpoint overrides cross those seams. Establish React ownership first, then move selectors with their consumers and compare rendered states.

## Phase 2D recommendation

The following are recommendations only; no runtime cleanup was performed in Phase 2C.

| Order | Candidate | Risk | Evidence and validation |
| --- | --- | --- | --- |
| 1 | Remove only the confirmed `.fileInfo`, `.success`, `.pending`, and `.error` orphan rules. | Low | No runtime references found. Re-run logo no-file/success/warning/error states and desktop/responsive screenshot checks; retain all `.validation*` classes. |
| 2 | Remove the redundant max-1279 `.actions` `gap` and `margin-top` declarations, keeping the base values. | Low | The same values already exist at the base selector. Verify desktop action row and the responsive footer at 390, 768, and 1279px. |
| 3 | Decide whether `.mainExpanded` / `.mainHasImprint` were intended to change layout. Remove the undefined lookups if they have no product requirement; otherwise define explicit selectors and their expected behavior. | Low for removing inert class tokens; medium if creating new behavior | Confirm with product intent, inspect computed class before/after details, and verify desktop form/preview layout. The current preview-expanded state has no reachable UI control, so don’t claim its user flow is covered. |
| 4 | Consider component-aligned stylesheet extraction only after the JSX component boundaries are reviewed. | Medium/high visual regression risk | Migrate one owner at a time and compare 390, 768, 1024, 1279, 1280, 1440, and 1920px in both responsive List and Preview, desktop no-imprint/imprint, warning/error, and selected-product states. |

There is no duplicate `.responsiveIntro` rule to remove based on current source. Keep `.textGroup h3 small` even though its declarations resemble `.fieldGroup h3 small`; the responsive DOM uses the former selector path without the latter ancestor.

## Phase 4D ownership update

The desktop `ProductPreviewPanel` selectors identified above were subsequently extracted to `ProductPreviewPanel.module.css` in [Phase 4D](phase4d-desktop-preview-css-ownership-record.md): preview controls, apply bar, switches, product identity, stage, and artboard. The shared `.previewPanel` and `.panelHeading` framing, their parent layout relationships, and `.productArt`, `.brandLogo`, and `.brandText` remain in this stylesheet. The responsive carousel continues to use only `BrandReview.module.css`; Phase 4D did not move its styles or change their values.

## Validation record

Before writing this report, the following baseline checks passed:

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit`
- Production build: `node node_modules/vite/bin/vite.js build`
- Focused Playwright suite: 49 tests passed across `brand-review.spec.ts`, `responsive-step2-fidelity.spec.ts`, `configuration-completeness.spec.ts`, and `shared-selected-products.spec.ts`.
- Computed geometry and class probes: seven viewport sizes listed above, plus responsive SVG warning and List/Preview mode checks.

The focused Playwright tests write screenshot/geometry outputs under `docs/validation`. Those generated files were compared against the protected pre-validation copy and restored where validation changed existing project artifacts. No new test was added and no test source was edited for this audit. Native iOS Safari input-focus behavior remains a real-device check; Chromium computed styles do not prove Safari zoom behavior.

## Reference

The broader stylesheet policy, existing Phase 2A/2B CSS cleanup decisions, and the Step 2 boundary context are summarized in [css-audit.md](css-audit.md). This audit extends that record without changing runtime behavior.
