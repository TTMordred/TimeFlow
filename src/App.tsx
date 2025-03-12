
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import { TimerProvider } from "./components/context/TimerContext";
import MainLayout from "./layout/MainLayout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Statistics = lazy(() => import("./pages/Statistics"));
const Settings = lazy(() => import("./pages/Settings"));
const Auth = lazy(() => import("./pages/Auth"));

// Create query client for React Query with improved configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error("Mutation error:", error);
      }
    }
  },
});

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-[70vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner 
        position="top-right" 
        expand 
        closeButton 
        theme="light"
        toastOptions={{
          duration: 4000,
          className: "glass !bg-white/90"
        }}
      />
      <BrowserRouter>
        <AuthProvider>
          <TimerProvider>
            <Routes>
              <Route path="/auth" element={
                <Suspense fallback={<PageLoader />}>
                  <Auth />
                </Suspense>
              } />
              <Route element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route path="/" element={
                  <Suspense fallback={<PageLoader />}>
                    <Dashboard />
                  </Suspense>
                } />
                <Route path="/sessions" element={
                  <Suspense fallback={<PageLoader />}>
                    <Sessions />
                  </Suspense>
                } />
                <Route path="/statistics" element={
                  <Suspense fallback={<PageLoader />}>
                    <Statistics />
                  </Suspense>
                } />
                <Route path="/settings" element={
                  <Suspense fallback={<PageLoader />}>
                    <Settings />
                  </Suspense>
                } />
              </Route>
              {/* Special routes for handling Vercel 404 errors */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TimerProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    {/* Only show React Query Devtools in development mode */}
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);

export default App;
