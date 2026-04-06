import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Loader2 } from "lucide-react";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    id: "basico",
    name: "Básico",
    price: "19,90",
    priceNumber: 19.9,
    description: "Ideal para pequenos estabelecimentos",
    icon: Zap,
    features: [
      "Cadastro ilimitado de produtos",
      "Controle de estoque básico",
      "Etiquetas personalizadas",
      "Relatórios simples",
      "Suporte por email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "39,90",
    priceNumber: 39.9,
    description: "Para operações que exigem mais controle",
    icon: Crown,
    popular: true,
    features: [
      "Tudo do plano Básico",
      "Relatórios avançados",
      "Contagem de estoque",
      "Múltiplos responsáveis",
      "Exportação de dados",
      "Suporte prioritário",
    ],
  },
];

export default function Planos() {
  const { isActive, subscription } = useSubscriptionContext();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, planName: string, price: number) => {
    setLoadingPlan(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: planId, planName, price },
      });

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
      setLoadingPlan(null);
    }
  };

  const currentPlan = subscription?.plan;

  return (
    <PageLayout title="Planos" description="Escolha o melhor plano para o seu negócio" icon={Crown} iconClassName="bg-primary/10 text-primary">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = isActive && currentPlan === plan.id;
            const Icon = plan.icon;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col transition-shadow hover:shadow-lg ${
                  plan.popular ? "border-primary shadow-md" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3">
                    Mais popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">R$ {plan.price}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isCurrentPlan || loadingPlan !== null}
                    onClick={() => handleSubscribe(plan.id, plan.name, plan.priceNumber)}
                  >
                    {loadingPlan === plan.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                    ) : isCurrentPlan ? (
                      "Plano atual"
                    ) : (
                      "Assinar agora"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Pagamento seguro via Mercado Pago. Cancele a qualquer momento.
        </p>
      </div>
    </PageLayout>
  );
}
