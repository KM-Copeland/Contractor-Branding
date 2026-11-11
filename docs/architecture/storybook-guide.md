# Storybook guide

Storybook is the interactive workshop for inspecting existing UI components in isolation. The application components, CSS Modules, `tokens.css`, global reset and local assets remain the source of truth; stories provide examples and small interaction wrappers, not replacement implementations.

## Run and navigate

- npm is the supported package manager for this pilot. Use `npm ci` for a clean install from `package-lock.json`; `pnpm-lock.yaml` is not synchronized with the Storybook dependencies and was left unchanged.
- `npm run storybook` starts the workshop at `http://127.0.0.1:6006` independently of Vite's application server.
- `npm run build-storybook` builds the static workshop into the ignored `storybook-static/` directory.
- Use the left sidebar to browse the complete catalog: Foundations, shared design controls, product selection, branding, workflow screens, and application shell. The catalog has stories for all 30 exported production UI components, plus screens and the full app. The canvas toolbar includes 320, 390, 414, 768, 1280 and 1440 pixel viewport presets.
- Use Controls to change the story's documented args. Stateful stories also let you click, type, or toggle directly in the canvas; the story wrapper owns only that demonstration state.

## Add a story

1. Add a co-located `ComponentName.stories.tsx` beside the production component.
2. Use a typed CSF meta with a responsibility-based title, `tags: ['autodocs']`, a short component description and controls for meaningful supported props.
3. Use the real component, production CSS Module and production data/types. Give stories deterministic names such as `Empty`, `Selected`, `Warning` or `LongContent` only when that state is supported.
4. For controlled interactions, wrap the component in story-local React state and pass the component's existing callbacks. Keep business rules in production code; do not add another reducer or mock domain.
5. For workflow states, reuse `src/stories/WorkflowScenario.tsx`. It prepares scenarios through the app's existing provider actions; keep fixtures, object URLs and layout wrappers inside `src/stories/`.
6. Add a shared fixture or decorator only when at least two stories benefit from it. A thin wrapper can reuse parent layout classes when a component requires its existing context.

The [component coverage matrix](storybook-component-coverage.md) lists every catalogued production UI component and its scenarios. The [full catalog record](storybook-full-catalog-implementation-record.md) documents completion and verification. The earlier [pilot record](storybook-pilot-implementation-record.md) remains the historical record for the first 26 stories.

## Accessibility and responsive checks

Use the Accessibility panel to inspect names, labels, semantics, keyboard focus and common contrast issues. Treat findings as either story/configuration issues or production-component issues; report genuine production findings separately rather than silently changing the component during story setup. Manual keyboard and assistive-technology checks remain necessary.

Choose a viewport preset from the canvas toolbar to inspect responsive behavior. This changes the story iframe dimensions; it does not emulate physical iOS Safari. Keep native-device claims separate from Storybook and Chromium checks.

Storybook complements the app's TypeScript/build checks and Playwright workflow tests. It does not replace them, full-screen visual review, or physical-device validation.
