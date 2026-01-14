# MEDIANN.DEV: VISUAL DESIGN CONCEPTS

This document presents three distinct design concepts for mediann.dev, each with detailed visual specifications.

**RECOMMENDATION**: Hybrid approach combining Concept B (primary) + Concept A (process) + Concept C (3D accent)

---

## CONCEPT OVERVIEW

| Concept | Name | Personality | Best For |
|---------|------|-------------|----------|
| **A** | Blueprint / Assembly Line | Systematic, technical, trustworthy | B2B, enterprise-leaning clients |
| **B** | Kinetic Editorial Tech | Energetic, modern, founder-friendly | Startups, early-stage founders |
| **C** | Tactile 3D Minimal | Premium, refined, sophisticated | High-ticket clients, differentiation |

---

## CONCEPT A: BLUEPRINT / ASSEMBLY LINE

### Personality
- Systematic and methodical
- Technical credibility
- "We build things properly"
- Engineering mindset

### Color Palette

```css
:root {
  /* Primary */
  --color-primary: #0891b2;        /* Cyan 600 */
  --color-primary-dark: #164e63;   /* Cyan 900 */
  
  /* Background */
  --color-bg-primary: #0f172a;     /* Slate 900 */
  --color-bg-secondary: #1e293b;   /* Slate 800 */
  --color-bg-tertiary: #334155;    /* Slate 700 */
  
  /* Text */
  --color-text-primary: #f8fafc;   /* Slate 50 */
  --color-text-secondary: #94a3b8; /* Slate 400 */
  --color-text-muted: #64748b;     /* Slate 500 */
  
  /* Accent */
  --color-accent: #22d3ee;         /* Cyan 400 */
  --color-accent-glow: rgba(34, 211, 238, 0.2);
  
  /* Blueprint lines */
  --color-grid: rgba(34, 211, 238, 0.1);
}
```

### Typography

```css
/* Headlines */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
font-weight: 700;
letter-spacing: -0.02em;

/* Body */
font-family: 'Inter', -apple-system, sans-serif;
font-weight: 400;
line-height: 1.6;

/* Technical labels */
font-family: 'JetBrains Mono', monospace;
font-size: 12px;
text-transform: uppercase;
letter-spacing: 0.1em;
```

### Visual Elements

- Grid overlay (subtle blueprint lines)
- Technical annotations and labels
- Process flowcharts with connecting lines
- Terminal/code-style UI elements
- Numbered steps with technical precision

### Hero Layout (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]                    [PROCESS] [CASE STUDIES] [CONTACT]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─ 01. DISCOVERY                                              │
│   │                                                              │
│   │   BUILD YOUR MVP                                            │
│   │   IN 30 DAYS.                                               │
│   │   ───────────────                                           │
│   │                                                              │
│   │   From validated hypothesis                                  │
│   │   to real users. Fast.                                      │
│   │                                                              │
│   │   [START ASSESSMENT ─────>]                                 │
│   │                                                              │
│   └─────────────────────────────────────────────────────────────│
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│   │ 30 days  │────│ 12 MVPs  │────│ 4.9 NPS  │                  │
│   │ avg time │    │ launched │    │ rating   │                  │
│   └──────────┘    └──────────┘    └──────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Process Section Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   HOW WE BUILD                                                  │
│   ────────────                                                  │
│                                                                  │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌────────┐│
│   │   01    │─────>│   02    │─────>│   03    │─────>│   04   ││
│   │ DISCOVER│      │  BUILD  │      │ LAUNCH  │      │ ITERATE││
│   │         │      │         │      │         │      │        ││
│   │ 3 days  │      │ 21 days │      │ 3 days  │      │ ongoing││
│   └─────────┘      └─────────┘      └─────────┘      └────────┘│
│                                                                  │
│   Understand       Design &         Deploy &         Measure &  │
│   your problem     develop MVP      onboard users    improve    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Motion Specifications

```javascript
// Concept A: Precise, mechanical animations
const motionConfig = {
  // Grid lines drawing in
  gridReveal: {
    duration: 1200,
    ease: "power2.out",
    stagger: 50, // Line by line
  },
  
  // Step-by-step reveals
  processStep: {
    duration: 400,
    ease: "power3.out",
    delay: index => index * 200,
  },
  
  // Technical counters
  metricCount: {
    duration: 2000,
    ease: "power2.out",
  },
  
  // Hover states
  hover: {
    scale: 1.02,
    duration: 150,
    ease: "ease-out",
  }
};
```

### Implementation Notes

- Use CSS Grid with visible grid lines (1px, low opacity)
- Monospace fonts for technical credibility
- Annotations use small caps and technical numbering
- Consider adding subtle "scan line" animation on hero
- Process visualization as horizontal flowchart

---

## CONCEPT B: KINETIC EDITORIAL TECH (RECOMMENDED)

### Personality
- Energetic and dynamic
- Modern editorial feel
- "We move fast"
- Founder-friendly, approachable

### Color Palette

```css
:root {
  /* Primary */
  --color-primary: #FF006E;        /* Hot Pink */
  --color-primary-hover: #ff3385;
  
  /* Background */
  --color-bg-primary: #000000;     /* Pure Black */
  --color-bg-secondary: #0a0a0a;
  --color-bg-elevated: #111111;
  
  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a1a1aa;  /* Zinc 400 */
  --color-text-muted: #71717a;      /* Zinc 500 */
  
  /* Accent */
  --color-accent: #0080FF;          /* Electric Blue */
  --color-accent-hover: #3399ff;
  
  /* Gradients */
  --gradient-hero: linear-gradient(135deg, #FF006E 0%, #0080FF 100%);
  --gradient-subtle: linear-gradient(180deg, rgba(255,0,110,0.1) 0%, transparent 50%);
}
```

### Typography

```css
/* Headlines - Variable font with animation */
font-family: 'Poppins', sans-serif;
font-weight: 700;
font-variation-settings: 'wght' 700;
letter-spacing: -0.03em;

/* Display sizes */
--text-display: clamp(48px, 8vw, 96px);
--text-h1: clamp(36px, 5vw, 64px);
--text-h2: clamp(28px, 4vw, 48px);
--text-h3: clamp(24px, 3vw, 32px);

/* Body */
font-family: 'Inter', sans-serif;
font-weight: 400;
line-height: 1.6;

/* Mono (metrics, code) */
font-family: 'IBM Plex Mono', monospace;
font-weight: 500;
```

### Visual Elements

- Large expressive typography (oversized headlines)
- Kinetic text animations (words revealing, morphing)
- High contrast (black + bright accents)
- Editorial-style layouts (asymmetric, magazine-like)
- Metric counters with impact

### Hero Layout (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│  mediann.                          [Work] [Process] [Contact]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│        ██████╗ ██████╗                                          │
│        ╚════██╗██╔═══██╗                                        │
│         █████╔╝██║   ██║   DAYS TO                              │
│         ╚═══██╗██║   ██║   YOUR MVP.                            │
│        ██████╔╝╚██████╔╝                                        │
│        ╚═════╝  ╚═════╝                                         │
│                                                                  │
│        From idea to real users.                                 │
│        Validated. Shipped. Growing.                             │
│                                                                  │
│        [GET STARTED]  [SEE OUR WORK →]                          │
│                                                                  │
│                                           ┌─────────────────┐   │
│                                           │   3D ELEMENT    │   │
│                                           │   (Spline)      │   │
│                                           └─────────────────┘   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   12                    30                     4.9              │
│   MVPs                  DAYS                   NPS              │
│   Launched              Average                Rating           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Bento Grid Layout (Services)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   WHAT WE BUILD                                                 │
│                                                                  │
│   ┌───────────────────────────┐  ┌────────────────────────────┐ │
│   │                           │  │                            │ │
│   │   MVP DEVELOPMENT         │  │   PRODUCT DESIGN           │ │
│   │   ─────────────────       │  │   ──────────────           │ │
│   │                           │  │                            │ │
│   │   Full-stack development  │  │   UX research, UI design   │ │
│   │   React, Node, Python     │  │   Figma, prototypes        │ │
│   │                           │  │                            │ │
│   │   From $8,000             │  │   From $3,000              │ │
│   │                           │  │                            │ │
│   └───────────────────────────┘  └────────────────────────────┘ │
│                                                                  │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │                                                           │ │
│   │   GROWTH PARTNERSHIP                                      │ │
│   │   ──────────────────                                      │ │
│   │                                                           │ │
│   │   Ongoing development + iteration. We become your         │ │
│   │   technical co-founder.                                   │ │
│   │                                                           │ │
│   │   From $15,000/month                     [LEARN MORE →]   │ │
│   │                                                           │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Motion Specifications

```javascript
// Concept B: Energetic, expressive animations
const motionConfig = {
  // Hero text reveal (word by word)
  heroText: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // Custom bounce
      staggerChildren: 0.1,
    }
  },
  
  // Metric counters (fast, impactful)
  metricCount: {
    duration: 1500,
    ease: "power4.out",
    // Count up with slight overshoot
  },
  
  // Card hovers
  cardHover: {
    y: -8,
    scale: 1.02,
    transition: { duration: 0.25, ease: "easeOut" }
  },
  
  // Scroll reveals
  scrollReveal: {
    initial: { y: 60, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  }
};
```

### Framer Motion Examples

```tsx
// Hero text animation
const HeroTitle = () => {
  const words = ["30", "Days", "to", "Your", "MVP."];
  
  return (
    <motion.h1 
      className="text-display font-bold"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } }
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { y: 100, opacity: 0 },
            visible: { 
              y: 0, 
              opacity: 1,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
            }
          }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </motion.h1>
  );
};

// Metric counter
const MetricCounter = ({ value, label }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  
  useEffect(() => {
    const animation = animate(count, value, { 
      duration: 1.5,
      ease: "easeOut"
    });
    return animation.stop;
  }, []);
  
  return (
    <div className="text-center">
      <motion.span className="text-5xl font-bold text-primary">
        {rounded}
      </motion.span>
      <p className="text-text-secondary mt-2">{label}</p>
    </div>
  );
};
```

### Implementation Notes

- Use Poppins variable font for headline weight animations
- Implement GSAP ScrollTrigger for scroll-based reveals
- 3D element via Spline (keep it minimal, one hero piece)
- High contrast ratios (WCAG AAA for body text)
- Mobile: Stack hero vertically, reduce animation intensity

---

## CONCEPT C: TACTILE 3D MINIMAL

### Personality
- Premium and refined
- Sophisticated minimalism
- "Quality over everything"
- High-end positioning

### Color Palette

```css
:root {
  /* Primary */
  --color-primary: #18181b;        /* Zinc 900 */
  --color-primary-hover: #27272a;  /* Zinc 800 */
  
  /* Background */
  --color-bg-primary: #fafafa;     /* Light mode: almost white */
  --color-bg-secondary: #f4f4f5;   /* Zinc 100 */
  --color-bg-elevated: #ffffff;
  
  /* Text */
  --color-text-primary: #18181b;   /* Zinc 900 */
  --color-text-secondary: #52525b; /* Zinc 600 */
  --color-text-muted: #a1a1aa;     /* Zinc 400 */
  
  /* Accent (subtle) */
  --color-accent: #6366f1;         /* Indigo 500 */
  --color-accent-light: #e0e7ff;   /* Indigo 100 */
  
  /* 3D element highlight */
  --color-3d-primary: #c084fc;     /* Purple 400 */
  --color-3d-secondary: #60a5fa;   /* Blue 400 */
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
}
```

### Typography

```css
/* Headlines */
font-family: 'Instrument Serif', 'Times New Roman', serif;
font-weight: 400;
letter-spacing: -0.02em;

/* Alternative: Sans-serif headlines */
font-family: 'Satoshi', 'Inter', sans-serif;
font-weight: 500;
letter-spacing: -0.03em;

/* Body */
font-family: 'Inter', sans-serif;
font-weight: 400;
line-height: 1.7;
letter-spacing: 0.01em;

/* Captions */
font-family: 'Inter', sans-serif;
font-size: 13px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.1em;
```

### Visual Elements

- Large 3D hero element (abstract shape, interactive)
- Generous whitespace
- Subtle shadows for depth
- Refined typography (serif headlines optional)
- Minimal UI chrome
- Glass morphism for cards (subtle)

### Hero Layout (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  mediann                               Work   About   Contact    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      ╭───────────────────╮                      │
│                      │                   │                      │
│                      │    3D ABSTRACT    │                      │
│                      │    SHAPE          │                      │
│                      │    (Interactive)  │                      │
│                      │                   │                      │
│                      │    Rotates on     │                      │
│                      │    mouse move     │                      │
│                      │                   │                      │
│                      ╰───────────────────╯                      │
│                                                                  │
│                                                                  │
│               We build MVPs in 30 days.                         │
│               Fast. Beautiful. Scalable.                        │
│                                                                  │
│                      [Start a Project]                          │
│                                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Card Design (Glass Morphism)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│   │                                                          │  │
│   │  MVP DEVELOPMENT                                         │  │
│   │                                                          │  │
│   │  Full-stack development for early-stage                  │  │
│   │  startups. React, Node.js, Python.                       │  │
│   │                                                          │  │
│   │  ────────────────────────────────────────────────        │  │
│   │                                                          │  │
│   │  Timeline: 30 days                                       │  │
│   │  Starting at $8,000                                      │  │
│   │                                                          │  │
│   │                                    [Learn more →]        │  │
│   │                                                          │  │
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│                                                                  │
│   Card: Glass effect, subtle border, soft shadow                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Motion Specifications

```javascript
// Concept C: Refined, subtle animations
const motionConfig = {
  // 3D element (Spline interaction)
  hero3D: {
    // Mouse parallax
    rotateX: mouseY * 0.1,
    rotateY: mouseX * 0.1,
    transition: { type: "spring", stiffness: 100, damping: 30 }
  },
  
  // Subtle fade in
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  
  // Card hover (gentle lift)
  cardHover: {
    y: -4,
    boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  // Button hover
  buttonHover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  
  // Scroll progress
  scrollProgress: {
    scaleX: scrollYProgress, // 0 to 1
    transformOrigin: "left"
  }
};
```

### Implementation Notes

- 3D element should be the centerpiece (use Spline or Three.js)
- Keep animations subtle and refined
- Light mode by default (dark mode optional)
- Generous padding and margins (1.5x standard)
- Consider subtle grain texture on backgrounds
- Premium feel requires attention to micro-details

---

## HYBRID RECOMMENDATION

### Primary: Concept B (70%)
- Color palette (black + hot pink + electric blue)
- Typography (Poppins headlines, Inter body)
- Energetic motion (kinetic reveals, counting metrics)
- Editorial layouts (asymmetric, impactful)

### From Concept A (20%)
- Process visualization (assembly line, numbered steps)
- Technical credibility elements
- Grid-based layouts for structured content
- Monospace for metrics and technical data

### From Concept C (10%)
- One 3D hero element (Spline, abstract shape)
- Refined hover states
- Premium attention to spacing
- Subtle shadows for depth

### Final Hybrid Palette

```css
:root {
  /* Brand */
  --color-brand-primary: #FF006E;   /* Hot Pink */
  --color-brand-secondary: #0080FF; /* Electric Blue */
  
  /* Background */
  --color-bg-primary: #000000;
  --color-bg-secondary: #0a0a0a;
  --color-bg-elevated: #111111;
  --color-bg-card: #161616;
  
  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #71717a;
  
  /* Semantic */
  --color-success: #4ade80;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Borders */
  --color-border: #27272a;
  --color-border-hover: #3f3f46;
}
```

---

## RESPONSIVE CONSIDERATIONS

### Desktop (1280px+)
- 12-column grid, max-width 1440px
- Full animations and 3D elements
- Side-by-side layouts

### Tablet (768px - 1279px)
- 8-column grid
- Reduced animation complexity
- Stacked layouts where needed

### Mobile (<768px)
- Single column
- Simplified animations (fade only)
- Touch-optimized interactions
- 3D element: static or simplified

---

## ACCESSIBILITY

All concepts must meet:

- **WCAG AA** minimum (AAA preferred for body text)
- **Color contrast**: 4.5:1 for body, 3:1 for large text
- **Focus states**: Visible, high contrast
- **Motion**: Respect `prefers-reduced-motion`
- **Touch targets**: Minimum 44x44px

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## NEXT STEPS

1. **Review concepts** with stakeholders
2. **Confirm hybrid approach** or select single concept
3. **Finalize color palette** and typography
4. **Begin Figma implementation** (see figma_handoff_complete.md)
5. **Development kickoff** (see design_system_guide.md for tokens)

