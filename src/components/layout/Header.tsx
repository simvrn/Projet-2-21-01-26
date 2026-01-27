import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Navigation } from './Navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-surface/90 backdrop-blur-md border-b border-noir-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-md bg-gold-400/10 border border-gold-400/20 flex items-center justify-center group-hover:border-gold-400/40 transition-colors">
              <span className="text-gold-400 font-serif text-lg font-semibold">S</span>
            </div>
            <span className="text-lg font-serif text-ivory-200 group-hover:text-gold-400 transition-colors tracking-wide">
              Simon Vrny
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-ivory-200/5 text-ivory-400 hover:text-ivory-200 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-noir-800 bg-surface/98 backdrop-blur-md">
          <div className="px-4 py-3">
            <Navigation mobile onItemClick={() => setIsMenuOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
