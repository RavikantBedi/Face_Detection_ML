import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Eagerly load auth page for fast initial access
import Auth from "./pages/Auth";

// Lazy load all protected pages
const Index = lazy(() => import("./pages/Index"));
const Recognition = lazy(() => import("./pages/Recognition"));
const Databases = lazy(() => import("./pages/Databases"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const Metrics = lazy(() => import("./pages/Metrics"));
const Activity = lazy(() => import("./pages/Activity"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Wrapper to add Suspense to lazy components inside ProtectedRoute
function LazyProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<LazyProtectedRoute><Index /></LazyProtectedRoute>} />
            <Route path="/recognition" element={<LazyProtectedRoute><Recognition /></LazyProtectedRoute>} />
            <Route path="/databases" element={<LazyProtectedRoute><Databases /></LazyProtectedRoute>} />
            <Route path="/pipeline" element={<LazyProtectedRoute><Pipeline /></LazyProtectedRoute>} />
            <Route path="/metrics" element={<LazyProtectedRoute><Metrics /></LazyProtectedRoute>} />
            <Route path="/activity" element={<LazyProtectedRoute><Activity /></LazyProtectedRoute>} />
            <Route path="/settings" element={<LazyProtectedRoute><Settings /></LazyProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
