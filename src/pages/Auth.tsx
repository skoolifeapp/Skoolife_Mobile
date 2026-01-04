import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    const { error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Erreur',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ou mot de passe incorrect'
          : error.message.includes('already registered')
          ? 'Cet email est déjà utilisé'
          : error.message,
        variant: 'destructive',
      });
    } else if (!isLogin) {
      toast({
        title: 'Inscription réussie',
        description: 'Vérifiez votre email pour confirmer votre compte',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto px-6 py-10">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <GraduationCap className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Skoolife</h1>
        <p className="text-muted-foreground text-sm">Votre compagnon scolaire</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary rounded-xl p-1 mb-8">
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
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="absolute right-4 top-1/2 -translate-y-1/2"
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
            <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
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
    </div>
  );
};

export default Auth;
