"use client";

import { useState, useRef, useEffect, forwardRef } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/shared/lib";
import { useDebounce } from "@/shared/hooks";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  options: ComboboxOption[];
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  onSearch?: (query: string) => void;
  emptyMessage?: string;
  className?: string;
}

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      value,
      onChange,
      options,
      label,
      placeholder = "Выберите...",
      searchPlaceholder = "Поиск...",
      error,
      disabled,
      multiple = false,
      searchable = true,
      clearable = true,
      loading = false,
      onSearch,
      emptyMessage = "Ничего не найдено",
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Handle external search
    useEffect(() => {
      if (onSearch && debouncedSearch !== undefined) {
        onSearch(debouncedSearch);
      }
    }, [debouncedSearch, onSearch]);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    // Focus search input when opened
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Reset search when closed
    useEffect(() => {
      if (!isOpen) {
        setSearchQuery("");
      }
    }, [isOpen]);

    const selectedValues = multiple
      ? (value as string[] | undefined) || []
      : value
      ? [value as string]
      : [];

    const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

    const filteredOptions = searchQuery
      ? options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue];
        onChange?.(newValues);
      } else {
        onChange?.(optionValue);
        setIsOpen(false);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(multiple ? [] : "");
    };

    const handleRemoveTag = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (multiple) {
        onChange?.(selectedValues.filter((v) => v !== optionValue));
      }
    };

    const displayValue = multiple
      ? selectedOptions.length > 0
        ? null // Will show tags
        : placeholder
      : selectedOptions[0]?.label || placeholder;

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        {label && (
          <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
            {label}
          </label>
        )}

        {/* Trigger */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex min-h-[40px] w-full items-center gap-2 rounded-lg border px-3 py-2",
            "bg-[var(--color-bg-primary)] text-sm",
            "transition-colors cursor-pointer",
            error
              ? "border-[var(--color-error)]"
              : isOpen
              ? "border-[var(--color-accent-primary)] ring-1 ring-[var(--color-accent-primary)]"
              : "border-[var(--color-border)]",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1">
            {multiple && selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="flex items-center gap-1 rounded-md bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveTag(opt.value, e)}
                    className="hover:text-[var(--color-error)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            ) : (
              <span
                className={
                  selectedValues.length > 0
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)]"
                }
              >
                {displayValue}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {clearable && selectedValues.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:text-[var(--color-error)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-[var(--color-text-muted)] transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </div>

        {/* Hidden input for form submission */}
        <input ref={ref} type="hidden" value={JSON.stringify(value)} />

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-lg">
            {/* Search */}
            {searchable && (
              <div className="border-b border-[var(--color-border)] p-2">
                <div className="flex items-center gap-2 rounded-md bg-[var(--color-bg-secondary)] px-3 py-2">
                  <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-muted)]"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="max-h-60 overflow-y-auto p-1">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-accent-primary)] border-t-transparent" />
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-sm text-[var(--color-text-muted)]">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                          : "hover:bg-[var(--color-bg-secondary)]",
                        option.disabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {option.description}
                          </div>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);

Combobox.displayName = "Combobox";

