import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type CheckoutStatus = 'loading' | 'success' | 'error';

const PostCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<CheckoutStatus>('loading');

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const success = searchParams.get('success');

      if (success === 'true' && sessionId && user) {
        try {
          // Update profiles table with lifetime_tier
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              lifetime_tier: 'Major',
            });

          if (error) throw error;

          setStatus('success');
          
          // Redirect after delay
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } catch (error) {
          console.error('Error updating subscription:', error);
          setStatus('error');
        }
      } else if (success === 'false' || searchParams.get('canceled') === 'true') {
        setStatus('error');
      } else {
        // No params, just show loading then redirect
        setTimeout(() => {
          navigate('/pricing', { replace: true });
        }, 1000);
      }
    };

    if (user) {
      verifyPayment();
    }
  }, [searchParams, user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 safe-area-top safe-area-bottom">
      <Card className="w-full max-w-sm p-8 text-center">
        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-foreground font-medium">Vérification du paiement...</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Paiement réussi !</h2>
              <p className="text-muted-foreground text-sm">
                Bienvenue dans Skoolife Major
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Redirection en cours...</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Paiement échoué</h2>
              <p className="text-muted-foreground text-sm">
                Le paiement n'a pas pu être effectué
              </p>
            </div>
            <Button
              onClick={() => navigate('/pricing')}
              className="w-full mt-2"
            >
              Réessayer
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default PostCheckout;
