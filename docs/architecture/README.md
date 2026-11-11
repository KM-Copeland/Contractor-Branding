# Architecture documentation

Start with the current-state guides. Phase records are retained as evidence of how the architecture reached this state; they are not required reading for routine product work.

## Start here

1. [System overview](system-overview.md) — source map, state/data flow, screen hierarchy and styling ownership.
2. [Component reference](component-reference.md) — component classification, responsibilities, contracts, accessibility and CSS ownership.
3. [Design system guide](design-system-guide.md) — token roles, coverage gaps and safe styling changes.
4. [Developer guide](developer-guide.md) — local commands, change ownership, responsive and accessibility contracts, visual validation.
5. [Final readiness report](final-readiness-report.md) — Phase 5B verification, closeout status and bounded deferred concerns.
6. [Storybook guide](storybook-guide.md) — run the component workshop and add focused interactive stories.
7. [Storybook component coverage](storybook-component-coverage.md) — cataloged production UI components and their scenario coverage.
8. [Storybook full catalog record](storybook-full-catalog-implementation-record.md) — catalog implementation and closeout verification.

## Status

**Architecture modernization: Complete — Initial Component Library & Design System Foundation.** Phases 0 through 4H established the component and design-system foundation; Phase 5A audited readiness; Phase 5B removed the final undefined CSS Module references and aligned the completion component name. The app remains a prototype that can continue evolving. This closeout does not claim production readiness or completion of future product screens. See the [final readiness report](final-readiness-report.md) and [Phase 5B closeout record](phase5b-final-cleanup-record.md).

## Historical records and evidence

Keep these records for specific implementation details, verification conditions, and visual comparisons. The current-state guides above supersede earlier descriptions where later phases changed the implementation.

- [Architecture audit](architecture-audit.md), [component inventory](component-inventory.md), [CSS audit](css-audit.md), [token audit](design-token-audit.md), [naming conventions](naming-conventions.md), [proposed architecture](proposed-architecture.md), [refactoring roadmap](refactoring-roadmap.md), [baseline validation](baseline-validation.md), and the [Phase 5B closeout record](phase5b-final-cleanup-record.md).
- Phase 1 token and control work: [Phase 1](phase1-implementation-record.md), [1B footer](phase1b-footer-token-record.md), [1C selected products](phase1c-selected-products-token-record.md), [1D workflow progress](phase1d-workflow-progress-token-record.md).
- Phase 2 CSS ownership work: [2A Selection/sidebar](phase2a-css-ownership-cleanup-record.md), [2B action row](phase2b-sidebar-action-row-record.md), [2C Step 2 audit](phase2c-step2-css-ownership-audit.md), [2D verified cleanup](phase2d-step2-css-cleanup-record.md).
- Phase 3 workflow boundaries: [3A domain extraction](phase3a-workflow-domain-extraction-record.md).
- Phase 4 component and CSS ownership: [4A imprint components](phase4a-imprint-component-extraction-record.md), [4B desktop preview](phase4b-desktop-preview-component-extraction-record.md), [4C responsive carousel](phase4c-responsive-carousel-component-extraction-record.md), [4D desktop preview CSS](phase4d-desktop-preview-css-ownership-record.md), [4E shared artwork CSS](phase4e-shared-preview-artwork-css-record.md), [4F responsive carousel CSS](phase4f-responsive-carousel-css-ownership-record.md), [4G Step 2 composition](phase4g-step2-screen-composition-extraction-record.md), [4H imprint CSS](phase4h-imprint-css-ownership-record.md).
- [Visual evidence and capture utilities](evidence/) remain beside their phase records. Run a capture utility only after checking its header and documented prerequisites.
- [Storybook pilot record](storybook-pilot-implementation-record.md) records the original 26-story pilot and its verification history.

## Related product/design references

The [architecture overview](../architecture.md), [UX behavior specification](../ux-behavior-spec.md), [Figma reconciliation](../figma-reconciliation.md), and [responsive audit](../responsive-audit.md) retain broader product/design context. Historical screenshots are evidence of their documented capture state; consult the linked current Figma source for design intent.
