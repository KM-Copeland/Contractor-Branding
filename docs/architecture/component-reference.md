# Component reference

Atomic Design labels describe scale and responsibility. They do not prescribe directories. Feature-specific components stay next to the feature that owns their state and styles.

## Shared components

| Component | Classification and contract | Key states/events and accessibility | Styles / consumers |
| --- | --- | --- | --- |
| `Button` | Atom; accepts native `ButtonHTMLAttributes<HTMLButtonElement>` plus optional `className` and children | Native disabled and focus behavior; sets `type="button"` | `Controls.module.css`; selection/completion and shared controls |
| `BackButton` | Atom; `{ label: string; onClick: () => void }` | Accessible name comes from `label`; arrow is decorative | `Controls.module.css`; Step 1/2 action areas |
| `FilterPill` | Atom; `{ active, children, onClick }` | `aria-pressed` exposes active filter | `Controls.module.css`; `StepOneScreen` |
| `SearchInput` | Molecule; `{ value, onChange, className? }` | Labeled search input, native clear/search semantics | `Controls.module.css`; `StepOneScreen` |
| `Panel` | Molecule; children and optional class | Presentation wrapper only | `Controls.module.css`; completion screen |
| `NoticeDialog` | Molecule; nullable `{title, body}` plus `close` callback | Native modal dialog; `aria-labelledby`, cancel/close handling | `Controls.module.css`; app shell destinations |
| `WorkflowProgress` | Molecule; optional stage and numeric progress | Progressbar role and accessible label/value; responds to 1280px breakpoint and reduced motion | `WorkflowProgress.module.css`; `AppShell` |
| `ResponsiveActionFooter` | Molecule; Back label/callback, Continue callback/disabled flag, required test ID | Native buttons and visible disabled state; safe-area-aware fixed footer | `ResponsiveActionFooter.module.css`; Step 1 and responsive Step 2 |

## Selection feature

| Component | Classification and contract | Key states/events and accessibility | Styles / consumers |
| --- | --- | --- | --- |
| `LandingScreen` | Page; `onStart` callback | Semantic hero/steps, focusable page heading | `LandingScreen.module.css`; app route |
| `StepOneScreen` | Page/template; `continueSelection`, `backToLanding`, `active` | Owns local search and filter; product selection dispatches to workflow context; hidden/inert while inactive so local filters persist | `Selection.module.css`; `App` |
| `ProductCard` | Molecule; product record, checked state, toggle callback | Native checkbox inside label; product name is accessible name; supported imprint capabilities are described to screen readers | `Selection.module.css` + capability module; catalog grid |
| `ProductImprintCapabilities` | Atom/molecule; capability record | Decorative compact capability badges; no duplicate selection controls | `ProductImprintCapabilities.module.css`; `ProductCard` |
| `SelectionPanel` | Organism; route callbacks from App | Derives selected products; provides empty state, Back/Continue, removal | `Selection.module.css`; `StepOneScreen` |
| `SelectedProductsSidebar` | Organism; mode, product list, branding map, optional active ID/select callback, remove callback, optional empty state/footer/test ID | Keeps heading/count and footer stable; shared product groups scroll; restores focus after keyboard removal | `SelectedProductsSidebar.module.css`; Step 1 and desktop Step 2 |
| `SelectedProductsList` | Organism-level list; product list, mode, branding map, optional active/select, remove callback | Category grouping, consistent row renderer | `SelectedProductsList.module.css`; sidebar |
| `SelectedProductRow` | Molecule; product, mode, optional branding/active/select, remove callback, remove style and status visibility | Read-only identity when not selectable; keyboard-accessible identity button when selectable; status group has combined accessible description; remove button has product-specific name | `SelectedProductsList.module.css`; shared list |
| `ImprintStatusIndicators` | Molecule; optional branding and muted state | Accessible combined Logo/Text status description | `SelectedProductsList.module.css`; selected row |
| `CompletionScreen` | Page; `back` callback | Renders the completed workflow confirmation, Clear All, removals, and Edit Products; focus restoration after removal | `Selection.module.css`; `App` completion route. |

## Branding feature

| Component | Classification and contract | Key states/events and accessibility | Styles / consumers |
| --- | --- | --- | --- |
| `BrandReview` | Page orchestrator; Back/complete and optional responsive progress callback | Derives selected/active product and readiness; owns shared upload validation/object URL lifecycle; owns responsive Imprint/Configure and List/Preview state | `BrandReview.module.css`; app route |
| `DesktopStep2` | Template; `DesktopStep2Props` combines shared presentation data/callbacks with active index and remove callback | Composes heading, imprint form, desktop preview, selected-products rail, actions | `BrandReview.module.css`; `BrandReview` |
| `ResponsiveStep2` | Template; `ResponsiveStep2Props` adds view/mode state setters and progress callback | Imprint and Configure modes; List/Preview tabs support arrow/Home/End keyboard navigation; footer remains fixed; scroll position is restored when changing mode | `BrandReview.module.css`; `BrandReview` |
| `ImprintForm` | Organism; imprint, validation state, file input ref, upload/removal, line and bold callbacks | Dropzone/button, hidden file control, helper text, validation live region; input states preserved | `ImprintForm.module.css` interior + shared parent layout in `BrandReview.module.css`; desktop composition |
| `ImprintTextFields` | Molecule; imprint, `setLine`, `toggleBold`, required wrapper class | Two 30-character fields, live counters, independent `aria-pressed` Bold controls; mobile inputs use at least 16px | `ImprintTextFields.module.css`; desktop and responsive forms |
| `LogoValidationMessage` | Molecule; one `LogoValidationResult` | Success/warning polite status; error alert; expandable detail checks | `LogoValidationMessage.module.css`; desktop/responsive form |
| `ProductConfigurationCard` | Molecule; product, per-product branding, logo/text availability, change callback | Configured state, capability limits, pressed-state toggle buttons; disabled options remain explained by labels | `ProductConfigurationCard.module.css`; responsive Configure/List |
| `BrandingToggle` | Atom; Logo/Text label, selected, disabled, click callback | Native button with `aria-pressed` and disabled semantics | `BrandingToggle.module.css`; configuration card and responsive preview |
| `ProductPreviewPanel` | Organism; selected/active product, index, config, imprint and availability, expanded state, select/brand callbacks | Previous/next controls, two product-specific switches, artwork and conditional logo/text overlays | `ProductPreviewPanel.module.css` + shared `PreviewArtwork.module.css`; desktop Step 2 |
| `ProductPreviewCarousel` | Organism; selected/active product, branding map, imprint, availability, product/branding callbacks | Touch/pointer horizontal swipe; preserves vertical scroll; arrow/Home/End keys; reduced-motion-aware summary transition | `ProductPreviewCarousel.module.css`, shared composition constraints, and `PreviewArtwork.module.css`; responsive Step 2 |
| `step2Presentation` | Feature contract, not rendered component | `Step2PresentationProps`, desktop/responsive extensions, and one default branding configuration | No stylesheet; shared by both Step 2 compositions |

## App and domain contracts

`App` and `Workflow` own hash navigation and route guards. `AppShell` owns global navigation and progress placement. `WorkflowContext` exposes `WorkflowState` and stable callbacks over the reducer. `workflowReducer` is pure; `workflowValidation` is pure and shared by UI and completion guard. `ProductFamily` contains stable ID, category, display names, local image key, capabilities, optional Figma node, and artwork-relative preview placements. `LogoAsset` holds local filename/type/size/object URL metadata; that URL is session-local, not persisted.

## Coupling and duplication review

- No runtime source path was found that imports from a higher feature back into its importer; the dependency direction remains app → screens, screens → shared context/components/domain/data, domain → types/data. Validate this again when adding package-level alias exports.
- Product capability rules have one catalog source and one pure simultaneous-imprint helper. The UI derives disabled states for feedback; reducer rules independently reject unsupported state changes as a required invariant, not duplicate authority.
- `BrandReview.module.css` deliberately retains parent-level desktop/responsive composition. The extracted child stylesheets own interior controls. Do not extract more solely due to file length.
- `DesktopStep2` applies only the defined `main` CSS Module class to its main element. The valid expanded-state modifier remains on the layout element inside the screen composition.
- `WorkflowContext.continueSelection` dispatches legacy `continue`, transitioning to `selection-ready`; no live component calls this context method. The similarly named Step 1 prop is live and routes through `App` to Step 2. Keep the legacy reducer route until URL/history compatibility is explicitly retired.
