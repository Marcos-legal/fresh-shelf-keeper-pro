import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TrialBanner() {
  const { isTrialing, isExpired, daysRemaining, loading } = useSubscriptionContext();

  if (loading) return null;

  if (isTrialing) {
    return (
      <Alert className="border-primary/30 bg-primary/5 mx-4 mt-4">
        <Clock className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-semibold">
          Período de teste gratuito
        </AlertTitle>
        <AlertDescription className="text-primary/80">
          Você tem <strong>{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</strong> restantes no período de teste.
        </AlertDescription>
      </Alert>
    );
  }

  if (isExpired) {
    return (
      <Alert className="border-destructive/30 bg-destructive/5 mx-4 mt-4">
        <Lock className="h-4 w-4 text-destructive" />
        <AlertTitle className="text-destructive font-semibold">
          Período de teste expirado
        </AlertTitle>
        <AlertDescription className="text-destructive/80 space-y-2">
          <p>Seu período de teste expirou. Você pode visualizar os dados, mas para criar ou editar é necessário assinar um plano.</p>
          <Button size="sm" className="mt-2">
            Assinar agora
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
