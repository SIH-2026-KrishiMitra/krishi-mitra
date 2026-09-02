# Krishi Mitra — Design System

**Krishi Mitra** is a modern Indian agriculture marketplace connecting **farmers**, **FPOs** (Farmer
Producer Organisations) and **verified buyers**. Farmers list crop lots and see real mandi prices;
buyers discover and bid on lots; money moves through escrow; FPOs aggregate lots on behalf of member
farmers; an internal admin console verifies identities, price sources and disputes.

> **Your crop. Your price. Your trusted market.**

## Sources

This design system was authored **from a written brief only**. No codebase, Figma file, slide deck,
logo files or screenshots were supplied.

| Source | Status |
| --- | --- |
| Codebase / repository | none provided |
| Figma file or link | none provided |
| Logo / brand assets | **none provided** — see "Logo" below |
| Font binaries | none provided — Google Fonts substitutes in use, see "Font substitutions" |
| Decks / marketing copy | none provided |

Everything here is therefore an original system built to the brief's constraints (premium
agriculture + fintech; no generic SaaS dashboard, no heavy gradients, no glassmorphism, no
stereotypical rural imagery). Where a real brand asset would normally live, this system either uses
plain type or leaves a documented gap rather than inventing one.

## The four surfaces

| Surface | Device posture | Primary jobs |
| --- | --- | --- |
| **Farmer app** | Mobile-first, one thumb, offline-first, multilingual | See today's price, list a lot, accept a bid, track payment |
| **Buyer console** | Desktop-first, dense, data-led | Discover lots, bid, fund escrow, manage deliveries |
| **FPO console** | Desktop-first with mobile fallback | Aggregate member lots, run collective sales, distribute payouts |
| **Admin console** | Desktop only | Verify KYC, manage price sources, resolve disputes |

The layout, components and colour system are **identical across all four**. The only per-role
difference is the role chip in the top nav, whose 3px left rule uses `--role-farmer` /
`--role-buyer` / `--role-fpo` / `--role-admin`. Re-skinning a whole console per role is explicitly
out of bounds — a farmer and a buyer looking at the same lot must see the same object.

---

## CONTENT FUNDAMENTALS

**Voice.** Plain, factual, second person. The product speaks to the user ("Your payment is held in
escrow"), never about itself ("We're excited to announce"). No exclamation marks anywhere in the UI.
No jokes, no encouragement, no "Oops". Money and weight are serious.

**Casing.** Sentence case for everything a user reads — buttons, headings, table cells, alerts.
UPPERCASE with `--ls-caps` tracking is reserved for field labels, table headers and trust markers.
Never Title Case A Whole Sentence.

**Numbers.** Indian digit grouping (`₹1,24,500`), `₹` always prefixed with no space, quintal
abbreviated `qtl` in dense tables and spelled "quintal" in farmer-facing copy. Never round a price
for display. Percentages carry one decimal (`2.7%`).

**Provenance is copy, not chrome.** Every displayed price states where it came from and when:
`Source: Agmarknet · Updated today, 6:40 AM`. A number without a source is a bug.

**Trust wording is fixed** — Verified Buyer, Verified Farmer, Escrow Protected, FPO Backed, Lab
Assayed, Govt. Price Source. Do not paraphrase ("100% safe", "Trusted!") and do not invent a
seventh marker.

**Errors** say what happened, then what happens next, then offer one action:

- Good: `Weight mismatch at gate. Buyer recorded 38.2 qtl against 40 qtl declared. Raise a dispute or accept the revised weight.`
- Bad: `Oops! Something went wrong 😬 Please try again later.`

**Offline is a state, not a failure.** `You are offline · 3 changes saved on this device` — dark ink,
not red. Never apologise for the network.

**Multilingual-ready.** English strings are written short so Hindi and Marathi can grow ~40% without
clipping. No idioms, no wordplay, no puns that will not translate. Devanagari is set one step larger
than the Latin equivalent (`--font-indic`).

**Emoji: never.** Not in the UI, not in notifications, not in empty states. The only non-Lucide
glyphs allowed are `▲ ▼ —` for price movement and `₹`.

---

## VISUAL FOUNDATIONS

**Palette.** A deep **field green** primary (`--green-700` chrome, `--green-600` actions), a
**turmeric** accent reserved for money and MSP lines, **indigo** for verification and escrow, **clay**
for rejection and loss, and warm **paper** neutrals (`--paper #FAF8F4`) — never blue-grey. Two
background colours per screen maximum: paper canvas plus white cards. Tinted cards (`brand`,
`accent`, `trust`) are limited to one per section.

**Type.** Display: **Familjen Grotesk** (semibold, `-0.02em`) for headings and every large number.
Core: **Hanken Grotesk** for all UI and body text. Mono: **IBM Plex Mono**, only for lot IDs, UTR
numbers and hashes. Indic: **Noto Sans Devanagari**. All figures are tabular (`tnum`, `lnum`) so
columns of prices align — this is a fintech, and jittering digits read as untrustworthy.

**Hierarchy.** The number is the loudest thing on the screen: 30–44px display type against a 12px
uppercase label and a 12px provenance line. Everything else is quiet.

**Backgrounds.** Flat colour only. No hero photography, no illustration, no repeating pattern, no
texture, no noise. The one permitted "rich" surface is `--surface-inverse` (`--green-950`), used for
a single dark stat block or hero at most. **No gradients** except the barely-there chart area wash
(18% → 0% of the line colour) and the skeleton shimmer. No glassmorphism, no backdrop blur anywhere.

**Cards.** White fill, `1px solid var(--border-default)` warm hairline, `--radius-lg` (16px), and one
soft warm shadow (`--shadow-sm`). Never a coloured left border. Never a shadow without a border.
Non-content surfaces (empty/error/offline) use a **dashed** hairline so they read as "nothing here"
rather than as content.

**Radii.** 4 chips/checkbox · 8 trust markers and icon tiles · 12 buttons and inputs · 16 cards and
tables · 24 bottom-sheet top corners · pill for search fields and state badges only.

**Shadows.** Two layers maximum, always warm (`rgba(18,23,27,…)`), never blue. `xs` hairline lift,
`sm` cards, `md` hover, `lg` modals, plus one upward `--shadow-sheet` for bottom sheets. No inner
shadows except the optional `--shadow-inset-top` highlight on dark surfaces.

**Hover.** Buttons darken one ramp step (`600 → 700`). Secondary surfaces tint to `--ink-050`.
Interactive cards and table rows tint to `--surface-brand-soft` and lift by 1px. Never lighten on
hover, never scale up, never change border colour on hover.

**Press.** `scale(.985)` for 80ms plus the next darker ramp step (`700 → 800`). No ripple.

**Focus.** 2px `--green-600` outline offset 2px, or the `--ring-focus` 3px green glow on fields.
Danger fields use `--ring-focus-danger`. Focus is never removed.

**Motion.** Functional and short: 80ms press, 140ms hover/colour, 200ms modal fade + 8px rise, 280ms
bottom-sheet slide, 320ms chart draw-in. Standard easing `cubic-bezier(.2,.6,.2,1)`. No bounce, no
spring, no parallax, no scroll-triggered animation, no page transitions. Everything honours
`prefers-reduced-motion` (handled globally in `tokens/base.css`).

**Transparency and blur.** Used in exactly two places: the modal/sheet scrim
(`--surface-overlay`, `rgba(14,19,21,.52)`) and low-alpha white on dark surfaces. No blur filters.

**Layout rules.** Mobile: 4 columns, 16px margins, 12px gutters, max 430px; the top nav and the
bottom nav are fixed, and a primary CTA may be pinned above the bottom nav with a white
(not gradient) backing and a hairline top border. Desktop: 12 columns, 40px margins, 24px gutters,
1240px content max, 248px sidebar, 64px top nav. Tables scroll horizontally; the page never does.

**Imagery.** There is none in the system by default. When a real crop photograph is supplied it is
used only inside a 64px ListingCard thumbnail or a 4:3 lot gallery, cropped square-ish, warm and
neutral in grade — no filters, no duotone, no green wash, and never a stock photo of a smiling farmer
in a field. Absent a photo the thumbnail falls back to a Lucide `wheat` glyph on `--surface-brand-soft`.

**Density.** Farmer mobile is generous: 48px minimum tap targets, 52px fields, 56px primary CTAs,
16px minimum body text. Consoles are compact: 44px fields, 14px body, `dense` tables at 12/16px
padding. Never apply console density to a farmer screen.

---

## ICONOGRAPHY

**System: Lucide** (v0.544.0), 2px stroke, rounded caps, loaded from CDN
(`https://unpkg.com/lucide@0.544.0/dist/umd/lucide.min.js`) and wrapped by the `Icon` component.

> ⚠️ **Substitution flagged:** no icon set was supplied with the brief. Lucide was chosen for its
> even 2px stroke and neutral, non-decorative shapes, which match a fintech register. If Krishi
> Mitra has its own glyph set, drop the SVGs into `assets/icons/` and repoint `Icon`.

- **Sizes:** 16 inline with text · 20 default and in buttons · 22–24 navigation · 26–32 empty states.
- **Colour:** `currentColor` by default; muted (`--text-muted`) for decorative or meta glyphs, brand
  green for active navigation, indigo for trust, clay for failures.
- **No icon-only primary actions** on farmer screens — labels are always visible, including in the
  bottom nav.
- **No emoji, ever.** The only unicode glyphs in the system are `▲ ▼ —` (price movement, always
  paired with colour) and `₹`.
- **No icon fonts, no PNG icons, no hand-drawn SVG.** Charts and sparklines are the only SVG the
  system draws itself, and they are generated from data.
- **Canonical glyphs:** `wheat` crop/lot · `trending-up` prices · `indian-rupee` money ·
  `shield-check` verified buyer · `user-check` verified farmer · `lock` escrow · `users` FPO ·
  `flask-conical` assaying · `database` price source · `clock` last updated · `truck` delivery ·
  `map-pin` mandi/location · `gavel` bids · `package` lots · `wifi-off` offline · `refresh-cw` sync.

### Logo

**No logo files were provided.** Nothing has been drawn or reconstructed. Wherever a mark would go,
the system sets the name **Krishi Mitra** in Familjen Grotesk semibold, optionally beside a plain
typographic "K" tile (see `guidelines/brand-wordmark.card.html` and `TopNav`). `assets/` therefore
contains no logo file. **Supply real logo artwork and this should be replaced.**

### Font substitutions

| Role | In use (Google Fonts) | Why |
| --- | --- | --- |
| Display | Familjen Grotesk | Grotesque with slightly humanist joints; reads modern without the SaaS-default feel |
| Core UI | Hanken Grotesk | Large x-height, very legible at 14–16px on low-end Android |
| Mono | IBM Plex Mono | IDs and UTRs only |
| Indic | Noto Sans Devanagari | Full Hindi/Marathi coverage, matches the grotesque tone |

**Please send licensed font binaries** if Krishi Mitra has its own typefaces; `tokens/fonts.css` is
the single file to change (swap the `@import` for self-hosted `@font-face` rules).

---

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | The single entry point consumers link. `@import` lines only. |
| `tokens/` | `fonts` · `colors` · `typography` · `spacing` · `radius` · `elevation` · `motion` · `grid` · `semantic` · `base` |
| `guidelines/` | 21 foundation specimen cards (Colors, Type, Spacing, Brand) |
| `components/core/` | `Icon` |
| `components/forms/` | `Button` `IconButton` `Input` `Select` `Textarea` `Checkbox` `Radio` `Switch` `SearchField` |
| `components/surfaces/` | `Card` `StatCard` `MetaRow` `ListingCard` |
| `components/feedback/` | `Badge` `TrustBadge` `Alert` `Modal` `BottomSheet` `Skeleton` `StateView` `OfflineBar` |
| `components/navigation/` | `TopNav` `BottomNav` `Sidebar` `Tabs` `SegmentedControl` |
| `components/data/` | `DataTable` `PriceChart` `BarChart` `Sparkline` `Timeline` `Stepper` |
| `ui_kits/farmer_app/` | Mobile app: home, price detail, sell flow, order + escrow tracking |
| `ui_kits/buyer_console/` | Desktop marketplace: lot discovery, lot detail + bid, escrow |
| `ui_kits/fpo_console/` | Desktop: member aggregation, collective lots, payouts |
| `ui_kits/admin_console/` | Desktop: verification queue, price sources, disputes |
| `SKILL.md` | Agent Skills entry point |

Each component directory carries `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md` and one
`@dsCard` HTML sheet showing its states.

### Intentional additions

Nothing in this system is a source recreation, so the inventory is the brief's list plus three
support pieces:

- **`Icon`** — a wrapper so the glyph set is swappable in one place.
- **`MetaRow`** — the Price Source / Last Updated provenance strip the brief asks for as a first-class
  trust indicator.
- **`OfflineBar`** — the offline-first status channel; the brief lists offline as a required state.

`StateView` intentionally covers empty, error, offline, no-results and success in one component so
those four states can never drift apart visually.
