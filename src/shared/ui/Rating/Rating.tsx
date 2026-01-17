"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/shared/lib";

export interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function Rating({
  value = 0,
  onChange,
  max = 5,
  size = "md",
  readonly = false,
  label,
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
      )}
      <div 
        className={cn("flex items-center gap-0.5", !readonly && "cursor-pointer")}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: max }, (_, i) => {
          const rating = i + 1;
          const isFilled = rating <= displayValue;

          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              disabled={readonly}
              className={cn(
                "transition-colors",
                readonly ? "cursor-default" : "cursor-pointer",
                isFilled
                  ? "text-[var(--color-warning)]"
                  : "text-[var(--color-text-muted)]",
                !readonly && "hover:text-[var(--color-warning)]"
              )}
            >
              <Star
                className={cn(sizeClasses[size], isFilled && "fill-current")}
              />
            </button>
          );
        })}
        {value > 0 && (
          <span className="ml-2 text-sm text-[var(--color-text-secondary)]">
            {value}/{max}
          </span>
        )}
      </div>
    </div>
  );
}

