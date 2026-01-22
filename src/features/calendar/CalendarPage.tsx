import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  LayoutGrid,
  Trash2,
  Check,
  Clock,
  Users,
  CheckSquare,
} from 'lucide-react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { useCalendarStore } from '@/stores';
import type { CalendarEvent, CalendarEventType } from '@/types';

const eventTypeConfig: Record<CalendarEventType, { label: string; icon: typeof CheckSquare; defaultColor: string }> = {
  task: { label: 'Tâche', icon: CheckSquare, defaultColor: '#3b82f6' },
  event: { label: 'Événement', icon: CalendarIcon, defaultColor: '#22c55e' },
  meeting: { label: 'Réunion', icon: Users, defaultColor: '#f59e0b' },
};

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<CalendarEventType>('event');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formAllDay, setFormAllDay] = useState(true);
  const [formColor, setFormColor] = useState('#3b82f6');

  const { events, fetchEvents, addEvent, updateEvent, removeEvent, toggleTaskComplete } = useCalendarStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormType('event');
    setFormDate(format(new Date(), 'yyyy-MM-dd'));
    setFormStartTime('09:00');
    setFormEndTime('10:00');
    setFormAllDay(true);
    setFormColor('#3b82f6');
    setEditingEvent(null);
  };

  const openAddModal = (date?: Date) => {
    resetForm();
    if (date) {
      setFormDate(format(date, 'yyyy-MM-dd'));
      setSelectedDate(date);
    }
    setIsModalOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description || '');
    setFormType(event.type);
    setFormDate(event.date);
    setFormStartTime(event.startTime || '09:00');
    setFormEndTime(event.endTime || '10:00');
    setFormAllDay(event.allDay);
    setFormColor(event.color);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) return;

    const eventData: CalendarEvent = {
      id: editingEvent?.id || crypto.randomUUID(),
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      type: formType,
      date: formDate,
      startTime: formAllDay ? undefined : formStartTime,
      endTime: formAllDay ? undefined : formEndTime,
      allDay: formAllDay,
      color: formColor,
      completed: editingEvent?.completed || false,
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
    };

    if (editingEvent) {
      await updateEvent(editingEvent.id, eventData);
    } else {
      await addEvent(eventData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await removeEvent(id);
    setIsModalOpen(false);
    resetForm();
  };

  // Calendar navigation
  const navigatePrev = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Get days for current view
  const getDays = () => {
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  };

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter((e) => e.date === dateStr);
  };

  const days = getDays();
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Calendrier</h1>
          <p className="text-dark-400 mt-1">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : "'Semaine du' d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <div className="flex items-center border border-dark-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                view === 'month' ? 'bg-accent-500/20 text-accent-400' : 'text-dark-400 hover:bg-dark-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                view === 'week' ? 'bg-accent-500/20 text-accent-400' : 'text-dark-400 hover:bg-dark-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={() => openAddModal()}>
            <Plus className="w-5 h-5 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={navigatePrev}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-dark-100 capitalize">
          {format(currentDate, view === 'month' ? 'MMMM yyyy' : "'Semaine' w", { locale: fr })}
        </h2>
        <Button variant="ghost" size="sm" onClick={navigateNext}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 border-b border-dark-700">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-dark-400 bg-dark-800/50">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className={`grid grid-cols-7 ${view === 'week' ? 'min-h-[500px]' : ''}`}>
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = view === 'month' ? isSameMonth(day, currentDate) : true;
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={idx}
                onClick={() => openAddModal(day)}
                className={`min-h-[100px] ${view === 'week' ? 'min-h-[500px]' : ''} p-2 border-b border-r border-dark-700/50 cursor-pointer hover:bg-dark-700/30 transition-colors ${
                  !isCurrentMonth ? 'bg-dark-800/30' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-accent-500 text-white'
                        : isCurrentMonth
                        ? 'text-dark-200'
                        : 'text-dark-500'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, view === 'week' ? 10 : 3).map((event) => {
                    const Icon = eventTypeConfig[event.type].icon;
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(event);
                        }}
                        className={`text-xs p-1.5 rounded truncate flex items-center gap-1 hover:opacity-80 transition-opacity ${
                          event.type === 'task' && event.completed ? 'opacity-50 line-through' : ''
                        }`}
                        style={{ backgroundColor: `${event.color}20`, color: event.color }}
                      >
                        {event.type === 'task' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskComplete(event.id);
                            }}
                            className="flex-shrink-0"
                          >
                            {event.completed ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <div className="w-3 h-3 border border-current rounded-sm" />
                            )}
                          </button>
                        )}
                        {event.type !== 'task' && <Icon className="w-3 h-3 flex-shrink-0" />}
                        {!event.allDay && event.startTime && (
                          <span className="flex-shrink-0">{event.startTime}</span>
                        )}
                        <span className="truncate">{event.title}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > (view === 'week' ? 10 : 3) && (
                    <div className="text-xs text-dark-400 pl-1">
                      +{dayEvents.length - (view === 'week' ? 10 : 3)} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingEvent ? 'Modifier' : 'Nouvel événement'}
      >
        <div className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Type</label>
            <div className="flex gap-2">
              {(Object.keys(eventTypeConfig) as CalendarEventType[]).map((type) => {
                const config = eventTypeConfig[type];
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setFormType(type);
                      setFormColor(config.defaultColor);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                      formType === type
                        ? 'border-accent-500 bg-accent-500/10 text-accent-400'
                        : 'border-dark-600 text-dark-400 hover:border-dark-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Titre"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Ex: Réunion équipe"
          />

          <Input
            label="Description (optionnel)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Détails..."
          />

          <Input
            label="Date"
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              checked={formAllDay}
              onChange={(e) => setFormAllDay(e.target.checked)}
              className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-accent-500 focus:ring-accent-500"
            />
            <label htmlFor="allDay" className="text-sm text-dark-300">
              Toute la journée
            </label>
          </div>

          {!formAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Début
                </label>
                <input
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Fin
                </label>
                <input
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Couleur</label>
            <div className="flex gap-2">
              {['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'].map((color) => (
                <button
                  key={color}
                  onClick={() => setFormColor(color)}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    formColor === color ? 'scale-110 ring-2 ring-offset-2 ring-offset-surface-light' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {editingEvent && (
              <Button
                variant="secondary"
                onClick={() => handleDelete(editingEvent.id)}
                className="!text-red-400 !border-red-400/30 hover:!bg-red-400/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              {editingEvent ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
