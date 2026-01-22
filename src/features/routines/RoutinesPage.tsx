import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { useRoutinesStore } from '@/stores';
import {
  format,
  startOfWeek,
  addDays,
  subDays,
  isToday,
  getDay,
  isSameDay,
  addWeeks,
  subWeeks,
  parseISO,
  isBefore,
  isAfter,
} from 'date-fns';
import { fr } from 'date-fns/locale';

const toISODateString = (date: Date): string => format(date, 'yyyy-MM-dd');

export function RoutinesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineFrequency, setNewRoutineFrequency] = useState<'daily' | 'weekly'>('daily');
  const [newRoutineWeekDay, setNewRoutineWeekDay] = useState(1);
  const [newRoutineStartDate, setNewRoutineStartDate] = useState('');
  const [newRoutineEndDate, setNewRoutineEndDate] = useState('');

  const { routines, completions, fetchRoutines, fetchCompletions, addRoutine, removeRoutine, toggleCompletion } =
    useRoutinesStore();

  useEffect(() => {
    fetchRoutines();
    fetchCompletions();
  }, [fetchRoutines, fetchCompletions]);

  const selectedDateStr = toISODateString(selectedDate);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Check if a routine is active for a given date
  const isRoutineActiveForDate = (routine: typeof routines[0], date: Date): boolean => {
    if (!routine.active) return false;

    // Check start date
    if (routine.startDate && isBefore(date, parseISO(routine.startDate))) {
      return false;
    }

    // Check end date
    if (routine.endDate && isAfter(date, parseISO(routine.endDate))) {
      return false;
    }

    return true;
  };

  const getRoutinesForDate = (date: Date) => {
    const dayOfWeek = getDay(date);
    return routines.filter((routine) => {
      if (!isRoutineActiveForDate(routine, date)) return false;
      if (routine.frequency === 'daily') return true;
      return routine.weekDay === dayOfWeek;
    });
  };

  const isRoutineCompleted = (routineId: string, date: string) => {
    const completion = completions.find(
      (c) => c.routineId === routineId && c.date === date
    );
    return completion?.completed || false;
  };

  const handleAddRoutine = async () => {
    if (!newRoutineName.trim()) return;

    await addRoutine({
      id: crypto.randomUUID(),
      name: newRoutineName.trim(),
      frequency: newRoutineFrequency,
      weekDay: newRoutineFrequency === 'weekly' ? newRoutineWeekDay : undefined,
      startDate: newRoutineStartDate || undefined,
      endDate: newRoutineEndDate || undefined,
      createdAt: new Date().toISOString(),
      active: true,
    });

    setNewRoutineName('');
    setNewRoutineFrequency('daily');
    setNewRoutineWeekDay(1);
    setNewRoutineStartDate('');
    setNewRoutineEndDate('');
    setIsModalOpen(false);
  };

  const selectedDayRoutines = getRoutinesForDate(selectedDate);
  const completedCount = selectedDayRoutines.filter((r) =>
    isRoutineCompleted(r.id, selectedDateStr)
  ).length;

  // Navigation handlers
  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToPreviousWeek = () => setSelectedDate(subWeeks(selectedDate, 1));
  const goToNextWeek = () => setSelectedDate(addWeeks(selectedDate, 1));
  const goToToday = () => setSelectedDate(new Date());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Routines</h1>
          <p className="text-dark-400 mt-1">
            {routines.filter(r => r.active).length} routine{routines.filter(r => r.active).length > 1 ? 's' : ''} active{routines.filter(r => r.active).length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle routine
        </Button>
      </div>

      {/* Date Navigation */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goToPreviousWeek} className="!p-2">
              <ChevronLeft className="w-5 h-5" />
              <ChevronLeft className="w-5 h-5 -ml-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToPreviousDay} className="!p-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold text-dark-100 capitalize">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
            {!isToday(selectedDate) && (
              <button
                onClick={goToToday}
                className="text-sm text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-1 mx-auto mt-1"
              >
                <Calendar className="w-4 h-4" />
                Retour à aujourd'hui
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goToNextDay} className="!p-2">
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToNextWeek} className="!p-2">
              <ChevronRight className="w-5 h-5" />
              <ChevronRight className="w-5 h-5 -ml-3" />
            </Button>
          </div>
        </div>

        {/* Week Overview - Clickable */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayStr = toISODateString(day);
            const dayRoutines = getRoutinesForDate(day);
            const dayCompletedCount = dayRoutines.filter((r) =>
              isRoutineCompleted(r.id, dayStr)
            ).length;
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <button
                key={dayStr}
                onClick={() => setSelectedDate(day)}
                className={`text-center p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-accent-500/20 ring-2 ring-accent-500 ring-offset-2 ring-offset-surface-light'
                    : isTodayDate
                    ? 'bg-dark-700/50 hover:bg-dark-700'
                    : 'bg-dark-800/50 hover:bg-dark-700/50'
                }`}
              >
                <p className={`text-xs uppercase ${isSelected ? 'text-accent-400' : 'text-dark-400'}`}>
                  {format(day, 'EEE', { locale: fr })}
                </p>
                <p className={`text-lg font-semibold mt-1 ${
                  isSelected ? 'text-accent-400' : isTodayDate ? 'text-dark-100' : 'text-dark-200'
                }`}>
                  {format(day, 'd')}
                </p>
                {dayRoutines.length > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-center gap-0.5">
                      {dayRoutines.slice(0, 5).map((r, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isRoutineCompleted(r.id, dayStr)
                              ? 'bg-emerald-400'
                              : 'bg-dark-500'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs mt-1 ${isSelected ? 'text-accent-300' : 'text-dark-400'}`}>
                      {dayCompletedCount}/{dayRoutines.length}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selected Day Routines */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-100">
              Routines du jour
              {selectedDayRoutines.length > 0 && (
                <span className="ml-2 text-sm font-normal text-dark-400">
                  ({completedCount}/{selectedDayRoutines.length} complétées)
                </span>
              )}
            </h2>
            {isToday(selectedDate) && (
              <span className="badge badge-accent">Aujourd'hui</span>
            )}
          </div>

          {selectedDayRoutines.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-dark-400">Aucune routine pour ce jour</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {selectedDayRoutines.map((routine) => {
                const completed = isRoutineCompleted(routine.id, selectedDateStr);
                return (
                  <Card
                    key={routine.id}
                    padding="sm"
                    hover
                    glow={completed}
                    className={`cursor-pointer transition-all ${
                      completed ? 'bg-emerald-500/10 border-emerald-500/30' : ''
                    }`}
                    onClick={() => toggleCompletion(routine.id, selectedDateStr)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-dark-500 hover:border-accent-400'
                        }`}
                      >
                        {completed && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span
                        className={`flex-1 ${
                          completed
                            ? 'text-emerald-300 line-through'
                            : 'text-dark-100'
                        }`}
                      >
                        {routine.name}
                      </span>
                      <span className="text-xs text-dark-500 bg-dark-800/50 px-2 py-1 rounded">
                        {routine.frequency === 'daily' ? 'Quotidien' : 'Hebdo'}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Progress bar for selected day */}
          {selectedDayRoutines.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-dark-400">Progression</span>
                <span className="text-dark-200 font-medium">
                  {Math.round((completedCount / selectedDayRoutines.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                  style={{
                    width: `${(completedCount / selectedDayRoutines.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* All Routines */}
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-100">Toutes les routines</h2>
          {routines.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-dark-400">Aucune routine créée</p>
              <p className="text-sm text-dark-500 mt-2">
                Crée ta première routine pour commencer
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {routines.map((routine) => (
                <Card key={routine.id} padding="sm" hover>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark-100">{routine.name}</p>
                      <p className="text-sm text-dark-400">
                        {routine.frequency === 'daily'
                          ? 'Tous les jours'
                          : `Chaque ${format(
                              addDays(
                                startOfWeek(new Date(), { weekStartsOn: 0 }),
                                routine.weekDay || 0
                              ),
                              'EEEE',
                              { locale: fr }
                            )}`}
                      </p>
                      {(routine.startDate || routine.endDate) && (
                        <p className="text-xs text-dark-500 mt-1">
                          {routine.startDate && `Du ${format(parseISO(routine.startDate), 'd MMM yyyy', { locale: fr })}`}
                          {routine.startDate && routine.endDate && ' '}
                          {routine.endDate && `au ${format(parseISO(routine.endDate), 'd MMM yyyy', { locale: fr })}`}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeRoutine(routine.id)}
                      className="p-2 text-dark-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Routine Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle routine"
      >
        <div className="space-y-4">
          <Input
            label="Nom de la routine"
            value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
            placeholder="Ex: Méditation, Sport, Lecture..."
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Fréquence
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setNewRoutineFrequency('daily')}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  newRoutineFrequency === 'daily'
                    ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                    : 'bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-600'
                }`}
              >
                Tous les jours
              </button>
              <button
                onClick={() => setNewRoutineFrequency('weekly')}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  newRoutineFrequency === 'weekly'
                    ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                    : 'bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-600'
                }`}
              >
                Toutes les semaines
              </button>
            </div>
          </div>
          {newRoutineFrequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">
                Jour de la semaine
              </label>
              <select
                value={newRoutineWeekDay}
                onChange={(e) => setNewRoutineWeekDay(parseInt(e.target.value))}
                className="input"
              >
                <option value={1}>Lundi</option>
                <option value={2}>Mardi</option>
                <option value={3}>Mercredi</option>
                <option value={4}>Jeudi</option>
                <option value={5}>Vendredi</option>
                <option value={6}>Samedi</option>
                <option value={0}>Dimanche</option>
              </select>
            </div>
          )}

          {/* Date range - NEW */}
          <div className="border-t border-dark-700 pt-4">
            <p className="text-sm font-medium text-dark-300 mb-3">Période (optionnel)</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date de début"
                type="date"
                value={newRoutineStartDate}
                onChange={(e) => setNewRoutineStartDate(e.target.value)}
              />
              <Input
                label="Date de fin"
                type="date"
                value={newRoutineEndDate}
                onChange={(e) => setNewRoutineEndDate(e.target.value)}
              />
            </div>
            <p className="text-xs text-dark-500 mt-2">
              Laisse vide pour une routine sans limite de temps
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleAddRoutine}>
              Créer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
