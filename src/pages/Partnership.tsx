import React from 'react';
import { Handshake, Users, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Partnership = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          PARTNERSHIP
        </h1>
        <p className={`mb-12 ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-300'
        }`}>Unisciti a noi come partner strategico</p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
          }`}>
            <Handshake className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Partner Tecnologici</h3>
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Integrazione con piattaforme e broker</p>
          </div>
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
          }`}>
            <Users className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Partner Educativi</h3>
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Formazione e corsi congiunti</p>
          </div>
          <div className={`rounded-lg p-6 ${
            theme === 'light'
              ? 'bg-white border-2 border-gray-200 shadow-lg'
              : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
          }`}>
            <TrendingUp className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Partner Commerciali</h3>
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>OpportunitÃ  di business e crescita</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partnership;
