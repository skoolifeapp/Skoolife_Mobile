import { BookOpen, ChevronRight, Plus } from 'lucide-react';

const Matieres = () => {
  const subjects = [
    { id: 1, name: 'Mathématiques', teacher: 'M. Dupont', lessons: 24, color: 'bg-blue-500' },
    { id: 2, name: 'Physique-Chimie', teacher: 'Mme Martin', lessons: 18, color: 'bg-green-500' },
    { id: 3, name: 'Histoire-Géographie', teacher: 'M. Bernard', lessons: 20, color: 'bg-purple-500' },
    { id: 4, name: 'Français', teacher: 'Mme Petit', lessons: 22, color: 'bg-pink-500' },
    { id: 5, name: 'Anglais', teacher: 'M. Wilson', lessons: 16, color: 'bg-orange-500' },
    { id: 6, name: 'SVT', teacher: 'Mme Roux', lessons: 14, color: 'bg-teal-500' },
  ];

  return (
    <div className="flex-1 px-5 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matières</h1>
          <p className="text-muted-foreground text-sm">{subjects.length} matières</p>
        </div>
        <button className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
          <Plus className="w-6 h-6 text-primary-foreground" />
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="space-y-3">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="flex items-center gap-4 bg-card rounded-2xl p-4 shadow-sm border border-border active:scale-[0.98] transition-transform"
          >
            <div
              className={`w-12 h-12 ${subject.color} rounded-xl flex items-center justify-center`}
            >
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{subject.name}</h3>
              <p className="text-sm text-muted-foreground">{subject.teacher}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{subject.lessons}</p>
              <p className="text-xs text-muted-foreground">cours</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        ))}
      </div>

      {/* Add Subject Hint */}
      <button className="w-full bg-secondary/50 rounded-2xl p-6 border-2 border-dashed border-border flex flex-col items-center gap-2">
        <Plus className="w-8 h-8 text-muted-foreground" />
        <span className="text-muted-foreground text-sm font-medium">Ajouter une matière</span>
      </button>
    </div>
  );
};

export default Matieres;
