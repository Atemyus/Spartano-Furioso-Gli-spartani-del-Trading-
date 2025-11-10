import React from 'react';
import { Mic, Headphones, Radio } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Podcast = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          PODCAST SPARTANO
        </h1>
        <p className={`mb-8 ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-300'
        }`}>Episodi settimanali con i migliori trader e analisti</p>
        <div className="space-y-6">
          {[1,2,3,4].map(i => (
            <div key={i} className={`rounded-lg p-6 flex items-center gap-6 ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 shadow-lg'
                : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
            }`}>
              <Mic className="w-12 h-12 text-yellow-500" />
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-800' : 'text-white'
                }`}>Episodio {i}: Trading Spartano</h3>
                <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Durata: 45 min</p>
              </div>
              <button className={`px-4 py-2 text-white rounded-lg transition-all hover:scale-105 ${
                theme === 'light' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-600 hover:bg-red-700'
              }`}>Ascolta</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Podcast;
