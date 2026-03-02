import { create } from "zustand";

interface LimitExceededState {
  isOpen: boolean;
  resource: string | null;
  currentUsage: number | null;
  limit: number | null;
  show: (resource: string, currentUsage: number, limit: number) => void;
  close: () => void;
}

export const useLimitExceededStore = create<LimitExceededState>((set) => ({
  isOpen: false,
  resource: null,
  currentUsage: null,
  limit: null,
  show: (resource, currentUsage, limit) =>
    set({ isOpen: true, resource, currentUsage, limit }),
  close: () =>
    set({ isOpen: false, resource: null, currentUsage: null, limit: null }),
}));
