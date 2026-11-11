# Figma audit — Phase 2 update
Inspected 2026-10-08 through Figma MCP design context, screenshots, page metadata, and Step 1 variable definitions.
Source: https://www.figma.com/design/xODM0i0DWXCtnVps5NkQU2/Untitled?node-id=0-1

## Status and confirmed corrections
All nine supplied frames returned full design context and screenshots, which were inspected. Page inventory returned one page (0:1) containing these nine top-level frames. No additional top-level screens or local component definitions were identified in its metadata. Instances reference navigation, buttons, icons, form labels, and footer components.

Figma did not return font binaries. Kyle subsequently supplied D:/Fonts/Aileron and D:/Fonts/Aileron-NEW. The application uses the complete original OpenType set: Aileron Light 300, Regular 400, SemiBold 600 and Bold 700. The newer webfont set lacks Light and SemiBold, so it was not mixed into the complete set.

Kyle confirmed that Fira Sans is a mistake and must not be used, and that the single-selection frame showing all categories despite its active filter is a mistake. Aileron-only typography and functional category filtering are implemented. There are no remaining Phase 1 asset blockers. React/TypeScript/Vite/CSS Modules, the initial screen, local assets and Playwright are initialized and validated.

## Screen inventory
All frames are 1280px wide. Heights below are from metadata, rounded to two decimals.

| Node | State | Height | Visible implications |
| --- | --- | ---: | --- |
| 121:2753 | Step 1, no selection | 2549.43 | All Products active; 0 families; Continue disabled |
| 144:1122 | Step 1, single selection | 2549.43 | Sensi Smart selected; Thermostats pill active; Continue enabled |
| 144:1490 | Step 1, multiple selection | 2549.43 | Summary says 5; six cards appear selected |
| 144:1897 | Step 2, empty, expanded | 2458.98 | Full-width preview above imprint and selection panels |
| 152:1694 | Step 2, populated, expanded | 2458.98 | Uploaded TEST logo and two text lines; switches off; Continue disabled |
| 152:2721 | Step 2, switches active, expanded | 2458.98 | Mixed product settings; logo/text appear on preview; Continue enabled |
| 152:4212 | Step 2, empty, collapsed | 2122.81 | Preview above imprint in left column; selection on right |
| 152:4330 | Step 2, populated, collapsed | 2166.81 | Same content/configuration pattern as populated expanded |
| 152:4513 | Step 2, switches active, collapsed | 2166.81 | Same mixed settings pattern as active expanded |

“Collapsed” retains a substantial preview; it means column-width rather than hidden.

## Verified layout measurements
- Navigation: 80px tall; blue #0c30cc; logo slot 208×40; horizontal logo padding 32.
- Main: 1280 maximum reference width; 50px gutters; 80px top/bottom padding; major vertical gaps 40.
- Progress: 36px step icons; 10px icon/label gap; 14px labels with 24px line height.
- Heading: Aileron Bold 28/40; introduction Regular 18/32; heading/subtext gap 10.
- Product Families: SemiBold 22/32; 20px gap to search/filter row.
- Search 143:1094: 520×48, 10px horizontal padding, 1px cool-grey border; 24px icon wrapper.
- Filter pills: 115×48, radius 100, 15px horizontal padding; 10px row gaps.
- Main catalog 121:2799: 1180px inner space, 780px catalog, 40px gap, 360px selection.
- Catalog: 3 columns, 10px gaps; category headings SemiBold 18/24, then 20px gap; 40px category gaps.
- First card 121:2829: rendered 253.33×233.43; other rows explicitly use 215px height. Padding 20, content gap 15. This variation requires deliberate treatment, not a universal fixed height.
- Selection wrapper 144:1121: 44px top offset to align with cards. Panel padding 30, internal gaps 20; heading Bold 22/32; count Regular 14/24.
- Continue 121:2981: 300×48; Bold 12/16, uppercase, 0.96px tracking (8% of 12px).
- Footer 121:2985: 421px total; upper section 251, lower section 170; upper horizontal padding 130, lower 137.

## Extracted token candidates
These are extracted values, not yet CSS implementations.

| Role | Value |
| --- | --- |
| Primary interaction/navigation | #0c30cc |
| Main body text | #2a2a26 |
| White/surface/reversed text | #ffffff |
| Muted text | #807e74 |
| Cool-grey borders/inactive steps/active pill | #c4ced1 |
| Divider | #e1e1de |
| Page background | white overlaid with rgba(49,85,164,0.05) |
| Disabled primary background | rgba(12,48,204,0.5) |
| Disabled primary label | rgba(255,255,255,0.5) |
| Product shadow / named visual navigation effect | 0 4px 10px rgba(0,0,0,0.15) |
| Selection panel shadow | 0 8px 10px rgba(0,0,0,0.05) |
| Header wrapper drop shadow | 0 8px 5px rgba(0,0,0,0.2) |
| Spacing | 5, 10, 12, 15, 20, 24, 30, 32, 40, 44, 50, 80 |
| Filter radius | 100px |
| Default control border | 1px solid #c4ced1 |

Typography includes 10/16 Bold for initials; 12/16 Light, SemiBold, Bold; 14/24 Light, Regular, Bold; 16/24 Light, Regular, SemiBold, Bold; 18/24 SemiBold; 18/32 Regular; 22/32 SemiBold and Bold; 28/40 Bold. Letter spacing is zero except uppercase button labels. Fira Sans Regular 16/24 appears in populated input nodes 152:1976 and 152:1987, but is explicitly superseded by Kyle's Aileron-only correction.

## Asset inventory
Initial Step 1 context references 29 assets: 14 product PNGs, one footer logo PNG, and 14 SVGs covering header branding, social marks, initials background, progress symbols/lines, search, selection circle, and Continue arrow. Asset constants and image layer names often say “Sensi Smart” even for other products; map by node and rendered content, never layer name alone.

Products: nine thermostats (Sensi Smart; 80 Series; 70 Series; Classic 80 Series; Classic 80 Series Programmable; Classic 70 Series; Classic 70 Series Vertical; Blue Series 12 Inch Touch; Blue Series 6 Inch), four wallplates, one Sensi Equipment Interface Module. Wallplate labels differ in length between cards and summary rows.

All 29 initial-frame assets plus the selected indicator and enabled arrow are downloaded under public/assets/figma. Local source and rendered geometry are recorded in validation/rendered-assets.json. Selected summary thumbnails use the corresponding product images from mock data. Step 2 adds large product imagery, upload/enlarge/edit/remove/validation assets and the TEST logo; those remain inventory findings for the future phase.

## Discrepancies requiring UX review
1. RESOLVED by Kyle: single selection 144:1122 incorrectly shows other categories. Filtering now hides nonmatching products while retaining their selections.
2. Multiple selection 144:1490: Sensi Smart, 80 Series, 70 Series, two wallplates and module are visually selected (six); summary lists five and omits 70 Series.
3. First card row uses an aspect ratio; later rows use fixed height. Preserve the initial rendered variation for the first comparison; decide whether to normalize later.
4. RESOLVED by Kyle: populated inputs must use Aileron; Fira Sans was accidental.
5. Uploaded content does not enable any switches automatically; Continue remains disabled. An explicit eligibility rule is absent.
6. Some active-frame products keep both switches off while Continue is enabled. Decide whether unbranded selected products can proceed.
7. Preview text includes “This in an example” while the input says “This is an example”; displayed counters also need derivation from actual input.
8. Fixed/minimum 1280 wrappers conflict with responsive requirements. Interpret visual constraints rather than reproducing those minimum widths.
9. Layer names include copied labels such as “Thank You Page”; they do not define application routes.
10. Missing designs: search-empty, upload errors, removal confirmation, focus/hover, narrow screens, completion and auxiliary navigation destinations.

## Validation
Historical Phase 1: Figma screenshots were inspected for all nine states. The initial 1280px browser output was compared against its matching reference and corrected for image shadows, progress spacing and footer branding position. The build and six Playwright checks passed. Keyboard selection, dialog focus, loaded local fonts/images and narrow-screen overflow were checked; a comprehensive accessibility audit was not performed. Historical evidence is in validation/README.md. Current Phase 2 results follow below.

### Phase 2 superseding update
The user's Phase 2 scope is complete Step 1, not Step 2. Step 1 is now implemented and all eleven Playwright tests pass. Refreshed design contexts for 144:1122 and 144:1490 and reference exports for all three Step 1 frames were compared to browser screenshots at 1280px. Corrections include selected fill #eef2fc, 1px selected borders, 18px summary headings, 44/50px summary images and 31px spacing before Continue.

Remove and Clear All are required additions absent from the reference. The one-selection screenshot uses All Products because Kyle rejected the source's active-Thermostats/full-catalog contradiction. The multiple screenshot uses the five products listed in the reference summary; a sixth selected family correctly appears in both count and summary. These intentional departures and rasterization differences are documented in validation/phase2/README.md. Same-tab navigation is functional through an explicit boundary screen; Step 2 remains unimplemented.
