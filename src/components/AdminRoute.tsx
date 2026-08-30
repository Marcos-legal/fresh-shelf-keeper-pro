import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

  if (loading || checking) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
}
