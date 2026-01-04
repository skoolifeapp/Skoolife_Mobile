import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, BookOpen, Settings } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', icon: Calendar, label: 'Planning' },
    { path: '/progression', icon: TrendingUp, label: 'Progression' },
    { path: '/matieres', icon: BookOpen, label: 'Matières' },
    { path: '/parametres', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 max-w-md mx-auto safe-area-bottom">
      <div className="flex items-center justify-around">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
