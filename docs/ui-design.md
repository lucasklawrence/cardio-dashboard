# UI & Design Upgrades — "Clinical Broadsheet" Spec

## Design Direction

The dashboard should feel like a **data-rich editorial publication** — think Monocle's annual Quality of Life index or a well-typeset clinical report. Dark, quiet backgrounds; large serif numerals for key stats; monospaced annotations; deliberate negative space. No gradients, no rounded cards, no Material-style elevation.

### Visual Identity
- **Primary font:** Instrument Serif (display numerals, section titles)
- **Body font:** DM Mono (data labels, axis ticks, body text, controls)
- **Background:** Deep charcoal `#111113` body, slightly lighter surface `#1a1a1d`
- **Accent palette:** Heart-rate zone colors (these already exist and carry semantic meaning)
- **Texture:** Subtle film grain overlay + vignette on the body for analog depth

---

## Priority Changes

### 1. Film-Grain Texture + Vignette
**Files:** `src/theme.css`
**Effort:** ~10 lines of CSS

Add a `body::before` pseudo-element with:
- Full-viewport fixed overlay at `pointer-events: none`
- SVG noise filter or a tiny tiling PNG for grain
- Radial gradient vignette darkening the edges

This single change shifts the entire feel from "React template" to "designed artifact."

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background:
    radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%);
  /* grain via SVG filter defined inline or as a tiny repeating image */
}
```

### 2. Editorial Stat Numerals
**Files:** `src/components/StatsGrid.tsx`, `src/theme.css`
**Current:** Stat cards with backgrounds and borders
**Target:** Kill the card containers. Display stats as hairline-separated editorial numerals:
- Value at ~104px in Instrument Serif
- Label below in DM Mono at 11px, uppercase, letter-spaced
- Thin 1px `rgba(255,255,255,0.08)` separator between stats
- No backgrounds, no borders, no box shadows

### 3. FIG. Counter on Section Headers
**Files:** `src/components/Dashboard.tsx`, all chart components
**Current:** Plain text section headers
**Target:** Prepend `FIG. 01`, `FIG. 02`, etc. in DM Mono at reduced opacity. The counter is a layout device borrowed from scientific publications — it gives the page a sense of ordered progression.

```
FIG. 01
Resting Heart Rate
```

### 4. Staggered Reveal Animation
**Files:** `src/theme.css`, dashboard components
**Effort:** CSS `@keyframes` + `animation-delay` on section wrappers

On data load, sections fade+slide in with staggered delays (0ms, 80ms, 160ms, ...). One well-orchestrated page load creates more delight than scattered micro-interactions.

```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dashboard-section {
  animation: reveal 0.5s ease-out both;
}
.dashboard-section:nth-child(1) { animation-delay: 0s; }
.dashboard-section:nth-child(2) { animation-delay: 0.08s; }
/* ... */
```

### 5. Typographic Tabs
**Files:** `src/components/ActivityTabs.tsx`, `src/theme.css`
**Current:** Pill-in-pill tab pattern
**Target:** Text-only tabs in DM Mono, uppercase, letter-spaced. Active tab indicated by a 2px underline in the zone-1 accent color. Inactive tabs at 40% opacity, no background. Hover raises to 70% opacity.

### 6. Chart Styling Refinements
**Files:** `src/hooks/useChart.ts`, chart components
- Axis labels in DM Mono 10px
- Grid lines at `rgba(255,255,255,0.04)` — barely visible, just enough structure
- Remove chart borders and backgrounds
- Point styles: small (3px radius), no borders, zone-colored
- Tooltip: dark background, DM Mono, no border-radius

### 7. Zone Bar Redesign
**Files:** `src/components/ZoneBar.tsx`
**Current:** Stacked bar with rounded corners
**Target:** Full-width stacked bar, no border-radius, 8px height. Labels above each segment in DM Mono 10px. Percentage values only (drop "Zone 1", etc. — the colors are self-documenting with the existing legend).

### 8. Session Log Table Polish
**Files:** `src/components/SessionLog.tsx`
**Current:** Table with alternating row backgrounds
**Target:** No backgrounds. Hairline bottom borders. Type column in DM Mono. Date column right-aligned. Numerical columns right-aligned and tabular-nums. Row hover: subtle highlight at `rgba(255,255,255,0.03)`.

### 9. Upload Zone
**Files:** `src/components/upload/UploadZone.tsx`
**Current:** Dashed border box
**Target:** Minimal: thin 1px dashed border in `rgba(255,255,255,0.15)`. Large Instrument Serif text "Drop your export" centered. Subtext in DM Mono at 11px. On drag-over: border brightens to zone-1 color, subtle pulse animation.

### 10. Header
**Files:** `src/components/Header.tsx`
**Current:** Basic header
**Target:** "CARDIO DASHBOARD" in DM Mono 11px, uppercase, letter-spaced 0.2em. Flush left. Version number at far right in reduced opacity. No background, no border — the grain texture provides ambient separation.

### 11. Date Filter
**Files:** `src/components/DateFilter.tsx`
**Current:** Input fields with button presets
**Target:** Text-only preset buttons matching the tab style (DM Mono, uppercase, underline-active). Date inputs styled as minimal bordered fields with DM Mono. Preset row and input row on the same line if viewport allows.

---

## Color Tokens

```css
:root {
  --bg-body:     #111113;
  --bg-surface:  #1a1a1d;
  --bg-elevated: #222226;
  --text-primary:   rgba(255, 255, 255, 0.92);
  --text-secondary: rgba(255, 255, 255, 0.55);
  --text-tertiary:  rgba(255, 255, 255, 0.3);
  --border-subtle:  rgba(255, 255, 255, 0.08);
  --border-medium:  rgba(255, 255, 255, 0.15);

  /* Zone accents (keep existing) */
  --zone-1: #3b82f6;
  --zone-2: #22c55e;
  --zone-3: #eab308;
  --zone-4: #f97316;
  --zone-5: #ef4444;
}
```

## Font Loading

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

:root {
  --font-display: 'Instrument Serif', serif;
  --font-mono:    'DM Mono', monospace;
}
```

## Implementation Notes
- All changes are CSS-first — no new dependencies needed
- The staggered reveal can use CSS-only (no Framer Motion / react-spring required at this stage)
- Font loading should use `display=swap` to avoid FOIT
- Film grain should be `pointer-events: none` and low z-index to avoid interfering with interactions
- Test on both retina and non-retina — grain texture looks different at different pixel densities
