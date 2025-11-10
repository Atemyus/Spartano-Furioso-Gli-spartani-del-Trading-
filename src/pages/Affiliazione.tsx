import React from 'react';
import { DollarSign, Users, Gift } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Affiliazione = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          PROGRAMMA AFFILIAZIONE
        </h1>
        <p className={`mb-12 ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-300'
        }`}>Guadagna condividendo il successo spartano</p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
          }`}>
            <DollarSign className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Commissioni Alte</h3>
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Fino al 50% di commissione ricorrente</p>
          </div>
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
          }`}>
            <Users className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Supporto Dedicato</h3>
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Team dedicato per il tuo successo</p>
          </div>
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
          }`}>
            <Gift className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Bonus e Premi</h3>
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Incentivi extra per top performer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Affiliazione;
