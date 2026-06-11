import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown, CalendarDays, CreditCard, AlertTriangle, Loader2, CheckCircle2,
  Zap, Bell, Users, BarChart3, Printer, QrCode, ArrowRight
} from "lucide-react";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  trialing: { label: "Teste grátis", variant: "secondary" },
  active: { label: "Ativo", variant: "default" },
  defaulting: { label: "Pagamento pendente", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "outline" },
};

const beneficios = [
  { icon: Zap, text: "Produtos e validades ilimitados" },
  { icon: Bell, text: "Alertas de vencimento automáticos" },
  { icon: Printer, text: "Etiquetas térmicas (57mm e 80mm)" },
  { icon: QrCode, text: "Leitor de QR para baixa rápida" },
  { icon: BarChart3, text: "Relatórios de desperdício e estoque" },
  { icon: Users, text: "Múltiplos usuários por empresa" },
];

export default function MinhaAssinatura() {
  const navigate = useNavigate();
  const {
    subscription, isTrialing, isActive, isDefaulting, isCancelled,
    daysRemaining, currentPeriodEnd, refetch,
  } = useSubscriptionContext();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {});
      if (error) throw error;
      toast({
        title: "Assinatura cancelada",
        description: data?.access_until
          ? `Acesso mantido até ${format(new Date(data.access_until), "dd/MM/yyyy", { locale: ptBR })}.`
          : "Sua assinatura foi cancelada.",
      });
      refetch();
    } catch (err: any) {
      toast({ title: "Erro ao cancelar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };

  const status = subscription?.status || "trialing";
  const statusInfo = statusLabels[status] || statusLabels.trialing;
  const trialExpired = isCancelled && (!currentPeriodEnd || new Date(currentPeriodEnd) <= new Date());

  return (
    <PageLayout
      title="Minha Assinatura"
      description="Gerencie seu plano e pagamentos"
      icon={CreditCard}
      iconClassName="bg-primary/10 text-primary"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Alerta pendente */}
        {isDefaulting && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="flex items-start gap-3 py-4">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-destructive text-sm">Pagamento pendente</p>
                <p className="text-sm text-destructive/80">Atualize seus dados de pagamento para manter o acesso completo.</p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => navigate("/planos")}>Resolver</Button>
            </CardContent>
          </Card>
        )}

        {/* Hero card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold tracking-tight">ValiControl Pro</h2>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-2xl font-bold text-foreground">R$ 29,90</span>
                    <span className="ml-1">/mês</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Status detail */}
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {isTrialing && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Teste grátis</p>
                    <p className="text-sm font-semibold">
                      {daysRemaining} {daysRemaining === 1 ? "dia restante" : "dias restantes"}
                    </p>
                  </div>
                </div>
              )}
              {isActive && currentPeriodEnd && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Próxima cobrança</p>
                    <p className="text-sm font-semibold">{format(currentPeriodEnd, "dd 'de' MMMM", { locale: ptBR })}</p>
                  </div>
                </div>
              )}
              {isCancelled && currentPeriodEnd && new Date(currentPeriodEnd) > new Date() && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border">
                  <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Acesso até</p>
                    <p className="text-sm font-semibold">{format(currentPeriodEnd, "dd 'de' MMMM", { locale: ptBR })}</p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA contextual */}
            <div className="mt-6 flex flex-wrap gap-2">
              {isTrialing && (
                <Button size="lg" className="flex-1 sm:flex-none" onClick={() => navigate("/planos")}>
                  Assinar agora <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {(isDefaulting || trialExpired) && (
                <Button size="lg" className="flex-1 sm:flex-none" onClick={() => navigate("/planos")}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Reativar assinatura
                </Button>
              )}
              {isActive && subscription?.mp_subscription_id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="lg" className="text-destructive border-destructive/30 hover:bg-destructive/5">
                      Cancelar assinatura
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você manterá o acesso até o fim do período já pago. Depois disso, a conta será limitada a apenas visualização.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Manter assinatura</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={cancelling}
                      >
                        {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar cancelamento"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Benefícios */}
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Tudo incluído no plano</h3>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {beneficios.map((b) => (
                <div key={b.text} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">{b.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histórico */}
        {subscription && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detalhes da assinatura</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              {subscription.mp_subscription_id && (
                <div className="flex justify-between">
                  <span>ID Mercado Pago</span>
                  <span className="text-foreground font-mono text-xs truncate max-w-[60%]">{subscription.mp_subscription_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Status atual</span>
                <span className="text-foreground font-medium">{statusInfo.label}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
