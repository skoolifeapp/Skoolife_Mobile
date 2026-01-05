import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionState {
  isSubscribed: boolean;
  tier: string | null;
  loading: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    tier: null,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({ isSubscribed: false, tier: null, loading: false });
      return;
    }

    try {
      // Check lifetime_tier in profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('lifetime_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      const tier = profile?.lifetime_tier;
      const isSubscribed = tier === 'Major' || tier === 'Student';

      setState({
        isSubscribed,
        tier,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState({ isSubscribed: false, tier: null, loading: false });
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return { ...state, checkSubscription };
};

export const useSubscriptionGuard = () => {
  const navigate = useNavigate();
  const { isSubscribed, loading, tier } = useSubscription();

  useEffect(() => {
    if (!loading && !isSubscribed) {
      navigate('/pricing', { replace: true });
    }
  }, [loading, isSubscribed, navigate]);

  return { isSubscribed, loading, tier };
};
