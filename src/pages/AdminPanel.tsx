import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, CreditCard, RefreshCw, Search, ShieldCheck, Users, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Subscriber { id: string; user_id: string; empresa_id: string | null; empresa_nome?: string; plan: string | null; status: string; trial_start: string; trial_end: string; current_period_end: string | null; mp_subscription_id: string | null; payment_provider: string | null; created_at: string; }

const statusLabel: Record<string,string> = { active: "Ativa", trialing: "Teste", cancelled: "Cancelada", canceled: "Cancelada", past_due: "Pagamento pendente", inactive: "Inativa" };

export default function AdminPanel() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Não foi possível carregar assinantes", description: error.message, variant: "destructive" });
    else setRows((data as Subscriber[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => rows.filter(r => `${r.user_id} ${r.empresa_id ?? ""} ${r.plan ?? ""} ${r.status}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const active = rows.filter(r => r.status === "active").length;
  const trial = rows.filter(r => r.status === "trialing").length;
  const cancelled = rows.filter(r => ["cancelled","canceled","inactive"].includes(r.status)).length;

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
    if (error) return toast({ title: "Não foi possível alterar", description: error.message, variant: "destructive" });
    toast({ title: "Assinatura atualizada" });
    await load();
  };

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-[68px] max-w-[1500px] items-center justify-between gap-4 px-5 lg:px-8">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white"><ShieldCheck className="h-5 w-5" /></div><div><h1 className="text-xl font-bold">Administração ValiControl</h1><p className="text-xs text-slate-500">Gestão da plataforma e assinantes</p></div></div>
        <Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Atualizar</Button>
      </div>
    </header>

    <main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Total de assinaturas" value={rows.length} />
        <Metric icon={CheckCircle2} label="Ativas" value={active} />
        <Metric icon={CreditCard} label="Em teste" value={trial} />
        <Metric icon={XCircle} label="Canceladas/inativas" value={cancelled} />
      </section>

      <Card className="mt-6"><CardHeader><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><CardTitle>Assinantes</CardTitle><p className="mt-1 text-sm text-slate-500">Controle o status das assinaturas existentes no Supabase.</p></div><div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por usuário, empresa ou plano" className="pl-9" /></div></div></CardHeader><CardContent>
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500"><th className="px-3 py-3">Cliente</th><th className="px-3 py-3">Plano</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Teste</th><th className="px-3 py-3">Próximo período</th><th className="px-3 py-3">Pagamento</th><th className="px-3 py-3 text-right">Ações</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={7} className="px-3 py-10 text-center text-slate-500">Carregando assinantes…</td></tr> : filtered.length === 0 ? <tr><td colSpan={7} className="px-3 py-10 text-center text-slate-500">Nenhuma assinatura encontrada.</td></tr> : filtered.map(row => <tr key={row.id} className="border-b last:border-0 hover:bg-slate-50"><td className="px-3 py-4"><p className="font-medium">{row.empresa_id || "Sem empresa"}</p><p className="max-w-[250px] truncate text-xs text-slate-500">Usuário: {row.user_id}</p></td><td className="px-3 py-4">{row.plan || "—"}</td><td className="px-3 py-4"><Badge variant={row.status === "active" || row.status === "trialing" ? "default" : row.status.includes("cancel") || row.status === "inactive" ? "destructive" : "secondary"}>{statusLabel[row.status] || row.status}</Badge></td><td className="px-3 py-4">{new Date(row.trial_end).toLocaleDateString("pt-BR")}</td><td className="px-3 py-4">{row.current_period_end ? new Date(row.current_period_end).toLocaleDateString("pt-BR") : "—"}</td><td className="px-3 py-4">{row.payment_provider || "—"}</td><td className="px-3 py-4"><div className="flex justify-end gap-2">{row.status !== "active" && <Button size="sm" variant="outline" onClick={() => void updateStatus(row.id,"active")}>Ativar</Button>}{row.status === "active" && <Button size="sm" variant="outline" className="text-red-600" onClick={() => void updateStatus(row.id,"cancelled")}>Cancelar</Button>}</div></td></tr>)}</tbody></table></div>
      </CardContent></Card>

      <section className="mt-6 grid gap-4 lg:grid-cols-2"><Card><CardContent className="flex gap-4 p-6"><BarChart3 className="h-6 w-6 text-blue-600" /><div><h3 className="font-semibold">Próxima etapa</h3><p className="mt-1 text-sm text-slate-500">Adicionar MRR, receita por plano, histórico de pagamentos e integração com o Mercado Pago sem expor credenciais no frontend.</p></div></CardContent></Card><Card><CardContent className="flex gap-4 p-6"><ShieldCheck className="h-6 w-6 text-emerald-600" /><div><h3 className="font-semibold">Acesso protegido</h3><p className="mt-1 text-sm text-slate-500">Esta área só deve ser acessível a usuários com o papel administrativo validado pelo Supabase.</p></div></CardContent></Card></section>
    </main>
  </div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) { return <Card><CardContent className="flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Icon className="h-5 w-5" /></div><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div></CardContent></Card>; }
