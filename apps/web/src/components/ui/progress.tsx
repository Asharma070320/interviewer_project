import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
    showValue?: boolean;
  }
>(({ className, value, indicatorClassName, showValue, ...props }, ref) => (
  <div className={cn("flex items-center gap-2", showValue && "")}>
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all duration-500 ease-in-out",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
    {showValue && (
      <span className="text-xs font-medium text-muted-foreground w-8 text-right">{value}%</span>
    )}
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
