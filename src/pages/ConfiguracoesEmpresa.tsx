import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Building2, Mail, Trash2, UserPlus, Shield } from "lucide-react";
import { useEmpresa } from "@/contexts/EmpresaContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Member {
  user_id: string;
  role: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function ConfiguracoesEmpresa() {
  const { user } = useAuth();
  const { activeEmpresa, activeEmpresaId, refresh } = useEmpresa();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const isOwner = activeEmpresa?.role === "owner";

  useEffect(() => {
    if (activeEmpresa) setNome(activeEmpresa.nome);
  }, [activeEmpresa]);

  const load = async () => {
    if (!activeEmpresaId) return;
    setLoading(true);
    const [m, i] = await Promise.all([
      supabase.rpc("list_empresa_members" as never, { _empresa: activeEmpresaId } as never),
      isOwner
        ? supabase.rpc("list_empresa_invites" as never, { _empresa: activeEmpresaId } as never)
        : Promise.resolve({ data: [], error: null } as any),
    ]);
    if (m.error) toast({ title: "Erro ao carregar membros", description: m.error.message, variant: "destructive" });
    else setMembers((m.data as Member[]) ?? []);
    if (!i.error) setInvites((i.data as Invite[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [activeEmpresaId, isOwner]);

  const handleRename = async () => {
    if (!activeEmpresaId || !nome.trim()) return;
    setBusy(true);
    const { error } = await supabase.rpc("rename_empresa" as never, { _empresa: activeEmpresaId, _nome: nome.trim() } as never);
    setBusy(false);
    if (error) return toast({ title: "Erro ao renomear", description: error.message, variant: "destructive" });
    toast({ title: "Empresa renomeada" });
    await refresh();
  };

  const handleInvite = async () => {
    if (!activeEmpresaId || !inviteEmail.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("invite_empresa_member" as never, {
      _empresa: activeEmpresaId,
      _email: inviteEmail.trim(),
      _role: "member",
    } as never);
    setBusy(false);
    if (error) return toast({ title: "Erro ao convidar", description: error.message, variant: "destructive" });
    const status = (data as any)?.status;
    toast({
      title: status === "added" ? "Membro adicionado" : "Convite enviado",
      description: status === "added"
        ? "Usuário já tinha conta e foi adicionado à empresa. O acesso é liberado sob sua assinatura."
        : "O usuário receberá acesso assim que se cadastrar com este e-mail.",
    });
    setInviteEmail("");
    await load();
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeEmpresaId) return;
    const { error } = await supabase.rpc("remove_empresa_member" as never, { _empresa: activeEmpresaId, _user: userId } as never);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Membro removido" });
    await load();
  };

  const handleCancelInvite = async (id: string) => {
    const { error } = await supabase.from("empresa_invites" as never).delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Convite cancelado" });
    await load();
  };

  if (!activeEmpresa) {
    return (
      <PageLayout title="Configurações da Empresa" icon={Building2}>
        <p className="text-muted-foreground">Nenhuma empresa selecionada.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Configurações da Empresa" description={activeEmpresa.nome} icon={Building2}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Dados da empresa</CardTitle>
            <CardDescription>Renomeie a empresa visível para a equipe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} disabled={!isOwner || busy} />
            </div>
            <Button onClick={handleRename} disabled={!isOwner || busy || nome === activeEmpresa.nome} className="w-full">
              Salvar
            </Button>
            {!isOwner && <p className="text-xs text-muted-foreground">Apenas o proprietário pode alterar.</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><UserPlus className="w-4 h-4" /> Convidar membro</CardTitle>
            <CardDescription>
              {isOwner
                ? "Apenas você (proprietário) pode convidar. Os membros convidados terão acesso liberado sob a sua assinatura, sem pagar mensalidade separada."
                : "Somente o proprietário da empresa pode convidar novos membros."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={!isOwner || busy}
                />
              </div>
              <Button onClick={handleInvite} disabled={!isOwner || busy || !inviteEmail.trim()}>
                Convidar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" /> Membros ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : (
              <div className="divide-y">
                {members.map((m) => {
                  const isSelf = m.user_id === user?.id;
                  const isMemberOwner = m.role === "owner";
                  return (
                    <div key={m.user_id} className="py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {[m.first_name, m.last_name].filter(Boolean).join(" ") || m.email}
                          {isSelf && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                      </div>
                      {isMemberOwner ? (
                        <Badge variant="default">Proprietário</Badge>
                      ) : (
                        <>
                          <Badge variant="secondary">Membro</Badge>
                          {isOwner && !isSelf && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {m.email} perderá acesso aos dados desta empresa.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveMember(m.user_id)}>Remover</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {isOwner && invites.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4" /> Convites pendentes ({invites.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {invites.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{inv.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Convidado em {new Date(inv.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <Badge variant="outline">Membro</Badge>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleCancelInvite(inv.id)}>
                      Cancelar
                    </Button>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
