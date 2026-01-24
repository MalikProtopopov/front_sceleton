"use client";

import { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/shared/lib";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  /** Container class name for width control */
  containerClassName?: string;
  /** Minimum width for the select (default: 200px for action selects) */
  minWidth?: string | number;
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  onBlur?: (e: { target: { value: string; name?: string } }) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      hint,
      options,
      placeholder,
      id,
      minWidth = label ? undefined : "200px",
      value,
      defaultValue,
      onChange,
      onBlur,
      name,
      disabled,
      required,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || "");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

    const currentValue = value !== undefined ? value : internalValue;
    const selectedOption = options.find((opt) => opt.value === currentValue);

    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const minWidthStyle = minWidth
      ? typeof minWidth === "number"
        ? { minWidth: `${minWidth}px` }
        : { minWidth }
      : undefined;
    
    // Calculate dropdown position when opening
    useEffect(() => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    }, [isOpen]);

    // Update position on scroll/resize
    useEffect(() => {
      if (!isOpen) return;

      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }, [isOpen]);

    // Check if dropdown should open upward
    const shouldOpenUpward = useMemo(() => {
      if (!dropdownPosition) return false;
      const spaceBelow = window.innerHeight - dropdownPosition.top;
      return spaceBelow < 250 && dropdownPosition.top > 250;
    }, [dropdownPosition]);

    const handleSelect = useCallback(
      (optionValue: string) => {
        if (value === undefined) {
          setInternalValue(optionValue);
        }
        onChange?.({ target: { value: optionValue, name } });
        setIsOpen(false);
        setHighlightedIndex(-1);
      },
      [onChange, name, value]
    );

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        if (!isOpen) {
          const currentIndex = options.findIndex((opt) => opt.value === currentValue);
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        }
      }
    };

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        // Check if click is outside both container and dropdown list (which is in portal)
        const isOutsideContainer = containerRef.current && !containerRef.current.contains(target);
        const isOutsideDropdown = listRef.current && !listRef.current.contains(target);
        
        if (isOutsideContainer && isOutsideDropdown) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      };

      if (isOpen) {
        // Use mouseup instead of mousedown to allow onClick handlers to fire first
        document.addEventListener("mouseup", handleClickOutside);
        return () => document.removeEventListener("mouseup", handleClickOutside);
      }
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const option = options[highlightedIndex];
            if (option && !option.disabled) {
              handleSelect(option.value);
            }
          } else {
            setIsOpen(true);
            const currentIndex = options.findIndex((opt) => opt.value === currentValue);
            setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            const currentIndex = options.findIndex((opt) => opt.value === currentValue);
            setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
          } else {
            setHighlightedIndex((prev) => {
              let next = prev + 1;
              while (next < options.length && options[next]?.disabled) {
                next++;
              }
              return next < options.length ? next : prev;
            });
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => {
              let next = prev - 1;
              while (next >= 0 && options[next]?.disabled) {
                next--;
              }
              return next >= 0 ? next : prev;
            });
          }
          break;
        case "Tab":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    // Scroll highlighted option into view
    useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && listRef.current) {
        const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
        if (highlightedElement) {
          highlightedElement.scrollIntoView({ block: "nearest" });
        }
      }
    }, [highlightedIndex, isOpen]);

    return (
      <div
        ref={containerRef}
        className={cn(label ? "w-full" : "", containerClassName, className)}
      >
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
          >
            {label}
            {required && <span className="ml-1 text-[var(--color-error)]">*</span>}
          </label>
        )}
        <div className="relative" style={minWidthStyle}>
          {/* Hidden native select for form submission */}
          <select
            name={name}
            id={selectId}
            value={currentValue}
            onChange={() => {}}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom trigger button */}
          <button
            ref={(node) => {
              // Handle both refs
              buttonRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={`${selectId}-listbox`}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling to parent (e.g., table row)
              handleToggle();
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => onBlur?.({ target: { value: currentValue, name } })}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-[var(--radius-md)] border bg-[var(--color-bg-primary)] px-4 text-left transition-colors duration-[var(--transition-fast)]",
              "hover:border-[var(--color-border-hover)]",
              "focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)]",
              className?.includes("h-9") && "h-9 px-3 text-sm"
            )}
          >
            <span
              className={cn(
                "truncate",
                selectedOption ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"
              )}
            >
              {selectedOption?.label || placeholder || "Выберите..."}
            </span>
            <ChevronDown
              className={cn(
                "ml-2 h-5 w-5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown menu - rendered in portal for proper z-index stacking */}
          {isOpen && dropdownPosition && typeof document !== "undefined" && createPortal(
            <ul
              ref={listRef}
              id={`${selectId}-listbox`}
              role="listbox"
              aria-activedescendant={
                highlightedIndex >= 0 ? `${selectId}-option-${highlightedIndex}` : undefined
              }
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling to parent
              }}
              className={cn(
                "fixed z-[9999] max-h-60 overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1 shadow-lg",
                "animate-in fade-in-0 zoom-in-95 duration-100"
              )}
              style={{
                top: shouldOpenUpward ? "auto" : dropdownPosition.top,
                bottom: shouldOpenUpward ? window.innerHeight - dropdownPosition.top + buttonRef.current!.offsetHeight + 8 : "auto",
                left: dropdownPosition.left,
                width: Math.max(dropdownPosition.width, 140),
                minWidth: "max-content",
                maxWidth: "calc(100vw - 2rem)",
              }}
            >
              {options.map((option, index) => {
                const isSelected = option.value === currentValue;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={option.value}
                    id={`${selectId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent focus loss and allow selection before dropdown closes
                      e.stopPropagation(); // Prevent event bubbling
                      if (!option.disabled) {
                        handleSelect(option.value);
                      }
                    }}
                    onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors",
                      option.disabled && "cursor-not-allowed opacity-50",
                      isHighlighted && !option.disabled && "bg-[var(--color-bg-hover)]",
                      isSelected && "text-[var(--color-accent-primary)] font-medium"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="ml-2 h-4 w-4 shrink-0 text-[var(--color-accent-primary)]" />
                    )}
                  </li>
                );
              })}
              {options.length === 0 && (
                <li className="px-4 py-2.5 text-sm text-[var(--color-text-muted)]">
                  Нет вариантов
                </li>
              )}
            </ul>,
            document.body
          )}
        </div>
        {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
