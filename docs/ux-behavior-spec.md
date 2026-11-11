# UX behavior specification — through Phase 3

Figma source states and design discrepancies are recorded in `figma-audit.md`. The Aileron-only type choice and category-filter behavior reflect Kyle's explicit corrections.

## Step 1 product selection

- Product families act as independent checkboxes. Search is trimmed, live and case-insensitive. Category filters show only the chosen category and preserve hidden selections.
- One selected-ID list drives card indicators, grouped summary, counts and Continue eligibility.
- Remove and Clear All work on filtered-out products. Empty results provide Reset search and filters without changing selected products.
- Continue requires a valid selected family. The local route is `#brand-review`; Back and browser Back/Forward preserve selected families, query/filter state and Step 2 configuration. Refresh resets the session.

## Step 2 shared imprint and product configuration

- All six Figma frames derive from one state: empty imprint, populated logo/text with switches off, and enabled per-family logo/text switches, each in expanded and collapsed preview layouts.
- The shared imprint has a nullable logo and two optional lines, each limited to 30 characters. The visible counter follows JavaScript string length (UTF-16 code units); composed emoji counting has not been designed.
- The upload control accepts SVG, EPS, PDF or PNG, up to 10 MB. PNG/SVG preview as local object URLs. EPS/PDF retain a local filename selection and explain that this prototype cannot render them. Remove then upload supports replacement. Removing a logo preserves optional text and family switch settings.
- Print validation is not implemented. The UI says when a preview is ready and explicitly says print requirements have not been checked. It does not use Figma's unsupported “Logo meets print requirements” claim.
- Corrected user-confirmed capabilities: Sensi Smart, 80 Series and Sensi Equipment Interface Module support Logo & Text together, as well as either one alone. All other products support Logo Only or Text Only, but not both together. For mutually exclusive products, the alternate switch stays disabled until the active type is turned off.
- Continue requires at least one selected product to have an enabled imprint type with non-empty content. Other selected products may remain unbranded, matching the active Figma state.
- Active product and expanded/collapsed state are distinct from shared and per-product configuration. Switching products and changing layout preserves the configuration. Back to products retains it too.
- Product images and branding overlays update from state. Thermostat families can use separate logo/text positions, with the six confidently matched models using the latest references. Reference images whose family is still unclear keep the proportional Sensi approximation until mapped. All preview positions remain demonstrative, not manufacturing specifications.
- Continue opens a local review-ready confirmation. It sends no order or production data. This phase stops before Phase 4.

## Accessibility

Use native buttons/inputs, labelled line fields and switch roles with `aria-checked`. Disabled controls use native `disabled`. The preview toggle exposes `aria-expanded` and `aria-controls`. Route transitions focus the active heading. Selection changes remain announced through their visible state; validation errors use a live status region.

## Open product decisions

- Production imprint positions and scale beyond the Sensi Smart Figma preview remain undefined; current proportional placement is only a prototype approximation.
- Print-requirement checks and the final meaning of the 30-character count for composed emoji remain out of scope until rules are supplied.
- Prototype settings reset on refresh; durable storage is not specified.
