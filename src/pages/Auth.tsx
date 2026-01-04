import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type AuthStep = 'auth' | 'onboarding';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<AuthStep>('auth');
  
  // Auth form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Onboarding form
  const [school, setSchool] = useState('');
  const [level, setLevel] = useState('');
  const [studyDomain, setStudyDomain] = useState('');
  const [examPeriod, setExamPeriod] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div 
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (user && step === 'auth') {
    return <Navigate to="/" replace />;
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        variant: 'destructive',
      });
      return;
    }

    if (!isLogin && !firstName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer votre prénom',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      setIsSubmitting(false);
      if (error) {
        toast({
          title: 'Erreur',
          description: error.message === 'Invalid login credentials' 
            ? 'Email ou mot de passe incorrect'
            : error.message,
          variant: 'destructive',
        });
      }
    } else {
      const { error } = await signUp(email, password);
      setIsSubmitting(false);
      if (error) {
        toast({
          title: 'Erreur',
          description: error.message.includes('already registered')
            ? 'Cet email est déjà utilisé'
            : error.message,
          variant: 'destructive',
        });
      } else {
        // Save first name and go to onboarding
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser) {
          await supabase.from('profiles').upsert({
            id: newUser.id,
            first_name: firstName,
            email: email,
          });
        }
        setStep('onboarding');
      }
    }
  };

  const handleOnboardingSubmit = async () => {
    setIsSubmitting(true);
    
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await supabase.from('profiles').upsert({
        id: currentUser.id,
        school,
        level,
        study_domain: studyDomain,
        main_exam_period: examPeriod,
      });
    }
    
    setIsSubmitting(false);
    navigate('/');
  };

  const skipOnboarding = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto px-6 py-8 safe-area-top safe-area-bottom">
      <AnimatePresence mode="wait">
        {step === 'auth' ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col"
          >
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <motion.div 
                className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <GraduationCap className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground">Skoolife</h1>
              <p className="text-muted-foreground text-sm">Votre compagnon de révision</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-secondary rounded-xl p-1 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                  isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                  !isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Inscription
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 flex-1">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-12 h-14 rounded-xl bg-secondary border-0"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 rounded-xl bg-secondary border-0"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 rounded-xl bg-secondary border-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 touch-target"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isLogin ? (
                  'Se connecter'
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>

            {isLogin && (
              <button className="mt-4 text-sm text-primary font-medium text-center">
                Mot de passe oublié ?
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                Bienvenue {firstName} ! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Parlez-nous un peu de vous pour personnaliser votre expérience
              </p>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <Label htmlFor="school">Établissement</Label>
                <Input
                  id="school"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Ex: Université de Paris"
                  className="mt-1.5 h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="level">Niveau</Label>
                  <Input
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="Ex: L3, M1..."
                    className="mt-1.5 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="studyDomain">Filière</Label>
                  <Input
                    id="studyDomain"
                    value={studyDomain}
                    onChange={(e) => setStudyDomain(e.target.value)}
                    placeholder="Ex: Droit, Info..."
                    className="mt-1.5 h-12"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="examPeriod">Période d'examens</Label>
                <Input
                  id="examPeriod"
                  value={examPeriod}
                  onChange={(e) => setExamPeriod(e.target.value)}
                  placeholder="Ex: Mai-Juin 2026"
                  className="mt-1.5 h-12"
                />
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={handleOnboardingSubmit} 
                className="w-full h-14 rounded-xl text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Commencer'
                )}
              </Button>
              
              <button 
                onClick={skipOnboarding}
                className="w-full py-3 text-sm text-muted-foreground font-medium"
              >
                Passer cette étape
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
