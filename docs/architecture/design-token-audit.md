# Design token audit

The consolidated current guidance and token coverage matrix now live in the [Design system guide](design-system-guide.md). This file retains the earlier audit trail and phase migration notes; use the consolidated guide for new changes.

`src/styles/tokens.css` is the current CSS source of truth for shared custom properties. It defines typography, color, spacing, component dimensions, shadows, and responsive gutters. CSS Modules consume some tokens, but many declarations still use raw values.

## Current foundation

The token file includes Aileron font faces and weights; colors such as primary `#0c30cc`, text `#2a2a26`, selected surface `#eef2fc`, page `#f5f7fa`, and divider `#e1e1de`; a type scale from 12px through 28px; line-height values; a spacing scale; control/sidebar dimensions; and shadows. There is no second token JSON source or automated Figma sync in the current runtime.

## Repetition observed

An audit search found repeated literal values across CSS modules, including `#dee4ed` for many UI borders (33 occurrences), `#fff` (25), `#0c30cc` (21), `#2a2a26` (17), and `#87919d` (13). Common spacing/type values include `16px` (76 occurrences), `20px` (75), `10px` (51), `12px` (51), `24px` (50), `1px` (44), `14px` (42), and `40px` (34). These counts indicate candidates for shared meaning; they do not prove each use has identical intent.

Existing declarations such as `--color-divider: #e1e1de` and the repeated `#dee4ed` border are visibly distinct values. Do not replace one with the other simply because both draw borders. Several token declarations (`--content-width`, `--header-width`, `--color-footer`, `--color-page`, `--shadow-product`, `--color-divider`, `--space-3`) appear unused by CSS consumers and should be verified before removal.

## Main design-system issues

- Primitive values and semantic roles sit together in one flat token layer.
- Semantic labels do not always match how consumers use a token; for example, `--shadow-header` is used by a dialog.
- Some high-frequency design values bypass the token layer, making global tuning harder.
- There is no written contract for when a value is a global token, a component token, or a one-off geometry value.

## Phase 1 migration status

The initial semantic aliases and the scoped migration are recorded in [the Phase 1 implementation record](phase1-implementation-record.md). The six additions map to existing palette values through references; only `Controls.module.css` was migrated. The earlier raw values and distinctions remain unchanged.

Phase 1B adds `--color-border-subtle: #dee4ed` for the responsive action footer's top border and reuses `--color-surface-default` for its white background. This remains distinct from the `#e1e1de` divider and `#c4ced1` control border. See [the Phase 1B record](phase1b-footer-token-record.md).

Phase 1C migrates the shared selected-products list's text, default surface/border, and action colors to existing aliases. The selected-row fill remains `--color-selected`; no token definitions were added. See [the Phase 1C record](phase1c-selected-products-token-record.md).

Phase 1D defines three progress-specific colors: `--color-progress-track` (`#dee4ed`), `--color-progress-fill` (`#3155a4`), and `--color-progress-track-breathe` (`#e7e9ed`). The track color is defined independently of `--color-border-subtle` to preserve the progress role if either value changes later. See [the Phase 1D record](phase1d-workflow-progress-token-record.md).

## Next adoption steps

1. Continue with one CSS Module at a time, selecting a shared component where semantic roles can be confirmed from actual computed styles. The next pass should assess whether the remaining repeated colors have stable semantic roles before selecting another component.
2. Keep distinctive border colors separate, including `#dee4ed`, `#c4ced1`, and `#e1e1de`.
3. Add component-scoped tokens only for repeated variations within that component (for example, selected row border/fill), not for every declaration.
4. Remove unused tokens only after repository-wide custom-property usage checks and visual tests.

Do not add DTCG JSON or a token build pipeline in this prototype yet. That would add another source of truth without an identified downstream consumer. Revisit when Figma-to-code synchronization or a second client platform becomes a real requirement.

## Token usage contract

- **Primitive tokens** hold foundational values and scales: palette values, type sizes, spacing, radii, and standard dimensions. Use these as the source for aliases and for values whose meaning is genuinely foundational.
- **Semantic aliases** name a stable purpose, using `--{category}-{role}` (for example, `--color-action-primary`). Define an alias by referencing the closest existing primitive instead of copying the same hex value. Use it when multiple declarations share a confirmed role.
- **Component tokens** describe a repeated, meaningful variable that belongs to one component family. Add one only when the component has a real contract to tune; do not encode every padding or one-off measurement as a token.
- **Local values** remain appropriate for unique geometry, one-off artwork positioning, or values that have no meaningful shared role. Keep them local rather than inventing a misleading alias.
- **Adding a token:** search existing declarations and usages first; confirm the visual role and exact computed value; add one non-circular alias; migrate only the approved component; record the meaning and consumer here.
- **Avoiding conflicts:** one role should have one canonical semantic name. Aliases should flow from semantic to primitive (or semantic to a lower-level semantic role), never point back upward. Similar-looking colors remain separate when their roles differ.
- **Validating a migration:** capture computed styles before and after under the same browser, viewport, DPR, zoom, route, state, fonts, and image readiness. Compare color, border, typography, dimensions, padding, interaction states, and screenshots. Fix real differences; do not loosen comparison thresholds to hide them.

Approved naming is lowercase kebab-case with category first: `--color-{role}`, `--space-{step}`, `--text-{size}`, `--line-{size}`, and `--shadow-{role}`. Keep the existing runtime source in `tokens.css`; do not add a parallel generated token catalog in this phase.
