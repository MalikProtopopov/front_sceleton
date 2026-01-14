# MEDIANN.DEV: DESIGN SYSTEM GUIDE

This document defines the complete design system including tokens, principles, and component specifications.

---

## TABLE OF CONTENTS

1. [Design Principles](#design-principles)
2. [Design Tokens](#design-tokens)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Motion & Interaction](#motion--interaction)
7. [Page Templates](#page-templates)

---

## DESIGN PRINCIPLES

### 1. Speed is a Feature
Every element should communicate velocity. Fast load times, quick interactions, immediate feedback. The UI should feel as fast as the 30-day delivery promise.

### 2. Proof Over Promise
Show don't tell. Metrics, case studies, and social proof should be prominently displayed. Numbers should animate to draw attention.

### 3. Founder-First Language
Write for early-stage founders. No corporate jargon. Direct, actionable, supportive. "Validate your hypothesis" not "Enterprise solutions".

### 4. Technical Credibility
Balance energy with substance. Use mono fonts for metrics, show technical details where appropriate, demonstrate engineering competence.

### 5. Conversion-Optimized
Every page should have a clear CTA path. Assessment form is the north star. Reduce friction, increase trust signals.

---

## DESIGN TOKENS

### Colors

```json
{
  "colors": {
    "brand": {
      "primary": "#FF006E",
      "primaryHover": "#ff3385",
      "secondary": "#0080FF",
      "secondaryHover": "#3399ff"
    },
    "background": {
      "primary": "#000000",
      "secondary": "#0a0a0a",
      "elevated": "#111111",
      "card": "#161616"
    },
    "text": {
      "primary": "#ffffff",
      "secondary": "#a1a1aa",
      "muted": "#71717a",
      "inverse": "#000000"
    },
    "border": {
      "default": "#27272a",
      "hover": "#3f3f46",
      "focus": "#FF006E"
    },
    "semantic": {
      "success": "#4ade80",
      "successBg": "rgba(74, 222, 128, 0.1)",
      "warning": "#f59e0b",
      "warningBg": "rgba(245, 158, 11, 0.1)",
      "error": "#ef4444",
      "errorBg": "rgba(239, 68, 68, 0.1)"
    }
  }
}
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF006E',
          'primary-hover': '#ff3385',
          secondary: '#0080FF',
          'secondary-hover': '#3399ff',
        },
        bg: {
          primary: '#000000',
          secondary: '#0a0a0a',
          elevated: '#111111',
          card: '#161616',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        border: {
          DEFAULT: '#27272a',
          hover: '#3f3f46',
          focus: '#FF006E',
        },
      },
    },
  },
};
```

### CSS Custom Properties

```css
:root {
  /* Brand */
  --color-brand-primary: #FF006E;
  --color-brand-primary-hover: #ff3385;
  --color-brand-secondary: #0080FF;
  --color-brand-secondary-hover: #3399ff;
  
  /* Background */
  --color-bg-primary: #000000;
  --color-bg-secondary: #0a0a0a;
  --color-bg-elevated: #111111;
  --color-bg-card: #161616;
  
  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #71717a;
  
  /* Border */
  --color-border: #27272a;
  --color-border-hover: #3f3f46;
  --color-border-focus: #FF006E;
  
  /* Semantic */
  --color-success: #4ade80;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 25px 50px rgba(0, 0, 0, 0.6);
  
  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 250ms ease-out;
  --transition-slow: 400ms ease-out;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

---

## TYPOGRAPHY

### Font Families

```css
:root {
  --font-heading: 'Poppins', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'IBM Plex Mono', 'Fira Code', monospace;
}
```

### Font Loading (Next.js)

```typescript
// app/layout.tsx
import { Poppins, Inter, IBM_Plex_Mono } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});
```

### Type Scale

| Name | Size | Line Height | Weight | Use Case |
|------|------|-------------|--------|----------|
| `display` | 64-96px | 1.0 | 700 | Hero headlines |
| `h1` | 48-64px | 1.1 | 700 | Page titles |
| `h2` | 36-48px | 1.2 | 600 | Section headers |
| `h3` | 24-32px | 1.3 | 600 | Card titles |
| `h4` | 20-24px | 1.4 | 600 | Subsections |
| `body-lg` | 18px | 1.6 | 400 | Lead paragraphs |
| `body` | 16px | 1.6 | 400 | Body text |
| `body-sm` | 14px | 1.5 | 400 | Secondary text |
| `caption` | 12px | 1.4 | 500 | Labels, captions |
| `mono` | 14px | 1.5 | 500 | Metrics, code |

### Tailwind Typography Classes

```css
/* Typography utilities */
.text-display {
  @apply font-heading text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none;
}

.text-h1 {
  @apply font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight;
}

.text-h2 {
  @apply font-heading text-3xl md:text-4xl font-semibold tracking-tight leading-tight;
}

.text-h3 {
  @apply font-heading text-2xl md:text-3xl font-semibold leading-snug;
}

.text-h4 {
  @apply font-heading text-xl md:text-2xl font-semibold leading-snug;
}

.text-body-lg {
  @apply font-body text-lg leading-relaxed;
}

.text-body {
  @apply font-body text-base leading-relaxed;
}

.text-body-sm {
  @apply font-body text-sm leading-normal;
}

.text-caption {
  @apply font-body text-xs font-medium uppercase tracking-wider;
}

.text-mono {
  @apply font-mono text-sm font-medium;
}
```

---

## SPACING & LAYOUT

### Spacing Scale

```json
{
  "spacing": {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
    "20": "80px",
    "24": "96px",
    "32": "128px"
  }
}
```

### Grid System

```css
/* Container */
.container {
  @apply mx-auto px-4 sm:px-6 lg:px-8;
  max-width: 1280px;
}

/* Grid */
.grid-12 {
  @apply grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8;
}
```

### Breakpoints

| Name | Min Width | Columns | Gutter |
|------|-----------|---------|--------|
| `sm` | 640px | 4 | 16px |
| `md` | 768px | 8 | 24px |
| `lg` | 1024px | 12 | 32px |
| `xl` | 1280px | 12 | 32px |
| `2xl` | 1536px | 12 | 32px |

### Section Spacing

```css
/* Vertical section spacing */
.section {
  @apply py-16 md:py-24 lg:py-32;
}

.section-sm {
  @apply py-12 md:py-16 lg:py-20;
}

.section-lg {
  @apply py-24 md:py-32 lg:py-40;
}
```

---

## COMPONENTS

### Button

#### Variants

| Variant | Background | Text | Border | Use Case |
|---------|------------|------|--------|----------|
| `primary` | brand-primary | white | none | Main CTA |
| `secondary` | transparent | text-primary | border | Secondary actions |
| `ghost` | transparent | text-secondary | none | Tertiary actions |
| `danger` | error | white | none | Destructive actions |

#### Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| `sm` | 32px | 12px 16px | 14px |
| `md` | 40px | 12px 20px | 14px |
| `lg` | 48px | 16px 24px | 16px |
| `xl` | 56px | 16px 32px | 16px |

#### States

```css
/* Primary Button */
.btn-primary {
  @apply bg-brand-primary text-white font-medium rounded-lg;
  @apply hover:bg-brand-primary-hover;
  @apply focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-bg-primary;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-all duration-150;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-transparent text-text-primary font-medium rounded-lg border border-border;
  @apply hover:bg-bg-elevated hover:border-border-hover;
  @apply focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-bg-primary;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-all duration-150;
}
```

#### Component Example

```tsx
// shared/ui/Button/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) => {
  return (
    <motion.button
      className={cn(buttonVariants({ variant, size }))}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Spinner className="mr-2" />}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
};
```

---

### Input

#### Variants

| Variant | Description |
|---------|-------------|
| `default` | Standard text input |
| `textarea` | Multi-line input |
| `select` | Dropdown select |

#### States

- Default
- Hover
- Focus
- Error
- Disabled

#### Styling

```css
.input {
  @apply w-full px-4 py-3 bg-bg-card text-text-primary rounded-lg border border-border;
  @apply placeholder:text-text-muted;
  @apply hover:border-border-hover;
  @apply focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-colors duration-150;
}

.input-error {
  @apply border-error focus:border-error focus:ring-error;
}

.input-label {
  @apply block text-sm font-medium text-text-secondary mb-2;
}

.input-error-message {
  @apply text-sm text-error mt-1;
}
```

---

### Card

#### Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `default` | Basic card | General content |
| `elevated` | With shadow | Important content |
| `interactive` | Hover effects | Clickable cards |
| `case-study` | Image + content | Case studies |
| `pricing` | Structured | Pricing tiers |

#### Styling

```css
.card {
  @apply bg-bg-card rounded-xl border border-border p-6;
}

.card-elevated {
  @apply bg-bg-card rounded-xl border border-border p-6 shadow-lg;
}

.card-interactive {
  @apply bg-bg-card rounded-xl border border-border p-6;
  @apply hover:border-border-hover hover:bg-bg-elevated;
  @apply transition-all duration-200;
}
```

#### Component Example

```tsx
// shared/ui/Card/Card.tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'interactive';
  children: React.ReactNode;
  className?: string;
}

export const Card = ({
  variant = 'default',
  children,
  className,
}: CardProps) => {
  const Wrapper = variant === 'interactive' ? motion.div : 'div';
  
  const motionProps = variant === 'interactive' ? {
    whileHover: { y: -4, borderColor: 'var(--color-border-hover)' },
    transition: { duration: 0.2 }
  } : {};
  
  return (
    <Wrapper
      className={cn(cardVariants({ variant }), className)}
      {...motionProps}
    >
      {children}
    </Wrapper>
  );
};
```

---

### Navigation

#### Header Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]                    [Nav Links]              [CTA Button]│
│  mediann.                  Work  Process  About      [Contact]  │
└─────────────────────────────────────────────────────────────────┘
```

#### Mobile Menu

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]                                           [Menu Toggle] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Work                                                    →      │
│  ─────────────────────────────────────────────────────────      │
│  Process                                                 →      │
│  ─────────────────────────────────────────────────────────      │
│  About                                                   →      │
│  ─────────────────────────────────────────────────────────      │
│                                                                  │
│  [Contact Us]                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Component Example

```tsx
// widgets/Header/Header.tsx
export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Logo />
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink href="/work">Work</NavLink>
          <NavLink href="/process">Process</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>
        
        <div className="hidden md:block">
          <Button variant="primary" size="md">
            Contact
          </Button>
        </div>
        
        {/* Mobile Toggle */}
        <MobileMenuToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  );
};
```

---

### Metric Counter

Animated number that counts up on scroll.

```tsx
// shared/ui/MetricCounter/MetricCounter.tsx
interface MetricCounterProps {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

export const MetricCounter = ({
  value,
  label,
  suffix = '',
  prefix = '',
}: MetricCounterProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  
  useEffect(() => {
    if (isInView) {
      animate(count, value, {
        duration: 1.5,
        ease: "easeOut",
      });
    }
  }, [isInView, value]);
  
  return (
    <div ref={ref} className="text-center">
      <div className="flex items-baseline justify-center">
        {prefix && <span className="text-2xl text-text-secondary mr-1">{prefix}</span>}
        <motion.span className="font-mono text-5xl md:text-6xl font-bold text-brand-primary">
          {rounded}
        </motion.span>
        {suffix && <span className="text-2xl text-text-secondary ml-1">{suffix}</span>}
      </div>
      <p className="text-text-secondary mt-2 text-sm uppercase tracking-wider">{label}</p>
    </div>
  );
};
```

---

### Process Step

```tsx
// shared/ui/ProcessStep/ProcessStep.tsx
interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
  duration: string;
  isActive?: boolean;
}

export const ProcessStep = ({
  number,
  title,
  description,
  duration,
  isActive = false,
}: ProcessStepProps) => {
  return (
    <motion.div 
      className={cn(
        "relative p-6 rounded-xl border",
        isActive ? "border-brand-primary bg-bg-card" : "border-border"
      )}
      whileHover={{ borderColor: 'var(--color-brand-primary)' }}
    >
      <div className="flex items-start gap-4">
        <span className="font-mono text-brand-primary text-sm font-bold">
          {number}
        </span>
        <div>
          <h3 className="font-heading text-xl font-semibold text-text-primary mb-2">
            {title}
          </h3>
          <p className="text-text-secondary text-sm mb-4">
            {description}
          </p>
          <span className="font-mono text-xs text-text-muted">
            {duration}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
```

---

## MOTION & INTERACTION

### Timing Functions

```javascript
const easings = {
  // Default ease out
  easeOut: [0, 0, 0.2, 1],
  
  // Bounce effect
  bounce: [0.16, 1, 0.3, 1],
  
  // Smooth
  smooth: [0.4, 0, 0.2, 1],
  
  // Snap
  snap: [0.68, -0.55, 0.27, 1.55],
};
```

### Duration Guidelines

| Type | Duration | Use Case |
|------|----------|----------|
| `instant` | 0-100ms | Button feedback, toggles |
| `fast` | 100-200ms | Hovers, micro-interactions |
| `normal` | 200-350ms | Menu opens, card transitions |
| `slow` | 350-500ms | Page transitions, reveals |
| `emphasis` | 500-1000ms | Hero animations, major reveals |

### Scroll Animations (GSAP)

```javascript
// lib/animations/scrollReveal.ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const createScrollReveal = (element: HTMLElement) => {
  gsap.fromTo(element, 
    {
      y: 60,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        once: true,
      },
    }
  );
};

export const createStaggerReveal = (elements: HTMLElement[]) => {
  gsap.fromTo(elements,
    {
      y: 40,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: elements[0],
        start: 'top 80%',
        once: true,
      },
    }
  );
};
```

### Framer Motion Variants

```typescript
// lib/animations/variants.ts
export const fadeInUp = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -30, opacity: 0 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

export const slideInLeft = {
  initial: { x: -60, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 60, opacity: 0 },
};
```

### Reduced Motion

```typescript
// hooks/useReducedMotion.ts
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
};
```

---

## PAGE TEMPLATES

### Home Page Structure

```
1. Header (fixed)
2. Hero Section
   - Large headline
   - Subheadline
   - CTA buttons
   - 3D element (optional)
3. Proof Row
   - 3-4 key metrics with counters
4. Services/What We Build
   - Bento grid layout
   - 3 service cards
5. Process
   - 4-step assembly line
   - Timeline visual
6. Case Studies
   - 2-3 featured cases
   - Results metrics
7. Testimonials
   - Social proof
8. FAQ
   - Accordion
9. CTA Section
   - Final conversion push
10. Footer
```

### Assessment Page Structure

```
1. Header (minimal)
2. Hero
   - Simple headline
   - Form context
3. Assessment Form
   - Multi-step or single page
   - Progress indicator
   - Fields:
     - Name
     - Email
     - Company
     - Project type (select)
     - Budget range (select)
     - Timeline (select)
     - Description (textarea)
4. Trust signals
   - Testimonial
   - Privacy note
5. Footer (minimal)
```

### Case Study Page Structure

```
1. Header
2. Case Hero
   - Project image/video
   - Client name
   - One-line result
3. Overview
   - Challenge
   - Solution
   - Timeline
4. Process Timeline
   - Week by week or phase by phase
5. Results
   - Metrics with counters
   - Before/after if applicable
6. Testimonial
   - Client quote
   - Photo
7. Gallery
   - Screenshots, mockups
8. Related Cases
9. CTA
10. Footer
```

---

## ACCESSIBILITY CHECKLIST

- [ ] Color contrast meets WCAG AA (4.5:1 body, 3:1 large text)
- [ ] All interactive elements have visible focus states
- [ ] Images have alt text
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Navigation is keyboard accessible
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Touch targets are minimum 44x44px
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] Skip link provided for keyboard users

---

## PERFORMANCE BUDGET

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Cumulative Layout Shift | < 0.1 |
| Total Bundle Size | < 200KB (gzipped) |
| Image optimization | WebP/AVIF, lazy loading |

---

## FILE STRUCTURE (FSD)

```
src/
├── app/                    # Next.js app router pages
│   ├── layout.tsx
│   ├── page.tsx           # Home
│   ├── assessment/
│   │   └── page.tsx
│   └── case-study/
│       └── [slug]/
│           └── page.tsx
├── widgets/               # Self-contained UI blocks
│   ├── Header/
│   ├── Footer/
│   ├── HeroSection/
│   ├── ProofRow/
│   ├── ProcessSection/
│   └── CTASection/
├── features/              # Business logic features
│   ├── assessment-form/
│   └── case-studies/
├── entities/              # Domain entities
│   └── case-study/
├── shared/                # Shared code
│   ├── ui/               # UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── ...
│   ├── lib/              # Utilities
│   │   ├── animations/
│   │   ├── cn.ts
│   │   └── ...
│   └── config/           # Configuration
│       ├── routes.ts
│       └── ...
└── styles/               # Global styles
    └── globals.css
```

---

**Document Version**: 1.0  
**Last Updated**: January 2026

