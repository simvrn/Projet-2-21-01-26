import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { useObjectivesStore } from '@/stores';
import { calculateObjectiveProgress } from '@/utils/objectives';
import { getDaysUntilTarget, TARGET_END_DATE, formatDate } from '@/utils/dates';

export function ObjectivesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newObjectiveName, setNewObjectiveName] = useState('');
  const [newObjectiveColor, setNewObjectiveColor] = useState('#06b6d4');

  const { objectives, timeEntries, addObjective, removeObjective } = useObjectivesStore();

  const daysRemaining = getDaysUntilTarget();

  const handleAddObjective = () => {
    if (!newObjectiveName.trim()) return;

    addObjective({
      id: crypto.randomUUID(),
      name: newObjectiveName.trim(),
      color: newObjectiveColor,
      createdAt: new Date().toISOString(),
    });

    setNewObjectiveName('');
    setNewObjectiveColor('#06b6d4');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Objectifs</h1>
          <p className="text-dark-400 mt-1">
            <span className="text-accent-400 font-semibold">{daysRemaining}</span> jours restants jusqu'au {formatDate(TARGET_END_DATE)}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nouvel objectif
        </Button>
      </div>

      {/* Objectives List */}
      {objectives.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-accent-400" />
          </div>
          <p className="text-dark-300">Aucun objectif défini</p>
          <p className="text-sm text-dark-500 mt-2">
            Créez votre premier objectif pour commencer à suivre votre temps
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {objectives.map((objective) => {
            const progress = calculateObjectiveProgress(
              objective.id,
              timeEntries,
              objective
            );

            return (
              <Card key={objective.id} hover>
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-surface-light"
                    style={{ backgroundColor: objective.color, ringColor: objective.color }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-dark-100">
                      {objective.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-dark-400">
                        {progress.hoursSpent}h / {progress.hoursRequired}h requis
                      </span>
                      <span
                        className={`font-semibold ${
                          progress.isValid ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {progress.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress.isValid
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : 'bg-gradient-to-r from-amber-500 to-amber-400'
                      }`}
                      style={{
                        width: `${Math.min(progress.percentage * 10, 100)}%`,
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeObjective(objective.id)}
                    className="p-2 text-dark-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Calendar placeholder */}
      <Card>
        <h2 className="text-lg font-semibold text-dark-100 mb-4">
          Calendrier de suivi
        </h2>
        <div className="text-center py-12 border-2 border-dashed border-dark-700 rounded-xl">
          <p className="text-dark-400">
            Calendrier à implémenter - Affichage jour par jour avec entrées de temps
          </p>
        </div>
      </Card>

      {/* Add Objective Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvel objectif"
      >
        <div className="space-y-4">
          <Input
            label="Nom de l'objectif"
            value={newObjectiveName}
            onChange={(e) => setNewObjectiveName(e.target.value)}
            placeholder="Ex: Apprendre le piano"
          />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Couleur
            </label>
            <div className="flex gap-2">
              {['#06b6d4', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewObjectiveColor(color)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    newObjectiveColor === color
                      ? 'ring-2 ring-offset-2 ring-offset-surface-light scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color, ringColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleAddObjective}>
              Créer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
