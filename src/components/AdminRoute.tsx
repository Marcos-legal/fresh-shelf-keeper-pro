import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!user) { setChecking(false); setAllowed(false); return; }
    supabase.rpc("has_role" as never, { _role: "admin", _user_id: user.id } as never)
      .then(({ data }) => { if (mounted) { setAllowed(Boolean(data)); setChecking(false); } })
      .catch(() => { if (mounted) { setAllowed(false); setChecking(false); } });
    return () => { mounted = false; };
  }, [user]);

  if (loading || checking) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="h-7 w-7 animate-spin text-blue-500" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!allowed) return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400"><ShieldAlert className="h-7 w-7" /></div>
        <h1 className="mt-5 text-2xl font-bold">Acesso administrativo</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Esta área é exclusiva para contas com o papel <strong className="text-slate-200">admin</strong>. Sua conta autenticada ainda não possui essa permissão.</p>
        <Button className="mt-6" onClick={() => window.location.assign("/")}>Voltar ao sistema</Button>
      </div>
    </div>
  );
  return <>{children}</>;
}
