import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, CalendarDays, CreditCard, AlertTriangle, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  trialing: { label: "Teste grátis", variant: "secondary" },
  active: { label: "Ativo", variant: "default" },
  defaulting: { label: "Inadimplente", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "outline" },
};

export default function MinhaAssinatura() {
  const { subscription, isTrialing, isActive, isDefaulting, isCancelled, daysRemaining, currentPeriodEnd, loading: subLoading, refetch } = useSubscriptionContext();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {});
      if (error) throw error;

      toast({
        title: "Assinatura cancelada",
        description: data?.access_until
          ? `Você ainda terá acesso até ${format(new Date(data.access_until), "dd/MM/yyyy", { locale: ptBR })}.`
          : "Sua assinatura foi cancelada.",
      });
      refetch();
    } catch (err: any) {
      console.error("Cancel error:", err);
      toast({
        title: "Erro ao cancelar",
        description: err.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const status = subscription?.status || "trialing";
  const statusInfo = statusLabels[status] || statusLabels.trialing;

  return (
    <PageLayout title="Minha Assinatura" description="Gerencie sua assinatura" icon={CreditCard} iconClassName="bg-primary/10 text-primary">
      <div className="max-w-lg mx-auto space-y-4">
        {isDefaulting && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
              <div>
                <p className="font-semibold text-destructive">Assinatura pendente</p>
                <p className="text-sm text-destructive/80">
                  Seu pagamento falhou. Atualize seus dados de pagamento para manter o acesso.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                ValiControl
              </CardTitle>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {isTrialing && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Teste grátis</p>
                    <p className="text-xs text-muted-foreground">
                      {daysRemaining} {daysRemaining === 1 ? "dia restante" : "dias restantes"}
                    </p>
                  </div>
                </div>
              )}

              {isActive && currentPeriodEnd && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Próxima cobrança</p>
                    <p className="text-xs text-muted-foreground">
                      {format(currentPeriodEnd, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}

              {isCancelled && currentPeriodEnd && new Date(currentPeriodEnd) > new Date() && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Acesso até</p>
                    <p className="text-xs text-muted-foreground">
                      {format(currentPeriodEnd, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Valor</p>
                  <p className="text-xs text-muted-foreground">R$ 29,90/mês</p>
                </div>
              </div>
            </div>

            {(isActive || isTrialing) && subscription?.mp_subscription_id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5">
                    Cancelar assinatura
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ao cancelar, você manterá o acesso até o fim do período já pago. Após isso, sua conta será limitada a apenas visualização.
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

            {(isDefaulting || (isCancelled && (!currentPeriodEnd || new Date(currentPeriodEnd) <= new Date()))) && (
              <Button className="w-full" onClick={() => window.location.href = "/planos"}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Reativar assinatura
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
