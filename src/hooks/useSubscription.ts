import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionData {
  status: string;
  trial_start: string;
  trial_end: string;
  plan: string;
  payment_provider: string | null;
  payment_id: string | null;
  current_period_end: string | null;
  mp_subscription_id: string | null;
}

export interface SubscriptionState {
  subscription: SubscriptionData | null;
  loading: boolean;
  isTrialing: boolean;
  isActive: boolean;
  isExpired: boolean;
  isDefaulting: boolean;
  isCancelled: boolean;
  daysRemaining: number;
  canEdit: boolean;
  currentPeriodEnd: Date | null;
  refetch: () => void;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('subscriptions')
      .select('status, trial_start, trial_end, plan, payment_provider, payment_id, current_period_end, mp_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
    }

    setSubscription(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const now = new Date();
  const trialEnd = subscription?.trial_end ? new Date(subscription.trial_end) : null;
  const daysRemaining = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const currentPeriodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;

  const isTrialing = subscription?.status === 'trialing' && daysRemaining > 0;
  const isActive = subscription?.status === 'active';
  const isDefaulting = subscription?.status === 'defaulting';
  const isCancelled = subscription?.status === 'cancelled';

  // Cancelled users still have access until current_period_end
  const cancelledWithAccess = isCancelled && currentPeriodEnd && currentPeriodEnd > now;

  const isExpired = !isTrialing && !isActive && !cancelledWithAccess;
  const canEdit = isTrialing || isActive || !!cancelledWithAccess;

  return {
    subscription,
    loading,
    isTrialing,
    isActive,
    isExpired,
    isDefaulting,
    isCancelled,
    daysRemaining,
    canEdit,
    currentPeriodEnd,
    refetch: fetchSubscription,
  };
}
