import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Pause, Play, Check, ImagePlus, X, Edit2, RefreshCw } from 'lucide-react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { useGoalsStore } from '@/stores';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Goal, GoalStatus } from '@/types';

export function ObjectivesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#06b6d4');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formImage, setFormImage] = useState<string | undefined>();
  const [inputMode, setInputMode] = useState<'endDate' | 'duration'>('duration');

  const { goals, loading, fetchGoals, addGoal, updateGoal, removeGoal } = useGoalsStore();

  // Force refresh from server on mount and visibility change
  useEffect(() => {
    fetchGoals();

    // Refresh when page becomes visible (when switching back from another tab/app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchGoals();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchGoals]);

  const handleRefresh = useCallback(() => {
    fetchGoals();
  }, [fetchGoals]);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormColor('#06b6d4');
    setFormStartDate(format(new Date(), 'yyyy-MM-dd'));
    setFormEndDate('');
    setFormDuration('90');
    setFormImage(undefined);
    setInputMode('duration');
    setEditingGoal(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormName(goal.name);
    setFormDescription(goal.description || '');
    setFormColor(goal.color);
    setFormStartDate(goal.startDate);
    setFormEndDate(goal.endDate || '');
    setFormDuration(goal.durationDays?.toString() || '');
    setFormImage(goal.image);
    setInputMode(goal.endDate ? 'endDate' : 'duration');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formStartDate) return;

    let endDate: string | undefined;
    let durationDays: number | undefined;

    if (inputMode === 'duration' && formDuration) {
      durationDays = parseInt(formDuration);
      endDate = format(addDays(parseISO(formStartDate), durationDays), 'yyyy-MM-dd');
    } else if (inputMode === 'endDate' && formEndDate) {
      endDate = formEndDate;
      durationDays = differenceInDays(parseISO(formEndDate), parseISO(formStartDate));
    }

    const goalData: Goal = {
      id: editingGoal?.id || crypto.randomUUID(),
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      image: formImage,
      color: formColor,
      startDate: formStartDate,
      endDate,
      durationDays,
      status: editingGoal?.status || 'active',
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
    };

    if (editingGoal) {
      await updateGoal(editingGoal.id, goalData);
    } else {
      await addGoal(goalData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleStatusChange = async (id: string, newStatus: GoalStatus) => {
    await updateGoal(id, { status: newStatus });
  };

  const calculateProgress = (goal: Goal) => {
    const start = parseISO(goal.startDate);
    const today = new Date();
    const daysElapsed = Math.max(0, differenceInDays(today, start));
    const totalDays = goal.durationDays || (goal.endDate ? differenceInDays(parseISO(goal.endDate), start) : 0);

    if (totalDays <= 0) return { daysElapsed: 0, totalDays: 0, percentage: 0, daysRemaining: 0 };

    const percentage = Math.min(100, (daysElapsed / totalDays) * 100);
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    return { daysElapsed, totalDays, percentage, daysRemaining };
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const pausedGoals = goals.filter((g) => g.status === 'paused');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const progress = calculateProgress(goal);
    const isCompleted = goal.status === 'completed';
    const isPaused = goal.status === 'paused';

    return (
      <Card
        hover
        className={`overflow-hidden ${isCompleted ? 'opacity-60' : ''} ${isPaused ? 'border-amber-500/30' : ''}`}
      >
        {goal.image && (
          <div className="h-32 -mx-4 -mt-4 mb-4 overflow-hidden">
            <img src={goal.image} alt={goal.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: goal.color }}
            />
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-dark-100 ${isCompleted ? 'line-through' : ''}`}>
                {goal.name}
              </h3>
              {goal.description && (
                <p className="text-sm text-dark-400 mt-1 line-clamp-2">{goal.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-dark-500">
                <span>{format(parseISO(goal.startDate), 'd MMM yyyy', { locale: fr })}</span>
                <span>→</span>
                <span>
                  {goal.endDate
                    ? format(parseISO(goal.endDate), 'd MMM yyyy', { locale: fr })
                    : `${goal.durationDays} jours`
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => openEditModal(goal)}
              className="p-1.5 text-dark-500 hover:text-accent-400 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {goal.status === 'active' && (
              <button
                onClick={() => handleStatusChange(goal.id, 'paused')}
                className="p-1.5 text-dark-500 hover:text-amber-400 transition-colors"
                title="Mettre en pause"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            {goal.status === 'paused' && (
              <button
                onClick={() => handleStatusChange(goal.id, 'active')}
                className="p-1.5 text-dark-500 hover:text-emerald-400 transition-colors"
                title="Reprendre"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            {goal.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange(goal.id, 'completed')}
                className="p-1.5 text-dark-500 hover:text-emerald-400 transition-colors"
                title="Marquer comme terminé"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => removeGoal(goal.id)}
              className="p-1.5 text-dark-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-dark-400">
              {progress.daysElapsed} / {progress.totalDays} jours
            </span>
            <span className={`font-medium ${
              progress.percentage >= 100 ? 'text-emerald-400' :
              isPaused ? 'text-amber-400' : 'text-accent-400'
            }`}>
              {progress.percentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progress.percentage >= 100
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : isPaused
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-accent-500 to-accent-400'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          {progress.daysRemaining > 0 && !isCompleted && (
            <p className="text-xs text-dark-500 mt-2">
              {progress.daysRemaining} jour{progress.daysRemaining > 1 ? 's' : ''} restant{progress.daysRemaining > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Objectifs</h1>
          <p className="text-dark-400 mt-1">
            {activeGoals.length} objectif{activeGoals.length > 1 ? 's' : ''} en cours
            {loading && <span className="ml-2 text-accent-400">Synchronisation...</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-all ${loading ? 'animate-spin' : ''}`}
            title="Rafraîchir"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Button onClick={openAddModal}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvel objectif
          </Button>
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-400" />
            En cours
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Paused Goals */}
      {pausedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            En pause
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pausedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            Terminés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {goals.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-accent-400" />
          </div>
          <p className="text-dark-300">Aucun objectif défini</p>
          <p className="text-sm text-dark-500 mt-2">
            Créez votre premier objectif avec une période définie
          </p>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingGoal ? "Modifier l'objectif" : "Nouvel objectif"}
      >
        <div className="space-y-4">
          <Input
            label="Nom de l'objectif"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Ex: Apprendre l'espagnol"
          />

          <Input
            label="Description (optionnel)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Détails sur l'objectif..."
          />

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Image (optionnel)
            </label>
            {formImage ? (
              <div className="relative h-32 rounded-lg overflow-hidden">
                <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setFormImage(undefined)}
                  className="absolute top-2 right-2 p-1 bg-dark-800/80 rounded-full hover:bg-dark-700"
                >
                  <X className="w-4 h-4 text-dark-300" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center h-24 border-2 border-dashed border-dark-600 rounded-lg cursor-pointer hover:border-dark-500 transition-colors">
                <div className="text-center">
                  <ImagePlus className="w-6 h-6 text-dark-500 mx-auto mb-1" />
                  <span className="text-sm text-dark-500">Ajouter une image</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          <Input
            label="Date de début"
            type="date"
            value={formStartDate}
            onChange={(e) => setFormStartDate(e.target.value)}
          />

          {/* Duration mode selector */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Définir la fin par</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setInputMode('duration')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'duration'
                    ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                    : 'bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-600'
                }`}
              >
                Durée
              </button>
              <button
                onClick={() => setInputMode('endDate')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  inputMode === 'endDate'
                    ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                    : 'bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-600'
                }`}
              >
                Date de fin
              </button>
            </div>
          </div>

          {inputMode === 'duration' ? (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Durée (jours)</label>
              <div className="flex gap-2">
                {[30, 60, 90, 180, 365].map((days) => (
                  <button
                    key={days}
                    onClick={() => setFormDuration(days.toString())}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      formDuration === days.toString()
                        ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                        : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    {days}j
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                placeholder="Ou saisir une durée personnalisée"
                className="input mt-2"
              />
            </div>
          ) : (
            <Input
              label="Date de fin"
              type="date"
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Couleur</label>
            <div className="flex gap-2">
              {['#06b6d4', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'].map((color) => (
                <button
                  key={color}
                  onClick={() => setFormColor(color)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    formColor === color ? 'scale-110 ring-2 ring-offset-2 ring-offset-surface-light' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              {editingGoal ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
