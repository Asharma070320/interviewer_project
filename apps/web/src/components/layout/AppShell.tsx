import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useUIStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";

export function AppShell() {
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <div
        className={cn(
          "hidden md:flex flex-col h-full shrink-0 z-30",
          "fixed md:relative md:translate-x-0 transition-transform duration-300"
        )}
      >
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col md:hidden transition-transform duration-300",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
