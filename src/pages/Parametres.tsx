import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Moon, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const Parametres = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const menuItems = [
    { icon: User, label: 'Mon profil', description: 'Modifier mes informations' },
    { icon: Bell, label: 'Notifications', description: 'Gérer les alertes', hasToggle: true },
    { icon: Moon, label: 'Mode sombre', description: 'Apparence de l\'app', hasToggle: true },
    { icon: Shield, label: 'Confidentialité', description: 'Paramètres de sécurité' },
    { icon: HelpCircle, label: 'Aide', description: 'Centre d\'assistance' },
  ];

  return (
    <div className="flex-1 px-5 pb-24 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground text-sm">Gérez votre compte</p>
      </div>

      {/* User Card */}
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-border flex items-center gap-4">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-foreground">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">
            {user?.email?.split('@')[0] || 'Utilisateur'}
          </h2>
          <p className="text-sm text-muted-foreground">{user?.email || 'email@example.com'}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map(({ icon: Icon, label, description, hasToggle }) => (
          <div
            key={label}
            className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-sm border border-border"
          >
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{label}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            {hasToggle ? (
              <Switch />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-3 bg-destructive/10 text-destructive rounded-xl p-4 font-medium"
      >
        <LogOut className="w-5 h-5" />
        <span>Se déconnecter</span>
      </button>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground">
        Skoolife Mobile v1.0.0
      </p>
    </div>
  );
};

export default Parametres;
