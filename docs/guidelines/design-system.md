# LocalPDF Design System

> All UI agents read this before touching any page or component.
> Last updated: Sprint 11

---

## Visual Language

Dark navy theme throughout. Every page inherits the dark base.
Reference mockup: `localpdf-v6.html` in repo root.

---

## Color Tokens (CSS vars in globals.css)

| Token | Value | Use |
|---|---|---|
| `--background` | `#0b0d14` | Page body bg |
| `--foreground` | `#f4f6fc` | Body text |
| `--border-subtle` | `rgba(255,255,255,.06)` | Dividers, card edges |
| `--border-default` | `rgba(255,255,255,.09)` | Input borders, segmented control |
| `--border-strong` | `rgba(255,255,255,.15)` | Focused states |
| `--text-primary` | `#f4f6fc` | Headings, labels |
| `--text-secondary` | `rgba(255,255,255,.5)` | Body text, descriptions |
| `--text-muted` | `rgba(255,255,255,.28)` | Placeholder, secondary labels |
| `--text-faint` | `rgba(255,255,255,.13)` | Footer, meta text |
| `--accent` | `#6366f1` | Primary CTA, interactive |
| `--accent-hover` | `#7274f3` | Hover state for accent |
| `--accent-glow` | `rgba(99,102,241,.35)` | Button glow on hover |

## Per-Tool Accent Colors

| Tool | Color |
|---|---|
| Edit | `#6366f1` (indigo) |
| Sign | `#22d3a0` (teal) |
| Compress | `#f59e0b` (amber) |
| Pages (Merge/Split) | `#60a5fa` (blue) |
| Annotate (coming) | `rgba(255,255,255,.3)` |
| Redact (coming) | `rgba(255,255,255,.25)` |

## Typography

| Variable | Font | Use |
|---|---|---|
| `var(--font-display)` | Instrument Serif | Hero h1, section headings |
| `var(--font-sans)` | DM Sans | All body text, UI labels |
| `var(--font-mono)` | JetBrains Mono | Eyebrow labels, badges, code |

Tailwind utilities: `font-display`, `font-sans`, `font-mono` (extended in tailwind.config.ts).

## Nav (NavBar.tsx)

- Sticky, 50px height
- Background: `rgba(11,13,20,.92)` + `backdrop-filter: blur(14px)`
- Border bottom: `1px solid rgba(255,255,255,.06)`
- Logo: font-weight 600, 15px, tracking -0.2px
- Links: Pricing | Privacy | Blog | About only — no tool links
- Link text: `rgba(255,255,255,.38)` → hover `rgba(255,255,255,.8)` with `rgba(255,255,255,.05)` bg

## Footer (Footer.tsx)

- Background: `#080a10`
- Border top: `1px solid rgba(255,255,255,.06)`
- Legal left, mono-font registry text right
- Import and use on every page wrapper

## Tool Page Pattern (Sprint 13 reference)

All tool pages (compress, merge, split, sign, about, pricing) follow:

```tsx
<main className="min-h-screen" style={{ background: '#0b0d14' }}>
  <NavBar current={...} />

  <div className="max-w-2xl mx-auto px-4 py-16">
    <div className="text-center mb-10">
      <h1 className="text-3xl font-bold mb-3" style={{ color: '#f4f6fc' }}>
        Tool Name
      </h1>
      <p style={{ color: 'rgba(255,255,255,.5)' }}>
        Description text.
      </p>
    </div>

    <ToolComponent />

    {/* Trust badge row */}
    <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>
      {['Files never uploaded', 'No account required', 'No watermark', 'Free'].map(item => (
        <span key={item} className="flex items-center gap-1.5">
          <span style={{ color: '#22d3a0' }}>✓</span> {item}
        </span>
      ))}
    </div>
  </div>

  <Footer />
</main>
```

## Card / Surface Pattern

```tsx
// Card container
style={{
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.09)',
  borderRadius: '12px',
}}

// Elevated card
style={{
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.09)',
  borderRadius: '12px',
}}
```

## Primary Button

```tsx
style={{
  background: '#6366f1',
  color: 'white',
  borderRadius: '7px',
  padding: '9px 28px',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '.02em',
}}
// hover: background '#7274f3', box-shadow '0 4px 16px rgba(99,102,241,.35)'
```

## Anti-patterns (DO NOT)

- No white or gray-50 backgrounds anywhere
- No `text-gray-900` or `text-gray-600` — use CSS var equivalents
- No padlock/shield icons
- No gradient hero backgrounds (solid only)
- No glassmorphism
- No arbitrary timeout-based DOM sync (use useEffect)
