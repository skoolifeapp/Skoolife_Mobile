import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, BarChart3, GraduationCap, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', icon: CalendarDays, label: 'Planning' },
    { path: '/progression', icon: BarChart3, label: 'Progression' },
    { path: '/matieres', icon: GraduationCap, label: 'Matières' },
    { path: '/parametres', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 max-w-md mx-auto safe-area-bottom z-50">
      <div className="flex items-center justify-around">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl touch-target transition-colors ${
                isActive 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-2xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className="w-6 h-6 relative z-10" />
              <span className="text-xs font-medium relative z-10">{label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
