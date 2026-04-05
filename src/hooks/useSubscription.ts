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
}

export interface SubscriptionState {
  subscription: SubscriptionData | null;
  loading: boolean;
  isTrialing: boolean;
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  canEdit: boolean;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('subscriptions')
        .select('status, trial_start, trial_end, plan, payment_provider, payment_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      }

      setSubscription(data);
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const now = new Date();
  const trialEnd = subscription?.trial_end ? new Date(subscription.trial_end) : null;
  const daysRemaining = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isTrialing = subscription?.status === 'trialing' && daysRemaining > 0;
  const isActive = subscription?.status === 'active';
  const isExpired = !isTrialing && !isActive;
  const canEdit = isTrialing || isActive;

  return {
    subscription,
    loading,
    isTrialing,
    isActive,
    isExpired,
    daysRemaining,
    canEdit,
  };
}
