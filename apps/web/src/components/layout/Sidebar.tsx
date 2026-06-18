import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, Mic, Code2, History,
  BrainCircuit, ChevronLeft, ChevronRight, Zap,
  MessageSquare, Trophy, Settings, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    group: "Main",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/", end: true },
      { label: "Resume Analysis", icon: FileText, path: "/resume" },
      { label: "AI Interview", icon: Zap, path: "/interview" },
      { label: "Voice Interview", icon: Mic, path: "/voice" },
      { label: "Coding Assessment", icon: Code2, path: "/coding" },
    ],
  },
  {
    group: "Learning",
    items: [
      { label: "Interview History", icon: History, path: "/history" },
      { label: "AI Career Coach", icon: BrainCircuit, path: "/coach" },
      { label: "Achievements", icon: Trophy, path: "/achievements" },
    ],
  },
  {
    group: "Support",
    items: [
      { label: "Feedback", icon: MessageSquare, path: "/feedback" },
      { label: "Settings", icon: Settings, path: "/settings" },
      { label: "Help", icon: HelpCircle, path: "/help" },
    ],
  },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-sidebar-border shrink-0",
        sidebarCollapsed ? "justify-center" : "gap-3"
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-sm">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-sidebar-foreground leading-none">InterviewAI</span>
            <span className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5">AI Interview Platform</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {navItems.map((group) => (
            <div key={group.group} className="mb-4">
              {!sidebarCollapsed && (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  {group.group}
                </p>
              )}
              {sidebarCollapsed && group.group !== "Main" && (
                <Separator className="my-2 bg-sidebar-border" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.end
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                  const link = (
                    <NavLink
                      to={item.path}
                      end={item.end}
                      className={cn(
                        "flex items-center rounded-lg text-sm font-medium transition-all duration-150 group",
                        sidebarCollapsed
                          ? "justify-center h-10 w-10 mx-auto"
                          : "gap-3 px-3 py-2 w-full",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className={cn("shrink-0", sidebarCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  );

                  if (sidebarCollapsed) {
                    return (
                      <Tooltip key={item.path} delayDuration={0}>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right" className="ml-1">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.path}>{link}</div>;
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Upgrade CTA */}
      {!sidebarCollapsed && (
        <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-brand-600/20 to-purple-600/20 border border-brand-500/20 p-3">
          <p className="text-xs font-semibold text-sidebar-foreground">Upgrade to Pro</p>
          <p className="text-[10px] text-sidebar-foreground/60 mt-0.5 mb-2">
            Unlimited interviews, advanced AI feedback
          </p>
          <Button size="sm" variant="gradient" className="w-full text-xs h-7">
            Upgrade Now
          </Button>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          className={cn(
            "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent w-full",
            sidebarCollapsed ? "justify-center" : "justify-end"
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
