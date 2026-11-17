# Navigation drawer implementation record

## Scope

Added the White-Rodgers customer-support link to the shared desktop navigation and implemented the responsive modal drawer below 1280px. The work keeps route/workflow state separate from navigation presentation and does not change product selection, branding, action-footer, or progress behavior.

## Implementation

- `src/app/navigation.ts` holds the shared Order History, FAQ, and Support definitions, including the one exact Support URL. The external destination is a native `_blank` anchor with `noopener noreferrer` in both layouts.
- `src/app/NavigationDrawer.tsx` owns the native `dialog` lifecycle, focus entry/restoration, Escape/backdrop/close behavior, page scroll locking, responsive close action, and the pending notice/account action sequence.
- `src/app/NavigationDrawer.module.css` owns the right-side layout, 360px maximum width, viewport-safe width/height, safe-area padding, 220ms entrance/backdrop animations, and reduced-motion behavior.
- `src/app/AppShell.tsx` keeps menu-open state at the shell boundary and retains the desktop JD placeholder. `src/app/App.tsx` accepts optional `accountPresentation`, defaulting to `signed-out`; it is a presentation prop, not an authentication service.
- `src/styles/tokens.css` adds `--color-navigation-backdrop` at 50% opacity. Other drawer color, type, spacing, and focus treatment use existing semantic tokens.

## Account and action contract

The host passes `accountPresentation: 'signed-out' | 'signed-in'`. Signed-out displays Sign In; signed-in displays Logout. Both invoke the existing prototype notice mechanism and explicitly state that no session was created or changed. Order History and FAQ retain their existing notices. No login route, credentials, or authentication state mutation was introduced. When real authentication is added, its host should provide the presentation value and real action callbacks through this boundary.

## Accessibility and responsive behavior

The drawer uses `showModal()` and a labelled native dialog. It starts focus on Close, contains keyboard focus, closes on Escape and backdrop, blocks interaction with the underlying page, locks background scroll and restores prior overflow and scroll position, then returns focus to the trigger. On crossing to 1280px, it closes and focuses the first desktop navigation action. The responsive drawer leaves the requested 48px glimpse on narrow screens and covers header, progress, content, and the fixed footer through the browser's modal top layer. Motion stops for `prefers-reduced-motion`.

## Storybook

Added `Navigation / NavigationDrawer` examples for open, signed-in/out, close/Escape, placeholder action, Support destination, short viewport scrolling, and reduced motion. Expanded `Application / AppShell` for desktop Support, responsive closed/open, signed-in/out, tablet, and breakpoint examples. Added a signed-in presentation example to `Application / Full Workflow`.

## Validation

Baseline evidence before edits is retained at `C:/Users/welau/.codex/visualizations/2026/10/08/01a11c5d-9825-7c83-8a1d-72a5d2451728/navigation-drawer-before-2026-11-17`, including a full project checkpoint and header crops at 320, 375, 390, 414, 768, 1024, 1279, 1280, 1440, and 1920 pixels. Post-change captures are stored under `docs/validation/navigation-drawer/` and use matching widths.

The focused Playwright spec is `tests/navigation-drawer.spec.ts`. It checks both Support anchors and popup behavior, all specified viewport dimensions and the 1279/1280 breakpoint, drawer geometry/backdrop, focus/scroll lock, Escape/backdrop/action dismissal, and workflow persistence through landing, selection, responsive Step 2 imprint/list/preview, desktop Step 2, and completion.

Final validation: TypeScript passed; the Vite production build passed; the static Storybook build passed; the Storybook index contains 127 stories and 32 Autodocs entries; all 108 Playwright tests passed in an isolated temporary workspace; and `git diff --check` passed. The Storybook build prints the existing large-chunk advisory for Storybook's DocsRenderer/iframe assets. No package or production dependency changes were needed for this navigation feature.

## Before/after comparison

The retained checkpoint contains before-change header crops. New header crops and responsive drawer captures document the intentional Support/menu additions and the open overlay. For example, compare `C:/Users/welau/.codex/visualizations/2026/10/08/01a11c5d-9825-7c83-8a1d-72a5d2451728/navigation-drawer-before-2026-11-17/before-header-captures/header-1280.png` with `docs/validation/navigation-drawer/header-1280.png`; the new capture adds Support without wrapping or moving the account out of the 50px bar. The 390px drawer capture shows the 48px app glimpse under the 50% backdrop. Unchanged application content and progress geometry remain covered by the existing regression suite; the navigation-specific captures are not represented as pixel-identical historical baselines.

## Remaining limitation

Authentication, Order History, and FAQ remain prototype placeholders because no production services/routes exist. The external Support destination itself requires network access when opened by a user.
