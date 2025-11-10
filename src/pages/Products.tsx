import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import ProductsSection from '../components/ProductsSection';
import { useTheme } from '../contexts/ThemeContext';

const Products: React.FC = () => {
  // Verifica se l'utente è autenticato
  const isAuthenticated = !!localStorage.getItem('token');
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-black via-gray-950 to-black'
        : 'bg-gradient-to-b from-white via-gray-50 to-white'
    }`}>
      {/* Header della dashboard - solo se autenticato */}
      {isAuthenticated && (
        <div className={`backdrop-blur-sm border-b ${
          theme === 'dark'
            ? 'bg-black/50 border-red-900/30'
            : 'bg-white/50 border-red-200'
        }`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className={`flex items-center gap-3 transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-yellow-500'
                  : 'text-gray-600 hover:text-yellow-600'
              }`}>
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold">Torna alla Dashboard</span>
              </Link>
              
              <div className="flex items-center gap-3">
                <Shield className="w-10 h-10 text-yellow-500" />
                <h1 className="text-2xl font-black">
                  <span className="text-red-600">SPARTANO</span>
                  <span className={`ml-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>SHOP</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sezione Arsenale Spartano - il componente completo dalla homepage */}
      <ProductsSection />
    </div>
  );
};

export default Products;
