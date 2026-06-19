import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductsSection from '../components/ProductsSection';
import { useTheme } from '../contexts/ThemeContext';

const Products: React.FC = () => {
  // Verifica se l'utente è autenticato
  const isAuthenticated = !!localStorage.getItem('token');
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <div className={`min-h-screen ${dark ? 'bg-black' : 'bg-slate-50'}`}>
      {/* Topbar dashboard-style - solo se autenticato */}
      {isAuthenticated && (
        <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${
          dark ? 'bg-black/70 border-slate-800/80' : 'bg-white/70 border-slate-200'
        }`}>
          <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <Link
              to="/dashboard"
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-semibold transition-all ${
                dark
                  ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <div className="text-center">
              <div className={`font-mono-lab text-[0.65rem] tracking-[0.3em] uppercase ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                // Nexora Lab
              </div>
              <div className={`font-display text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                Catalogo
              </div>
            </div>
            <img
              src="/logo.png"
              alt="Nexora Lab"
              className={`h-8 w-auto ${dark ? '' : 'bg-slate-900 rounded-lg px-2 py-1'}`}
            />
          </div>
        </header>
      )}

      {/* Sezione Catalogo - il componente completo dalla homepage */}
      <ProductsSection />
    </div>
  );
};

export default Products;
