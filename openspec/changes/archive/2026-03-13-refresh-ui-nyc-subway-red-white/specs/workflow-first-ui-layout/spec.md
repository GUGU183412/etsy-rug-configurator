## ADDED Requirements

### Requirement: Editor uses workflow-first information layout
The editor SHALL present layout regions in a workflow-first sequence: preview/work area, primary actions, and control groups ordered by design progression.

#### Scenario: Customer completes design flow without hidden steps
- **WHEN** a customer performs pattern, color, text, and code generation actions
- **THEN** required actions appear in an explicit order without relying on hidden navigation

### Requirement: Merchant tool uses production-console layout
The merchant tool MUST present parse, validation, preview, and export actions with clear production status visibility.

#### Scenario: Merchant validates before export
- **WHEN** a merchant pastes a configuration code
- **THEN** parse status and key production metadata are visible before export action is triggered

### Requirement: Responsive behavior preserves task clarity
Both applications SHALL preserve workflow comprehension on mobile and narrow screens by stacking regions in task order and preserving action prominence.

#### Scenario: Narrow viewport interaction
- **WHEN** viewport width is below the defined mobile breakpoint
- **THEN** regions stack in logical task sequence and primary actions remain visible and accessible

### Requirement: Feedback surfaces are location-stable
Success, warning, and error feedback MUST appear in stable, predictable locations near the affected task region.

#### Scenario: Export failure feedback placement
- **WHEN** export fails in merchant tool
- **THEN** error feedback appears adjacent to export controls and does not require scrolling to discover
