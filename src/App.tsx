import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResponsaveisProvider } from "@/contexts/ResponsaveisContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { EmpresaProvider } from "@/contexts/EmpresaContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import DashboardReference from "./pages/DashboardReference";
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
import LeitorQrCode from "./pages/LeitorQrCode";
import ConfiguracoesEmpresa from "./pages/ConfiguracoesEmpresa";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

const App: React.FC = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <EmpresaProvider>
            <ResponsaveisProvider>
              <TooltipProvider>
                <SidebarProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter basename={routerBasename}>
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/" element={<ProtectedRoute><DashboardReference /></ProtectedRoute>} />
                      <Route path="/refrigerado" element={<ProtectedRoute><Refrigerado /></ProtectedRoute>} />
                      <Route path="/congelado" element={<ProtectedRoute><Congelado /></ProtectedRoute>} />
                      <Route path="/ambiente" element={<ProtectedRoute><Ambiente /></ProtectedRoute>} />
                      <Route path="/camara-fria" element={<ProtectedRoute><CamaraFria /></ProtectedRoute>} />
                      <Route path="/cadastro" element={<ProtectedRoute><Cadastro /></ProtectedRoute>} />
                      <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
                      <Route path="/impressao-etiquetas" element={<ProtectedRoute><ImpressaoEtiquetas /></ProtectedRoute>} />
                      <Route path="/visualizar-etiquetas" element={<VisualizarEtiquetas />} />
                      <Route path="/contagem-estoque" element={<ProtectedRoute><ContagemEstoque /></ProtectedRoute>} />
                      <Route path="/leitor-qrcode" element={<ProtectedRoute><LeitorQrCode /></ProtectedRoute>} />
                      <Route path="/configuracoes/empresa" element={<ProtectedRoute><ConfiguracoesEmpresa /></ProtectedRoute>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </SidebarProvider>
              </TooltipProvider>
            </ResponsaveisProvider>
          </EmpresaProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
