import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

export interface EmpresaResumo {
  id: string;
  nome: string;
  role: "owner" | "admin" | "member";
}

interface EmpresaContextValue {
  empresas: EmpresaResumo[];
  activeEmpresaId: string | null;
  activeEmpresa: EmpresaResumo | null;
  loading: boolean;
  setActiveEmpresaId: (id: string) => void;
  refresh: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextValue | undefined>(undefined);
const STORAGE_KEY = "valicontrol:active_empresa_id";

export function EmpresaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [empresas, setEmpresas] = useState<EmpresaResumo[]>([]);
  const [activeEmpresaId, _setActiveEmpresaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setEmpresas([]);
      _setActiveEmpresaId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Aceitar convites pendentes silenciosamente
    await supabase.rpc("claim_pending_invites" as never).catch(() => null);

    const { data, error } = await supabase
      .from("empresa_members")
      .select("role, empresas(id, nome)")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      setEmpresas([]);
      setLoading(false);
      return;
    }

    const list: EmpresaResumo[] = (data ?? [])
      .map((row: any) => row.empresas ? { id: row.empresas.id, nome: row.empresas.nome, role: row.role } : null)
      .filter(Boolean) as EmpresaResumo[];
    list.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    setEmpresas(list);

    const stored = localStorage.getItem(STORAGE_KEY);
    const exists = stored && list.some(e => e.id === stored);
    const next = exists ? stored : list[0]?.id ?? null;
    if (next && next !== activeEmpresaId) {
      _setActiveEmpresaId(next);
      if (next) localStorage.setItem(STORAGE_KEY, next);
    } else if (!next) {
      _setActiveEmpresaId(null);
    }
    setLoading(false);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const setActiveEmpresaId = useCallback((id: string) => {
    _setActiveEmpresaId(id);
    localStorage.setItem(STORAGE_KEY, id);
    queryClient.invalidateQueries();
  }, [queryClient]);

  const activeEmpresa = empresas.find(e => e.id === activeEmpresaId) ?? null;

  return (
    <EmpresaContext.Provider value={{ empresas, activeEmpresaId, activeEmpresa, loading, setActiveEmpresaId, refresh: load }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) throw new Error("useEmpresa must be used within EmpresaProvider");
  return ctx;
}
