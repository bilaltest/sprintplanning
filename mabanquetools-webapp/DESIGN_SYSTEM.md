# MaBanqueTools Design System

This document outlines the design principles, tokens, and components used in the MaBanqueTools application. Future developments must adhere to these guidelines to maintain visual consistency.

## 1. Core Principles
- **Modern & Premium**: Use glassmorphism, subtle gradients, and smooth interactions.
- **Responsive**: Mobile-first approach using Tailwind breakpoints.
- **Dark Mode First**: Colors are optimized for dark mode (using `gray` palette) but work seamlessly in light mode.
- **Visual Feedback**: Interactive elements have hover states, focus rings, and transitions.

## 2. Colors

### Brand & Modules
- **Credit Agricole Identity**: `ca` palette (Base: `#00a859`).
- **Planning Module**: `planning` (Emerald: `#10b981`) and `planning-blue` (Blue: `#3b82f6`).
- **Releases Module**: `releases` (Emerald: `#10b981`), `releases-secondary` (Blue: `#3b82f6`), and `releases-alert` (Amber: `#f59e0b`).

### Neutrals (Dark Mode Optimized)
Custom `gray` palette tailored for depth in dark interfaces.
- **Backgrounds**: `gray-800` (Main), `gray-750` (Cards/Surfaces).
- **Text**: `gray-900` (Primary Light), `gray-100` (Primary Dark), `gray-500` (Secondary).

### Event Types
Semantic colors for event categorization:
- **MEP**: `#22c55e` (Green)
- **Incident**: `#ef4444` (Red)
- **Hotfix**: `#dc2626` (Dark Red)
- **Maintenance**: `#f97316` (Orange)
- **Meeting**: `#3b82f6` (Blue)
- et al. (see `tailwind.config.js` for full list).

## 3. Typography
- **Font Family**: 'Inter', system-ui, sans-serif.
- **Icons**: Material Icons (Outlined/Filled).
- **Headings**: Bold weights, clear hierarchy (`text-2xl`, `text-xl`, `font-bold`).
- **Body**: `text-sm` or `text-base` for readability.

## 4. Components & Utilities (Styles.scss)

### Buttons
Classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-releases`, `.btn-planning`
- **Shape**: Rounded-lg (`rounded-lg`).
- **Interaction**: Transform scale on hover (`hover:scale-105`), shadow depth (`shadow-md` -> `shadow-lg`).
- **Gradients**: Used for primary calls to action (e.g., `.btn-releases` uses `bg-gradient-action-cta`).

### Cards
Classes: `.card`, `.card-releases`, `.card-planning`
- **Surface**: `bg-white` (Light) / `bg-gray-750` (Dark).
- **Border**: Thin borders (`border-gray-200`/`600`) for definition.
- **Interactiveness**: `card-releases` has a lift effect (`hover:-translate-y-2`) and shadow bloom on hover.

### Glassmorphism
Utility classes for frosted glass effects:
- `.glass`: Standard blur (`backdrop-blur-md`).
- `.glass-strong`: Heavier blur (`backdrop-blur-xl`).
- `.glass-planning`: Tuned for the planning module.
- `.glass-releases`: Tuned for releases (green tint).

### Modals
- **Overlay**: Backdrop blur (`backdrop-blur-sm`).
- **Content**: Glassmorphic container (`glass-planning`), rounded corners (`rounded-xl`), floating header (`modal-header-glass`).

### Badges
- **Shape**: Fully rounded (`rounded-full`).
- **Padding**: `px-3 py-1`.
- **Context**: Used for statuses, counts, and date deltas (e.g., "J-5").

## 5. Effects & Animations
- **Transitions**: `transition-all duration-200` or `300` for smooth state changes.
- **Custom Animations**:
    - `fade-in`: Opacity 0 -> 1.
    - `slide-up`: Translate Y 10px -> 0.
    - `fade-in-scale`: Scale 0.95 -> 1 & Opacity.

## 6. Implementation Guidelines
When creating new components:
1. **Use Tailwind Utility Classes** for layout (Flex/Grid), spacing (p/m), and typography.
2. **Apply Semantic Classes** (`.card-releases`, `.btn-primary`) for consistent component styling.
3. **Ensure Dark Mode Support** by adding `dark:` variants for colors and borders.
4. **Maintain "Premium" Feel** by adding hover effects (`hover:shadow`, `hover:scale`) to clickable elements.
