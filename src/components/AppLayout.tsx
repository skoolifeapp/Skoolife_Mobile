import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from './BottomNav';
import { Bell } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-card border-b border-border">
        <div>
          <p className="text-muted-foreground text-sm">Bonjour 👋</p>
          <h1 className="text-xl font-bold text-foreground">
            {user.email?.split('@')[0] || 'Élève'}
          </h1>
        </div>
        <button className="relative p-3 bg-secondary rounded-full">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 pt-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
