# Design Brief

## Direction

Brick Showcase — a bright, joyful LEGO toy-store storefront (DayShop) built from chunky rounded shapes, vivid brick colors, and tactile "stud" surfaces.

## Tone

Playful, premium toy-retail: saturated brick red and gold on warm off-white, executed with confident spacing and rounded, friendly forms.

## Differentiation

A tactile brick language — stud-dot textures, chunky bottom-edge card shadows, and per-theme color bands — makes every surface feel like a physical LEGO set rather than a generic shop.

## Color Palette

| Token      | OKLCH          | Role                                    |
| ---------- | -------------- | --------------------------------------- |
| background | 0.975 0.012 85 | Warm off-white page canvas              |
| foreground | 0.22 0.035 40  | Deep warm charcoal text                 |
| card       | 1.0 0 0        | Pure white product surfaces             |
| primary    | 0.56 0.225 27  | LEGO brick red — CTAs, prices, brand    |
| accent     | 0.82 0.165 88  | Brick-yellow gold — badges, highlights  |
| muted      | 0.945 0.018 85 | Section alternation, subtle panels      |
| destructive| 0.55 0.22 25   | Errors and validation states            |

## Typography

- Display: Nunito — headings, wordmark, hero; rounded and friendly, weights 700–900
- Body: Plus Jakarta Sans — paragraphs, labels, UI text
- Mono: Geist Mono — prices/order refs if needed
- Scale: hero `text-5xl md:text-7xl font-extrabold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-sm font-bold tracking-widest uppercase`, body `text-base md:text-lg`

## Elevation & Depth

White cards float on the warm canvas with `shadow-brick` (solid bottom edge + soft drop) that deepens to `shadow-brick-hover` on lift; hero and footer use flat color blocks for contrast.

## Structural Zones

| Zone    | Background            | Border          | Notes                                              |
| ------- | --------------------- | --------------- | -------------------------------------------------- |
| Header  | `bg-card`             | `border-b`      | Sticky, brand wordmark left, nav center, login pill right |
| Hero    | `bg-gradient-hero`    | —               | Split layout: headline + CTA left, product mosaic right |
| Content | `bg-background` / `bg-muted/40` | —    | Alternate section tints for rhythm                  |
| Footer  | `bg-foreground`       | —               | Dark charcoal band, white text, link columns        |

## Spacing & Rhythm

Sections use `py-16 md:py-24` with `max-w-7xl` container; content groups at `gap-6 md:gap-8`; product grids `gap-5`; micro-spacing in cards `p-5` with `space-y-2`.

## Component Patterns

- Buttons: full-radius pills; primary = brick red with `shadow-brick`, hover lifts + darkens; secondary = white with `border-border`
- Cards: `rounded-2xl` white, `shadow-brick`, hover `-translate-y-1` + `shadow-brick-hover`; product image sits on a soft tinted panel
- Badges: pill `rounded-full`, gold accent or theme color, uppercase bold micro-label
- Theme cards: solid saturated color band per franchise (Ninjago red, Star Wars navy, Chima green, Scooby purple, Variado teal)

## Motion

- Entrance: `animate-fade-up` staggered on hero and section headers (0.5s, ease-out)
- Hover: `transition-smooth` lift on cards/buttons, `animate-float-slow` on hero decorative bricks
- Decorative: `animate-pop-in` for badges and login feedback; restrained, one motion story

## Constraints

- Spanish UI copy throughout; currency in EUR
- Light mode is primary; dark mode is a tuned, intentional variant
- No cart/checkout, no product search or theme filters in this build
- Never use raw hex or arbitrary color classes — semantic tokens only

## Signature Detail

The "brick stud" texture (`brick-studs`) and chunky bottom-edge card shadow (`shadow-brick`) — a tactile physical-brick motif across hero, cards, and section dividers.
