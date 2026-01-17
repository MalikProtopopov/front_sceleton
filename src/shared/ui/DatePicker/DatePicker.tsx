"use client";

import { forwardRef, useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib";

export interface DatePickerProps {
  value?: string; // ISO date string: YYYY-MM-DD
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
}

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Adjust for Monday start
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (year === undefined || month === undefined || day === undefined) return null;
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month - 1, day);
}

function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return "";
  return date.toLocaleDateString("ru-RU", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  });
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, label, placeholder = "Выберите дату", error, disabled, min, max, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
      const parsed = parseDate(value || "");
      return parsed || new Date();
    });
    const containerRef = useRef<HTMLDivElement>(null);

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

    const handlePrevMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const dateStr = formatDate(newDate);
      
      // Check min/max constraints
      if (min && dateStr < min) return;
      if (max && dateStr > max) return;
      
      onChange?.(dateStr);
      setIsOpen(false);
    };

    const isDateDisabled = (day: number): boolean => {
      const dateStr = formatDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
      if (min && dateStr < min) return true;
      if (max && dateStr > max) return true;
      return false;
    };

    const isDateSelected = (day: number): boolean => {
      if (!value) return false;
      const dateStr = formatDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
      return dateStr === value;
    };

    const isToday = (day: number): boolean => {
      const today = new Date();
      return (
        viewDate.getFullYear() === today.getFullYear() &&
        viewDate.getMonth() === today.getMonth() &&
        day === today.getDate()
      );
    };

    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        {label && (
          <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
            {label}
          </label>
        )}
        
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2",
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
          <span className={value ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
          <Calendar className="h-4 w-4 text-[var(--color-text-muted)]" />
        </div>

        {/* Hidden input for form submission */}
        <input ref={ref} type="hidden" value={value || ""} />

        {/* Calendar dropdown */}
        {isOpen && !disabled && (
          <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 shadow-lg">
            {/* Month/Year navigation */}
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-medium text-[var(--color-text-primary)]">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-[var(--color-text-muted)]"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="h-8 w-8" />
              ))}
              {days.map((day) => {
                const isDisabled = isDateDisabled(day);
                const isSelected = isDateSelected(day);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    disabled={isDisabled}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors",
                      isSelected
                        ? "bg-[var(--color-accent-primary)] text-white"
                        : isTodayDate
                        ? "border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                        : "hover:bg-[var(--color-bg-secondary)]",
                      isDisabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

