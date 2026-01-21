import { Card } from '@/components/ui';
import { useChallengesStore } from '@/stores';
import { format, startOfYear, eachMonthOfInterval, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trophy } from 'lucide-react';

export function ChallengesPage() {
  const { challenges, updateChallenge } = useChallengesStore();

  const currentYear = new Date().getFullYear();
  const months = eachMonthOfInterval({
    start: startOfYear(new Date(currentYear, 0)),
    end: endOfYear(new Date(currentYear, 0)),
  });

  const getChallenge = (monthStr: string): string => {
    return challenges.find((c) => c.month === monthStr)?.content || '';
  };

  const currentMonthStr = format(new Date(), 'yyyy-MM');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Défis Mensuels</h1>
        <p className="text-dark-400 mt-1">
          Fixe un objectif créatif ou un thème pour chaque mois de l'année
        </p>
      </div>

      {/* Months Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((month) => {
          const monthStr = format(month, 'yyyy-MM');
          const content = getChallenge(monthStr);
          const isCurrentMonth = currentMonthStr === monthStr;

          return (
            <Card
              key={monthStr}
              glow={isCurrentMonth}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-dark-100 capitalize flex items-center gap-2">
                    {isCurrentMonth && (
                      <Trophy className="w-4 h-4 text-accent-400" />
                    )}
                    {format(month, 'MMMM', { locale: fr })}
                  </h3>
                  {isCurrentMonth && (
                    <span className="badge badge-accent">En cours</span>
                  )}
                </div>
                <textarea
                  value={content}
                  onChange={(e) => updateChallenge(monthStr, e.target.value)}
                  placeholder="Quel est ton défi pour ce mois ?"
                  className="input min-h-[100px] text-sm"
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
