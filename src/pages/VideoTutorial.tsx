import React from 'react';
import { PlayCircle, Youtube } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const VideoTutorial = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          VIDEO TUTORIAL
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className={`rounded-lg overflow-hidden ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 shadow-lg'
                : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30'
            }`}>
              <div className={`h-40 flex items-center justify-center ${
                theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'
              }`}>
                <PlayCircle className="w-16 h-16 text-yellow-500" />
              </div>
              <div className="p-4">
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === 'light' ? 'text-gray-800' : 'text-white'
                }`}>Tutorial {i}</h3>
                <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Impara le strategie spartane</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoTutorial;
