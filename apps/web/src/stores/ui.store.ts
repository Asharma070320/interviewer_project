import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  theme: "light" | "dark" | "system";
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (v: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      theme: "system",

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarMobileOpen: (v) => set({ sidebarMobileOpen: v }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "ui-store", partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, theme: s.theme }) }
  )
);
