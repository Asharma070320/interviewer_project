import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  description?: string;
}

export function StatCard({
  title, value, change, changeType = "neutral",
  icon: Icon, iconColor, iconBg, description,
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
            {change && (
              <p className={cn(
                "text-xs font-medium mt-1 flex items-center gap-1",
                changeType === "positive" && "text-emerald-600 dark:text-emerald-400",
                changeType === "negative" && "text-red-500",
                changeType === "neutral" && "text-muted-foreground",
              )}>
                {changeType === "positive" && "↑"}
                {changeType === "negative" && "↓"}
                {change}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            iconBg ?? "bg-primary/10"
          )}>
            <Icon className={cn("h-5 w-5", iconColor ?? "text-primary")} />
          </div>
        </div>
      </CardContent>

      {/* Subtle gradient accent */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-brand opacity-50" />
    </Card>
  );
}
