import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function TrialBanner() {
  const { isTrialing, isExpired, isDefaulting, daysRemaining, loading } = useSubscriptionContext();
  const navigate = useNavigate();

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

  if (isDefaulting) {
    return (
      <Alert className="border-destructive/30 bg-destructive/5 mx-4 mt-4">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertTitle className="text-destructive font-semibold">
          Assinatura pendente
        </AlertTitle>
        <AlertDescription className="text-destructive/80 space-y-2">
          <p>Seu pagamento falhou. Atualize seus dados para manter o acesso.</p>
          <Button size="sm" className="mt-2" onClick={() => navigate('/planos')}>
            Regularizar pagamento
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isExpired) {
    return (
      <Alert className="border-destructive/30 bg-destructive/5 mx-4 mt-4">
        <Lock className="h-4 w-4 text-destructive" />
        <AlertTitle className="text-destructive font-semibold">
          Acesso bloqueado
        </AlertTitle>
        <AlertDescription className="text-destructive/80 space-y-2">
          <p>Sua assinatura expirou. Assine um plano para continuar usando o sistema.</p>
          <Button size="sm" className="mt-2" onClick={() => navigate('/planos')}>
            Assinar agora
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
