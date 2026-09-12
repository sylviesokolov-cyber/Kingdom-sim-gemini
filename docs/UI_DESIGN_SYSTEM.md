# UI Design System — Royal Gacha

> The owner-supplied reference images in `docs/reference/` are the **visual source of truth**.
> When this document and those images disagree, the images win.
>
> - `01-key-art-throne.jpg` — character art register, lighting, background quality bar
> - `02-home-screen-mockup.png` — **the Home screen layout, verbatim target**
> - `03-full-ui-screen-map.png` — all 16 screens, components, rarity frames, icon set

---

## 1. Principles

1. **Illustration first.** The character is the screen. UI floats over art; it never boxes it in.
2. **Dark royal, gold accent.** Near-black plum and wine grounds, thin gold framing, ivory text.
3. **Premium, not dashboard.** Jewel-like gradient buttons, layered translucent glass, soft
   ornament. Never flat Tailwind default chrome.
4. **Landscape phone is the constraint.** Everything must work at ~740×360 CSS px.
5. **One dominant heading and one primary action per zone.** Density kills on a phone.

---

## 2. Tokens

### Color

```css
--ink-950: #0a0509;   /* deepest ground */
--ink-900: #120810;   /* app background */
--plum-900: #1c0d1a;  /* panel ground */
--plum-800: #2a1426;  /* raised panel */
--wine-800: #4a1226;  /* primary button base */
--wine-600: #7d1f38;  /* primary button light */

--gold-500: #c9a227;  /* borders, frames, key numerals */
--gold-400: #e3c15a;  /* hover / emphasis */
--gold-200: #f2e0a8;  /* headings on dark */
--ivory:    #f6efe2;  /* body text */
--parchment:#d9cbb0;  /* secondary text */

--rose-500: #e05780;  /* affection / bond — THE relationship accent */
--rose-300: #f4a6bf;

--jade-500:  #4f9d69;  /* positive delta */
--ember-500: #d9762b;  /* warning */
--blood-500: #b33a3a;  /* danger / unrest */
```

**Rose is reserved for relationship/affection.** Never use it for a generic accent.
**Never** make blue, indigo, or green a screen-wide theme.

### Rarity

| Rarity | Frame | Glow |
|---|---|---|
| **SSR** | gold on wine, ornate crown finial | warm gold bloom |
| **SR** | violet on plum, silver filigree | cool violet bloom |
| **R** | steel on charcoal, plain bevel | faint, none on idle |
| **N** | parchment on grey, no ornament | none |

### Type

- **Display / headings / nav:** Cinzel — 600/700, generous letter-spacing on small caps
- **Narrative / dialogue:** Cormorant Garamond — 400/500, italic for narration
- **Numerals / HUD:** Cinzel 600, tabular where they tick

Minimum body size **13px**; minimum tap target **44×44px**.

### Material

```css
/* the standard panel */
background: linear-gradient(160deg, rgba(42,20,38,.92), rgba(18,8,16,.96));
border: 1px solid rgba(201,162,39,.35);
box-shadow: 0 18px 40px -12px rgba(0,0,0,.8), inset 0 1px 0 rgba(242,224,168,.12);
backdrop-filter: blur(12px);
border-radius: 14px;
```

---

## 3. The Home screen

**Home holds no companion interaction.** `02-home-screen-mockup.png` set the original visual
target — illustration-first, dark-royal-gold, character-anchored — but as of the 2026-09-12
redesign Home is the player's own chambers: a day-action hub with a purely decorative,
idle-animated companion display. Talk, Gift, and Bond live in the Bonds tab
(`CharactersScreen`) instead — see `docs/systems/BONDS.md`.

Zones, clockwise from top-left:

| Zone | Contents |
|---|---|
| **Player chip** (top-left) | Avatar, name, `Lv. 12 Outsider`, next-estate progress bar |
| **Currency bar** (top-center) | Copper, Guild Marks, Fate Crystals, Bond Hearts |
| **Realm chip** (top-right) | `Day 1`, weather, **hide-UI toggle**, settings |
| **Side rail** (left edge) | Mail · Quests · Events · Notice — each with an unread dot |
| **Location label** (top-center, over the stage) | `Valenreach · {scene name} · Day {n}` |
| **Character stage** (center) | The chosen companion, idle-animated, over the chambers backdrop |
| **Stage controls** (bottom-center, over the stage) | Scene-cycle button + a companion-picker avatar strip — purely cosmetic, no dialogue or affection change |
| **Day's Actions** (right) | A `.row-list` of live-status cards — Work, Market, Bonds, Kingdom, Summon, Council — each tapping straight into that tab |
| **Bottom dock** | Home · Kingdom · Bonds · Work · Market · Council · Summon · Inventory |
| **Next Day** (bottom-right) | The single largest button on the screen |

**The idle companion display ("L2D-style").** The roster is single flattened portraits, not
rigged/layered Live2D source art, so this is a CSS approximation of the same feeling rather than
real Live2D: a breathe-and-sway keyframe animation baked into the art (`@keyframes l2d-idle`),
plus a slow parallax drift toward the pointer on desktop only (gated to `pointerType === 'mouse'`
so touch dragging never triggers it, and to a `prefers-reduced-motion` check before it ever writes
a CSS variable). See `.l2d-anchor` / `.stage-art` in `src/styles/home.css`.

**Immersive ("hide UI") mode.** Azur Lane/Brown Dust 2-style: an Eye button in the HUD (visible
only on Home) drops every panel — HUD, dock, side rail, location label, stage controls, Day's
Actions — leaving only the backdrop and companion. An EyeOff button appears in the same corner to
restore, and tapping anywhere on the stage does the same. Session-local (`ui.immersive`, not
persisted) and Home-only: leaving Home always clears it, so no other screen can be left
chromeless. See `setImmersive` / `hideChrome` in `src/state/store.ts` and `src/App.tsx`.

**Rules:** the companion's face is never covered by a panel. `Next Day` is always reachable by the
right thumb. The stage controls never gate a mechanic — cycling the scene or the displayed
companion is cosmetic, never an affection/trust change.

### The Bonds tab

Companion interaction's actual home — a full-bleed hero screen, not a roster-grid-first pattern.
The companion's art fills the stage (reusing Home's `.scene-bg`/`.scene-vignette`/`.stage`
treatment) with the interaction UI overlaid directly on it:

| Zone | Contents |
|---|---|
| **`.bond-head`** (top-left, over the art) | Name, title, mood, the tier/affection readout (heart · tier number 1–6 · bar · `affection/cap`), and up to three traits |
| **`.bond-foot`** (bottom-left, over the art) | The mood-varied quote, then **Talk / Gift / Bond** |
| **`.bond-rail`** (right edge) | Profile · Outfits · Bond Story · **Intimacy** · **Intimacy Gallery** · Voice · More — all but Profile are disabled stubs naming what unlocks them |
| **Stage controls** (bottom-center) | A button opening the full roster grid + the companion-switcher strip (width-capped so it can never grow into `.bond-foot`) |

**Profile** opens a trimmed version of the old detail modal — condition, what she runs, what she
wants/fears, the five relationship-dimension bars, her bond perks with live suspended/active
state, her opinions of the rest of the cast, and her memory of the player — without repeating the
header/traits/tier/quote/actions already on the main screen. The roster grid (rarity frames,
affection bars) and the gift picker (favourites-first sort) are unchanged from the previous
implementation, just reachable from the stage controls and the Gift button respectively instead
of always-open.

**Intimacy and its gallery are content-guide-bound the same as everything else**: whatever lands
there must stay suggestive/fade-to-black, never explicit, per `docs/CONTENT_GUIDE.md` — the stub
naming them now does not change that constraint later.

---

## 4. Screen map

From `03-full-ui-screen-map.png`:

| # | Screen | Identity | Primary content |
|---|---|---|---|
| 1 | Title | Key art + gold serif logotype | New Game · Continue · Settings · Gallery · Exit |
| 2 | **Home** | The player's chambers, day-action hub | The layout above — decorative only, no interaction |
| 3 | Kingdom Map | Painted realm overview | District pins, vitals, supply chains, investment |
| 4 | **Bonds** (Character Roster) | Gallery grid, rarity frames | Filter by faction, sort by rarity/affection |
| 5 | Bonds detail (Character Profile) | Portrait + full detail | Talk/Gift/Assist · Relationship dimensions · Outfits · Bond Scenes · Voice · Stories |
| 6 | Summon | Banner carousel | x1 / x10, pity counter, rate details, result reel |
| 7 | Bond / VN Scene | Full-bleed cinematic | Dialogue, choices, Auto · Skip · Log |
| 8 | Work / Career | Guild hall | Career tracks, jobs, energy cost, rank progress |
| 9 | Market | Trading hall | Buy · Sell · Special; price, trend, supply band |
| 10 | Council | Council chamber | Petitions, decrees, votes, faction reactions |
| 11 | Event | Illustrated modal | Framed choice with named consequences |
| 12 | HUD / Nav | — | Currency bar, player chip, bottom dock |
| 13 | Buttons / Dialogue | — | Primary · Secondary · Danger; VN dialogue box |
| 14 | Rarity Frames | — | SSR · SR · R · N |
| 15 | Icon Set | — | Crown, swords, scroll, scales, heart, gift, coin, book |
| 16 | Backgrounds | — | Throne room · city street · countryside · catacombs |

---

## 5. Layout rules

- **Landscape only.** Lock orientation; never author a portrait breakpoint.
- Respect `env(safe-area-inset-*)` on all four edges — notches and home bars.
- 2–3 major zones per screen, never a grid of equal cards.
- Important information above the fold; scrolling is for detail, never for the primary action.
- One navigation system, defined once in `components/layout/`. Never a per-screen nav.
- Modals: same glass, gold border, vignette, and shadow as panels. Backdrop dismiss.
- Every list needs an authored empty state — never a blank panel.

---

## 6. Motion

Restrained and expensive-feeling. 180–260ms, `cubic-bezier(.22,.61,.36,1)`.

- Screen transitions: crossfade + 8px rise
- Character entrance: fade + slight scale-down from 1.03
- Affection gain: heart pulse + floating `+N` in rose
- Gacha reveal: the only place allowed to be loud — hold, flare, then the card
- Honor `prefers-reduced-motion`: cut every non-essential animation

---

## 7. Implementation

```
src/styles/
  tokens.css      the variables above — the only place colors are defined
  base.css        reset, font wiring, safe areas, landscape shell
  panels.css      panel/button/frame materials
  home.css        Home screen composition
  screens.css     shared secondary-screen layout
```

**Never hardcode a hex value in a component.** If a color is missing, add a token.
