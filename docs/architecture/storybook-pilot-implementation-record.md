# Storybook pilot implementation record

## Scope and choices

Added Storybook 10.6.6 with `@storybook/react-vite` and the official `@storybook/addon-a11y`, aligned to the existing React 19, Vite 7 and TypeScript 5 project. The packages are pinned to one Storybook release to keep the framework and CLI in sync. No application runtime dependency or production component behavior changed.

`.storybook/main.ts` discovers co-located `src/**/*.stories.tsx`, uses the existing `public/` assets, enables Autodocs and registers the accessibility addon. `.storybook/preview.ts` loads the real token and global styles and provides 320, 390, 414, 768, 1280 and 1440 pixel viewport choices. `storybook-static/` is ignored.

## Story inventory

The pilot includes five requested production components:

- `Button`: default, disabled and long label.
- `BrandingToggle`: off, on and disabled, all with a working local interaction wrapper.
- `ImprintTextFields`: empty, populated, independent bold states, near limit, maximum length and long content; the wrapper uses the production form layout classes and keeps 30-character content.
- `LogoValidationMessage`: success, warning, error and expanded details using deterministic production-shaped results.
- `ProductConfigurationCard`: unconfigured, logo, text, combined, mutually exclusive and long-name product examples from the real catalog.

Also included `BackButton` as a small shared action and one foundations sample for the existing tokens and font stack. Total: 26 stories across seven entries. `fn()` callbacks appear in Storybook Actions; only demonstration state lives in the story wrappers.

## Validation

Baseline before Storybook changes: TypeScript and Vite production build passed; full Playwright suite passed 99/99. The protected checkpoint is outside the repository.

Post-integration builds and Storybook checks: TypeScript, the Vite production build and Storybook static build passed. Storybook serves an index with 26 stories and seven Autodocs entries. Browser checks confirmed story navigation and rendering, toggle interaction, text entry and counters, validation alert semantics, and mutually exclusive configuration. The existing Aileron fonts and product assets returned HTTP 200, and the 390px text-fields viewport had no horizontal overflow. No production source file that existed in the protected checkpoint changed for this pilot.

## Final verification

The first post-integration application run reported 97 passed and two screenshot-write failures. Two further runs from the normal workspace reported 98 passed / 1 failed and 96 passed / 3 failed. Every failure was a Playwright output operation with the same Windows error, `Error: UNKNOWN: unknown error, open '<path>'`, on these existing `docs/validation` targets: `product-imprint-placement/sensi-module-logo.png`, `phase2/single-selection-geometry.json`, `full-width-correction/step2-2048.png`, `product-imprint-placement/wallplate-touch2-lite-logo.png`, `full-width-correction/step1-2048.png`, and `step1-pass1/single-selection-1920x2113.png`. No application assertion failed. The previously failing full-width test passed 1/1 when run alone. The Windows `openfiles /query` facility could not inspect local handles because local object tracking is disabled; exclusive-open probes found the files available after each failure, so the process that interfered at write time could not be identified.

To isolate the artifact location without changing test assertions or the application, the full suite was run against a temporary copy of the current working tree, with a separate validation directory and a temporary Playwright config pointing Vite at port 5174. That run passed all 99 tests in 2.6 minutes. This confirms the test behavior against the same current source while keeping test-generated screenshots out of historical evidence. All 489 files under the protected `docs/validation` checkpoint now match byte-for-byte; no files were missing or added. The original checkpoint remains outside the repository. Normal-workspace Playwright writes remain an intermittent Windows filesystem limitation; if needed, run the suite from an isolated working copy or later move screenshot outputs to a run-specific directory, which would stop updating the canonical comparison images automatically.

Package verification: the `package.json` declarations match `package-lock.json`; `npm ls --package-lock-only --depth=0` and `npm ci --dry-run --ignore-scripts --offline` both passed. The Storybook packages are pinned to 10.6.6. Comparing against the protected pre-pilot lockfile found zero version changes to existing packages. `pnpm-lock.yaml` remains untouched and does not contain the Storybook packages; npm is the supported installation path for this pilot.

Closeout: the Storybook pilot is complete. The application regression suite passed 99/99 in the isolated-artifact run, the three builds passed, the protected validation evidence is restored and verified, and no application behavior or test assertions were changed.

## Known limits

The existing font-face declarations and font files are reused. Browser rendering can confirm the declared Aileron family loads in the iframe, but cannot establish native iOS Safari input behavior. The accessibility addon reports automated checks only; keyboard, screen reader and physical-device review remain separate checks.
