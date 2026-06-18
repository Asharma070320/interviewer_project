import { Zap } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-brand animate-pulse shadow-glow" />
          <Zap className="absolute inset-0 m-auto h-6 w-6 text-white" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
