
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResponsaveisProvider } from "@/contexts/ResponsaveisContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Refrigerado from "./pages/Refrigerado";
import Congelado from "./pages/Congelado";
import Ambiente from "./pages/Ambiente";
import CamaraFria from "./pages/CamaraFria";
import Cadastro from "./pages/Cadastro";
import Relatorios from "./pages/Relatorios";
import ImpressaoEtiquetas from "./pages/ImpressaoEtiquetas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ResponsaveisProvider>
  </QueryClientProvider>
);

export default App;
