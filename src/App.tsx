import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResponsaveisProvider } from "@/contexts/ResponsaveisContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Refrigerado from "./pages/Refrigerado";
import Congelado from "./pages/Congelado";
import Ambiente from "./pages/Ambiente";
import CamaraFria from "./pages/CamaraFria";
import Cadastro from "./pages/Cadastro";
import Relatorios from "./pages/Relatorios";
import ImpressaoEtiquetas from "./pages/ImpressaoEtiquetas";
import VisualizarEtiquetas from "./pages/VisualizarEtiquetas";
import ContagemEstoque from "./pages/ContagemEstoque";
import ResetPassword from "./pages/ResetPassword";
import Planos from "./pages/Planos";
import MinhaAssinatura from "./pages/MinhaAssinatura";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <SubscriptionProvider>
        <ResponsaveisProvider>
          <TooltipProvider>
            <SidebarProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/refrigerado" element={<ProtectedRoute><Refrigerado /></ProtectedRoute>} />
                <Route path="/congelado" element={<ProtectedRoute><Congelado /></ProtectedRoute>} />
                <Route path="/ambiente" element={<ProtectedRoute><Ambiente /></ProtectedRoute>} />
                <Route path="/camara-fria" element={<ProtectedRoute><CamaraFria /></ProtectedRoute>} />
                <Route path="/cadastro" element={<ProtectedRoute><Cadastro /></ProtectedRoute>} />
                <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
                <Route path="/impressao-etiquetas" element={<ProtectedRoute><ImpressaoEtiquetas /></ProtectedRoute>} />
                <Route path="/visualizar-etiquetas" element={<ProtectedRoute><VisualizarEtiquetas /></ProtectedRoute>} />
                <Route path="/contagem-estoque" element={<ProtectedRoute><ContagemEstoque /></ProtectedRoute>} />
                <Route path="/planos" element={<ProtectedRoute><Planos /></ProtectedRoute>} />
                <Route path="/minha-assinatura" element={<ProtectedRoute><MinhaAssinatura /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </SidebarProvider>
          </TooltipProvider>
        </ResponsaveisProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
