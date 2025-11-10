import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Key,
  Zap,
  DollarSign,
  Target,
  TrendingUp,
  Shield,
  Calendar,
  Newspaper,
  Sliders,
  BarChart3,
  Layers
} from 'lucide-react';
import { eaParameterSections } from '../data/eaParameters';

interface EAParametersCompleteProps {
  theme: 'light' | 'dark';
  expandedSections: { [key: string]: boolean };
  toggleSection: (section: string) => void;
}

const iconMap: { [key: string]: React.ReactNode } = {
  Key: <Key className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Newspaper: <Newspaper className="w-5 h-5" />,
  Sliders: <Sliders className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />
};

const colorMap: { [key: string]: string } = {
  yellow: 'text-yellow-500',
  green: 'text-green-500',
  blue: 'text-blue-500',
  red: 'text-red-500',
  purple: 'text-purple-500',
  orange: 'text-orange-500',
  cyan: 'text-cyan-500',
  pink: 'text-pink-500',
  indigo: 'text-indigo-500',
  teal: 'text-teal-500',
  violet: 'text-violet-500',
  emerald: 'text-emerald-500'
};

const EAParametersComplete: React.FC<EAParametersCompleteProps> = ({
  theme,
  expandedSections,
  toggleSection
}) => {
  return (
    <div className={`border rounded-xl p-6 mb-8 ${
      theme === 'dark'
        ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-800'
        : 'bg-white border-green-300 shadow-lg'
    }`}>
      <h3 className={`text-2xl font-black mb-2 flex items-center gap-2 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        <Sliders className="w-7 h-7 text-green-500" />
        ⚙️ Input Parameters EA
      </h3>
      <p className={`mb-6 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Tutti i parametri configurabili dell'Expert Advisor. Clicca su ogni sezione per espandere i dettagli.
      </p>

      <div className="space-y-3">
        {eaParameterSections.map((section) => (
          <div
            key={section.id}
            className={`border rounded-lg overflow-hidden ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
            }`}
          >
            <button
              onClick={() => toggleSection(section.id)}
              className={`w-full p-4 flex items-center justify-between transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 hover:bg-gray-800' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={colorMap[section.color]}>
                  {iconMap[section.icon]}
                </span>
                <span className={`font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{section.title}</span>
              </div>
              {expandedSections[section.id] ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {expandedSections[section.id] && (
              <div className={`p-4 ${
                theme === 'dark' ? 'bg-black/30' : 'bg-white'
              }`}>
                <div className={`${
                  section.parameters.length > 4 ? 'grid md:grid-cols-2 gap-3' : 'space-y-3'
                }`}>
                  {section.parameters.map((param, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold ${colorMap[section.color]}`}>
                          {param.name}
                        </span>
                        <span className="text-xs text-gray-500">{param.type}</span>
                      </div>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {param.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EAParametersComplete;
