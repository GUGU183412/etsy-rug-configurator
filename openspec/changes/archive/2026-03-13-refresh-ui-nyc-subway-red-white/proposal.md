## Why

The current editor and merchant interfaces use mixed visual styles, which makes the product feel inconsistent and less production-grade. We need a unified visual system that reflects the target brand direction (red/white, New York subway-inspired minimalism) and improves clarity for both customer design flow and merchant production flow.

## What Changes

- Introduce a shared visual language based on high-contrast red/white/black design tokens with minimal ornamentation.
- Redesign the editor UI structure, controls, and hierarchy to match a subway-inspired minimal information layout.
- Redesign the merchant tool UI as a production console with stronger readability, status visibility, and action emphasis.
- Standardize typography, spacing, borders, focus states, and feedback patterns across both applications.
- Improve responsive behavior and accessibility contrast/focus clarity while preserving existing functional workflows.

## Capabilities

### New Capabilities
- `nyc-subway-ui-theme`: Define and apply a subway-inspired UI theme system (color, typography, spacing, component states) across editor and merchant tools.
- `workflow-first-ui-layout`: Define information architecture and layout rules that prioritize task flow for customer editing and merchant production operations.

### Modified Capabilities
- None.

## Impact

- Affected code: `packages/editor/src/*.css`, `packages/editor/src/components/*`, `packages/merchant-tool/src/*.css`, `packages/merchant-tool/src/App.tsx`.
- Affected assets: runtime visual tokens and potential iconography/header treatments.
- No API or backend changes; this is a front-end presentation and interaction-layer change.
- Requires design QA for desktop/mobile breakpoints and contrast/focus compliance.
