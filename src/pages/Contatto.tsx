import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Contatto = () => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          CONTATTO DIRETTO
        </h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Inviaci un messaggio</h2>
            <form className="space-y-4">
              <input type="text" placeholder="Nome" className={`w-full p-3 border rounded-lg ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-800'
                  : 'bg-gray-900 border-red-800/30 text-white'
              }`} />
              <input type="email" placeholder="Email" className={`w-full p-3 border rounded-lg ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-800'
                  : 'bg-gray-900 border-red-800/30 text-white'
              }`} />
              <textarea placeholder="Messaggio" rows={5} className={`w-full p-3 border rounded-lg ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-800'
                  : 'bg-gray-900 border-red-800/30 text-white'
              }`}></textarea>
              <button className={`px-6 py-3 text-white rounded-lg flex items-center gap-2 hover:scale-105 transition-all border-2 ${
                theme === 'light'
                  ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-700 shadow-md'
                  : 'bg-red-600 hover:bg-red-700 border-transparent'
              }`}>
                Invia <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold mb-6 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Informazioni di contatto</h2>
            <div className="flex items-center gap-4">
              <Mail className="w-6 h-6 text-yellow-500" />
              <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>info@spartanofurioso.com</span>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="w-6 h-6 text-yellow-500" />
              <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>+39 XXX XXX XXXX</span>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-6 h-6 text-yellow-500" />
              <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>Italia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contatto;
