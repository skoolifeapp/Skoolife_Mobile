import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { Flame, Target, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RevisionSession, Subject, Profile } from '@/types/database';
import MobileHeader from '@/components/MobileHeader';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const Progression = () => {
  const { user } = useAuth();

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  // Fetch profile for weekly goal
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user?.id,
  });

  // Fetch completed sessions this week
  const { data: weekSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions-week', user?.id, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revision_sessions')
        .select('*, subject:subjects(*)')
        .eq('user_id', user?.id)
        .eq('status', 'done')
        .gte('date', weekStart)
        .lte('date', weekEnd);
      
      if (error) throw error;
      return (data || []) as RevisionSession[];
    },
    enabled: !!user?.id,
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return (data || []) as Subject[];
    },
    enabled: !!user?.id,
  });

  // Calculate streak
  const { data: streak = 0 } = useQuery({
    queryKey: ['streak', user?.id],
    queryFn: async () => {
      let currentStreak = 0;
      let checkDate = new Date();
      
      while (true) {
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        const { data } = await supabase
          .from('revision_sessions')
          .select('id')
          .eq('user_id', user?.id)
          .eq('status', 'done')
          .eq('date', dateStr)
          .limit(1);
        
        if (data && data.length > 0) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else if (format(checkDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
        
        if (currentStreak > 365) break;
      }
      
      return currentStreak;
    },
    enabled: !!user?.id,
  });

  // Calculate hours per subject
  const subjectStats = useMemo(() => {
    const stats: Record<string, { name: string; color: string; hours: number; target: number }> = {};
    
    subjects.forEach(subject => {
      stats[subject.id] = {
        name: subject.name,
        color: subject.color,
        hours: 0,
        target: subject.target_hours || 10,
      };
    });
    
    weekSessions.forEach(session => {
      if (session.subject_id && stats[session.subject_id]) {
        const [startH, startM] = session.start_time.split(':').map(Number);
        const [endH, endM] = session.end_time.split(':').map(Number);
        const mins = (endH * 60 + endM) - (startH * 60 + startM);
        stats[session.subject_id].hours += mins / 60;
      }
    });
    
    return Object.values(stats).sort((a, b) => b.hours - a.hours);
  }, [subjects, weekSessions]);

  // Total hours this week
  const totalHours = useMemo(() => {
    return weekSessions.reduce((acc, session) => {
      const [startH, startM] = session.start_time.split(':').map(Number);
      const [endH, endM] = session.end_time.split(':').map(Number);
      const mins = (endH * 60 + endM) - (startH * 60 + startM);
      return acc + mins / 60;
    }, 0);
  }, [weekSessions]);

  const weeklyGoal = profile?.weekly_revision_hours || 20;
  const progressPercent = Math.min((totalHours / weeklyGoal) * 100, 100);

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader 
        title="Progression"
        subtitle="Cette semaine"
        showNotification
      />

      <div className="flex-1 px-4 py-4 space-y-4">
        {loadingSessions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Main Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Heures cette semaine</p>
                    <div className="flex items-baseline gap-1">
                      <motion.span
                        className="text-4xl font-bold text-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {totalHours.toFixed(1)}
                      </motion.span>
                      <span className="text-lg text-muted-foreground">/ {weeklyGoal}h</span>
                    </div>
                  </div>
                  
                  {/* Circular Progress */}
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="hsl(var(--primary))"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={251.2}
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * progressPercent) / 100 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-foreground">
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <Progress value={progressPercent} className="h-2" />
              </Card>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{streak}</p>
                      <p className="text-xs text-muted-foreground">jours de suite</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Target className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{weekSessions.length}</p>
                      <p className="text-xs text-muted-foreground">sessions terminées</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Subject Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Répartition par matière
                </h3>
                
                <div className="space-y-4">
                  {subjectStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune matière enregistrée
                    </p>
                  ) : (
                    subjectStats.map((stat, index) => (
                      <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: stat.color }}
                            />
                            <span className="font-medium text-foreground">{stat.name}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {stat.hours.toFixed(1)}h / {stat.target}h
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: stat.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((stat.hours / stat.target) * 100, 100)}%` }}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                          />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Progression;
