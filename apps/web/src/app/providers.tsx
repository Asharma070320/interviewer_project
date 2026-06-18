import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { useTheme } from "@/hooks/useTheme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ThemeInit() {
  useTheme();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <ThemeInit />
        {children}
        <Toaster richColors position="top-right" expand closeButton />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
