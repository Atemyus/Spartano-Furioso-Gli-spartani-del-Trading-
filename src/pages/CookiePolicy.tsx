import React from 'react';
import { Cookie, Settings, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const CookiePolicy = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen pt-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          COOKIE POLICY
        </h1>
        <div className={`border rounded-lg p-8 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-gray-900 to-black border-red-800/30'
            : 'bg-gradient-to-b from-white to-gray-50 border-red-200'
        }`}>
          <div className={`space-y-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <section>
              <h2 className={`text-2xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Cosa sono i Cookie</h2>
              <p>I cookie sono piccoli file di testo salvati sul tuo dispositivo per migliorare l'esperienza utente.</p>
            </section>
            <section>
              <h2 className={`text-2xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Cookie Utilizzati</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Cookie tecnici necessari</li>
                <li>Cookie di analisi per migliorare i servizi</li>
                <li>Cookie di preferenza per ricordare le tue scelte</li>
              </ul>
            </section>
            <section>
              <h2 className={`text-2xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Gestione Cookie</h2>
              <p>Puoi gestire o disabilitare i cookie dalle impostazioni del tuo browser.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
