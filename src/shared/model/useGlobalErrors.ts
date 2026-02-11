import { create } from "zustand";

interface GlobalErrorsState {
  /** True when the current tenant has been deactivated */
  isTenantInactive: boolean;
  /** Name of the disabled feature, or null if none */
  disabledFeature: string | null;
  /** Set tenant as inactive */
  setTenantInactive: () => void;
  /** Set a specific feature as disabled */
  setFeatureDisabled: (featureName: string) => void;
  /** Clear the disabled feature state */
  clearFeatureDisabled: () => void;
  /** Reset all global error states */
  reset: () => void;
}

export const useGlobalErrors = create<GlobalErrorsState>((set) => ({
  isTenantInactive: false,
  disabledFeature: null,
  setTenantInactive: () => set({ isTenantInactive: true }),
  setFeatureDisabled: (featureName: string) => set({ disabledFeature: featureName }),
  clearFeatureDisabled: () => set({ disabledFeature: null }),
  reset: () => set({ isTenantInactive: false, disabledFeature: null }),
}));
