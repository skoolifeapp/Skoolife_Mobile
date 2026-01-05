import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Bell, LogOut, ChevronRight, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Profile, UserPreferences } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

const DAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
  { value: 0, label: 'Dim' },
];

const Parametres = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [school, setSchool] = useState('');
  const [level, setLevel] = useState('');
  const [studyDomain, setStudyDomain] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(20);

  // Preferences form state
  const [preferredDays, setPreferredDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [dailyStart, setDailyStart] = useState('09:00');
  const [dailyEnd, setDailyEnd] = useState('18:00');
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(4);
  const [sessionDuration, setSessionDuration] = useState(45);
  const [avoidEarlyMorning, setAvoidEarlyMorning] = useState(true);
  const [avoidLateEvening, setAvoidLateEvening] = useState(true);

  // Fetch profile
  const { data: profile, isLoading: loadingProfile } = useQuery({
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

  // Fetch preferences
  const { data: preferences } = useQuery({
    queryKey: ['preferences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserPreferences | null;
    },
    enabled: !!user?.id,
  });

  // Update form state when data loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setSchool(profile.school || '');
      setLevel(profile.level || '');
      setStudyDomain(profile.study_domain || '');
      setWeeklyHours(profile.weekly_revision_hours || 20);
    }
  }, [profile]);

  useEffect(() => {
    if (preferences) {
      setPreferredDays(preferences.preferred_days_of_week || [1, 2, 3, 4, 5]);
      setDailyStart(preferences.daily_start_time || '09:00');
      setDailyEnd(preferences.daily_end_time || '18:00');
      setMaxHoursPerDay(preferences.max_hours_per_day || 4);
      setSessionDuration(preferences.session_duration_minutes || 45);
      setAvoidEarlyMorning(preferences.avoid_early_morning ?? true);
      setAvoidLateEvening(preferences.avoid_late_evening ?? true);
    }
  }, [preferences]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          first_name: firstName,
          last_name: lastName,
          school,
          level,
          study_domain: studyDomain,
          weekly_revision_hours: weeklyHours,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsProfileOpen(false);
      toast({ title: 'Profil mis à jour' });
    },
    onError: () => {
      toast({ title: 'Erreur', variant: 'destructive' });
    },
  });

  // Save preferences mutation
  const savePrefsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          preferred_days_of_week: preferredDays,
          daily_start_time: dailyStart,
          daily_end_time: dailyEnd,
          max_hours_per_day: maxHoursPerDay,
          session_duration_minutes: sessionDuration,
          avoid_early_morning: avoidEarlyMorning,
          avoid_late_evening: avoidLateEvening,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      setIsPrefsOpen(false);
      toast({ title: 'Préférences mises à jour' });
    },
    onError: () => {
      toast({ title: 'Erreur', variant: 'destructive' });
    },
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const toggleDay = (day: number) => {
    setPreferredDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Header */}
      <div className="bg-card px-4 pt-4 pb-3 safe-area-top">
        <span className="text-sm text-muted-foreground">Gérez votre compte</span>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {loadingProfile ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* User Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <SheetTrigger asChild>
                  <Card className="p-4 cursor-pointer active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-primary-foreground">
                          {(firstName || user?.email?.charAt(0) || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-foreground truncate">
                          {firstName && lastName 
                            ? `${firstName} ${lastName}`
                            : user?.email?.split('@')[0] || 'Utilisateur'
                          }
                        </h2>
                        <p className="text-sm text-muted-foreground truncate">
                          {school && level ? `${school} · ${level}` : user?.email}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </Card>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-auto">
                  <SheetHeader>
                    <SheetTitle>Mon profil</SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="mt-1.5 h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="mt-1.5 h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="school">Établissement</Label>
                      <Input
                        id="school"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="Ex: Université de Paris"
                        className="mt-1.5 h-12"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="level">Niveau</Label>
                        <Input
                          id="level"
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                          placeholder="Ex: L3"
                          className="mt-1.5 h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="studyDomain">Filière</Label>
                        <Input
                          id="studyDomain"
                          value={studyDomain}
                          onChange={(e) => setStudyDomain(e.target.value)}
                          placeholder="Ex: Informatique"
                          className="mt-1.5 h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Objectif hebdomadaire: {weeklyHours}h</Label>
                      <Slider
                        value={[weeklyHours]}
                        onValueChange={([v]) => setWeeklyHours(v)}
                        min={5}
                        max={50}
                        step={1}
                        className="mt-3"
                      />
                    </div>

                    <Button 
                      onClick={() => saveProfileMutation.mutate()} 
                      className="w-full h-12 rounded-xl gap-2"
                      disabled={saveProfileMutation.isPending}
                    >
                      {saveProfileMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Enregistrer
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </motion.div>

            {/* Settings Sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              {/* Preferences */}
              <Sheet open={isPrefsOpen} onOpenChange={setIsPrefsOpen}>
                <SheetTrigger asChild>
                  <Card className="p-4 cursor-pointer active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">Préférences planning</h3>
                        <p className="text-xs text-muted-foreground">Jours, horaires, durée</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Card>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-auto">
                  <SheetHeader>
                    <SheetTitle>Préférences de planning</SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-6 mt-6">
                    <div>
                      <Label>Jours de révision</Label>
                      <div className="flex gap-2 mt-2">
                        {DAYS.map(day => (
                          <motion.button
                            key={day.value}
                            onClick={() => toggleDay(day.value)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                              preferredDays.includes(day.value)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-muted-foreground'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {day.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="dailyStart">Début</Label>
                        <Input
                          id="dailyStart"
                          type="time"
                          value={dailyStart}
                          onChange={(e) => setDailyStart(e.target.value)}
                          className="mt-1.5 h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dailyEnd">Fin</Label>
                        <Input
                          id="dailyEnd"
                          type="time"
                          value={dailyEnd}
                          onChange={(e) => setDailyEnd(e.target.value)}
                          className="mt-1.5 h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Heures max par jour: {maxHoursPerDay}h</Label>
                      <Slider
                        value={[maxHoursPerDay]}
                        onValueChange={([v]) => setMaxHoursPerDay(v)}
                        min={1}
                        max={10}
                        step={1}
                        className="mt-3"
                      />
                    </div>

                    <div>
                      <Label>Durée des sessions: {sessionDuration} min</Label>
                      <Slider
                        value={[sessionDuration]}
                        onValueChange={([v]) => setSessionDuration(v)}
                        min={15}
                        max={120}
                        step={15}
                        className="mt-3"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="avoidEarly">Éviter le matin tôt</Label>
                        <Switch
                          id="avoidEarly"
                          checked={avoidEarlyMorning}
                          onCheckedChange={setAvoidEarlyMorning}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="avoidLate">Éviter le soir tard</Label>
                        <Switch
                          id="avoidLate"
                          checked={avoidLateEvening}
                          onCheckedChange={setAvoidLateEvening}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={() => savePrefsMutation.mutate()} 
                      className="w-full h-12 rounded-xl gap-2"
                      disabled={savePrefsMutation.isPending}
                    >
                      {savePrefsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Enregistrer
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Notifications */}
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">Notifications</h3>
                    <p className="text-xs text-muted-foreground">Rappels de sessions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </Card>
            </motion.div>

            {/* Sign Out Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-4"
            >
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="w-full h-12 rounded-xl gap-2"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </Button>
            </motion.div>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground pt-4">
              Skoolife Mobile v1.0.0
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Parametres;
