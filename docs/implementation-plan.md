# Implementation plan and acceptance status

## Phase 1 — foundation

Completed React/TypeScript/Vite setup, typed local product data, Aileron fonts and Figma imagery, shared shell and controls, architecture, and initial visual review.

## Phase 2 — Step 1 product selection

Complete: live case-insensitive search, All Products/Thermostats/Wallplates/Other filters, independent family selection, a state-derived grouped summary, removal/Clear All, no-results reset, guarded progression and same-session back/forward preservation. Figma's filter and count errors were corrected per user direction. See `validation/phase2/README.md`.

## Phase 3 — Step 2 Brand & Review

Implemented: six state-derived Figma combinations, shared logo/two-line imprint data, per-family capability switches, local logo preview, active-family switching, expanded/collapsed layouts, live overlays, validation, Back preservation and local review confirmation. The local completion endpoint sends no production data.

The user confirmed the Continue rule (one selected family needs active, non-empty imprint content), accepted PNG/SVG browser previews with PDF/EPS stored but not rendered, and corrected product capabilities: Sensi Smart, 80 Series and Sensi Equipment Interface Module support Logo & Text together. All other products allow Logo Only or Text Only, but not both together. The product-specific mutual-exclusion rule is enforced.

Phase 3 verification and screenshots are in `validation/phase3/README.md`. Six thermostat families now use positions matched to the latest user reference images; other references need family mapping before their placements can be applied. No Phase 4 work is included.
