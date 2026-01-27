import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import {
  Target,
  Wallet,
  CheckSquare,
  Trophy,
  ArrowRight,
  Clock,
  TrendingUp,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { differenceInDays, differenceInMilliseconds } from 'date-fns';

const modules = [
  {
    path: '/objectives',
    label: 'Objectifs',
    description: 'Suivi du temps et progression',
    icon: Target,
  },
  {
    path: '/calendar',
    label: 'Calendrier',
    description: 'Evenements et planification',
    icon: Calendar,
  },
  {
    path: '/expenses',
    label: 'Depenses',
    description: 'Gestion budgetaire mensuelle',
    icon: Wallet,
  },
  {
    path: '/finance',
    label: 'Finance',
    description: 'Actions et patrimoine',
    icon: TrendingUp,
  },
  {
    path: '/chroniques',
    label: 'Chroniques',
    description: 'Structure hierarchique extensible',
    icon: BookOpen,
  },
  {
    path: '/routines',
    label: 'Routines',
    description: 'Habitudes quotidiennes',
    icon: CheckSquare,
  },
  {
    path: '/challenges',
    label: 'Defis',
    description: 'Objectifs mensuels',
    icon: Trophy,
  },
];

// Dates de reference
const START_DATE = new Date(2026, 0, 1); // 1er janvier 2026
const END_DATE = new Date(2027, 0, 1);   // 1er janvier 2027

function getTimeProgress() {
  const now = new Date();
  const totalDuration = differenceInMilliseconds(END_DATE, START_DATE);
  const elapsed = differenceInMilliseconds(now, START_DATE);
  const daysRemaining = differenceInDays(END_DATE, now);

  // Calcul du pourcentage ecoule
  let percentElapsed = (elapsed / totalDuration) * 100;
  percentElapsed = Math.max(0, Math.min(100, percentElapsed));

  // Pourcentage restant
  const percentRemaining = 100 - percentElapsed;

  return {
    daysRemaining: Math.max(0, daysRemaining),
    percentElapsed: percentElapsed.toFixed(1),
    percentRemaining: percentRemaining.toFixed(1),
  };
}

export function HomePage() {
  const { daysRemaining, percentElapsed, percentRemaining } = getTimeProgress();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 relative">
        <div className="absolute inset-0 bg-glow-warm opacity-30" />
        <div className="relative">
          <p className="text-xs uppercase tracking-wider text-gold-400 mb-6 font-medium">
            Can you hear the music Simon ?
          </p>
          <h1 className="text-5xl md:text-6xl font-serif text-ivory-100 mb-6 tracking-tight">
            We are in the simulation
          </h1>
          <p className="text-lg text-ivory-400 max-w-xl mx-auto leading-relaxed">
            Life is a game played with itself so you have to be the best everywhere
          </p>
        </div>
      </section>

      {/* Time Progress Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jours restants */}
          <Card glow className="text-center py-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gold-400/10 border border-gold-400/20">
                <Clock className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <p className="text-5xl font-serif text-ivory-100 mb-2">
              {daysRemaining}
            </p>
            <p className="text-sm text-ivory-500 uppercase tracking-wider">
              jours restants
            </p>
            <p className="text-xs text-ivory-600 mt-2">
              jusqu'au 1er janvier 2027
            </p>
          </Card>

          {/* Pourcentage de progression */}
          <Card className="text-center py-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gold-400/10 border border-gold-400/20">
                <TrendingUp className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-8 mb-6">
              <div>
                <p className="text-4xl font-serif text-ivory-100">
                  {percentRemaining}%
                </p>
                <p className="text-xs text-ivory-500 uppercase tracking-wider mt-1">restant</p>
              </div>
              <div className="h-10 w-px bg-noir-700" />
              <div>
                <p className="text-4xl font-serif text-ivory-500">
                  {percentElapsed}%
                </p>
                <p className="text-xs text-ivory-600 uppercase tracking-wider mt-1">ecoule</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-noir-800 rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${percentElapsed}%`,
                  background: 'linear-gradient(90deg, #725636, #c4ac78)',
                }}
              />
            </div>
            <p className="text-xs text-ivory-600 mt-4">
              2026 - 2027
            </p>
          </Card>
        </div>
      </section>

      {/* Modules Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif text-ivory-200">
            Modules
          </h2>
          <span className="text-xs text-ivory-600 uppercase tracking-wider">
            {modules.length} disponibles
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ path, label, description, icon: Icon }) => (
            <Link key={path} to={path}>
              <Card
                hover
                className="h-full cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-surface-elevated border border-noir-700 group-hover:border-gold-400/30 transition-colors">
                    <Icon className="w-5 h-5 text-ivory-400 group-hover:text-gold-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-ivory-200 group-hover:text-gold-400 transition-colors">
                      {label}
                    </h3>
                    <p className="text-sm text-ivory-500 mt-1">
                      {description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ivory-600 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer hint */}
      <section className="text-center py-8">
        <p className="text-ivory-600 text-sm">
          Systeme personnel confidentiel
        </p>
      </section>
    </div>
  );
}
