"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import DOMPurify from "dompurify";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/shared/lib";
import { useCallback, useEffect, useState } from "react";

// HTML Sanitization config
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'blockquote', 'pre', 'code',
    'div', 'span', 'mark',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr'
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'class', 'style', 'colspan', 'rowspan', 'width', 'height'],
};

// Sanitize HTML content
function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded transition-colors",
        "hover:bg-[var(--color-bg-secondary)]",
        isActive && "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {children}
    </button>
  );
}

interface ToolbarDividerProps {
  className?: string;
}

function ToolbarDivider({ className }: ToolbarDividerProps) {
  return (
    <div className={cn("mx-1 h-6 w-px bg-[var(--color-border)]", className)} />
  );
}

interface MenuBarProps {
  editor: Editor | null;
}

function MenuBar({ editor }: MenuBarProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  // Force re-render on selection/transaction changes to update toolbar button states
  const [, forceUpdate] = useState(0);

  // Subscribe to editor events to update toolbar state when selection changes
  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      forceUpdate((prev) => prev + 1);
    };

    // Listen to selection and transaction changes
    editor.on("selectionUpdate", updateHandler);
    editor.on("transaction", updateHandler);

    return () => {
      editor.off("selectionUpdate", updateHandler);
      editor.off("transaction", updateHandler);
    };
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt("Введите URL изображения:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2">
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Отменить"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Повторить"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Заголовок 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Заголовок 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Заголовок 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Жирный"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Курсив"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Подчёркнутый"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Зачёркнутый"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive("highlight")}
        title="Выделить"
      >
        <Highlighter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Код"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Маркированный список"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Нумерованный список"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Цитата"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Горизонтальная линия"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="По левому краю"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="По центру"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="По правому краю"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        isActive={editor.isActive({ textAlign: "justify" })}
        title="По ширине"
      >
        <AlignJustify className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Link */}
      {showLinkInput ? (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://"
            className="h-8 w-48 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setLink();
              }
              if (e.key === "Escape") {
                setShowLinkInput(false);
                setLinkUrl("");
              }
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={setLink}
            className="h-8 rounded bg-[var(--color-accent-primary)] px-3 text-sm text-white"
          >
            OK
          </button>
        </div>
      ) : (
        <ToolbarButton
          onClick={() => setShowLinkInput(true)}
          isActive={editor.isActive("link")}
          title="Ссылка"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
      )}

      {/* Image */}
      <ToolbarButton onClick={addImage} title="Изображение">
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Начните писать...",
  disabled = false,
  label,
  error,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    // Disable immediate render to avoid SSR hydration mismatch
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[var(--color-accent-primary)] underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-yellow-200 dark:bg-yellow-800",
        },
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      // Sanitize HTML before passing to parent
      const html = editor.getHTML();
      onChange?.(sanitizeHtml(html));
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none",
          // Headings styling
          "prose-headings:text-[var(--color-text-primary)]",
          "prose-h1:text-2xl prose-h1:font-bold prose-h1:mt-6 prose-h1:mb-4",
          "prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-5 prose-h2:mb-3",
          "prose-h3:text-lg prose-h3:font-medium prose-h3:mt-4 prose-h3:mb-2",
          // Text styling
          "prose-p:text-[var(--color-text-primary)] prose-p:my-2",
          "prose-strong:text-[var(--color-text-primary)]",
          "prose-a:text-[var(--color-accent-primary)]",
          // Lists styling
          "prose-ul:list-disc prose-ul:pl-6 prose-ul:my-2",
          "prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-2",
          "prose-li:my-1 prose-li:text-[var(--color-text-primary)]",
          // Other elements
          "prose-blockquote:border-l-[var(--color-accent-primary)] prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-code:bg-[var(--color-bg-secondary)] prose-code:px-1 prose-code:rounded",
          "prose-hr:border-[var(--color-border)]",
          // Placeholder styling
          "[&_.is-editor-empty:first-child::before]:text-[var(--color-text-muted)]",
          "[&_.is-editor-empty:first-child::before]:float-left",
          "[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          "[&_.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_.is-editor-empty:first-child::before]:h-0"
        ),
      },
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Sanitize incoming content
      const sanitized = sanitizeHtml(value);
      editor.commands.setContent(sanitized);
    }
  }, [value, editor]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)]",
          error && "border-[var(--color-error)]",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

