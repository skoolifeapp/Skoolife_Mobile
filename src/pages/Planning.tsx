import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Check, X, Clock, Plus, Loader2, Bell } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RevisionSession, CalendarEvent } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Planning = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<RevisionSession | null>(null);
  const [dragDirection, setDragDirection] = useState(0);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Fetch sessions with subject data
  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions', user?.id, dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revision_sessions')
        .select('*, subject:subjects(*)')
        .eq('user_id', user?.id)
        .eq('date', dateStr)
        .order('start_time');
      
      if (error) throw error;
      return (data || []) as RevisionSession[];
    },
    enabled: !!user?.id,
  });

  // Update session status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'done' | 'skipped' }) => {
      const { error } = await supabase
        .from('revision_sessions')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: 'Session mise à jour !' });
    },
  });

  // Delete session
  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('revision_sessions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setSelectedSession(null);
      toast({ title: 'Session supprimée' });
    },
  });

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setDragDirection(-1);
      setSelectedDate(prev => subDays(prev, 1));
    } else if (info.offset.x < -100) {
      setDragDirection(1);
      setSelectedDate(prev => addDays(prev, 1));
    }
  };

  const getDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const mins = (endH * 60 + endM) - (startH * 60 + startM);
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h${minutes > 0 ? minutes : ''}` : `${minutes}min`;
  };

  const isLoading = loadingSessions;
  const hasNoSessions = !isLoading && sessions.length === 0;

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Header */}
      <div className="bg-card px-4 pt-4 pb-3 safe-area-top">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">Planning</span>
          <motion.button
            className="p-2 rounded-full touch-target"
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="w-5 h-5 text-primary" />
          </motion.button>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
        </h1>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <motion.button
          onClick={() => {
            setDragDirection(-1);
            setSelectedDate(prev => subDays(prev, 1));
          }}
          className="p-2 rounded-full touch-target"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </motion.button>

        <motion.button
          onClick={() => setSelectedDate(new Date())}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold"
          whileTap={{ scale: 0.95 }}
        >
          Aujourd'hui
        </motion.button>

        <motion.button
          onClick={() => {
            setDragDirection(1);
            setSelectedDate(prev => addDays(prev, 1));
          }}
          className="p-2 rounded-full touch-target"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </motion.button>
      </div>

      {/* Content */}
      <motion.div
        className="flex-1 px-4 py-4"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={dateStr}
            initial={{ opacity: 0, x: dragDirection * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dragDirection * 50 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {hasNoSessions && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <Clock className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  Aucune session prévue pour ce jour
                </p>
                <Button className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" />
                  Générer un planning
                </Button>
              </div>
            )}

            {sessions.map((session, index) => {
              const isDone = session.status === 'done';
              const isSkipped = session.status === 'skipped';
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`overflow-hidden cursor-pointer active:scale-[0.98] transition-all ${
                      isDone ? 'bg-green-50 dark:bg-green-900/10' : ''
                    } ${isSkipped ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex">
                      <div 
                        className="w-1.5 shrink-0" 
                        style={{ backgroundColor: session.subject?.color || '#FFC107' }}
                      />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isDone && <Check className="w-4 h-4 text-green-500" />}
                              {isSkipped && <X className="w-4 h-4 text-red-500" />}
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold text-foreground uppercase text-sm">
                                {session.subject?.name || 'Session'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {session.start_time} - {session.end_time} · {getDuration(session.start_time, session.end_time)}
                            </p>
                          </div>

                          {session.status === 'planned' && (
                            <div className="flex gap-2">
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatus.mutate({ id: session.id, status: 'done' });
                                }}
                                className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center touch-target"
                                whileTap={{ scale: 0.9 }}
                              >
                                <Check className="w-5 h-5 text-green-600" />
                              </motion.button>
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatus.mutate({ id: session.id, status: 'skipped' });
                                }}
                                className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center touch-target"
                                whileTap={{ scale: 0.9 }}
                              >
                                <X className="w-5 h-5 text-red-600" />
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Session Detail Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedSession?.subject?.color }}
              />
              {selectedSession?.subject?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>
                {selectedSession?.start_time} - {selectedSession?.end_time}
              </span>
            </div>

            {selectedSession?.notes && (
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-xl">
                {selectedSession.notes}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl"
                onClick={() => setSelectedSession(null)}
              >
                Fermer
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 rounded-xl"
                onClick={() => selectedSession && deleteSession.mutate(selectedSession.id)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planning;
