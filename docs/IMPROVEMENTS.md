# Credex AI Spend Audit — Improvement Plan

> **Status:** In Progress | **Updated:** 2026-05-09

---

## 1. UI Improvements — Dark / Light Mode Toggle

### Problem
`layout.tsx` me `dark` class hardcode hai. `next-themes` already installed hai lekin use nahi kiya gaya. Users ko theme switch karne ki ability nahi hai.

### Plan
- `ThemeProvider` wrap karo `layout.tsx` mein
- `ThemeToggle` client component banao (`Sun` / `Moon` lucide icons ke saath)
- `SiteHeader` mein toggle button add karo
- `globals.css` mein light mode CSS variables define karo (`:root` for light, `.dark` for dark)

### Files to touch
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/layout/site-header.tsx`
- `src/components/layout/theme-toggle.tsx` ← new

---

## 2. UI Improvements — Premium Visual Polish

### Problem
App already decent hai lekin kuch jagah premium feel missing hai.

### What to improve

#### Header
- Frosted glass effect better karo
- Logo ke saath subtle gradient glow add karo
- Mobile hamburger menu add karo (currently nav hidden on mobile, no fallback)

#### Landing Page Hero
- Animated gradient background (`aurora-panel` refine)
- Hero heading mein gradient text highlight add karo ("AI Spend" ko teal gradient)
- CTA buttons pe shimmer animation
- Product preview card mein animated progress bars

#### Features Section
- Feature cards pe hover glow / border animation
- Icon ke behind subtle radial gradient

#### Testimonials
- Quote marks bade aur stylized karo
- Avatar placeholder add karo (initials based)
- Card hover lift effect

#### FAQ
- Accordion banana (`details/summary` ya radix collapsible)
- Currently static divs hain — interactive hone chahiye

#### Footer
- Footer mein links add karo (Privacy, Terms, GitHub)
- Social icons (Twitter/X, GitHub)

#### Audit Form
- Tool cards pe animated checkbox toggle
- Selected tool ka border highlight (teal glow)
- Live savings preview as animated counter

#### Results Dashboard
- Score ring / circular progress visualization
- Animated number counter on total savings mount
- Tool health badges better styling

---

## 3. Folder Structure — Move All `.md` to `docs/`

### Problem
Root mein scattered hain: `ARCHITECTURE.md`, `DEVLOG.md`, `ECONOMICS.md`, `GTM.md`, `LANDING_COPY.md`, `METRICS.md`, `PRICING_DATA.md`, `PROMPTS.md`, `REFLECTION.md`, `TESTS.md`, `USER_INTERVIEWS.md`, `README.md`, `CLAUDE.md`, `AGENTS.md`

### Plan
Root mein sirf `README.md`, `AGENTS.md`, `CLAUDE.md` rakhna (tooling ke liye required).
Baaki sab `docs/` folder mein move karna.

### Final `docs/` structure
```
docs/
├── IMPROVEMENTS.md        ← this file
├── ARCHITECTURE.md
├── DEVLOG.md
├── ECONOMICS.md
├── GTM.md
├── LANDING_COPY.md
├── METRICS.md
├── PRICING_DATA.md
├── PROMPTS.md
├── REFLECTION.md
├── TESTS.md
└── USER_INTERVIEWS.md
```

---

## 4. Feature Improvements

### 4a. Mobile Navigation
- Hamburger menu component (Sheet / drawer from radix)
- Mobile-responsive nav items

### 4b. Animated Savings Counter
- `framer-motion` use karke number animate karo when results load
- `useSpring` hook

### 4c. FAQ Accordion
- Radix `Collapsible` use karo (`@radix-ui/react-collapsible` already available via tree-shaking)
- Smooth expand/collapse animation

### 4d. Toast Notifications
- Form submit success/error ke liye toast
- Sonner ya basic custom toast

### 4e. Score Visualization
- Circular progress ring for optimization score
- SVG based, pure CSS animation

### 4f. Print / PDF Export
- `window.print()` button on results page
- Print-friendly CSS

---

## 5. Code Quality Improvements

### 5a. Theme-aware colors
- Sare hardcoded colors (`text-emerald-200`, `text-rose-200`) ko CSS variables se replace karo

### 5b. Component extraction
- `LandingPage` component bahut bada hai (347 lines) — sections ko alag files mein extract karo
- `ResultsDashboard` bhi split karo

### 5c. Accessibility
- `aria-expanded` FAQ accordion mein
- Focus visible rings on all interactive elements
- Skip-to-content link add karo

---

## Implementation Order

| Priority | Task | File(s) |
|---|---|---|
| 🔴 HIGH | Dark/Light mode toggle | layout, globals.css, site-header, theme-toggle (new) |
| 🔴 HIGH | Move MDs to docs/ | file moves |
| 🟡 MED | Premium hero gradient text | landing-page.tsx |
| 🟡 MED | FAQ Accordion | landing-page.tsx |
| 🟡 MED | Mobile nav | site-header.tsx |
| 🟡 MED | Animated savings counter | results-dashboard.tsx |
| 🟢 LOW | Score ring visualization | results-dashboard.tsx |
| 🟢 LOW | Toast notifications | new component |
| 🟢 LOW | Print/PDF export | results page |
| 🟢 LOW | Component file splitting | refactor |
