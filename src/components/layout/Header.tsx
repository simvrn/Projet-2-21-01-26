import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { Navigation } from './Navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-surface-light/60 backdrop-blur-xl border-b border-dark-700/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-dark-100 group-hover:text-accent-400 transition-colors">
              Life Dashboard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-dark-700/50 text-dark-300 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-dark-700/50 bg-surface-light/95 backdrop-blur-xl">
          <div className="px-4 py-3">
            <Navigation mobile onItemClick={() => setIsMenuOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
