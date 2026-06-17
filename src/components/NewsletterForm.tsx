import React, { useState } from 'react';
import { Send, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NewsletterFormProps {
  source?: string;
  className?: string;
  compact?: boolean;
  placeholder?: string;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ 
  source = 'other', 
  className = '',
  compact = false,
  placeholder = 'La tua email di battaglia'
}) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.nexoralab.solutions';
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        setEmail(''); // Pulisce il campo
        setTimeout(() => setIsSubscribed(false), 5000);
      } else {
        if (data.requiresRegistration) {
          setErrorMessage('⚠️ Questa email non è registrata! Registrati prima al sito.');
        } else {
          setErrorMessage(data.error || 'Errore durante l\'iscrizione');
        }
        setTimeout(() => setErrorMessage(''), 7000);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setErrorMessage('Errore di connessione. Riprova più tardi.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubscribe} className={`relative ${className}`}>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-all duration-300 pr-10"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
            title="Iscriviti"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        {isSubscribed && (
          <div className="absolute -bottom-10 left-0 right-0 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg shadow-lg animate-bounce">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-bold">🎉 Benvenuto nella Falange, Guerriero!</span>
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="absolute -bottom-10 left-0 right-0 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-lg">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-bold">{errorMessage}</span>
            </div>
          </div>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className={`${className}`}>
      <div className="relative mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-6 py-3 border-2 rounded-xl placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-black/50 border-blue-800/50 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          required
        />
        {isSubscribed && (
          <div className="absolute -top-10 left-0 right-0 flex justify-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white rounded-xl shadow-2xl border-2 border-green-400 animate-bounce">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-bold">🎉 Benvenuto nella Falange, Guerriero! Riceverai le nostre strategie di battaglia!</span>
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="absolute -top-10 left-0 right-0 flex justify-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white rounded-xl shadow-2xl border-2 border-blue-400">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-bold">{errorMessage}</span>
            </div>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 hover:from-blue-500 hover:to-blue-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? 'CARICAMENTO...' : 'ARRUOLATI'}
          <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
      </button>
    </form>
  );
};

export default NewsletterForm;
