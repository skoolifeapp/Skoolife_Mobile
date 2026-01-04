import { ReactNode } from 'react';
import { Bell, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  showNotification?: boolean;
}

const MobileHeader = ({ 
  title, 
  subtitle, 
  showBack = false, 
  rightAction,
  showNotification = false 
}: MobileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 safe-area-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full touch-target"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </motion.button>
          )}
          <div>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>
        </div>
        
        {rightAction || (showNotification && (
          <motion.button 
            className="relative p-3 bg-secondary rounded-full touch-target"
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full" />
          </motion.button>
        ))}
      </div>
    </header>
  );
};

export default MobileHeader;
