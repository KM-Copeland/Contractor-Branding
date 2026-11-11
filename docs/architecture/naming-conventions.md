# Naming conventions audit

## Existing patterns

- React component files and exported components use PascalCase (`ProductCard.tsx`, `SelectedProductsSidebar`).
- Hooks and callbacks use camelCase with verbs for actions (`useWorkflow`, `removeProduct`, `setActiveProduct`).
- CSS Modules use camelCase class keys.
- Product IDs, route hashes, reducer action discriminants, and asset names use different formats because each is an external or domain identifier. Do not normalize them blindly.

## Compatibility and naming findings

| Current name | Why it can confuse | Possible direction | Constraint |
| --- | --- | --- | --- |
| `continueSelection` in context | The Step 1 prop uses the same phrase but means navigation through `App`; the context callback dispatches an apparently unconsumed reducer action. | Remove the unused context API after compatibility search, or rename the route callback to `onContinue` at the feature boundary. | Don’t conflate reducer progress with URL navigation. |
| `--shadow-header` | Current observed consumer is a notice/dialog, not the header. | Rename by visual role after verifying all consumers. | Keep exact computed shadow. |
| Generic CSS keys (`active`, `row`, `panel`) | Hard to infer the owning element in nested compositions. | Prefer feature-scoped names such as `activeProductRow` where they improve readability. | CSS Modules already scope names; avoid mass renaming without a behavior benefit. |

## Conventions for future work

- Use nouns for component names and verbs for callbacks/actions.
- Prefer a name that reflects the user's task or domain (`ProductConfigurationCard`) over its incidental styling (`BlueBox`).
- Keep route identifiers and product identifiers stable when used in URLs, saved references, or tests.
- Name design tokens for intent (`border-subtle`, `surface-selected`) and reserve raw numeric names for primitive scales.
- Rename in small batches with compile, route, accessibility, and test updates in the same change.
