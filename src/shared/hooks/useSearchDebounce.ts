"use client";

import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";

export function useSearchDebounce(delay = 300) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTerm = useDebounce(searchTerm, delay);

  return useMemo(
    () => ({ searchTerm, debouncedTerm, setSearchTerm }),
    [searchTerm, debouncedTerm],
  );
}
