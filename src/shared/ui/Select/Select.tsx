"use client";

import { forwardRef, useState, useRef, useEffect, useCallback } from "react";
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
    const listRef = useRef<HTMLUListElement>(null);

    const currentValue = value !== undefined ? value : internalValue;
    const selectedOption = options.find((opt) => opt.value === currentValue);

    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const minWidthStyle = minWidth
      ? typeof minWidth === "number"
        ? { minWidth: `${minWidth}px` }
        : { minWidth }
      : undefined;

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
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
            ref={ref}
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={`${selectId}-listbox`}
            disabled={disabled}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            onBlur={() => onBlur?.({ target: { value: currentValue, name } })}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-[var(--radius-md)] border bg-[var(--color-bg-primary)] px-4 text-left transition-colors duration-[var(--transition-fast)]",
              "hover:border-[var(--color-border-hover)]",
              "focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)]"
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

          {/* Dropdown menu */}
          {isOpen && (
            <ul
              ref={listRef}
              id={`${selectId}-listbox`}
              role="listbox"
              aria-activedescendant={
                highlightedIndex >= 0 ? `${selectId}-option-${highlightedIndex}` : undefined
              }
              className={cn(
                "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1 shadow-lg",
                "animate-in fade-in-0 zoom-in-95 duration-100"
              )}
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
                    onClick={() => !option.disabled && handleSelect(option.value)}
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
            </ul>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
