import { Calendar, Plus, Clock } from 'lucide-react';

const Planning = () => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;

  const events = [
    { id: 1, title: 'Cours de Maths', time: '08:00 - 10:00', color: 'bg-blue-500' },
    { id: 2, title: 'Devoir Physique', time: '10:30 - 12:00', color: 'bg-green-500' },
    { id: 3, title: 'Révision Histoire', time: '14:00 - 16:00', color: 'bg-purple-500' },
  ];

  return (
    <div className="flex-1 px-5 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planning</h1>
          <p className="text-muted-foreground text-sm">Janvier 2026</p>
        </div>
        <button className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
          <Plus className="w-6 h-6 text-primary-foreground" />
        </button>
      </div>

      {/* Week Days */}
      <div className="flex justify-between bg-card rounded-2xl p-4 shadow-sm border border-border">
        {days.map((day, index) => (
          <div
            key={day}
            className={`flex flex-col items-center gap-1 ${
              index === adjustedToday ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <span className="text-xs font-medium">{day}</span>
            <span
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                index === adjustedToday ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              {6 + index}
            </span>
          </div>
        ))}
      </div>

      {/* Today's Events */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Aujourd'hui</h2>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-sm border border-border"
            >
              <div className={`w-1 h-12 rounded-full ${event.color}`} />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{event.title}</h3>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State Hint */}
      <div className="bg-secondary/50 rounded-2xl p-6 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">
          Ajoutez vos cours et devoirs pour organiser votre semaine
        </p>
      </div>
    </div>
  );
};

export default Planning;
