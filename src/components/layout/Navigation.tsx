import { NavLink } from 'react-router-dom';
import {
  Target,
  Wallet,
  UtensilsCrossed,
  Users,
  CheckSquare,
  Trophy,
} from 'lucide-react';

const navItems = [
  { path: '/objectives', label: 'Objectifs', icon: Target },
  { path: '/expenses', label: 'Dépenses', icon: Wallet },
  { path: '/food', label: 'Nourriture', icon: UtensilsCrossed },
  { path: '/biography', label: 'Biographie', icon: Users },
  { path: '/routines', label: 'Routines', icon: CheckSquare },
  { path: '/challenges', label: 'Défis', icon: Trophy },
];

interface NavigationProps {
  mobile?: boolean;
  onItemClick?: () => void;
}

export function Navigation({ mobile = false, onItemClick }: NavigationProps) {
  const baseClasses = mobile
    ? 'flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:bg-dark-700/50 hover:text-white transition-all'
    : 'flex items-center gap-2 px-3 py-2 rounded-xl text-dark-300 hover:bg-dark-700/50 hover:text-white text-sm transition-all';

  const activeClasses = 'bg-accent-500/20 text-accent-400 border border-accent-500/30';

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
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
