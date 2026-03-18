## Context

The current editor and merchant UIs are functionally complete but visually inconsistent. Existing pages use mixed gradients, mixed typographic rhythm, and card styling that does not match the requested brand language.

This change introduces a deliberate visual system aligned with a New York subway-inspired minimalist style: red and white as dominant colors, black for high-contrast text and framing, dense but legible information hierarchy, and reduced decorative effects.

Constraints:
- No behavior regressions in design/config/export workflows.
- Maintain existing component architecture and data flow where possible.
- Keep UI readable in desktop and mobile views.
- Preserve production-critical signals (safety boundary warnings, export errors, parse status).

Stakeholders:
- End customers using the editor before Etsy order placement.
- Merchants/operators using the production export tool.

## Goals / Non-Goals

**Goals:**
- Create one shared visual language across editor and merchant tool.
- Apply a red/white high-contrast theme with predictable component states.
- Improve workflow clarity by prioritizing task sequence over decorative grouping.
- Standardize spacing, borders, typography, buttons, and status messages.
- Improve accessibility for focus visibility and text contrast.

**Non-Goals:**
- No redesign of business logic, serialization schema, or production calculation formulas.
- No backend/API changes.
- No new feature scope beyond visual and layout improvements.

## Decisions

1. Design tokens as single source of truth
- Decision: Define a compact token set (primary red, white, near-black, neutral border, status colors) and use these tokens in all page/component styles.
- Rationale: Prevent style drift and allow rapid future tuning.
- Alternative considered: Keep per-component colors. Rejected because it recreates inconsistency.

2. Hard-minimal visual grammar
- Decision: Use low-radius corners, 1px borders, minimal shadows, and clear section separators.
- Rationale: Matches subway-inspired practical signage style and improves scanning speed.
- Alternative considered: Soft cards with layered shadows. Rejected due to lower information density and weaker thematic fit.

3. Workflow-first layout
- Decision: Keep left-to-right operational flow (preview/work area -> controls/actions) with explicit section labels and stronger action hierarchy.
- Rationale: Reduces interaction ambiguity and supports both novice and production users.
- Alternative considered: Multi-tabbed controls. Rejected because it hides state and adds extra navigation friction.

4. Accessibility-first interaction states
- Decision: Require visible focus rings, high-contrast text, and explicit warning/error blocks.
- Rationale: Production workflows must remain readable and recoverable under pressure.
- Alternative considered: Subtle focus styles. Rejected for insufficient visibility.

## Risks / Trade-offs

- [Risk] Overly rigid minimal style may feel less playful for end customers → Mitigation: retain clear section labeling and selective accent usage while preserving minimal baseline.
- [Risk] CSS token migration can miss isolated component styles → Mitigation: perform pass-by-pass audit for editor and merchant component trees.
- [Risk] Responsive density may reduce readability on small screens → Mitigation: define explicit mobile breakpoints with stacked layout and enlarged touch targets.
- [Risk] Theme changes can accidentally reduce warning prominence → Mitigation: pin warning/error semantic colors independent from primary red token.
