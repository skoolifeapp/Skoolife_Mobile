import { TrendingUp, Award, Target, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Progression = () => {
  const stats = [
    { icon: Flame, label: 'Série', value: '7 jours', color: 'text-orange-500' },
    { icon: Target, label: 'Objectifs', value: '12/15', color: 'text-blue-500' },
    { icon: Award, label: 'Badges', value: '8', color: 'text-yellow-500' },
  ];

  const subjects = [
    { name: 'Mathématiques', progress: 78, grade: '15.2/20' },
    { name: 'Physique-Chimie', progress: 65, grade: '13.5/20' },
    { name: 'Histoire-Géo', progress: 82, grade: '16.0/20' },
    { name: 'Français', progress: 70, grade: '14.2/20' },
  ];

  return (
    <div className="flex-1 px-5 pb-24 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Progression</h1>
        <p className="text-muted-foreground text-sm">Suivez vos performances</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center"
          >
            <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6" />
          <span className="font-semibold">Moyenne générale</span>
        </div>
        <div className="text-4xl font-bold mb-2">14.7/20</div>
        <p className="text-sm opacity-90">+0.5 pts depuis le mois dernier</p>
      </div>

      {/* Subjects Progress */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Par matière</h2>
        <div className="space-y-4">
          {subjects.map((subject) => (
            <div
              key={subject.name}
              className="bg-card rounded-xl p-4 shadow-sm border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">{subject.name}</span>
                <span className="text-sm text-primary font-semibold">{subject.grade}</span>
              </div>
              <Progress value={subject.progress} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progression;
