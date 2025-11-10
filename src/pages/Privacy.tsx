import React from 'react';
import { Shield, Lock, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Privacy = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen pt-24 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          PRIVACY POLICY
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
              }`}>1. Raccolta Dati</h2>
              <p>Raccogliamo solo i dati necessari per fornire i nostri servizi di trading e formazione.</p>
            </section>
            <section>
              <h2 className={`text-2xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>2. Uso dei Dati</h2>
              <p>I tuoi dati sono utilizzati esclusivamente per migliorare la tua esperienza di trading.</p>
            </section>
            <section>
              <h2 className={`text-2xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>3. Protezione</h2>
              <p>Utilizziamo le piÃ¹ moderne tecnologie di crittografia per proteggere i tuoi dati.</p>
            </section>
            <section>
              <h2 className={`text-2xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>4. Diritti dell'Utente</h2>
              <p>Hai il diritto di accedere, modificare o cancellare i tuoi dati in qualsiasi momento.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
