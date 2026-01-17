"use client";

import { sanitizeHtml, sanitizeHtmlStrict } from "@/shared/lib";
import { cn } from "@/shared/lib";

export interface HtmlContentProps {
  /** HTML content to render */
  html: string | null | undefined;
  /** Use strict sanitization (for user-generated content) */
  strict?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Wrapper element type */
  as?: "div" | "span" | "article" | "section";
}

/**
 * Safe HTML content renderer
 * 
 * Automatically sanitizes HTML content to prevent XSS attacks.
 * Use for rendering article content, descriptions, bios, etc.
 * 
 * @example
 * // For article content
 * <HtmlContent html={article.content} className="prose" />
 * 
 * // For user comments (strict mode)
 * <HtmlContent html={comment.text} strict />
 */
export function HtmlContent({ 
  html, 
  strict = false, 
  className,
  as: Component = "div",
}: HtmlContentProps) {
  if (!html) return null;

  const sanitized = strict ? sanitizeHtmlStrict(html) : sanitizeHtml(html);

  return (
    <Component
      className={cn(
        // Default prose styles
        "prose prose-sm max-w-none",
        "prose-headings:text-[var(--color-text-primary)]",
        "prose-p:text-[var(--color-text-primary)]",
        "prose-strong:text-[var(--color-text-primary)]",
        "prose-a:text-[var(--color-accent-primary)]",
        "prose-blockquote:border-l-[var(--color-accent-primary)]",
        "prose-code:bg-[var(--color-bg-secondary)] prose-code:px-1 prose-code:rounded",
        "prose-hr:border-[var(--color-border)]",
        "prose-img:rounded-lg",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

