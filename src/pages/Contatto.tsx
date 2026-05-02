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
        <span className="font-mono-lab text-xs text-cyan-400 tracking-[0.3em] uppercase">// Contact</span>
        <h1 className={`font-display text-5xl md:text-6xl font-bold mt-2 mb-4 tracking-tight ${
          theme === 'light' ? 'text-slate-900' : 'text-white'
        }`}>
          Parliamo di <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">numeri</span>
        </h1>
        <p className={`mb-10 text-lg max-w-2xl ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-300'
        }`}>Hai un progetto, una domanda o vuoi capire quale modulo del lab è più adatto a te? Scrivici.</p>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className={`font-display text-2xl font-semibold mb-5 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>Inviaci un messaggio</h2>
            <form className="space-y-4">
              <input type="text" placeholder="Nome" className={`w-full p-3 border rounded-lg ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-800'
                  : 'bg-gray-900 border-blue-800/30 text-white'
              }`} />
              <input type="email" placeholder="Email" className={`w-full p-3 border rounded-lg ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-800'
                  : 'bg-gray-900 border-blue-800/30 text-white'
              }`} />
              <textarea placeholder="Messaggio" rows={5} className={`w-full p-3 border rounded-lg ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-800'
                  : 'bg-gray-900 border-blue-800/30 text-white'
              }`}></textarea>
              <button className={`px-6 py-3 text-white rounded-lg flex items-center gap-2 hover:scale-105 transition-all border-2 ${
                theme === 'light'
                  ? 'bg-cyan-500 hover:bg-cyan-600 border-cyan-700 shadow-md'
                  : 'bg-blue-600 hover:bg-blue-700 border-transparent'
              }`}>
                Invia <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="space-y-5">
            <h2 className={`font-display text-2xl font-semibold mb-5 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>Canali diretti</h2>
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase block">// Email</span>
                <span className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>info@spartanofurioso.com</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase block">// Phone</span>
                <span className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>+39 XXX XXX XXXX</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="font-mono-lab text-xs text-cyan-500 tracking-widest uppercase block">// Location</span>
                <span className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Italia · Operativi globalmente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contatto;
