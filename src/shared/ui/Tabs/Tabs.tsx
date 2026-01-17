"use client";

import { createContext, useContext, useState, Children, isValidElement, type ReactNode } from "react";
import { cn } from "@/shared/lib";

// ============ Value-based API (original) ============

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  // Index-based API
  activeIndex?: number;
  onChange?: (index: number) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  activeIndex,
  onChange,
  children,
  className,
}: TabsProps) {
  // Determine if we're using index-based or value-based API
  const isIndexBased = activeIndex !== undefined || onChange !== undefined;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  };

  // Index-based API - render Tab components
  if (isIndexBased) {
    const childArray = Children.toArray(children).filter(
      (child): child is React.ReactElement<TabProps> => 
        isValidElement(child) && child.type === Tab
    );
    
    const currentIndex = activeIndex ?? 0;

    return (
      <div className={className}>
        {/* Tab headers */}
        <div
          className="flex gap-1 border-b border-[var(--color-border)] pb-px"
          role="tablist"
        >
          {childArray.map((child, index) => {
            const isSelected = index === currentIndex;
            const tabLabel = child.props.label;

            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onChange?.(index)}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2",
                  isSelected
                    ? "text-[var(--color-accent-primary)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                {tabLabel}
                {isSelected && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent-primary)]" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Tab content */}
        <div role="tabpanel" className="mt-4">
          {childArray[currentIndex]}
        </div>
      </div>
    );
  }

  // Value-based API
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// ============ Index-based Tab component ============

export interface TabProps {
  label: ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Tab({ children, className }: TabProps) {
  return <div className={className}>{children}</div>;
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        "flex gap-1 border-b border-[var(--color-border)] pb-px",
        className,
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        "relative px-4 py-2 text-sm font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isSelected
          ? "text-[var(--color-accent-primary)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
        className,
      )}
    >
      {children}
      {isSelected && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent-primary)]" />
      )}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();

  if (selectedValue !== value) return null;

  return (
    <div role="tabpanel" className={cn("mt-4", className)}>
      {children}
    </div>
  );
}

