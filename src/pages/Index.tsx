import { Home, Search, Heart, User, Bell, ChevronRight, Sparkles, Zap, Gift } from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-card">
        <div>
          <p className="text-muted-foreground text-sm">Bonjour 👋</p>
          <h1 className="text-xl font-bold text-foreground">Marie</h1>
        </div>
        <button className="relative p-3 bg-secondary rounded-full">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pb-24 space-y-6">
        {/* Hero Card */}
        <section className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Nouveau</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Bienvenue sur l'app</h2>
          <p className="text-sm opacity-90 mb-4">Découvrez toutes les fonctionnalités disponibles.</p>
          <button className="bg-primary-foreground text-primary px-5 py-2.5 rounded-full text-sm font-semibold">
            Commencer
          </button>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard icon={<Zap className="w-6 h-6" />} title="Activité" subtitle="12 nouvelles" />
            <ActionCard icon={<Gift className="w-6 h-6" />} title="Offres" subtitle="3 disponibles" />
          </div>
        </section>

        {/* List Items */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4">Récent</h3>
          <div className="space-y-3">
            <ListItem title="Mise à jour profil" time="Il y a 2h" />
            <ListItem title="Nouveau message" time="Il y a 5h" />
            <ListItem title="Confirmation reçue" time="Hier" />
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 max-w-md mx-auto">
        <div className="flex items-center justify-around">
          <NavItem icon={<Home className="w-6 h-6" />} label="Accueil" active />
          <NavItem icon={<Search className="w-6 h-6" />} label="Recherche" />
          <NavItem icon={<Heart className="w-6 h-6" />} label="Favoris" />
          <NavItem icon={<User className="w-6 h-6" />} label="Profil" />
        </div>
      </nav>
    </div>
  );
};

const ActionCard = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
  <div className="bg-card rounded-2xl p-4 shadow-sm border border-border active:scale-95 transition-transform">
    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-primary mb-3">
      {icon}
    </div>
    <h4 className="font-semibold text-foreground">{title}</h4>
    <p className="text-sm text-muted-foreground">{subtitle}</p>
  </div>
);

const ListItem = ({ title, time }: { title: string; time: string }) => (
  <div className="flex items-center justify-between bg-card rounded-xl p-4 shadow-sm border border-border active:bg-secondary transition-colors">
    <div>
      <h4 className="font-medium text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{time}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-muted-foreground" />
  </div>
);

const NavItem = ({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) => (
  <button className={`flex flex-col items-center gap-1 ${active ? "text-primary" : "text-muted-foreground"}`}>
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default Index;
