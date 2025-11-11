import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Pontos from "./pages/Pontos";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./store/authStore";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  // Inicializar MSW em desenvolvimento
  useEffect(() => {
    if (import.meta.env.DEV) {
      import('./mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass',
          serviceWorker: {
            url: '/mockServiceWorker.js',
          },
        }).then(() => {
          console.log('[MSW] Mock Service Worker iniciado ✅');
        }).catch((error) => {
          console.error('[MSW] Erro ao iniciar Mock Service Worker:', error);
        });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated() ? (
                  <Navigate to={isAdmin() ? "/dashboard" : "/pontos"} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route
              path="/pontos"
              element={
                <ProtectedRoute>
                  <Pontos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
