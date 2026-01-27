import { useState } from 'react';
import { Card } from '@/components/ui';
import { useChallengesStore } from '@/stores';
import { format, startOfYear, eachMonthOfInterval, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trophy, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

export function ChallengesPage() {
  const { challenges, addChallenge, removeChallenge, toggleChallengeComplete } = useChallengesStore();
  const [newChallengeInputs, setNewChallengeInputs] = useState<Record<string, string>>({});

  const currentYear = new Date().getFullYear();
  const months = eachMonthOfInterval({
    start: startOfYear(new Date(currentYear, 0)),
    end: endOfYear(new Date(currentYear, 0)),
  });

  const getChallengesForMonth = (monthStr: string) => {
    return challenges.filter((c) => c.month === monthStr);
  };

  const currentMonthStr = format(new Date(), 'yyyy-MM');

  // Stats
  const completedCount = challenges.filter(c => c.completed).length;
  const totalCount = challenges.length;

  const handleAddChallenge = (monthStr: string) => {
    const content = newChallengeInputs[monthStr]?.trim();
    if (content) {
      addChallenge(monthStr, content);
      setNewChallengeInputs(prev => ({ ...prev, [monthStr]: '' }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, monthStr: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddChallenge(monthStr);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ivory-100">Défis Mensuels</h1>
          <p className="text-ivory-500 mt-1">
            Fixe plusieurs objectifs pour chaque mois et coche-les quand ils sont accomplis
          </p>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-2 bg-noir-800/50 border border-gold-400/20 rounded-lg px-4 py-2">
            <Trophy className="w-5 h-5 text-gold-400" />
            <span className="text-ivory-300">
              <span className="text-gold-400 font-semibold">{completedCount}</span>
              <span className="text-ivory-500">/{totalCount} complétés</span>
            </span>
          </div>
        )}
      </div>

      {/* Months Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((month) => {
          const monthStr = format(month, 'yyyy-MM');
          const monthChallenges = getChallengesForMonth(monthStr);
          const isCurrentMonth = currentMonthStr === monthStr;
          const completedInMonth = monthChallenges.filter(c => c.completed).length;
          const totalInMonth = monthChallenges.length;

          return (
            <Card
              key={monthStr}
              glow={isCurrentMonth}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ivory-100 capitalize flex items-center gap-2">
                    {isCurrentMonth && (
                      <Trophy className="w-4 h-4 text-gold-400" />
                    )}
                    {format(month, 'MMMM', { locale: fr })}
                  </h3>
                  <div className="flex items-center gap-2">
                    {totalInMonth > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        completedInMonth === totalInMonth
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-noir-700 text-ivory-400'
                      }`}>
                        {completedInMonth}/{totalInMonth}
                      </span>
                    )}
                    {isCurrentMonth && (
                      <span className="text-xs bg-gold-400/20 text-gold-400 px-2 py-0.5 rounded-full">
                        En cours
                      </span>
                    )}
                  </div>
                </div>

                {/* Liste des défis */}
                <div className="space-y-2">
                  {monthChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${
                        challenge.completed ? 'bg-emerald-500/10' : 'bg-noir-800/50'
                      }`}
                    >
                      <button
                        onClick={() => toggleChallengeComplete(challenge.id)}
                        className={`flex-shrink-0 mt-0.5 transition-colors ${
                          challenge.completed ? 'text-emerald-400' : 'text-ivory-500 hover:text-ivory-300'
                        }`}
                      >
                        {challenge.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${
                        challenge.completed ? 'text-ivory-400 line-through' : 'text-ivory-200'
                      }`}>
                        {challenge.content}
                      </span>
                      <button
                        onClick={() => removeChallenge(challenge.id)}
                        className="flex-shrink-0 text-ivory-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Ajouter un défi */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChallengeInputs[monthStr] || ''}
                    onChange={(e) => setNewChallengeInputs(prev => ({ ...prev, [monthStr]: e.target.value }))}
                    onKeyPress={(e) => handleKeyPress(e, monthStr)}
                    placeholder="Nouveau défi..."
                    className="flex-1 px-3 py-2 bg-noir-800 border border-noir-700 rounded-lg text-ivory-200 placeholder-ivory-600 text-sm focus:outline-none focus:border-gold-400/40"
                  />
                  <button
                    onClick={() => handleAddChallenge(monthStr)}
                    disabled={!newChallengeInputs[monthStr]?.trim()}
                    className="px-3 py-2 bg-gold-400/20 text-gold-400 rounded-lg hover:bg-gold-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
