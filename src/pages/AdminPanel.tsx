import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3, Building2, CheckCircle2, CreditCard, LayoutDashboard,
  LogOut, Package, PauseCircle, PlayCircle, RefreshCw, Search,
  Settings, ShieldCheck, Users, XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Subscriber {
  id: string; user_id: string; empresa_id: string | null; plan: string | null;
  status: string; trial_start: string | null; trial_end: string | null;
  current_period_end: string | null; mp_subscription_id: string | null;
  payment_provider: string | null; created_at: string;
}

type Section = "overview" | "subscribers" | "plans" | "finance" | "settings";
const statusLabel: Record<string, string> = {
  active: "Ativa", trialing: "Em teste", cancelled: "Cancelada", canceled: "Cancelada",
  past_due: "Pagamento pendente", inactive: "Inativa", paused: "Pausada"
};
const date = (value?: string | null) => value ? new Date(value).toLocaleDateString("pt-BR") : "—";

export default function AdminPanel() {
  const [section, setSection] = useState<Section>("overview");
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Não foi possível carregar assinantes", description: error.message, variant: "destructive" });
    else setRows((data as Subscriber[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => rows.filter(r => {
    const text = `${r.user_id} ${r.empresa_id ?? ""} ${r.plan ?? ""} ${r.status}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (statusFilter === "all" || r.status === statusFilter);
  }), [rows, query, statusFilter]);

  const counts = {
    active: rows.filter(r => r.status === "active").length,
    trial: rows.filter(r => r.status === "trialing").length,
    pending: rows.filter(r => r.status === "past_due").length,
    cancelled: rows.filter(r => ["cancelled", "canceled", "inactive"].includes(r.status)).length,
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
    if (error) return toast({ title: "Não foi possível alterar", description: error.message, variant: "destructive" });
    toast({ title: status === "active" ? "Assinatura ativada" : "Assinatura cancelada" });
    await load();
  };

  const nav = [
    ["overview", "Visão geral", LayoutDashboard],
    ["subscribers", "Assinantes", Users],
    ["plans", "Planos", Package],
    ["finance", "Financeiro", CreditCard],
    ["settings", "Configurações", Settings],
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-800 bg-slate-950 md:flex md:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600"><ShieldCheck className="h-5 w-5" /></div>
          <div><p className="font-bold">ValiControl</p><p className="text-xs text-slate-500">ADMINISTRAÇÃO</p></div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map(([id, label, Icon]) => <button key={id} onClick={() => setSection(id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${section === id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}><Icon className="h-4 w-4" />{label}</button>)}
        </nav>
        <div className="border-t border-slate-800 p-4 text-xs text-slate-500">Área restrita ao administrador da plataforma.</div>
      </aside>

      <div className="min-h-screen md:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 lg:px-8">
            <div><p className="text-xs uppercase tracking-wider text-blue-400">Painel administrativo</p><h1 className="text-xl font-bold">{nav.find(n => n[0] === section)?.[1]}</h1></div>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Atualizar</Button>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-slate-800 px-4 py-2 md:hidden">
            {nav.map(([id, label]) => <button key={id} onClick={() => setSection(id)} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs ${section === id ? "bg-blue-600" : "text-slate-400"}`}>{label}</button>)}
          </div>
        </header>

        <main className="p-5 lg:p-8">
          {section === "overview" && <Overview rows={rows} counts={counts} onSubscribers={() => setSection("subscribers")} />}
          {section === "subscribers" && <Subscribers rows={rows} filtered={filtered} loading={loading} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} updateStatus={updateStatus} />}
          {section === "plans" && <EmptySection icon={Package} title="Planos" text="Aqui ficará o cadastro e gerenciamento dos planos do ValiControl, incluindo preço, período de teste e limites." />}
          {section === "finance" && <EmptySection icon={BarChart3} title="Financeiro" text="MRR, receita, pagamentos e conciliação serão exibidos aqui quando a integração de cobrança estiver conectada ao backend." />}
          {section === "settings" && <EmptySection icon={Settings} title="Configurações" text="Configurações da plataforma e permissões administrativas ficarão nesta área." />}
        </main>
      </div>
    </div>
  );
}

function Overview({ rows, counts, onSubscribers }: { rows: Subscriber[]; counts: { active: number; trial: number; pending: number; cancelled: number }; onSubscribers: () => void }) {
  const conversion = counts.active + counts.trial ? Math.round(counts.active / (counts.active + counts.trial) * 100) : 0;
  return <div className="mx-auto max-w-[1500px] space-y-6">
    <div><p className="text-sm text-slate-400">Visão geral da operação</p><h2 className="mt-1 text-2xl font-bold">Olá, administrador 👋</h2></div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Users} label="Total de assinantes" value={rows.length} />
      <Metric icon={CheckCircle2} label="Assinaturas ativas" value={counts.active} />
      <Metric icon={CreditCard} label="Em período de teste" value={counts.trial} />
      <Metric icon={XCircle} label="Canceladas / inativas" value={counts.cancelled} />
    </section>
    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="border-slate-800 bg-slate-900"><CardContent className="p-5"><p className="text-sm text-slate-400">Pagamentos pendentes</p><p className="mt-2 text-3xl font-bold">{counts.pending}</p></CardContent></Card>
      <Card className="border-slate-800 bg-slate-900"><CardContent className="p-5"><p className="text-sm text-slate-400">Conversão teste → ativa</p><p className="mt-2 text-3xl font-bold">{conversion}%</p></CardContent></Card>
      <Card className="border-slate-800 bg-slate-900"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-slate-400">Gestão de assinantes</p><p className="mt-1 text-sm">Consultar e administrar clientes.</p></div><Button onClick={onSubscribers}>Abrir</Button></CardContent></Card>
    </section>
    <Card className="border-slate-800 bg-slate-900"><CardHeader><CardTitle className="text-base">Operação administrativa</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><Info icon={Building2} title="Clientes" text="Visualize empresas e usuários vinculados às assinaturas." /><Info icon={CreditCard} title="Cobrança" text="Acompanhe o status das assinaturas e prepare a integração de pagamento." /><Info icon={ShieldCheck} title="Segurança" text="Acesso restrito por função administrativa." /></CardContent></Card>
  </div>;
}

function Subscribers({ rows, filtered, loading, query, setQuery, statusFilter, setStatusFilter, updateStatus }: { rows: Subscriber[]; filtered: Subscriber[]; loading: boolean; query: string; setQuery: (v: string) => void; statusFilter: string; setStatusFilter: (v: string) => void; updateStatus: (id: string, status: string) => Promise<void> }) {
  return <div className="mx-auto max-w-[1500px] space-y-5">
    <div><p className="text-sm text-slate-400">Gestão comercial</p><h2 className="mt-1 text-2xl font-bold">Assinantes</h2></div>
    <Card className="border-slate-800 bg-slate-900"><CardHeader><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><CardTitle className="text-base">Clientes da plataforma</CardTitle><p className="mt-1 text-sm text-slate-400">{filtered.length} de {rows.length} assinaturas</p></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar cliente, empresa ou plano" className="border-slate-700 bg-slate-950 pl-9" /></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm"><option value="all">Todos os status</option><option value="active">Ativas</option><option value="trialing">Em teste</option><option value="past_due">Pagamento pendente</option><option value="cancelled">Canceladas</option><option value="inactive">Inativas</option></select></div></div></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-sm"><thead><tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500"><th className="px-3 py-3">Cliente</th><th className="px-3 py-3">Plano</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Cadastro</th><th className="px-3 py-3">Fim do teste</th><th className="px-3 py-3">Próxima cobrança</th><th className="px-3 py-3">Pagamento</th><th className="px-3 py-3 text-right">Ações</th></tr></thead><tbody>{loading ? <tr><td colSpan={8} className="px-3 py-12 text-center text-slate-500">Carregando…</td></tr> : filtered.length === 0 ? <tr><td colSpan={8} className="px-3 py-12 text-center text-slate-500">Nenhuma assinatura encontrada.</td></tr> : filtered.map(row => <tr key={row.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40"><td className="px-3 py-4"><p className="font-medium">{row.empresa_id || "Sem empresa"}</p><p className="max-w-[230px] truncate text-xs text-slate-500">{row.user_id}</p></td><td className="px-3 py-4 font-medium">{row.plan || "—"}</td><td className="px-3 py-4"><Badge variant={row.status === "active" || row.status === "trialing" ? "default" : "secondary"}>{statusLabel[row.status] || row.status}</Badge></td><td className="px-3 py-4">{date(row.created_at)}</td><td className="px-3 py-4">{date(row.trial_end)}</td><td className="px-3 py-4">{date(row.current_period_end)}</td><td className="px-3 py-4">{row.payment_provider || "—"}</td><td className="px-3 py-4"><div className="flex justify-end gap-2">{row.status !== "active" && <Button size="sm" variant="outline" onClick={() => void updateStatus(row.id, "active")}><PlayCircle className="mr-1 h-4 w-4" />Ativar</Button>}{row.status === "active" && <Button size="sm" variant="outline" className="border-red-900 text-red-400 hover:bg-red-950" onClick={() => void updateStatus(row.id, "cancelled")}><PauseCircle className="mr-1 h-4 w-4" />Cancelar</Button>}</div></td></tr>)}</tbody></table></div></CardContent></Card>
  </div>;
}

function EmptySection({ icon: Icon, title, text }: { icon: typeof Package; title: string; text: string }) { return <div className="mx-auto max-w-5xl"><Card className="border-slate-800 bg-slate-900"><CardContent className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400"><Icon className="h-7 w-7" /></div><h2 className="mt-5 text-2xl font-bold">{title}</h2><p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">{text}</p></CardContent></Card></div>; }
function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) { return <Card className="border-slate-800 bg-slate-900"><CardContent className="flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400"><Icon className="h-5 w-5" /></div><div><p className="text-xs font-medium text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div></CardContent></Card>; }
function Info({ icon: Icon, title, text }: { icon: typeof Users; title: string; text: string }) { return <div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><Icon className="h-5 w-5 text-blue-400" /><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-400">{text}</p></div>; }
