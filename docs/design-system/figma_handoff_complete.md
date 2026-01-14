# MEDIANN.DEV: FIGMA HANDOFF & DEVELOPER SPECIFICATIONS

Complete developer handoff guide with component specifications, code examples, and implementation notes.

---

## TABLE OF CONTENTS

1. [Figma File Structure](#figma-file-structure)
2. [Component Specifications](#component-specifications)
3. [Responsive Rules](#responsive-rules)
4. [Motion & Code Examples](#motion--code-examples)
5. [Design Tokens Export](#design-tokens-export)
6. [QA Checklist](#qa-checklist)
7. [Implementation Timeline](#implementation-timeline)

---

## FIGMA FILE STRUCTURE

### Recommended Page Organization

```
📁 mediann.dev Design System
├── 📄 Cover
├── 📄 1. Foundations
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Grid System
│   ├── Shadows
│   └── Icons
├── 📄 2. Components
│   ├── Buttons
│   ├── Inputs
│   ├── Cards
│   ├── Navigation
│   ├── Modals
│   ├── Accordions
│   └── Misc
├── 📄 3. Patterns
│   ├── Hero Sections
│   ├── Proof Row
│   ├── Process Timeline
│   ├── Bento Grid
│   ├── Testimonials
│   ├── CTA Sections
│   └── Footer
├── 📄 4. Pages
│   ├── Home (Desktop)
│   ├── Home (Tablet)
│   ├── Home (Mobile)
│   ├── Assessment
│   └── Case Study Template
├── 📄 5. Motion Specs
│   ├── Timing Reference
│   ├── Hover States
│   ├── Scroll Animations
│   └── Page Transitions
├── 📄 6. Developer Handoff
│   ├── Spacing Guide
│   ├── Responsive Breakpoints
│   ├── Component States Matrix
│   └── Export Assets
└── 📄 7. Archive
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `Button`, `CardCaseStudy` |
| Variants | Descriptive | `Primary`, `Secondary`, `Ghost` |
| States | State name | `Default`, `Hover`, `Active`, `Disabled` |
| Sizes | Size name | `Small`, `Medium`, `Large` |
| Breakpoints | Device name | `Desktop`, `Tablet`, `Mobile` |

---

## COMPONENT SPECIFICATIONS

### Button

#### Properties Table

| Property | Type | Options | Default |
|----------|------|---------|---------|
| `variant` | enum | `primary`, `secondary`, `ghost`, `danger` | `primary` |
| `size` | enum | `sm`, `md`, `lg`, `xl` | `md` |
| `state` | enum | `default`, `hover`, `active`, `disabled`, `loading` | `default` |
| `leftIcon` | boolean | `true`, `false` | `false` |
| `rightIcon` | boolean | `true`, `false` | `false` |

#### Measurements

| Size | Height | Padding X | Padding Y | Font Size | Border Radius |
|------|--------|-----------|-----------|-----------|---------------|
| `sm` | 32px | 16px | 6px | 14px | 6px |
| `md` | 40px | 20px | 8px | 14px | 8px |
| `lg` | 48px | 24px | 12px | 16px | 8px |
| `xl` | 56px | 32px | 16px | 16px | 10px |

#### Color Specs by Variant

**Primary Button**
```
Default:
  Background: #FF006E (brand-primary)
  Text: #FFFFFF
  Border: none

Hover:
  Background: #ff3385 (brand-primary-hover)
  Transform: scale(1.02)

Active:
  Background: #cc0058
  Transform: scale(0.98)

Disabled:
  Background: #FF006E
  Opacity: 0.5
  Cursor: not-allowed

Loading:
  Background: #FF006E
  Content: Spinner + text
```

**Secondary Button**
```
Default:
  Background: transparent
  Text: #FFFFFF (text-primary)
  Border: 1px solid #27272a (border)

Hover:
  Background: #111111 (bg-elevated)
  Border: 1px solid #3f3f46 (border-hover)

Active:
  Background: #161616
  Border: 1px solid #3f3f46

Disabled:
  Opacity: 0.5
  Cursor: not-allowed
```

**Ghost Button**
```
Default:
  Background: transparent
  Text: #a1a1aa (text-secondary)
  Border: none

Hover:
  Text: #FFFFFF (text-primary)
  Background: rgba(255,255,255,0.05)
```

#### Implementation Code

```tsx
// Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary',
        secondary: 'bg-transparent text-text-primary border border-border hover:bg-bg-elevated hover:border-border-hover focus:ring-brand-primary',
        ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
        danger: 'bg-error text-white hover:bg-red-600 focus:ring-error',
      },
      size: {
        sm: 'h-8 px-4 text-sm rounded-md',
        md: 'h-10 px-5 text-sm rounded-lg',
        lg: 'h-12 px-6 text-base rounded-lg',
        xl: 'h-14 px-8 text-base rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = ({
  variant,
  size,
  isLoading,
  leftIcon,
  rightIcon,
  children,
  className,
  ...props
}: ButtonProps) => {
  return (
    <motion.button
      className={cn(buttonVariants({ variant, size }), className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
};
```

---

### Input

#### Properties Table

| Property | Type | Options | Default |
|----------|------|---------|---------|
| `variant` | enum | `default`, `error` | `default` |
| `size` | enum | `sm`, `md`, `lg` | `md` |
| `state` | enum | `default`, `hover`, `focus`, `disabled`, `error` | `default` |

#### Measurements

| Size | Height | Padding X | Padding Y | Font Size |
|------|--------|-----------|-----------|-----------|
| `sm` | 36px | 12px | 8px | 14px |
| `md` | 44px | 16px | 12px | 14px |
| `lg` | 52px | 16px | 14px | 16px |

#### Color Specs

```
Default:
  Background: #161616 (bg-card)
  Text: #FFFFFF (text-primary)
  Placeholder: #71717a (text-muted)
  Border: 1px solid #27272a (border)
  Border Radius: 8px

Hover:
  Border: 1px solid #3f3f46 (border-hover)

Focus:
  Border: 1px solid #FF006E (brand-primary)
  Ring: 1px #FF006E (brand-primary)

Error:
  Border: 1px solid #ef4444 (error)
  Ring: 1px #ef4444

Disabled:
  Opacity: 0.5
  Background: #111111
```

#### Implementation Code

```tsx
// Input.tsx
import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-11 px-4 bg-bg-card text-text-primary rounded-lg border transition-colors duration-150',
            'placeholder:text-text-muted',
            'hover:border-border-hover',
            'focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-error focus:border-error focus:ring-error' : 'border-border',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-sm text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

### Card

#### Variants

| Variant | Background | Border | Shadow | Hover |
|---------|------------|--------|--------|-------|
| `default` | bg-card | border | none | - |
| `elevated` | bg-card | border | shadow-lg | - |
| `interactive` | bg-card | border | none | lift + glow |
| `case-study` | image + content | border | shadow-md | scale |

#### Measurements

```
Padding: 24px (default)
Border Radius: 12px
Border: 1px solid #27272a

Interactive Hover:
  Transform: translateY(-4px)
  Border: 1px solid #3f3f46
  Shadow: 0 20px 25px rgba(0,0,0,0.3)
```

#### Implementation Code

```tsx
// Card.tsx
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

interface CardProps {
  variant?: 'default' | 'elevated' | 'interactive';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({
  variant = 'default',
  children,
  className,
  onClick,
}: CardProps) => {
  const baseStyles = 'rounded-xl border border-border p-6 bg-bg-card';
  
  const variantStyles = {
    default: '',
    elevated: 'shadow-lg',
    interactive: 'cursor-pointer transition-all duration-200 hover:border-border-hover hover:shadow-lg',
  };

  if (variant === 'interactive') {
    return (
      <motion.div
        className={cn(baseStyles, variantStyles[variant], className)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)}>
      {children}
    </div>
  );
};
```

---

### Case Study Card

```tsx
// CaseStudyCard.tsx
interface CaseStudyCardProps {
  image: string;
  title: string;
  category: string;
  metrics: { value: string; label: string }[];
  href: string;
}

export const CaseStudyCard = ({
  image,
  title,
  category,
  metrics,
  href,
}: CaseStudyCardProps) => {
  return (
    <motion.a
      href={href}
      className="group block rounded-xl overflow-hidden bg-bg-card border border-border"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="p-6">
        <span className="text-caption text-brand-primary">{category}</span>
        <h3 className="text-h4 text-text-primary mt-2 mb-4 group-hover:text-brand-primary transition-colors">
          {title}
        </h3>
        
        {/* Metrics */}
        <div className="flex gap-6">
          {metrics.map((metric, i) => (
            <div key={i}>
              <span className="font-mono text-xl font-bold text-text-primary">
                {metric.value}
              </span>
              <span className="block text-xs text-text-muted mt-1">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.a>
  );
};
```

---

### Navigation Header

```tsx
// Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';

const navLinks = [
  { label: 'Work', href: '/work' },
  { label: 'Process', href: '/process' },
  { label: 'About', href: '/about' },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-bg-primary/90 backdrop-blur-lg border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="font-heading font-bold text-xl text-text-primary">
            mediann.
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <Button variant="primary" size="md">
              Start Project
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <motion.span
                className="w-full h-0.5 bg-text-primary"
                animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 9 : 0 }}
              />
              <motion.span
                className="w-full h-0.5 bg-text-primary"
                animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
              />
              <motion.span
                className="w-full h-0.5 bg-text-primary"
                animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -9 : 0 }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden bg-bg-primary border-t border-border"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="container py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-text-primary text-lg py-3 border-b border-border"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button variant="primary" size="lg" className="mt-4">
                Start Project
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
```

---

## RESPONSIVE RULES

### Breakpoint Reference

| Breakpoint | Min Width | Tailwind Class | Use Case |
|------------|-----------|----------------|----------|
| Mobile | 0px | (default) | Phones |
| sm | 640px | `sm:` | Large phones |
| md | 768px | `md:` | Tablets |
| lg | 1024px | `lg:` | Small laptops |
| xl | 1280px | `xl:` | Desktops |
| 2xl | 1536px | `2xl:` | Large screens |

### Grid Behavior

```
Mobile (< 768px):
  - Single column layout
  - Full-width cards
  - Stack everything vertically
  - Reduce section padding to py-12

Tablet (768px - 1023px):
  - 2-column grids where applicable
  - Side-by-side hero layout optional
  - Section padding py-16

Desktop (1024px+):
  - 12-column grid system
  - Multi-column layouts
  - Full animation complexity
  - Section padding py-24 to py-32
```

### Component Responsive Changes

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Hero Headline | 36-48px | 48-64px | 64-96px |
| Section Padding | 48px | 64px | 96-128px |
| Card Grid | 1 col | 2 col | 3 col |
| Process Steps | Vertical | Vertical | Horizontal |
| Metrics Row | Stack | 2x2 | Row |

---

## MOTION & CODE EXAMPLES

### Framer Motion - Hero Animation

```tsx
// HeroSection.tsx
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // Custom easing
    },
  },
};

export const HeroSection = () => {
  return (
    <motion.section
      className="min-h-screen flex items-center pt-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container">
        <motion.span 
          className="text-caption text-brand-primary mb-4 block"
          variants={itemVariants}
        >
          MVP Studio
        </motion.span>
        
        <motion.h1 
          className="text-display text-text-primary mb-6"
          variants={itemVariants}
        >
          30 Days to<br />Your MVP.
        </motion.h1>
        
        <motion.p 
          className="text-body-lg text-text-secondary max-w-xl mb-8"
          variants={itemVariants}
        >
          From validated hypothesis to real users. Fast.
        </motion.p>
        
        <motion.div 
          className="flex gap-4"
          variants={itemVariants}
        >
          <Button variant="primary" size="lg">Get Started</Button>
          <Button variant="secondary" size="lg">See Our Work</Button>
        </motion.div>
      </div>
    </motion.section>
  );
};
```

### GSAP - Scroll Counter

```tsx
// MetricCounter.tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MetricCounterProps {
  value: number;
  label: string;
  suffix?: string;
}

export const MetricCounter = ({ value, label, suffix = '' }: MetricCounterProps) => {
  const counterRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!counterRef.current || hasAnimated.current) return;

    const counter = { value: 0 };

    ScrollTrigger.create({
      trigger: counterRef.current,
      start: 'top 80%',
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;
        
        gsap.to(counter, {
          value: value,
          duration: 1.5,
          ease: 'power3.out',
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = Math.round(counter.value).toString();
            }
          },
        });
      },
    });
  }, [value]);

  return (
    <div className="text-center">
      <div className="flex items-baseline justify-center">
        <span
          ref={counterRef}
          className="font-mono text-5xl font-bold text-brand-primary"
        >
          0
        </span>
        {suffix && (
          <span className="text-2xl text-text-secondary ml-1">{suffix}</span>
        )}
      </div>
      <p className="text-text-muted text-sm uppercase tracking-wider mt-2">
        {label}
      </p>
    </div>
  );
};
```

### GSAP - Scroll Reveal

```tsx
// useScrollReveal.ts
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      {
        y: 60,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
      }
    );
  }, []);

  return ref;
};

// Usage
const Section = () => {
  const ref = useScrollReveal();
  return <div ref={ref}>Content</div>;
};
```

### Page Transition

```tsx
// app/template.tsx
'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

---

## DESIGN TOKENS EXPORT

### JSON Format (for Tailwind)

```json
{
  "colors": {
    "brand": {
      "primary": { "value": "#FF006E" },
      "primary-hover": { "value": "#ff3385" },
      "secondary": { "value": "#0080FF" },
      "secondary-hover": { "value": "#3399ff" }
    },
    "bg": {
      "primary": { "value": "#000000" },
      "secondary": { "value": "#0a0a0a" },
      "elevated": { "value": "#111111" },
      "card": { "value": "#161616" }
    },
    "text": {
      "primary": { "value": "#ffffff" },
      "secondary": { "value": "#a1a1aa" },
      "muted": { "value": "#71717a" }
    },
    "border": {
      "default": { "value": "#27272a" },
      "hover": { "value": "#3f3f46" },
      "focus": { "value": "#FF006E" }
    },
    "semantic": {
      "success": { "value": "#4ade80" },
      "warning": { "value": "#f59e0b" },
      "error": { "value": "#ef4444" }
    }
  },
  "typography": {
    "fontFamily": {
      "heading": { "value": "'Poppins', sans-serif" },
      "body": { "value": "'Inter', sans-serif" },
      "mono": { "value": "'IBM Plex Mono', monospace" }
    },
    "fontSize": {
      "display": { "value": "clamp(48px, 8vw, 96px)" },
      "h1": { "value": "clamp(36px, 5vw, 64px)" },
      "h2": { "value": "clamp(28px, 4vw, 48px)" },
      "h3": { "value": "clamp(24px, 3vw, 32px)" },
      "body-lg": { "value": "18px" },
      "body": { "value": "16px" },
      "body-sm": { "value": "14px" },
      "caption": { "value": "12px" }
    }
  },
  "spacing": {
    "1": { "value": "4px" },
    "2": { "value": "8px" },
    "3": { "value": "12px" },
    "4": { "value": "16px" },
    "5": { "value": "20px" },
    "6": { "value": "24px" },
    "8": { "value": "32px" },
    "10": { "value": "40px" },
    "12": { "value": "48px" },
    "16": { "value": "64px" },
    "20": { "value": "80px" },
    "24": { "value": "96px" }
  },
  "borderRadius": {
    "sm": { "value": "4px" },
    "md": { "value": "8px" },
    "lg": { "value": "12px" },
    "xl": { "value": "16px" },
    "full": { "value": "9999px" }
  },
  "shadow": {
    "sm": { "value": "0 1px 2px rgba(0, 0, 0, 0.3)" },
    "md": { "value": "0 4px 6px rgba(0, 0, 0, 0.4)" },
    "lg": { "value": "0 10px 15px rgba(0, 0, 0, 0.5)" },
    "xl": { "value": "0 25px 50px rgba(0, 0, 0, 0.6)" }
  },
  "transition": {
    "fast": { "value": "150ms ease-out" },
    "normal": { "value": "250ms ease-out" },
    "slow": { "value": "400ms ease-out" }
  }
}
```

### Tailwind Config Export

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
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
        success: '#4ade80',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Poppins', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        display: ['clamp(48px, 8vw, 96px)', { lineHeight: '1', fontWeight: '700' }],
        h1: ['clamp(36px, 5vw, 64px)', { lineHeight: '1.1', fontWeight: '700' }],
        h2: ['clamp(28px, 4vw, 48px)', { lineHeight: '1.2', fontWeight: '600' }],
        h3: ['clamp(24px, 3vw, 32px)', { lineHeight: '1.3', fontWeight: '600' }],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px rgba(0, 0, 0, 0.4)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
        xl: '0 25px 50px rgba(0, 0, 0, 0.6)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
    },
  },
  plugins: [],
};
```

---

## QA CHECKLIST

### Visual QA

- [ ] All colors match design tokens exactly
- [ ] Typography hierarchy is consistent
- [ ] Spacing follows 4px grid
- [ ] Border radius is consistent
- [ ] Shadows render correctly

### Component QA

- [ ] All button states work (hover, active, disabled, loading)
- [ ] Form inputs validate correctly
- [ ] Error states display properly
- [ ] Cards scale correctly on different screen sizes
- [ ] Navigation works on all devices

### Responsive QA

- [ ] Test at 375px (iPhone SE)
- [ ] Test at 390px (iPhone 14)
- [ ] Test at 768px (iPad)
- [ ] Test at 1024px (iPad Pro)
- [ ] Test at 1280px (Desktop)
- [ ] Test at 1920px (Large Desktop)

### Motion QA

- [ ] Animations are smooth (60fps)
- [ ] Reduced motion preference respected
- [ ] No layout shift during animations
- [ ] Scroll animations trigger at correct positions
- [ ] Page transitions work correctly

### Performance QA

- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] No render-blocking resources
- [ ] Images optimized (WebP/AVIF)
- [ ] Fonts preloaded

### Accessibility QA

- [ ] Color contrast passes WCAG AA
- [ ] All interactive elements focusable
- [ ] Focus states visible
- [ ] Form labels associated correctly
- [ ] Images have alt text
- [ ] Keyboard navigation works
- [ ] Screen reader testing passed

### Cross-Browser QA

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari
- [ ] Android Chrome

---

## IMPLEMENTATION TIMELINE

### Week 1: Setup & Foundations

| Day | Task |
|-----|------|
| 1 | Project setup (Next.js, Tailwind, TypeScript) |
| 2 | Design tokens implementation (colors, typography, spacing) |
| 3 | Base component structure (Button, Input) |
| 4 | Card variants |
| 5 | Navigation (Header, Footer) |

### Week 2: Core Components

| Day | Task |
|-----|------|
| 1 | Form components (Input, Select, Textarea, Checkbox) |
| 2 | Modal and Accordion |
| 3 | Metric Counter with animation |
| 4 | Process Step component |
| 5 | Testimonial and CTA components |

### Week 3: Page Patterns

| Day | Task |
|-----|------|
| 1 | Hero Section pattern |
| 2 | Proof Row pattern |
| 3 | Bento Grid / Services pattern |
| 4 | Case Study Card pattern |
| 5 | Footer and FAQ patterns |

### Week 4: Pages

| Day | Task |
|-----|------|
| 1-2 | Home page implementation |
| 3 | Assessment page implementation |
| 4-5 | Case Study template |

### Week 5: Motion & Polish

| Day | Task |
|-----|------|
| 1-2 | Scroll animations (GSAP) |
| 3 | Hover states and micro-interactions |
| 4 | Page transitions |
| 5 | Responsive fine-tuning |

### Week 6: QA & Launch

| Day | Task |
|-----|------|
| 1 | Visual QA and bug fixes |
| 2 | Performance optimization |
| 3 | Accessibility audit |
| 4 | Cross-browser testing |
| 5 | Launch preparation |

---

**Document Version**: 1.0  
**Last Updated**: January 2026

