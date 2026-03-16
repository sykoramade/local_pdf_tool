# Brand Brief — Sprint 10
Generated: 2026-03-16 | Status: draft, pending MD review

---

## Brand Name
**TBD.** Under active review. Leading candidate: LocalPDF. Decision required from MD
before any public-facing copy, domain, or SEO page uses a name.

All design work uses neutral references ("the tool", "the app", "PDF editor").
Do not hardcode a product name into reusable components.

---

## Visual Identity

### Colour System
| Token | Hex | Usage |
|---|---|---|
| `surface-base` | `#f9fafb` | Page background (gray-50) |
| `surface-card` | `#ffffff` | Cards, panels |
| `surface-dark` | `#0c111d` | Dark navy band, footer |
| `ink-primary` | `#111827` | Headings (gray-900) |
| `ink-secondary` | `#374151` | Body copy (gray-700) |
| `ink-muted` | `#6b7280` | Secondary labels (gray-500) |
| `accent` | `#4f46e5` | CTAs, links, active states (indigo-600) |
| `trust-green` | `#059669` | Trust badges, confirmations (emerald-600) |
| `border` | `#e5e7eb` | Dividers, card borders (gray-200) |

No gradients on backgrounds. No transparency layers. Solid colours only.

### Typography
| Role | Font | Weight | Size |
|---|---|---|---|
| Display / hero H1 | DM Serif Display | 400 | 48px desktop / 32px mobile |
| Section headings H2 | Inter | 700 | 28px |
| Sub-headings H3 | Inter | 600 | 18px |
| Body | Inter | 400 | 16px |
| Labels / eyebrows | DM Mono | 500 | 11px, uppercase, tracked |
| UI / buttons | Inter | 600 | 14px |
| Data / devtools | DM Mono | 400 | 12px |

DM Serif Display is for hero H1 only. All other headings use Inter.
Use DM Mono for technical labels, code-adjacent UI (DevTools proof element, eyebrows).

### Spacing
Tailwind defaults. Key rhythm: 4px base unit.
Section vertical padding: `py-16` (64px) for content sections, `py-20` (80px) for feature grid.

### Border radius
- Buttons: `rounded-lg` (8px)
- Cards: `rounded-xl` (12px)
- Badges/pills: `rounded-full`
- DevTools panel: `rounded-lg`
- Do not use `rounded-3xl` or beyond on content containers.

### Iconography
Emoji as feature icons (contained in a small soft-background square). No icon font,
no SVG icon library in the MVP. This keeps bundle size zero and avoids visual
inconsistency between icon packs.

---

## Voice & Tone

### Personality
Trustworthy · Precise · Calm

### Copy rules
1. Lead with the mechanism, not the outcome. Say "processed in your browser" not "keeps you safe".
2. Use second-person sparingly. "Your file" yes. "You are protected" no — too paternalistic.
3. No exclamation marks in trust contexts. They undermine the calm authority.
4. Numbers anchor credibility: "0 network requests", "100% in-browser", "GDPR Art. 25".
5. If making a claim that can be verified, include the verification path immediately after.
6. Avoid weasel words: "essentially", "virtually", "almost". Either it is or it isn't.

### Headline formula
`[Action] [sensitive thing]. [Trust proof in one clause].`
Examples:
- "Edit PDFs. Your file never leaves this browser."
- "Redact patient records. No server ever sees them."
- "Sign contracts. Nothing leaves your device."

---

## Component Patterns

### Trust badge row
```
✓ No file upload  ✓ No account  ✓ No server  ✓ GDPR Art. 25  ✓ Open source
```
- Always present on landing pages and tool pages
- Check: `text-green-500` (emerald), text: `text-gray-500`, `text-sm`
- Horizontal scroll on mobile rather than wrapping (tool pages); wraps on homepage

### CTA hierarchy
1. Primary (filled): `bg-indigo-600 text-white` — one per section
2. Secondary (text link): `text-indigo-600 underline` — for verification/learn-more actions
3. Ghost (outline): reserved for destructive or secondary confirmation actions

### DevTools proof element
The highest-trust UI element. Present on homepage hero and privacy-architecture page.
Shows a realistic Chrome DevTools Network panel with 0 XHR/Fetch requests.
NOT an illustration — styled to look like the real panel.
Always paired with: "Verify yourself →" link to /privacy-architecture.

---

## What This Brand Is Not

- Not a consumer app. No mascots, no confetti, no "Yay!"
- Not a security product. No padlocks, no shields, no chains, no vault imagery.
- Not a startup landing page. No testimonial carousels, no "Join 10,000 users", no countdown timers.
- Not an enterprise SaaS. No enterprise logos, no "book a demo", no sales-qualified-lead language.

It is a professional utility. Honest. Capable. Unhurried.
