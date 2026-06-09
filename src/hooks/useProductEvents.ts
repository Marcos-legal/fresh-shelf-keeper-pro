import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export type ProductEventType = "consumido" | "descartado" | "vencido";

export interface ProductEvent {
  id: string;
  empresa_id: string;
  product_id: number | null;
  product_nome: string | null;
  product_lote: string | null;
  user_id: string | null;
  tipo: ProductEventType;
  motivo: string | null;
  custo_snapshot: number | null;
  created_at: string;
}

interface RegisterParams {
  productId: string;
  productNome?: string;
  productLote?: string;
  tipo: ProductEventType;
  motivo?: string;
  precoCusto?: number;
}

export function useProductEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ProductEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("product_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      console.error(error);
    } else {
      setEvents((data ?? []) as ProductEvent[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const registerEvent = useCallback(
    async ({ productId, productNome, productLote, tipo, motivo, precoCusto }: RegisterParams) => {
      if (!user) {
        toast({ title: "Sessão expirada", description: "Faça login novamente.", variant: "destructive" });
        return false;
      }
      const numericId = Number(productId);
      const { error: insertError } = await supabase.from("product_events").insert({
        product_id: Number.isFinite(numericId) ? numericId : null,
        product_nome: productNome ?? null,
        product_lote: productLote ?? null,
        tipo,
        motivo: motivo ?? null,
        custo_snapshot: precoCusto ?? null,
      } as never);

      if (insertError) {
        console.error(insertError);
        toast({
          title: "Não foi possível registrar a baixa",
          description: insertError.message,
          variant: "destructive",
        });
        return false;
      }

      if (Number.isFinite(numericId)) {
        await supabase.from("products").delete().eq("id", numericId);
      }

      await loadEvents();
      toast({
        title: tipo === "consumido" ? "Produto consumido" : "Produto descartado",
        description: "Baixa registrada com sucesso.",
      });
      return true;
    },
    [user, loadEvents]
  );

  return { events, loading, registerEvent, refresh: loadEvents };
}
