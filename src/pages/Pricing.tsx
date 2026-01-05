import { useState } from 'react';
import { Check, Loader2, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const PLANS = [
  {
    id: 'student',
    name: 'Student',
    price: '2,99',
    priceId: 'price_1Sf3tHC3rnIsVpuj5m5zh0cG',
    icon: Sparkles,
    popular: false,
    features: [
      'Planning de révision personnalisé',
      'Suivi de progression',
      'Gestion illimitée des matières',
      'Statistiques détaillées',
    ],
  },
  {
    id: 'major',
    name: 'Major',
    price: '4,99',
    priceId: 'price_1Sf3tdC3rnIsVpuj9TVbB47r',
    icon: Crown,
    popular: true,
    features: [
      'Tout le plan Student',
      'Sessions de révision collaboratives',
      'Génération IA du planning',
      'Export calendrier',
      'Support prioritaire',
    ],
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour souscrire',
        variant: 'destructive',
      });
      return;
    }

    setLoadingPlan(planId);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { price_id: priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du paiement',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 safe-area-top safe-area-bottom">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Choisissez votre formule
          </h1>
          <p className="text-muted-foreground">
            Commencez avec 7 jours d'essai gratuit
          </p>
        </motion.div>

        {/* Plans */}
        <div className="space-y-4">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative overflow-hidden p-6 ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-lg' 
                    : 'border border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-xl">
                    Populaire
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${
                    plan.popular 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-foreground'
                  }`}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">{plan.price}€</span>
                      <span className="text-muted-foreground text-sm">/mois</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  disabled={loadingPlan !== null}
                  className={`w-full h-12 rounded-xl font-semibold ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Commencer l'essai gratuit"
                  )}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Annulez à tout moment. Pas de frais cachés.
        </motion.p>
      </div>
    </div>
  );
};

export default Pricing;
