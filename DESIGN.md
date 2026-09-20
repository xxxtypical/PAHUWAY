# Design Brief

## Direction

Sari-Sari Neon — a Philippine food-delivery marketplace that renders tropical warmth in a bold magenta-rose brand system on a warm off-white canvas.

## Tone

Confident consumer e-commerce: saturated brand color, generous rounding, food photography as the hero, dense but breathable mobile-first layout. Bold, never cute.

## Differentiation

Every price is set in tabular monospace with a superscript peso glyph, so the ₱ amount is the loudest typographic event on any card — a marketplace that treats price as the primary content, not an afterthought.

## Color Palette

| Token      | OKLCH         | Role                                                       |
| ---------- | ------------- | ---------------------------------------------------------- |
| background | 0.985 0.004 20 | Warm off-white app canvas                                  |
| foreground | 0.19 0.02 340  | Deep plum-ink text, headings, prices                       |
| card       | 1 0 0          | Pure white restaurant/dish cards and sticky header          |
| primary    | 0.52 0.215 355 | Brand magenta-rose — CTAs, active chips, cart badge, links  |
| accent     | 0.78 0.155 72  | Mango amber — promo badges, price emphasis, ratings         |
| muted      | 0.965 0.008 340| Chip rails, secondary surfaces, inactive filters            |
| success    | 0.6 0.16 152   | Delivered status, COD confirmation                          |
| warning    | 0.76 0.15 85   | Preparing / pending states                                  |
| info       | 0.68 0.125 200 | Out-for-delivery status, informational pills                |
| destructive| 0.55 0.22 27   | Remove item, delete address, cancel order                   |

## Typography

- Display: Plus Jakarta Sans — wordmark, page headings, restaurant names, section titles
- Body: DM Sans — descriptions, menu copy, labels, form fields, buttons
- Mono: JetBrains Mono — prices, order numbers, delivery ETAs, dashboard counts
- Scale: hero `text-4xl sm:text-5xl font-bold tracking-tight`, h2 `text-2xl sm:text-3xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase text-muted-foreground`, body `text-sm sm:text-base`

## Elevation & Depth

Flat warm canvas with layered white surfaces: `shadow-subtle` for chips and inputs, `shadow-card` for restaurant/dish cards, `shadow-card-hover` on hover, `shadow-sticky` for the header and cart bar. No glassmorphism, no glow.

## Structural Zones

| Zone        | Background              | Border             | Notes                                                       |
| ----------- | ----------------------- | ------------------ | ----------------------------------------------------------- |
| Header      | `bg-card`               | `border-b`         | Sticky; wordmark + location pill + avatar + cart badge       |
| Search rail | `bg-card`               | `border-b`         | Pill search input and horizontally scrolling cuisine chips   |
| Content     | `bg-background`         | —                  | Alternating `bg-muted/30` bands between major sections       |
| Promo band  | `bg-gradient-promo`     | —                  | Amber→magenta gradient card, rounded-3xl, white type         |
| Footer      | `bg-muted/40`           | `border-t`         | Quiet links, app info, safe-area bottom padding              |
| Admin shell | `bg-sidebar`            | `border-r`         | Merchant dashboard sidebar, magenta active item              |

## Spacing & Rhythm

Mobile-first: `px-4` gutters, `gap-3` in chip rails, `gap-4 sm:gap-6` in card grids, `py-8 sm:py-12` between sections; `space-y-2` inside cards and `space-y-6` between form groups.

## Component Patterns

- Buttons: `rounded-full` pills; primary = solid `bg-primary` with white text and `shadow-card`; secondary = `bg-secondary`; ghost = transparent with `hover:bg-muted`; hover lifts with `-translate-y-0.5`
- Cards: `rounded-2xl bg-card shadow-card`, image on top with `rounded-t-2xl`, `overflow-hidden`, hover to `shadow-card-hover`
- Badges: small `rounded-full px-2.5 py-1 text-xs font-semibold`; promo = `bg-accent text-accent-foreground`, rating = `bg-primary/10 text-primary`, status pills tinted by state token
- Inputs: `rounded-full` search, `rounded-xl` form fields, `border-input`, focus ring `ring-2 ring-ring`

## Motion

- Entrance: `animate-fade-in-up` staggered ~40ms per card on list load; `animate-fade-in` for route content
- Hover: `transition-smooth` — cards lift 2px and deepen shadow; buttons shift color, never scale
- Decorative: `animate-pulse-soft` on the live order status dot; skeleton rows use `animate-shimmer`

## Constraints

- Tokens only — no hex, `rgb()`, or arbitrary `bg-[#...]` values in components
- 3 core colors (magenta-rose, mango amber, turquoise-info) plus neutrals; no rainbow palettes
- Mobile-first: every layout must work at 360px before it is widened
- Light theme is primary; dark theme must be tuned, not inverted
- No grocery/pandamart vertical, rider app, promo-code redemption, or customer ratings/reviews surfaces

## Signature Detail

Tabular monospace peso pricing with a superscript ₱ glyph, paired with a gradient promo band — price-forward typography as the marketplace's identity (category: typographic treatment).
