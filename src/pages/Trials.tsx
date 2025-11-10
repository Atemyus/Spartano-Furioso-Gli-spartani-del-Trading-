import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  ArrowLeft,
  TrendingUp,
  Star,
  Gift,
  Rocket,
  Target,
  Award,
  PlayCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  features: string[];
  trialDays: number;
  category?: string;
  badge?: string;
  metrics?: {
    winRate?: number;
    avgProfit?: number;
  };
  pricingPlans?: any;
}

interface Trial {
  id: string;
  productId: string;
  productName: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  status: 'active' | 'expired' | 'converted';
}

const Trials: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTrials, setActiveTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      // Fetch prodotti disponibili per trial
      const productsResponse = await fetch(`http://localhost:3001/api/products?t=${Date.now()}`, {
        cache: 'no-cache'
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        // Filtra solo i prodotti con trial disponibile
        const triableProducts = productsData.filter((p: Product) => p.trialDays > 0);
        setProducts(triableProducts);
      }

      // TODO: Fetch trial attivi dell'utente
      // const trialsResponse = await fetch('http://localhost:3001/api/user/trials', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // if (trialsResponse.ok) {
      //   const trialsData = await trialsResponse.json();
      //   setActiveTrials(trialsData);
      // }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async (productId: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/trials/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        alert('Trial attivato con successo!');
        fetchData(); // Ricarica i dati
      } else {
        const error = await response.json();
        alert(error.message || 'Errore nell\'attivazione del trial');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      alert('Errore nell\'attivazione del trial');
    }
  };

  const categories = [
    { id: 'all', name: 'TUTTI', icon: Gift, color: 'from-yellow-600 to-red-600' },
    { id: 'bot', name: 'BOT TRADING', icon: Shield, color: 'from-red-600 to-red-800' },
    { id: 'indicator', name: 'INDICATORI', icon: TrendingUp, color: 'from-blue-600 to-purple-600' },
    { id: 'course', name: 'FORMAZIONE', icon: Star, color: 'from-purple-600 to-pink-600' },
    { id: 'service', name: 'SERVIZI', icon: Zap, color: 'from-green-600 to-emerald-600' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => {
        const pCategory = (p.category || 'bot').toLowerCase();
        if (selectedCategory === 'bot') return pCategory.includes('bot');
        if (selectedCategory === 'indicator') return pCategory.includes('indicator') || pCategory.includes('indicat');
        if (selectedCategory === 'course') return pCategory.includes('formazione') || pCategory.includes('course');
        if (selectedCategory === 'service') return pCategory.includes('service') || pCategory.includes('signal');
        return false;
      });

  const isTrialActive = (productId: string) => {
    return activeTrials.some(t => t.productId === productId && t.status === 'active');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-black via-gray-950 to-black'
          : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-black via-gray-950 to-black'
        : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`backdrop-blur-sm border-b ${
        theme === 'dark'
          ? 'bg-black/50 border-red-900/30'
          : 'bg-white border-red-200'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-yellow-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Torna alla Dashboard</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Gift className="w-10 h-10 text-yellow-500" />
              <h1 className="text-2xl font-black">
                <span className="text-red-600">PROVE</span>
                <span className="text-white ml-2">GRATUITE</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <Rocket className="w-8 h-8 text-red-600 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-black">
              <span className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
                60 GIORNI
              </span>
              <span className="text-white ml-3">DI PROVA GRATUITA</span>
            </h2>
            <Rocket className="w-8 h-8 text-red-600 scale-x-[-1] animate-pulse" />
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Testa qualsiasi bot o servizio per 
            <span className="text-yellow-500 font-bold"> 60 giorni completamente gratis</span>. 
            Nessuna carta di credito richiesta!
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-800 rounded-xl p-4 text-center">
            <Target className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">100%</div>
            <div className="text-sm text-gray-400">Gratuito</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-800 rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">60</div>
            <div className="text-sm text-gray-400">Giorni di prova</div>
          </div>
          <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-800 rounded-xl p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">NO</div>
            <div className="text-sm text-gray-400">Carta richiesta</div>
          </div>
          <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-800 rounded-xl p-4 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">FULL</div>
            <div className="text-sm text-gray-400">Accesso completo</div>
          </div>
        </div>

        {/* Active Trials Section */}
        {activeTrials.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-green-500" />
              I TUOI TRIAL ATTIVI
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {activeTrials.map(trial => (
                <div key={trial.id} className="bg-gray-900/50 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{trial.productName}</h4>
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Trial Attivo</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-yellow-500">{trial.daysRemaining}</div>
                      <div className="text-xs text-gray-400">giorni rimanenti</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 px-4 py-2 bg-yellow-600 rounded-lg font-bold text-white hover:bg-yellow-500 transition-colors"
                    >
                      Vai al Prodotto
                    </button>
                    <button className="px-4 py-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors">
                      Converti in Abbonamento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  group relative px-6 py-3 rounded-xl font-bold transition-all duration-300
                  ${selectedCategory === category.id 
                    ? `bg-gradient-to-r ${category.color} text-white scale-105 shadow-lg shadow-red-500/20` 
                    : 'bg-gray-900/50 border border-red-900/30 text-gray-400 hover:border-yellow-500/50 hover:text-white'
                  }
                `}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products with Trial */}
        <div className="mb-12">
          <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
            <Gift className="w-6 h-6 text-yellow-500" />
            PRODOTTI DISPONIBILI PER LA PROVA
          </h3>
          
          {filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isTrial = isTrialActive(product.id);
                return (
                  <div 
                    key={product.id}
                    className="bg-gray-900/50 border border-red-900/30 rounded-xl p-6 hover:border-yellow-500/50 transition-all"
                  >
                    {/* Badge */}
                    {product.badge && (
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                          {product.badge}
                        </span>
                      </div>
                    )}

                    <h4 className="text-xl font-bold text-white mb-2">{product.name}</h4>
                    <p className="text-gray-400 mb-4 text-sm">{product.description}</p>

                    {/* Trial Info */}
                    <div className="bg-black/30 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Durata prova:</span>
                        <span className="text-yellow-500 font-bold">{product.trialDays} giorni</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    {product.metrics && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {product.metrics.winRate && (
                          <div className="bg-green-900/20 rounded-lg p-2 text-center">
                            <div className="text-green-400 text-xs">Win Rate</div>
                            <div className="text-white font-bold">{product.metrics.winRate}%</div>
                          </div>
                        )}
                        {product.metrics.avgProfit && (
                          <div className="bg-blue-900/20 rounded-lg p-2 text-center">
                            <div className="text-blue-400 text-xs">Profit Medio</div>
                            <div className="text-white font-bold">+{product.metrics.avgProfit}%</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Features Preview */}
                    <ul className="space-y-2 mb-6">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                      {product.features.length > 3 && (
                        <li className="text-gray-500 text-sm ml-6">
                          +{product.features.length - 3} altre funzionalità
                        </li>
                      )}
                    </ul>

                    {/* CTA Button */}
                    {isTrial ? (
                      <button 
                        disabled
                        className="w-full py-3 bg-gray-800 rounded-lg font-bold text-gray-500 cursor-not-allowed"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Trial Attivo
                        </span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => startTrial(product.id)}
                        className="w-full py-3 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-red-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <Rocket className="w-5 h-5" />
                        INIZIA PROVA GRATUITA
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-900/50 border-2 border-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">Nessun prodotto disponibile</h3>
              <p className="text-gray-500">Non ci sono prodotti con prova gratuita in questa categoria</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-red-950/50 via-yellow-950/50 to-red-950/50 border-2 border-yellow-500/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="text-center">
            <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-4">Come Funziona?</h3>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl">
                  1
                </div>
                <h4 className="text-white font-bold mb-2">Scegli il Prodotto</h4>
                <p className="text-gray-300 text-sm">Seleziona il bot o servizio che vuoi provare</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl">
                  2
                </div>
                <h4 className="text-white font-bold mb-2">Attiva il Trial</h4>
                <p className="text-gray-300 text-sm">60 giorni di accesso completo, gratis</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl">
                  3
                </div>
                <h4 className="text-white font-bold mb-2">Valuta e Decidi</h4>
                <p className="text-gray-300 text-sm">Converti in abbonamento solo se soddisfatto</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trials;
