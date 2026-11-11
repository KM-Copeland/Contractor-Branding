# Storybook component coverage

The catalog contains one entry for each of the 30 exported production UI components, plus shared foundations, screen compositions and the full application workflow. Storybook's built index contains 111 stories and 31 Autodocs documents. Stories render the production component and CSS; only the wrappers under `src/stories/` prepare realistic state using the existing workflow provider and public actions.

## Coverage matrix

| Area | Production component | Story entry | Covered scenarios |
| --- | --- | --- | --- |
| Shared actions | `Button` | Design System / Components / Actions / Button | Default, disabled, long label |
| Shared actions | `BackButton` | Design System / Components / Actions / BackButton | Default and labeled back action |
| Shared actions | `FilterPill` | Design System / Actions / FilterPill | Inactive, active, long label, interactive group |
| Shared input | `SearchInput` | Design System / Inputs / SearchInput | Empty, populated, long query |
| Shared layout | `Panel` | Design System / Layout / Panel | Basic and longer content |
| Shared feedback | `NoticeDialog` | Design System / Feedback / NoticeDialog | Open, dismiss and reopen, long description |
| Shared workflow | `WorkflowProgress` | Design System / Feedback / WorkflowProgress | Selection, branding, completion, intermediate progress |
| Shared layout | `ResponsiveActionFooter` | Design System / Layout / ResponsiveActionFooter | Enabled, disabled, alternate back label |
| Product selection | `ProductImprintCapabilities` | Product Selection / Components / ProductImprintCapabilities | Logo and text, either capability, text only, none |
| Product selection | `ProductCard` | Product Selection / Components / ProductCard | Unselected, selected, text-only capability, long name, interactive selection |
| Product selection | `ImprintStatusIndicators` | Product Selection / Components / ImprintStatusIndicators | Both off, logo on, text on, both on, muted selection mode |
| Product selection | `SelectedProductRow` | Product Selection / Components / SelectedProductRow | Selection mode, branding mode, active preview, remove control, long name, removable interaction |
| Product selection | `SelectedProductsList` | Product Selection / Components / SelectedProductsList | Single product, multiple categories, mixed branding, removal interaction |
| Product selection | `SelectedProductsSidebar` | Product Selection / Components / SelectedProductsSidebar | Empty, one product, multiple categories, active product, scroll and remove |
| Product selection | `SelectionPanel` | Product Selection / Compositions / SelectionPanel | Empty and selected product |
| Product selection | `StepOneScreen` | Screens / Product Selection / StepOneScreen | Empty default, single selection, multiple categories |
| Completion | `CompletionScreen` | Screens / Completion / CompletionScreen | One and multiple configured products |
| Landing | `LandingScreen` | Screens / Landing / LandingScreen | Landing page with start action |
| Branding | `BrandingToggle` | Design System / Components / Inputs / BrandingToggle | Off, on, disabled |
| Branding | `ImprintTextFields` | Design System / Components / Inputs / ImprintTextFields | Empty, each line populated, independent bold states, near/max limit, long content |
| Branding | `LogoValidationMessage` | Design System / Components / Feedback / LogoValidationMessage | Success, warning, error, expanded details |
| Branding | `ProductConfigurationCard` | Branding / Components / ProductConfigurationCard | Unconfigured, logo, text, both, mutually exclusive imprint, long name |
| Branding | `ImprintForm` | Branding / Components / ImprintForm | Empty interactive form, logo and text |
| Branding | `ProductPreviewPanel` | Branding / Components / ProductPreviewPanel | First/middle/last product, text-only capability, logo, both, unconfigured, long name |
| Branding | `ProductPreviewCarousel` | Branding / Components / ProductPreviewCarousel | First/middle/last, capability variants, logo, both, unconfigured, reduced-motion state |
| Branding screen | `DesktopStep2` | Screens / Branding / DesktopStep2 | Populated workflow composition |
| Branding screen | `ResponsiveStep2` | Screens / Branding / ResponsiveStep2 | Imprint details, configure list, configure preview |
| Branding screen | `BrandReview` | Screens / Branding / BrandReview | Initial imprint and configured multiple products |
| Application | `AppShell` | Application / AppShell | Selection, branding, completion and landing without progress |
| Application | `App` | Application / Full Workflow | Real application, route and workflow interactions |

The **Design System / Foundations / Colors & Typography** entry documents the shared token and typography base rather than a production UI component.

## Interaction and validation notes

- Interactive stories use the real component callbacks. Workflow stories use `WorkflowScenario`, a Storybook-only adapter that calls the app's existing provider actions to select products, set shared imprint content, configure per-product visibility, choose the active product, and advance workflow steps.
- The full application story renders `App` itself. Focused screen stories render production screen compositions and use representative catalog products.
- Logo upload stories invoke the production file validator. They use temporary browser object URLs and revoke them on removal, replacement or unmount.
- The carousel story was checked by changing pagination from the initially active `70 Series` to `80 Series`; the product summary and active pagination indicator updated. The Accessibility addon reported zero violations for that scenario (27 passes, one inconclusive check).
- Storybook's mobile and tablet viewport presets help inspect responsive composition. Chromium-based previews do not establish native iOS Safari or assistive-technology behavior.

## Deliberate exclusions

This is a UI component catalog, not a catalog of every exported symbol. Workflow context providers/hooks, domain reducer functions, validation helpers, data records, prop types, and Storybook fixture/composition helpers are not standalone visual components. Private implementation parts such as SVG icons, artwork layers, and the local switch markup are exercised through their owning production component. No production behavior was changed to make a story render.
