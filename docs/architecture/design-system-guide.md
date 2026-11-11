# Design system guide

`src/styles/tokens.css` is the single runtime source for shared custom properties and Aileron font faces. CSS Modules consume shared semantic roles or keep values local when they describe component geometry. There is no generated token pipeline or automatic Figma sync.

## Token layers

| Layer | Use | Examples |
| --- | --- | --- |
| Primitive | Foundational value/scale whose identity is independent of one control | `--color-primary`, `--space-4`, `--text-base`, `--line-base` |
| Semantic | Stable role expressed in UI language; alias to a primitive or another semantic role | `--color-action-primary`, `--color-border-control`, `--color-focus-indicator`, `--color-progress-fill` |
| Component-specific | Repeated variable that is a real contract within one component family | Use sparingly; responsive action clearance is an existing special-purpose token |
| Local/dynamic | Unique geometry, artwork placement, state-derived values | Product-specific percentage coordinates, carousel transform, unique card padding |

Use lowercase kebab-case and category-first names: `--color-{role}`, `--space-{step}`, `--text-{size}`, `--line-{size}`, `--shadow-{role}`. Avoid names based only on where a value once appeared if consumers have another clear visual role.

## Current coverage matrix

| System | Established roles and current consumers | Remaining raw values / gaps | Classification and recommendation | Priority / risk |
| --- | --- | --- | --- | --- |
| Color | Primary/text/white/muted/cool-grey/divider/page/selected/footer; semantic action, text, surface, control/subtle/strong border, focus, disabled, progress roles. Used across shared controls, progress, rows, and feature modules. | Raw `#dee4ed`, `#fff`, `#0c30cc`, `#2a2a26`, `#87919d` recur in CSS; raw literals sometimes match existing semantic roles. `--color-divider`, `--color-page`, `--color-footer` consumer coverage needs search before removal. | Existing semantic equivalents: use current token when role and rendered value match. Raw colors that recur but express different states: review role before adding semantic token. Similar border colors remain distinct. | Medium; broad color changes can create visual drift. |
| Typography | Aileron faces at 300/400/600/700; `--text-xs` through `--text-title`; line-height scale. Used globally and in feature styles. | Many raw 11–28px sizes; a recurring size alone does not prove a shared typographic role. Mobile edit fields have a 16px minimum for Safari focus behavior. | Use existing scale when role matches; add a semantic style only when multiple consumers share both size and meaning. Keep product-specific preview text sizing local. | Medium. |
| Spacing | `--space-1` to `--space-10`; responsive page gutter and action clearance. | Raw 8/12/16/20/24/32/40px recur; application layouts also use deliberate gutters/gaps that vary by breakpoint. | Migrate only repeated, semantically equivalent component values. Keep measured page/preview geometry local until a stable cross-component contract is confirmed. | Medium to high for shell/Step 2 layout. |
| Dimensions | Sidebar width, control height, app gutter, responsive gutter/action clearance. | Card height, image slots, rail rows, upload areas, artboard constraints and tablet widths include component- and viewport-specific values. | Keep local unless a dimension is shared and independently tuned as a design contract. Do not make all cards/tabs the same height by tokenizing coincidence. | Low to medium. |
| Border | `--border-control`; semantic control, subtle and strong border colors. | Many one-pixel borders and multiple distinct colors, including `#c4ced1`, `#dee4ed`, `#e1e1de`. | Border width can use a shared token when intended. Keep colors distinct by visual role; test before substituting. | Medium. |
| Radius | `--radius-pill` for filter chips. | Small control/card radii remain raw or square depending on the Figma treatment. | No broad radius scale is established. Add one only after repeated design evidence; preserve square corners where intended. | Low. |
| Shadow | Product and panel shadows; `--shadow-header` exists. | `--shadow-header` currently styles `NoticeDialog`, not navigation. Header itself uses a fixed border. | A rename to a dialog/overlay role could clarify intent, but aliasing is not needed for runtime behavior. Preserve exact shadow. | Low. |
| Breakpoints | Shared desktop/responsive split at 1280px; selected-card grid has additional narrow layout rules; CSS container query supports the rail. | Breakpoint numbers live in media queries, not custom properties (CSS cannot use custom properties in standard media query conditions). No single breakpoint registry exists. | Keep literal media-query thresholds documented and consistent. Do not propose a token where platform syntax cannot consume it. | Low. |
| Motion | Progress fill and subtle track breathing; preview summary transition; carousel drag transform; reduced-motion handling. | Durations/easing are local declarations, not shared motion tokens. | Keep interaction-specific timing local until repeated motion roles exist; preserve `prefers-reduced-motion`. | Medium for interaction/accessibility. |
| Layering | Header, modal/skip link, focus-visible stacking rules use z-index values. | Layer numbers are raw. A complete overlay stack is not tokenized. | No evidence of conflicting layers in current flows. Add a small layer scale only if another overlay creates a demonstrated ordering problem. | Low. |

The historical audit counted repeated raw declarations such as `#dee4ed` (33), `#fff` (25), `#0c30cc` (21), and `#2a2a26` (17), and common raw sizes such as `16px`, `20px`, `10px`, `12px`, and `24px`. Treat these as search clues, not an equivalence map: tokenization should follow semantic role, not frequency.

## Current typography and colors

Global body text uses Aileron and 16px/24px. Declared local font faces are Light 300, Regular 400, SemiBold 600, and Bold 700. Do not add a font weight or substitute another family without a design requirement and local assets. The established primary action blue and progress fill blue are intentionally different. Likewise, control grey, subtle border grey, and divider grey remain distinct.

## Adding or using a token

1. Search `tokens.css` and all CSS Modules for the exact existing role/value.
2. Confirm its computed value and every proposed consumer. Similar-looking declarations may serve different states.
3. If a shared role is clear, add one non-circular semantic alias referencing the closest primitive.
4. Migrate one component family at a time. Keep unique layout, product placement, and state-derived styles local.
5. Run typecheck/build and the relevant interaction tests. Compare computed styles and bounding boxes at the owning breakpoints, then compare screenshots with fixed viewport, DPR, zoom, route, state, font readiness, and loaded images.
6. Update this matrix with the token’s role and actual consumer. Remove a token only after a repository-wide usage check.

## Component styling

Reuse `Button`, `BackButton`, `FilterPill`, and `SearchInput` when their interaction contracts match. Feature components should own their inner CSS Module. A parent stylesheet may own parent layout constraints where the same child appears in different compositions. Do not add appended override blocks; edit the owning declaration and verify its responsive states. Product artwork placements belong to the product record and remain percentage-based relative to the artboard.
