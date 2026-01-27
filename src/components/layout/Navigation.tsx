import { NavLink } from 'react-router-dom';
import {
  Target,
  Wallet,
  CheckSquare,
  Trophy,
  Calendar,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

const navItems = [
  { path: '/objectives', label: 'Objectifs', icon: Target },
  { path: '/calendar', label: 'Calendrier', icon: Calendar },
  { path: '/expenses', label: 'Depenses', icon: Wallet },
  { path: '/finance', label: 'Finance', icon: TrendingUp },
  { path: '/chroniques', label: 'Chroniques', icon: BookOpen },
  { path: '/routines', label: 'Routines', icon: CheckSquare },
  { path: '/challenges', label: 'Defis', icon: Trophy },
];

interface NavigationProps {
  mobile?: boolean;
  onItemClick?: () => void;
}

export function Navigation({ mobile = false, onItemClick }: NavigationProps) {
  const baseClasses = mobile
    ? 'flex items-center gap-3 px-4 py-3 rounded-md text-ivory-400 hover:bg-ivory-200/5 hover:text-ivory-200 transition-all text-sm'
    : 'flex items-center gap-2 px-3 py-2 rounded-md text-ivory-500 hover:bg-ivory-200/5 hover:text-ivory-200 text-sm transition-all';

  const activeClasses = 'bg-gold-400/10 text-gold-400 border border-gold-400/20';

  return (
    <nav className={mobile ? 'flex flex-col gap-1' : 'flex items-center gap-1'}>
      {navItems.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onItemClick}
          className={({ isActive }) =>
            `${baseClasses} ${isActive ? activeClasses : 'border border-transparent'}`
          }
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
