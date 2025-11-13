import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { 
  Shield, 
  TrendingUp, 
  Star, 
  Zap, 
  Filter,
  Flame,
  Crown,
  Swords,
  Target
} from 'lucide-react';

// Interfaccia Product compatibile con l'API
interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number | {
    monthly?: number;
    yearly?: number;
    lifetime?: number;
  };
  pricingPlans?: {
    monthly?: any;
    yearly?: any;
    lifetime?: any;
    oneTime?: any;
    payment3?: any;
    vip?: any;
  };
  originalPrice?: number;
  currency: string;
  type: 'one-time' | 'subscription';
  interval?: string;
  features: string[];
  requirements?: string[];
  platforms?: string[];
  active: boolean;
  image?: string;
  category?: string;
  displayCategory?: string; // Categoria mappata per display e filtering
  popular?: boolean;
  badge?: string | null;
  badgeColor?: string;
  stock?: number;
  metrics?: {
    winRate?: number;
    avgProfit?: number;
    totalTrades?: number;
    profitableMonths?: number;
  };
  trialDays?: number;
  performance?: {
    winRate: string;
    avgProfit: string;
    drawdown?: string;
    trades?: string;
  };
  trial?: {
    available: boolean;
    days: number;
    features?: string[];
  };
  status?: 'active' | 'coming-soon' | 'beta' | 'soldout';
}

const ProductsSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();

  // Fetch prodotti dall'API
  useEffect(() => {
    fetchProducts();
    
    // Ricarica i prodotti quando la pagina torna in focus
    const handleFocus = () => {
      fetchProducts();
    };

    // Ricarica i prodotti ogni 2 secondi per sincronizzazione rapida con admin
    const interval = setInterval(fetchProducts, 2000);
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Apri automaticamente il modal se c'è un productId nell'URL
  useEffect(() => {
    const productId = searchParams.get('product');
    if (productId && products.length > 0) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setIsModalOpen(true);
        // Rimuovi il parametro dall'URL dopo aver aperto il modal
        setSearchParams({});
      }
    }
  }, [products, searchParams, setSearchParams]);

  const fetchProducts = async () => {
    try {
      // Usa API_URL dalla configurazione
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.spartanofurioso.com';
      const response = await fetch(`${apiUrl}/api/products?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('ProductsSection: Fetched', data.length, 'products');
        console.log('First product raw data:', data[0]); // Debug: check raw data structure
        
        // Trasformo i dati per compatibilità con il componente
        const transformedProducts = data.map((p: any) => {
          const transformed = {
            ...p,  // Preserva TUTTI i campi originali inclusi pricingPlans, requirements, platforms
            // Aggiungo solo i campi calcolati/derivati
            trial: {
              available: p.trialDays > 0,
              days: p.trialDays || 0,
              features: []
            },
            // Trasformo metrics in performance se esiste
            performance: p.metrics ? {
              winRate: `${p.metrics.winRate || 0}%`,
              avgProfit: `+${p.metrics.avgProfit || 0}%`,
              drawdown: '',
              trades: ''
            } : undefined,
            // IMPORTANTE: Preserva la categoria originale per il routing corretto!
            // Non sovrascrivere con mapCategory
            displayCategory: mapCategory(p.category), // Usa per display/filtering
            // Status basato su badge
            status: p.badge === 'PROSSIMAMENTE' ? 'coming-soon' : 'active'
          };
          console.log('Transformed product:', transformed.name, '- Has pricingPlans:', !!transformed.pricingPlans, '- Has requirements:', !!transformed.requirements, '- Has platforms:', !!transformed.platforms);
          return transformed;
        });
        
        setProducts(transformedProducts);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mappa le categorie dal backend
  const mapCategory = (category?: string): string => {
    if (!category) return 'bot';
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('bot')) return 'bot';
    if (lowerCat.includes('indicator') || lowerCat.includes('indicat')) return 'indicator';
    if (lowerCat.includes('formazione') || lowerCat.includes('course') || lowerCat.includes('academy')) return 'course';
    if (lowerCat.includes('segnali') || lowerCat.includes('signal') || lowerCat.includes('service')) return 'service';
    return 'bot';
  };

  const categories = [
    { id: 'all', name: 'TUTTI', icon: Crown, color: 'from-yellow-600 to-red-600' },
    { id: 'bot', name: 'BOT TRADING', icon: Shield, color: 'from-red-600 to-red-800' },
    { id: 'indicator', name: 'INDICATORI', icon: TrendingUp, color: 'from-blue-600 to-purple-600' },
    { id: 'course', name: 'FORMAZIONE', icon: Star, color: 'from-purple-600 to-pink-600' },
    { id: 'service', name: 'SERVIZI', icon: Zap, color: 'from-green-600 to-emerald-600' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products.filter(p => p.status === 'active' || p.status === 'beta')
    : products.filter(p => 
        (p.displayCategory === selectedCategory || mapCategory(p.category) === selectedCategory) && 
        (p.status === 'active' || p.status === 'beta')
      );

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleStartTrial = (product: Product) => {
    // La logica vera ora è nel ProductModal
    // Questa callback può essere usata per aggiornare lo stato locale se necessario
    console.log(`Trial attivato per ${product.name}`);
  };

  const handlePurchase = (product: Product, plan: 'monthly' | 'yearly' | 'lifetime') => {
    // La logica vera ora è nel ProductModal
    // Questa callback può essere usata per aggiornare lo stato locale se necessario
    console.log(`Acquisto del piano ${plan} per ${product.name}`);
  };

  return (
    <section id="products" className={`relative py-24 overflow-hidden transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-black via-gray-950 to-black' 
        : 'bg-gradient-to-b from-white via-gray-50 to-white'
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-red-900/10' : 'bg-red-100/30'
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl ${
          theme === 'dark' ? 'bg-yellow-900/10' : 'bg-yellow-100/30'
        }`}></div>
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] ${
          theme === 'dark' ? 'opacity-5' : 'opacity-10'
        }`}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <Swords className="w-8 h-8 text-red-600" />
            <h2 className="text-5xl md:text-6xl font-black">
              <span className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
                ARSENALE
              </span>
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>SPARTANO</span>
            </h2>
            <Swords className="w-8 h-8 text-red-600 scale-x-[-1]" />
          </div>
          <p className={`text-xl max-w-3xl mx-auto font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Scegli le tue armi per dominare i mercati. Ogni strumento è forgiato con la 
            <span className="text-yellow-500"> disciplina spartana</span> e testato in 
            <span className="text-red-500"> battaglia reale</span>.
          </p>
          {/* Debug: mostra numero prodotti e ultimo aggiornamento */}
          <p className={`text-sm mt-2 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {loading ? 'Caricamento...' : `${products.length} prodotti disponibili`} • 
            Aggiornamento: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`
                  group relative px-6 py-3 rounded-xl font-bold transition-all duration-300
                  ${selectedCategory === category.id 
                    ? `bg-gradient-to-r ${category.color} text-white scale-105 shadow-lg shadow-red-500/20` 
                    : theme === 'dark'
                      ? 'bg-gray-900/50 border border-red-900/30 text-gray-400 hover:border-yellow-500/50 hover:text-white'
                      : 'bg-white border border-red-200 text-gray-600 hover:border-yellow-500 hover:text-gray-900'
                  }
                `}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {category.name}
                  {category.id === 'all' && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      theme === 'dark' ? 'bg-black/30' : 'bg-gray-200'
                    }`}>
                      {products.length}
                    </span>
                  )}
                </span>
                {selectedCategory === category.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-xl animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Special Offer Banner */}
        <div className={`mb-12 border-2 border-yellow-500/50 rounded-2xl p-6 backdrop-blur-sm ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-red-950/50 via-yellow-950/50 to-red-950/50'
            : 'bg-gradient-to-r from-red-50/80 via-yellow-50/80 to-red-50/80'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-red-600 rounded-xl flex items-center justify-center animate-pulse">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-black flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  PROVA GRATUITA DISPONIBILE
                  <Flame className="w-5 h-5 text-yellow-500 animate-pulse" />
                </h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Testa qualsiasi bot o servizio senza rischi. 
                  <span className="text-yellow-500 font-bold"> Garanzia soddisfatti o rimborsati!</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400 font-bold">
              <Shield className="w-5 h-5" />
              <span>NESSUNA CARTA RICHIESTA</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewDetails}
                onStartTrial={handleStartTrial}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className={`w-24 h-24 border-2 rounded-full flex items-center justify-center mx-auto mb-6 ${
              theme === 'dark'
                ? 'bg-gray-900/50 border-red-900/30'
                : 'bg-gray-100 border-red-200'
            }`}>
              <Filter className={`w-12 h-12 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`} />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Nessun prodotto trovato</h3>
            <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
              Prova a selezionare una categoria diversa
            </p>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '100+', label: 'Trader Attivi', icon: Shield },
            { value: '€500K+', label: 'Volume Gestito', icon: TrendingUp },
            { value: '95%', label: 'Soddisfazione Clienti', icon: Star },
            { value: '24/7', label: 'Supporto Dedicato', icon: Zap }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300 ${
                  theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-8 h-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                </div>
                <div className={`text-3xl font-black mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{stat.value}</div>
                <div className={`text-sm uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center">
          <div className="inline-flex flex-col items-center">
            <p className={`mb-4 text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Hai domande sui nostri prodotti?
            </p>
            <button 
              onClick={() => window.open('https://t.me/your_telegram_bot', '_blank')}
              className="group px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 rounded-xl font-bold text-white text-lg hover:from-red-500 hover:to-red-700 hover:scale-105 transition-all duration-300 flex items-center gap-3">
              <Shield className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              PARLA CON UN GUERRIERO
              <Shield className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onStartTrial={handleStartTrial}
        onPurchase={handlePurchase}
      />
    </section>
  );
};

export default ProductsSection;
