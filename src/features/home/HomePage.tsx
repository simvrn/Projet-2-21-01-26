import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import {
  Target,
  Wallet,
  UtensilsCrossed,
  Users,
  CheckSquare,
  Trophy,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { differenceInDays, differenceInMilliseconds } from 'date-fns';

const modules = [
  {
    path: '/objectives',
    label: 'Objectifs',
    description: 'Suivi du temps et progression',
    icon: Target,
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    path: '/expenses',
    label: 'Dépenses',
    description: 'Gestion budgétaire mensuelle',
    icon: Wallet,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    path: '/food',
    label: 'Nourriture',
    description: 'Bibliothèque de plats',
    icon: UtensilsCrossed,
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    path: '/biography',
    label: 'Biographie',
    description: 'Personnes inspirantes',
    icon: Users,
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    path: '/routines',
    label: 'Routines',
    description: 'Habitudes quotidiennes',
    icon: CheckSquare,
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    path: '/challenges',
    label: 'Défis',
    description: 'Objectifs mensuels',
    icon: Trophy,
    gradient: 'from-yellow-500 to-orange-500',
  },
];

// Dates de référence
const START_DATE = new Date(2026, 0, 1); // 1er janvier 2026
const END_DATE = new Date(2027, 0, 1);   // 1er janvier 2027

function getTimeProgress() {
  const now = new Date();
  const totalDuration = differenceInMilliseconds(END_DATE, START_DATE);
  const elapsed = differenceInMilliseconds(now, START_DATE);
  const daysRemaining = differenceInDays(END_DATE, now);

  // Calcul du pourcentage écoulé
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
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 relative">
        <div className="absolute inset-0 bg-glow-accent opacity-30" />
        <div className="relative">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-accent-400" />
            <span className="text-sm font-medium text-accent-400 uppercase tracking-wider">
              Dashboard Personnel
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-dark-100">Life </span>
            <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-lg text-dark-300 max-w-2xl mx-auto leading-relaxed">
            Organise ta vie, atteins tes objectifs. Un espace minimaliste pour
            suivre ta progression et rester concentré sur l'essentiel.
          </p>
        </div>
      </section>

      {/* Time Progress Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jours restants */}
          <Card glow className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-glow-sm">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-dark-100">Compte à rebours</h2>
            </div>
            <p className="text-5xl font-bold text-gradient mb-2">{daysRemaining}</p>
            <p className="text-dark-400">jours restants jusqu'au 1er janvier 2027</p>
          </Card>

          {/* Pourcentage de progression */}
          <Card className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-dark-100">Progression 2026</h2>
            </div>
            <div className="flex items-center justify-center gap-6 mb-4">
              <div>
                <p className="text-4xl font-bold text-secondary-400">{percentRemaining}%</p>
                <p className="text-sm text-dark-400">restant</p>
              </div>
              <div className="h-12 w-px bg-dark-700" />
              <div>
                <p className="text-4xl font-bold text-dark-300">{percentElapsed}%</p>
                <p className="text-sm text-dark-400">écoulé</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 transition-all duration-1000"
                style={{ width: `${percentElapsed}%` }}
              />
            </div>
            <p className="text-xs text-dark-500 mt-2">1er janvier 2026 → 1er janvier 2027</p>
          </Card>
        </div>
      </section>

      {/* Modules Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(({ path, label, description, icon: Icon, gradient }) => (
            <Link key={path} to={path}>
              <Card
                hover
                className="h-full cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-dark-100 group-hover:text-accent-400 transition-colors">
                      {label}
                    </h3>
                    <p className="text-sm text-dark-400 mt-1">{description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-dark-500 group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
