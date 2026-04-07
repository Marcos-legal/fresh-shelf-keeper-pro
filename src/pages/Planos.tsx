import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Loader2 } from "lucide-react";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Planos() {
  const { isActive, isCancelled, subscription } = useSubscriptionContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isSubscribed = isActive || (isCancelled && subscription?.mp_subscription_id);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {});

      if (error) throw error;

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("URL de pagamento não retornada");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({
        title: "Erro ao iniciar pagamento",
        description: err.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Cadastro ilimitado de produtos",
    "Controle de estoque completo",
    "Etiquetas personalizadas",
    "Relatórios avançados",
    "Contagem de estoque",
    "Múltiplos responsáveis",
    "Exportação de dados",
    "Suporte prioritário",
  ];

  return (
    <PageLayout title="Plano" description="Comece com 7 dias grátis" icon={Crown} iconClassName="bg-primary/10 text-primary">
      <div className="max-w-md mx-auto">
        <Card className="relative flex flex-col border-primary shadow-md">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3">
            7 dias grátis
          </Badge>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">ValiControl</CardTitle>
            <CardDescription>Acesso completo a todas as funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="text-center flex-1">
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">R$ 29,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <ul className="space-y-3 text-left">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              disabled={!!isSubscribed || loading}
              onClick={handleSubscribe}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
              ) : isSubscribed ? (
                "Você já é assinante"
              ) : (
                "Começar teste grátis"
              )}
            </Button>
            {isSubscribed && (
              <Button variant="outline" className="w-full" onClick={() => navigate("/minha-assinatura")}>
                Ver minha assinatura
              </Button>
            )}
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Pagamento seguro via Mercado Pago. Cancele a qualquer momento.
          <br />
          Após os 7 dias grátis, a cobrança é automática.
        </p>
      </div>
    </PageLayout>
  );
}
