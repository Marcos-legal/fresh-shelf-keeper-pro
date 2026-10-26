import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, CreditCard, Loader2, ShieldCheck, Users, History, Wallet } from "lucide-react";

const PRICE = 29.9;
const rpc = (fn: string, args?: Record<string, unknown>) => (supabase.rpc as any)(fn, args);

const STATUS_LABEL: Record<string, string> = {
  trialing: "Em teste", active: "Ativa", past_due: "Pagamento pendente", canceled: "Cancelada", expired: "Expirada", suspended: "Suspensa",
};
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "—");
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function useAdminQuery<T>(key: string, fn: string, enabled: boolean) {
  return useQuery<T>({
    queryKey: ["admin", key],
    enabled,
    queryFn: async () => {
      const { data, error } = await rpc(fn);
      if (error) throw new Error(error.message);
      return data as T;
    },
  });
}

function StatusBadge({ s }: { s?: string | null }) {
  if (!s) return <Badge variant="outline">Sem assinatura</Badge>;
  const variant = s === "active" ? "default" : s === "trialing" ? "secondary" : "destructive";
  return <Badge variant={variant as any}>{STATUS_LABEL[s] ?? s}</Badge>;
}

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = useQuery({
    queryKey: ["admin", "is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await rpc("is_current_user_admin");
      if (error) return false;
      return !!data;
    },
  });
  const ok = isAdmin.data === true;
  const overview = useAdminQuery<any>("overview", "admin_overview", ok);
  const users = useAdminQuery<any[]>("users", "admin_list_users", ok);
  const empresas = useAdminQuery<any[]>("empresas", "admin_list_empresas", ok);
  const subs = useAdminQuery<any[]>("subs", "admin_list_subscriptions", ok);
  const audit = useAdminQuery<any[]>("audit", "admin_list_audit", ok);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => { document.title = "Admin · ValiControl"; }, []);

  const filter = <T extends Record<string, any>>(rows?: T[]) =>
    (rows ?? []).filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  const subCounts = (overview.data?.subs ?? {}) as Record<string, number>;
  const mrr = useMemo(() => (subCounts.active ?? 0) * PRICE, [subCounts.active]);

  if (isAdmin.isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!ok) return <Navigate to="/" replace />;

  return (
    <div className="admin-theme min-h-[100dvh] bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <h1 className="text-lg font-bold">Painel Administrativo</h1>
              <p className="text-xs text-muted-foreground">ValiControl SaaS</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm"><Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />Voltar ao sistema</Link></Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Usuários" value={overview.data?.users ?? "—"} icon={Users} />
          <Stat label="Empresas" value={overview.data?.empresas ?? "—"} icon={Building2} />
          <Stat label="Assinaturas ativas" value={subCounts.active ?? 0} icon={CreditCard} />
          <Stat label="Receita mensal (planos ativos)" value={brl(mrr)} icon={Wallet} />
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(subCounts).map(([k, v]) => <Badge key={k} variant="outline">{STATUS_LABEL[k] ?? k}: {v}</Badge>)}
          <Badge variant="outline">Novos usuários (30 dias): {overview.data?.users_30d ?? 0}</Badge>
        </div>

        <Input placeholder="Buscar por e-mail, nome, empresa…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />

        <Tabs defaultValue="subs">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="subs">Assinaturas</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
          </TabsList>

          <TabsContent value="subs">
            <Table head={["E-mail", "Empresa", "Status", "Fim do teste", "Fim do período", "Mercado Pago", ""]}
              rows={filter(subs.data).map((s) => [
                s.email, s.empresa_nome ?? "—", <StatusBadge s={s.effective_status} />, fmtDate(s.trial_end), fmtDate(s.current_period_end),
                s.mp_subscription_id ? "Vinculada" : "—",
                <Button size="sm" variant="outline" onClick={() => setEditing(s)}>Gerenciar</Button>,
              ])} loading={subs.isLoading} />
          </TabsContent>
          <TabsContent value="users">
            <Table head={["E-mail", "Nome", "Cadastro", "Último acesso", "Empresas", "Assinatura"]}
              rows={filter(users.data).map((u) => [
                u.email, [u.first_name, u.last_name].filter(Boolean).join(" ") || "—", fmtDate(u.created_at), fmtDate(u.last_sign_in_at), u.empresas, <StatusBadge s={u.sub_status} />,
              ])} loading={users.isLoading} />
          </TabsContent>
          <TabsContent value="empresas">
            <Table head={["Empresa", "Proprietário", "Membros", "Produtos", "Criada em"]}
              rows={filter(empresas.data).map((e) => [e.nome, e.owner_email ?? "—", e.members, e.products, fmtDate(e.created_at)])} loading={empresas.isLoading} />
          </TabsContent>
          <TabsContent value="audit">
            <Table head={["Data", "Administrador", "Ação", "Motivo", "Status antes → depois"]}
              rows={filter(audit.data).map((a) => [
                new Date(a.created_at).toLocaleString("pt-BR"), a.actor_email, a.action, a.reason ?? "—",
                `${STATUS_LABEL[a.before_data?.status] ?? a.before_data?.status ?? "—"} → ${STATUS_LABEL[a.after_data?.status] ?? a.after_data?.status ?? "—"}`,
              ])} loading={audit.isLoading} empty="Nenhuma alteração administrativa registrada." />
          </TabsContent>
        </Tabs>
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><History className="h-3 w-3" />Receita estimada pelos planos ativos (R$ 29,90/mês). Pagamentos são confirmados apenas pelo webhook do Mercado Pago.</p>
      </main>

      <EditSubscription sub={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin"] }); }} />
    </div>
  );
}

function Table({ head, rows, loading, empty = "Nenhum registro." }: { head: string[]; rows: any[][]; loading?: boolean; empty?: string }) {
  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (!rows.length) return <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className="px-3 py-2 align-middle">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function EditSubscription({ sub, onClose, onSaved }: { sub: any | null; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState<string>("keep");
  const [trialDays, setTrialDays] = useState("0");
  const [periodDays, setPeriodDays] = useState("0");
  const [reason, setReason] = useState("");
  useEffect(() => { setStatus("keep"); setTrialDays("0"); setPeriodDays("0"); setReason(""); }, [sub?.id]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await rpc("admin_update_subscription", {
        _id: sub.id, _status: status === "keep" ? null : status,
        _trial_days: Number(trialDays) || 0, _period_days: Number(periodDays) || 0, _reason: reason,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { toast({ title: "Assinatura atualizada", description: "Alteração registrada na auditoria." }); onSaved(); },
    onError: (e: Error) => toast({ title: "Erro ao atualizar", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={!!sub} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="admin-theme">
        <DialogHeader><DialogTitle>Gerenciar assinatura</DialogTitle></DialogHeader>
        {sub && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{sub.email} · atual: {STATUS_LABEL[sub.effective_status] ?? sub.effective_status}</p>
            <div className="space-y-1.5">
              <Label>Novo status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Manter</SelectItem>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Estender teste (dias)</Label><Input type="number" min={0} max={365} value={trialDays} onChange={(e) => setTrialDays(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Liberar período (dias)</Label><Input type="number" min={0} max={366} value={periodDays} onChange={(e) => setPeriodDays(e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label>Motivo (obrigatório)</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: cortesia de 7 dias combinada com o cliente" /></div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={save.isPending || reason.trim().length < 3} onClick={() => save.mutate()}>
            {save.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
