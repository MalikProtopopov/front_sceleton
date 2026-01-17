/**
 * HTML Sanitization Utilities
 * 
 * Use these utilities for safe HTML rendering and sanitization.
 * Based on DOMPurify for XSS prevention.
 */

import DOMPurify from 'dompurify';

// Default sanitization config
const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'pre', 'code',
  'div', 'span', 'mark',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr',
];

const DEFAULT_ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'target', 
  'class', 'style', 
  'colspan', 'rowspan', 'width', 'height',
];

// Strict config for user-generated content
const STRICT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'ul', 'ol', 'li',
  'a',
];

const STRICT_ALLOWED_ATTR = ['href', 'title'];

/**
 * Sanitize HTML content with default config
 * Use for article content, descriptions, etc.
 */
export function sanitizeHtml(
  html: string, 
  allowedTags = DEFAULT_ALLOWED_TAGS,
  allowedAttr = DEFAULT_ALLOWED_ATTR
): string {
  if (typeof window === 'undefined') return html;
  if (!html) return '';
  return DOMPurify.sanitize(html, { 
    ALLOWED_TAGS: allowedTags, 
    ALLOWED_ATTR: allowedAttr 
  });
}

/**
 * Sanitize HTML with strict config
 * Use for user comments, reviews, etc.
 */
export function sanitizeHtmlStrict(html: string): string {
  return sanitizeHtml(html, STRICT_ALLOWED_TAGS, STRICT_ALLOWED_ATTR);
}

/**
 * Strip all HTML tags, return plain text
 * Use for previews, excerpts, etc.
 */
export function stripHtml(html: string): string {
  if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '');
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

/**
 * Truncate HTML content safely
 * Preserves tags, cuts at word boundary
 */
export function truncateHtml(html: string, maxLength: number): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return html;
  
  const truncated = text.slice(0, maxLength).replace(/\s+\S*$/, '');
  return truncated + '...';
}

/**
 * Check if HTML content is empty
 * Returns true if content is empty or only contains whitespace/empty tags
 */
export function isHtmlEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  const text = stripHtml(html).trim();
  return text.length === 0;
}

/**
 * Extract first paragraph from HTML
 * Useful for generating excerpts
 */
export function extractFirstParagraph(html: string): string {
  if (!html) return '';
  
  // Try to find first <p> tag content
  const match = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (match && match[1]) {
    return stripHtml(match[1]).trim();
  }
  
  // Fallback: strip all tags and take first sentence
  const text = stripHtml(html).trim();
  const firstSentence = text.split(/[.!?]\s/)[0];
  return firstSentence ? firstSentence + '.' : text.slice(0, 200);
}

