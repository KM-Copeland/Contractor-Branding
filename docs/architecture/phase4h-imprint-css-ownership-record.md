# Phase 4H: Imprint component CSS ownership

## Result

The existing imprint presentation components now own their internal CSS through feature-local CSS Modules. This was an ownership-only migration: component state, public props, DOM hierarchy, accessible attributes, event handlers, layout, breakpoints, and CSS values remain unchanged.

## Ownership changes

| Component | New stylesheet | Migrated selectors |
| --- | --- | --- |
| `ImprintTextFields` | `ImprintTextFields.module.css` | `.lineField`, `.lineField label`, `.lineControls`, `.inputWrap`, `.inputWrap:focus-within`, `.inputWrap input`, `.inputWrap small`, `.boldButton`, `.boldButton:hover`, `.boldButtonActive`, including the existing 1279px input-size and 767px line-label overrides |
| `LogoValidationMessage` | `LogoValidationMessage.module.css` | `.validation`, `.validationIcon`, `.validationContent`, `.validationTitle`, `.validationDetails`, its `summary` and `p` descendants, `.validationSuccess`, `.validationWarning`, `.validationError`, including the existing responsive success-message rules |
| `ImprintForm` | `ImprintForm.module.css` | `.formHeading`, `.hint`, `.dropzone` and its hover/focus/descendant rules, `.uploadIcon`, `.uploadGuidance`, `.fileCard`, `.logoThumb` and its descendants, `.removeFile` and its image, `.sharedNote` and its `::before` icon, including existing 767px adjustments |

`BrandReview.module.css` keeps `.formPanel` and its responsive framing, `.formPanel h2` in the grouped heading rule, `.fieldGroup`, `.fieldGroup h3` and its small text, `.textGroup` and its heading rules, `.hiddenInput`, and `.validationProgress`. Those selectors define parent layout or are shared with Responsive Step 2, so they remain in shared ownership. `ImprintTextFields` continues accepting the existing `className`; desktop still passes the combined `.fieldGroup`/`.textGroup` classes and responsive Step 2 still supplies its existing wrapper.

`ImprintForm.tsx` imports both its own module and the shared parent module: it uses the parent module for panel framing, field-group layout, hidden file input, and validation progress, and its own module for interior presentation. The validation component resolves its dynamic status names against its own module, preserving all three state variants and the existing live-region behavior.

## Verification

- Protected baseline: TypeScript check passed, production build passed, and the full Playwright suite passed with 99 tests before edits.
- TypeScript check and production build passed after extraction. The focused Step 2 suites passed all 44 tests; the complete suite passed all 99 tests.
- The responsive text input retained 16px computed font sizing through 1279px, existing 48px input and Bold control heights, and the 8px control gap. Focus-visible styling and `aria-pressed` behavior remain covered by the focused tests.
- Desktop baseline/current screenshots at 1280×900, 1440×900, and 1920×1080 match pixel-for-pixel with identical measured geometry. The capture script flags expected generated CSS-module class-name differences in its DOM string comparison; class hashes are explicitly allowed to change by the migration rules.
- The responsive capture covers 79 images at 320×568, 375×667, 390×844, 414×896, 767×800, 768×1140, 1024×768, 1279×800, 1280×900, 1440×900, and 1920×1080, plus the 1279→1280→1279 transition. DOM semantics and measured geometry match. Repeated image comparisons show one localized raster difference in the 390×844 uploaded-logo capture: 38 pixels on a single horizontal row of the dashed uploaded-file border (`x=34..221`, `y=346`). The matching computed border style and bounding rectangle are unchanged, and the responsive file-card rule was not moved. This is consistent with a one-pixel rasterization difference; it is not evidence of a changed layout or CSS value.
- No comparison thresholds were relaxed. The CSS module class hashes are normalized for semantic DOM comparison in the responsive capture.

## Source-size impact

`BrandReview.module.css` decreased from 13,996 bytes to 9,345 bytes (−4,651). The three new component stylesheets total 4,776 bytes, for a net source CSS increase of 125 bytes. The increase comes from scoped CSS-module selectors and their generated class names, not additional visual rules. The production CSS bundle grew from 46.01 kB to 46.04 kB; JavaScript output remained 288.93 kB.

## Evidence and remaining work

The capture scripts and before/after/repeat assets are under `docs/architecture/evidence/phase4h/`. Representative final comparisons are [desktop 1440×900](evidence/phase4h/desktop/after/1440x900-empty.png), [desktop 1920×1080](evidence/phase4h/desktop/after/1920x1080-empty.png), and [responsive 390×844](evidence/phase4h/responsive/repeat/390x844-text-bold.png). The CSS ownership review is complete for Phase 4H. Shared screen composition, preview-mode constraints, and shared upload utilities remain in `BrandReview.module.css` by design and can be evaluated only in a later scoped phase.
