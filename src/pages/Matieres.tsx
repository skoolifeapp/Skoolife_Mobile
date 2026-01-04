import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Clock, Calendar, Award, Edit2, Trash2, Archive, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Subject } from '@/types/database';
import MobileHeader from '@/components/MobileHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

const COLORS = [
  '#FFC107', '#FF5722', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FF9800', '#795548', '#607D8B',
];

const Matieres = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [examDate, setExamDate] = useState('');
  const [examWeight, setExamWeight] = useState('');
  const [targetHours, setTargetHours] = useState('');

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('exam_date', { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      return (data || []) as Subject[];
    },
    enabled: !!user?.id,
  });

  const { data: hoursMap = {} } = useQuery({
    queryKey: ['subject-hours', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revision_sessions')
        .select('subject_id, start_time, end_time')
        .eq('user_id', user?.id)
        .eq('status', 'done');
      
      if (error) throw error;
      
      const map: Record<string, number> = {};
      data?.forEach(session => {
        if (!session.subject_id) return;
        const [startH, startM] = session.start_time.split(':').map(Number);
        const [endH, endM] = session.end_time.split(':').map(Number);
        const mins = (endH * 60 + endM) - (startH * 60 + startM);
        map[session.subject_id] = (map[session.subject_id] || 0) + mins / 60;
      });
      return map;
    },
    enabled: !!user?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Subject>) => {
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update(data)
          .eq('id', editingSubject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert({ ...data, user_id: user?.id, status: 'active' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      resetForm();
      setIsSheetOpen(false);
      toast({ title: editingSubject ? 'Matière modifiée' : 'Matière ajoutée' });
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subjects')
        .update({ status: 'archived' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Matière archivée' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({ title: 'Matière supprimée' });
    },
  });

  const resetForm = () => {
    setName('');
    setColor(COLORS[0]);
    setExamDate('');
    setExamWeight('');
    setTargetHours('');
    setEditingSubject(null);
  };

  const openEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setColor(subject.color);
    setExamDate(subject.exam_date || '');
    setExamWeight(subject.exam_weight?.toString() || '');
    setTargetHours(subject.target_hours?.toString() || '');
    setIsSheetOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    saveMutation.mutate({
      name: name.trim(),
      color,
      exam_date: examDate || null,
      exam_weight: examWeight ? Number(examWeight) : null,
      target_hours: targetHours ? Number(targetHours) : null,
    });
  };

  const getDaysUntilExam = (examDate: string | null) => {
    if (!examDate) return null;
    const days = differenceInDays(parseISO(examDate), new Date());
    return days >= 0 ? days : null;
  };

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader 
        title="Matières"
        subtitle={`${subjects.length} matière${subjects.length > 1 ? 's' : ''}`}
        rightAction={
          <Sheet open={isSheetOpen} onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) resetForm();
          }}>
            <SheetTrigger asChild>
              <motion.button
                className="p-3 bg-primary rounded-full touch-target"
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="w-5 h-5 text-primary-foreground" />
              </motion.button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-auto">
              <SheetHeader>
                <SheetTitle>
                  {editingSubject ? 'Modifier la matière' : 'Nouvelle matière'}
                </SheetTitle>
              </SheetHeader>
              
              <div className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="name">Nom de la matière</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Mathématiques"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Couleur</Label>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {COLORS.map((c) => (
                      <motion.button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full touch-target ${
                          color === c ? 'ring-2 ring-offset-2 ring-foreground' : ''
                        }`}
                        style={{ backgroundColor: c }}
                        whileTap={{ scale: 0.9 }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="examDate">Date d'examen</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="examWeight">Coefficient</Label>
                    <Input
                      id="examWeight"
                      type="number"
                      value={examWeight}
                      onChange={(e) => setExamWeight(e.target.value)}
                      placeholder="Ex: 3"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetHours">Objectif (heures)</Label>
                    <Input
                      id="targetHours"
                      type="number"
                      value={targetHours}
                      onChange={(e) => setTargetHours(e.target.value)}
                      placeholder="Ex: 20"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full mt-4"
                  disabled={!name.trim() || saveMutation.isPending}
                >
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingSubject ? 'Enregistrer' : 'Ajouter'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="flex-1 px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <Award className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center">
              Aucune matière pour l'instant
            </p>
            <Button onClick={() => setIsSheetOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter une matière
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {subjects.map((subject, index) => {
                const daysUntil = getDaysUntilExam(subject.exam_date);
                const hours = hoursMap[subject.id] || 0;
                const target = subject.target_hours || 0;
                const progress = target > 0 ? Math.min((hours / target) * 100, 100) : 0;

                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden">
                      <div 
                        className="h-2" 
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {subject.name}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                              {subject.exam_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {format(parseISO(subject.exam_date), 'd MMM', { locale: fr })}
                                  </span>
                                </div>
                              )}
                              
                              {subject.exam_weight && (
                                <div className="flex items-center gap-1">
                                  <Award className="w-4 h-4" />
                                  <span>Coef {subject.exam_weight}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{hours.toFixed(1)}h{target > 0 ? ` / ${target}h` : ''}</span>
                              </div>
                            </div>

                            {target > 0 && (
                              <div className="mt-3">
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: subject.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {daysUntil !== null && (
                            <div className="px-3 py-1.5 bg-primary/10 rounded-full">
                              <span className="text-sm font-semibold text-primary">
                                J-{daysUntil}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 gap-1.5"
                            onClick={() => openEdit(subject)}
                          >
                            <Edit2 className="w-4 h-4" />
                            Modifier
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 gap-1.5"
                            onClick={() => archiveMutation.mutate(subject.id)}
                          >
                            <Archive className="w-4 h-4" />
                            Archiver
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1.5 text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(subject.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matieres;
