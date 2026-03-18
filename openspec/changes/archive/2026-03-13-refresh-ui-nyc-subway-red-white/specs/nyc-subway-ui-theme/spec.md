## ADDED Requirements

### Requirement: Shared NY subway-inspired theme tokens
The UI system MUST define and use a shared token palette where primary visual emphasis is red and white, with black/near-black used for body text and framing.

#### Scenario: Theme token application in editor and merchant
- **WHEN** a user opens either the editor or merchant tool
- **THEN** core UI surfaces, headings, buttons, and separators use the same tokenized color system

### Requirement: Consistent component state styling
All interactive controls SHALL expose consistent visual states for default, hover, active, focus, disabled, warning, and error.

#### Scenario: Focus and disabled states remain predictable
- **WHEN** a user tabs through controls or encounters disabled actions
- **THEN** focus rings and disabled visuals follow the same style rules across both applications

### Requirement: High-contrast readability baseline
Primary text and critical UI labels MUST meet a high-contrast baseline suitable for production workflows.

#### Scenario: Critical status readability
- **WHEN** warning or error messages are displayed
- **THEN** text remains clearly legible against background color and visually distinct from neutral informational text

### Requirement: Typography hierarchy standardization
The system MUST provide a standardized typography scale for page title, section title, body text, label text, and monospace code blocks.

#### Scenario: Cross-page hierarchy parity
- **WHEN** users compare information blocks between editor and merchant pages
- **THEN** equivalent hierarchy levels render with consistent size, weight, and spacing relationships
