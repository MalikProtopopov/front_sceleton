"use client";

import { useState, useEffect, useMemo } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useSearchDebounce(delay = 300) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTerm = useDebounce(searchTerm, delay);

  return useMemo(
    () => ({ searchTerm, debouncedTerm, setSearchTerm }),
    [searchTerm, debouncedTerm]
  );
}

