import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResponsaveisProvider } from "@/contexts/ResponsaveisContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Refrigerado from "./pages/Refrigerado";
import Congelado from "./pages/Congelado";
import Ambiente from "./pages/Ambiente";
import CamaraFria from "./pages/CamaraFria";
import Cadastro from "./pages/Cadastro";
import Relatorios from "./pages/Relatorios";
import ImpressaoEtiquetas from "./pages/ImpressaoEtiquetas";
import VisualizarEtiquetas from "./pages/VisualizarEtiquetas";
import ContagemEstoque from "./pages/ContagemEstoque";

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
      <ResponsaveisProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/refrigerado" element={<Refrigerado />} />
            <Route path="/congelado" element={<Congelado />} />
            <Route path="/ambiente" element={<Ambiente />} />
            <Route path="/camara-fria" element={<CamaraFria />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/impressao-etiquetas" element={<ImpressaoEtiquetas />} />
            <Route path="/visualizar-etiquetas" element={<VisualizarEtiquetas />} />
            <Route path="/contagem-estoque" element={<ContagemEstoque />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ResponsaveisProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
