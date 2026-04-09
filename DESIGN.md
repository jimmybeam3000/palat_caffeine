# Design Brief — Palantir-Inspired Intelligence Platform

**Purpose**: Enterprise intelligence platform for analysts tracking threats, entities, and incidents in real time with precision-focused, high-contrast visual hierarchy.

**Tone**: Utilitarian, authoritative, technical precision. Every element conveys competence.

**Typography**: Space Grotesk (display/headers, technical authority) + DM Sans (body, clarity) + JetBrains Mono (data/code, precision).

## Color Palette (OKLCH)

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| **Background** | `0.98 0 0` | `0.12 0 0` | Page canvas |
| **Card** | `0.95 0 0` | `0.17 0 0` | Elevated surfaces |
| **Primary** | `0.65 0.15 265` | `0.62 0.15 265` | Technical blue, interactive elements, buttons |
| **Destructive** | `0.55 0.22 25` | `0.62 0.22 25` | Alerts, critical states |
| **Border** | `0.88 0 0` | `0.25 0 0` | Structural dividers |
| **Entity-Person** | `0.62 0.15 265` | `0.62 0.15 265` | Blue accent for people nodes |
| **Entity-Org** | `0.65 0.18 310` | `0.65 0.18 310` | Purple accent for organizations |
| **Entity-Asset** | `0.65 0.20 50` | `0.70 0.20 50` | Amber accent for assets |
| **Entity-Event** | `0.60 0.22 25` | `0.62 0.22 25` | Red accent for events |

## Severity & Status Indicators

| Level | OKLCH | Usage |
|-------|-------|-------|
| **Critical** | `0.60 0.22 25` | Red, highest priority incidents |
| **High** | `0.60 0.20 40` | Orange, elevated risk |
| **Medium** | `0.65 0.20 90` | Yellow, monitor |
| **Low** | `0.65 0.18 150` | Green, informational |
| **Open** | `0.60 0.22 25` | Red badge background |
| **Investigating** | `0.60 0.20 40` | Orange badge background |
| **Closed** | `0.65 0.18 150` | Green badge background |

## Structural Zones

| Zone | Treatment | Purpose |
|------|-----------|---------|
| **Header** | Card with bottom border (`border-b border-border`), elevated typography | Navigation, title, context |
| **Sidebar** | Subtle background shift (`bg-sidebar`), borders for section dividers | Navigation menu, filters |
| **Content Grid** | Card-based layout with `card-elevated` utility (border, subtle shadow) | Data cards, KPIs, charts |
| **Footer** | Muted background (`bg-muted/20`), border-top, smaller typography | Meta info, pagination |

## Component Patterns

- **KPI Card**: `card-elevated` with icon + value + trend indicator. Left border accent (primary color).
- **Entity Node**: Circle node with border-l-4 semantic color (person/org/asset/event). Clickable to expand relationships.
- **Incident Row**: Card row with severity badge (color + background), status badge, title, timestamp.
- **Integration Source**: Card with icon, source name, sync status (green/yellow/red dot), last sync time.
- **Button**: Primary (blue bg, white text), Secondary (border only), Destructive (red).

## Motion

- **Default transition**: `.transition-smooth` (0.3s ease-out) on hover states, focus rings, color changes.
- **No animations** on page load — clarity over delight.

## Constraints

- **Accessibility**: WCAG AA+ contrast ratios maintained in all color combinations.
- **Density**: Compact grid layouts for information density; breathing room in details.
- **Hierarchy**: Typography size + weight + color conveys importance; no reliance on decoration alone.
- **Dark mode primary**: Light mode available as fallback.

## Fonts

- **Display**: Space Grotesk 400 — headers, titles, navigation.
- **Body**: DM Sans 400 — paragraphs, descriptions, labels.
- **Mono**: JetBrains Mono 400 — IDs, codes, timestamps, data values.

## Signature Detail

Semantic entity type borders (left border accent `border-l-4`) combined with chart-specific color tokens create visual cohesion across graph, feed, and integration hub. Severity/status badges layer color + semi-transparent background for scannable alert hierarchy. Dark mode lifts hierarchy through border subtlety (25% opacity on `bg-border`) rather than heavy shadows.
