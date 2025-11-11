import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductConfig } from '../hooks/useProductConfig';
import { useTheme } from '../contexts/ThemeContext';
import PaymentOptionsModal from './PaymentOptionsModal';
import { 
  X, 
  Shield, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Cpu,
  Users,
  Award,
  Zap,
  Star,
  Play,
  DollarSign,
  Loader2,
  Monitor
} from 'lucide-react';

interface PricingPlan {
  price: number;
  originalPrice?: number;
  interval: string;
  savings?: string;
}

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
    monthly?: PricingPlan;
    yearly?: PricingPlan;
    lifetime?: PricingPlan;
    oneTime?: PricingPlan;
    payment3?: PricingPlan;
    vip?: PricingPlan;
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
  popular?: boolean;
  badge?: string | null;
  badgeColor?: string;
  stock?: number;
  metrics?: any;
  trialDays?: number;
  performance?: any;
  trial?: {
    available: boolean;
    days: number;
    features?: string[];
  };
  status?: 'active' | 'coming-soon' | 'beta' | 'soldout';
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: (product: Product) => void;
  onPurchase: (product: Product, plan: 'monthly' | 'yearly' | 'lifetime') => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onStartTrial,
  onPurchase 
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loadingTrial, setLoadingTrial] = useState(false);
  const [loadingPurchase, setLoadingPurchase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('lifetime');
  const [selectedPlanPrice, setSelectedPlanPrice] = useState(0);
  const [selectedPlanOriginalPrice, setSelectedPlanOriginalPrice] = useState<number | undefined>();
  
  // Load dynamic product configuration (platforms, etc.)
  const { config, loading: configLoading } = useProductConfig(product?.id);

  if (!isOpen || !product) return null;

  // Debug: log product data
  console.log('ProductModal - Full product data:', product);
  console.log('ProductModal - pricingPlans:', product.pricingPlans);
  console.log('ProductModal - requirements:', product.requirements);
  console.log('ProductModal - platforms:', product.platforms);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return `€${price.toLocaleString('it-IT')}`;
  };

  const getSavings = (monthly: number, yearly: number) => {
    const yearlyEquivalent = monthly * 12;
    const savings = yearlyEquivalent - yearly;
    const percentage = Math.round((savings / yearlyEquivalent) * 100);
    return { amount: savings, percentage };
  };

  // Gestione Trial Gratuito - Reindirizza alla pagina di attivazione
  const handleStartTrial = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Redirect to login if not authenticated
      const redirectPath = `/trial-activation/${product.id}`;
      navigate('/login', { state: { from: redirectPath } });
      return;
    }

    // Prima controlla se ha già un trial attivo
    try {
      const response = await fetch(`http://localhost:3001/api/products/trial-status/${product.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.hasTrial && data.trial && data.trial.active) {
          // Ha già un trial attivo, reindirizza alla gestione
          onClose();
          
          if (product.category === 'Formazione') {
            // Per formazione, vai alla gestione del trial
            navigate(`/course/${product.id}/manage-trial`);
          } else {
            // Per altri prodotti, vai alla dashboard sezione trials
            navigate('/dashboard', { state: { activeTab: 'trials' } });
          }
        } else {
          // Non ha trial attivo, vai alla pagina di attivazione
          onClose();
          if (product.category === 'Formazione' || product.category === 'course') {
            navigate(`/course/${product.id}/trial`);
          } else {
            navigate(`/trial-activation/${product.id}`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
      // In caso di errore, vai comunque alla pagina di attivazione
      onClose();
      if (product.category === 'Formazione' || product.category === 'course') {
        navigate(`/course/${product.id}/trial`);
      } else {
        navigate(`/trial-activation/${product.id}`);
      }
    }
  };

  // Gestione Acquisto - Apre il PaymentOptionsModal
  const handlePurchase = (plan: 'monthly' | 'yearly' | 'lifetime') => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Determina il prezzo e il prezzo originale in base al piano
    let price = 0;
    let originalPrice: number | undefined = undefined;

    if (plan === 'monthly') {
      if (product.pricingPlans?.monthly) {
        price = product.pricingPlans.monthly.price;
        originalPrice = product.pricingPlans.monthly.originalPrice;
      } else if (typeof product.price === 'object' && product.price.monthly) {
        price = product.price.monthly;
      }
    } else if (plan === 'yearly') {
      if (product.pricingPlans?.yearly) {
        price = product.pricingPlans.yearly.price;
        originalPrice = product.pricingPlans.yearly.originalPrice;
      } else if (typeof product.price === 'object' && product.price.yearly) {
        price = product.price.yearly;
      }
    } else if (plan === 'lifetime') {
      // Per corsi (categoria Formazione), usa oneTime pricing
      if (product.category === 'Formazione' || product.type === 'one-time') {
        if (product.pricingPlans?.oneTime) {
          price = product.pricingPlans.oneTime.price;
          originalPrice = product.pricingPlans.oneTime.originalPrice;
        } else if (typeof product.price === 'number') {
          price = product.price;
          originalPrice = product.originalPrice;
        }
      } else {
        // Per bot/indicatori, usa lifetime pricing
        if (product.pricingPlans?.lifetime) {
          price = product.pricingPlans.lifetime.price;
          originalPrice = product.pricingPlans.lifetime.originalPrice;
        } else if (typeof product.price === 'object' && product.price.lifetime) {
          price = product.price.lifetime;
        }
      }
    }

    // Imposta i valori per il PaymentOptionsModal
    setSelectedPlan(plan);
    setSelectedPlanPrice(price);
    setSelectedPlanOriginalPrice(originalPrice);
    setIsPaymentModalOpen(true);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm ${
          theme === 'dark' ? 'bg-black/80' : 'bg-gray-900/50'
        }`}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className={`relative w-full max-w-6xl max-h-[90vh] border-2 border-red-800 rounded-3xl overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-900 to-black'
          : 'bg-gradient-to-b from-white to-gray-50'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 z-10 w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-red-900/50 hover:border-red-600 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-black/50 border-red-800/50'
              : 'bg-white border-red-200'
          }`}
        >
          <X className={`w-5 h-5 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`} />
        </button>

        {/* Content */}
        <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
          {/* Notifiche */}
          {(error || success) && (
            <div className={`p-4 m-4 rounded-lg border ${
              error 
                ? 'bg-red-900/20 border-red-600 text-red-400' 
                : 'bg-green-900/20 border-green-600 text-green-400'
            }`}>
              <div className="flex items-center gap-3">
                {error ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{success}</span>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className={`relative p-8 border-b ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-red-950/50 via-black/50 to-red-950/50 border-red-800/30'
              : 'bg-gradient-to-r from-red-50/80 via-white/80 to-red-50/80 border-red-200'
          }`}>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className={`text-4xl font-black ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{product.name}</h2>
                  {product.badge && (
                    <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-bold rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>
                <p className={`text-lg mb-4 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>{product.description}</p>
                
                {/* Quick Stats */}
                {product.performance && (
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className={`font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Win Rate: {product.performance.winRate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className={`font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Avg Profit: {product.performance.avgProfit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span className={`font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Trades: {product.performance.trades}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 p-8">
            {/* Left Column - Features & Details */}
            <div className="space-y-8">
              {/* Features */}
              <div>
                <h3 className={`text-2xl font-black mb-6 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <Zap className="w-6 h-6 text-yellow-500" />
                  CARATTERISTICHE PRINCIPALI
                </h3>
                <div className="space-y-3">
                  {product.features.map((feature, index) => (
                    <div key={index} className={`flex items-start gap-3 p-3 border rounded-lg hover:border-yellow-500/30 transition-colors ${
                      theme === 'dark'
                        ? 'bg-black/30 border-red-900/20'
                        : 'bg-white border-red-200'
                    }`}>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {product.requirements && product.requirements.length > 0 && (
                <div>
                  <h3 className={`text-xl font-black mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    REQUISITI
                  </h3>
                  <div className="space-y-2">
                    {product.requirements.map((req, index) => (
                      <div key={index} className={`flex items-center gap-3 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platforms - Use dynamic config if available */}
              {((config?.platforms && config.platforms.length > 0) || (product.platforms && product.platforms.length > 0)) && (
                <div>
                  <h3 className={`text-xl font-black mb-4 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Cpu className="w-5 h-5 text-blue-500" />
                    PIATTAFORME SUPPORTATE
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(config?.platforms || product.platforms || []).map((platform, index) => (
                      <span key={index} className={`px-4 py-2 border border-blue-500/30 rounded-lg font-semibold ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-white'
                          : 'bg-gradient-to-r from-blue-50 to-purple-50 text-gray-900'
                      }`}>
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Pricing & Trial */}
            <div className="space-y-8">
              {/* Trial Section */}
              {product.trial && product.trial.available && (
                <div className={`border-2 rounded-2xl p-6 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-green-950/30 to-emerald-950/30 border-green-500/30'
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-lg'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>PROVA GRATUITA</h3>
                      <p className="text-green-400 font-bold">{product.trial.days} GIORNI - NESSUNA CARTA RICHIESTA</p>
                    </div>
                  </div>
                  
                  {product.trial.features && (
                    <div className="space-y-2 mb-6">
                      {product.trial.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={handleStartTrial}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 border-2 border-green-400 rounded-xl font-black text-white text-lg hover:from-green-500 hover:to-emerald-500 hover:border-green-300 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group"
                  >
                    <Play className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    INIZIA LA PROVA GRATUITA
                  </button>
                </div>
              )}

              {/* Pricing Plans */}
              <div>
                <h3 className={`text-2xl font-black mb-6 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <DollarSign className="w-6 h-6 text-yellow-500" />
                  {product.category === 'Formazione' ? 'OPZIONI DI ACQUISTO' : 'PIANI DI ABBONAMENTO'}
                </h3>
                
                <div className="space-y-4">
                  {/* Monthly Plan - Hide for Formazione */}
                  {product.category !== 'Formazione' && (product.pricingPlans?.monthly || (typeof product.price === 'object' && product.price.monthly)) && (
                    <div className={`border rounded-xl p-5 hover:border-yellow-500/50 transition-colors ${
                      theme === 'dark'
                        ? 'bg-black/30 border-red-900/30'
                        : 'bg-white border-red-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className={`text-lg font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>MENSILE</h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>Fatturazione mensile</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-black ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatPrice(product.pricingPlans?.monthly?.price || (typeof product.price === 'object' ? product.price.monthly : product.price) || 0)}
                          </div>
                          <div className="text-sm text-gray-400">/mese</div>
                          {product.pricingPlans?.monthly?.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.pricingPlans.monthly.originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePurchase('monthly')}
                        disabled={loadingPurchase === 'monthly'}
                        className="w-full px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 border border-red-800/50 rounded-lg font-bold text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {loadingPurchase === 'monthly' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Elaborazione...
                          </>
                        ) : (
                          'Scegli Mensile'
                        )}
                      </button>
                    </div>
                  )}

                  {/* Yearly Plan - Hide for Formazione */}
                  {product.category !== 'Formazione' && (product.pricingPlans?.yearly || (typeof product.price === 'object' && product.price.yearly)) && (
                    <div className={`border-2 rounded-xl p-5 relative ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-yellow-950/20 to-orange-950/20 border-yellow-500/50'
                        : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-lg'
                    }`}>
                      {product.pricingPlans?.yearly?.savings && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-black rounded-full">
                            {product.pricingPlans.yearly.savings}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className={`text-lg font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>ANNUALE</h4>
                          <p className="text-sm text-yellow-400 font-semibold">Più popolare - Miglior valore</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-black ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatPrice(product.pricingPlans?.yearly?.price || (typeof product.price === 'object' ? product.price.yearly : 0) || 0)}
                          </div>
                          <div className="text-sm text-gray-400">/anno</div>
                          {product.pricingPlans?.yearly?.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.pricingPlans.yearly.originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePurchase('yearly')}
                        disabled={loadingPurchase === 'yearly'}
                        className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {loadingPurchase === 'yearly' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Elaborazione...
                          </>
                        ) : (
                          'Scegli Annuale'
                        )}
                      </button>
                    </div>
                  )}

                  {/* Lifetime Plan - Hide for Formazione */}
                  {product.category !== 'Formazione' && (product.pricingPlans?.lifetime || (typeof product.price === 'object' && product.price.lifetime)) && (
                    <div className={`border-2 rounded-xl p-5 relative ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-red-950/30 to-purple-950/30 border-red-500/50'
                        : 'bg-gradient-to-br from-red-50 to-purple-50 border-red-400 shadow-lg'
                    }`}>
                      {product.pricingPlans?.lifetime?.savings && (
                        <div className="absolute -top-3 right-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-purple-600 text-white text-xs font-black rounded-full">
                            {product.pricingPlans.lifetime.savings}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className={`text-lg font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>LIFETIME</h4>
                          <p className="text-sm text-red-400 font-semibold">Accesso a vita - Nessun rinnovo</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-black ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatPrice(product.pricingPlans?.lifetime?.price || (typeof product.price === 'object' ? product.price.lifetime : 0) || 0)}
                          </div>
                          <div className="text-sm text-gray-400">pagamento unico</div>
                          {product.pricingPlans?.lifetime?.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.pricingPlans.lifetime.originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePurchase('lifetime')}
                        disabled={loadingPurchase === 'lifetime'}
                        className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-purple-600 border-2 border-red-400 rounded-lg font-bold text-white hover:from-red-500 hover:to-purple-500 hover:border-red-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {loadingPurchase === 'lifetime' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Elaborazione...
                          </>
                        ) : (
                          <>
                            <Star className="w-5 h-5" />
                            Acquista Lifetime
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* One-time Payment for courses and Formazione */}
                  {(product.category === 'Formazione' || (product.type === 'one-time' && product.pricingPlans?.oneTime)) && (
                    <div className={`border-2 rounded-xl p-5 relative ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-purple-950/30 to-pink-950/30 border-purple-500/50'
                        : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-400 shadow-lg'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className={`text-lg font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>PAGAMENTO UNICO</h4>
                          <p className="text-sm text-purple-400 font-semibold">Accesso completo al corso</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-black ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formatPrice(product.pricingPlans?.oneTime?.price || 
                                       (typeof product.price === 'number' ? product.price : 0) || 0)}
                          </div>
                          {(product.pricingPlans?.oneTime?.originalPrice || product.originalPrice) && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.pricingPlans?.oneTime?.originalPrice || product.originalPrice || 0)}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePurchase('lifetime')}
                        disabled={loadingPurchase === 'lifetime'}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg font-bold text-white hover:from-purple-500 hover:to-pink-500 hover:border-purple-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {loadingPurchase === 'lifetime' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Elaborazione...
                          </>
                        ) : (
                          'Acquista Ora'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Platforms Section - Show for Bot, Indicators and Services */}
              {(product.category === 'bot' || product.category === 'indicator' || product.category === 'service' || 
                product.category === 'Bot' || product.category === 'Indicatori' || product.category === 'Servizi') && 
               (config?.platforms || product.platforms) && 
               ((config?.platforms && config.platforms.length > 0) || 
                (product.platforms && product.platforms.length > 0)) && (
                <div className="bg-gradient-to-r from-purple-950/20 via-pink-950/20 to-purple-950/20 border border-purple-500/30 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-purple-400" />
                    PIATTAFORME SUPPORTATE
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(config?.platforms || product.platforms || []).map((platform, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-purple-900/30 border border-purple-700 rounded-lg text-purple-300 text-sm font-medium"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Guarantees */}
              <div className="bg-gradient-to-r from-blue-950/20 via-purple-950/20 to-blue-950/20 border border-blue-500/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  GARANZIE SPARTANE
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Garanzia soddisfatti o rimborsati 30 giorni</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Supporto prioritario 24/7</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Aggiornamenti gratuiti a vita</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>Cancellazione in qualsiasi momento</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Options Modal */}
      <PaymentOptionsModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        productId={product.id}
        productName={`${product.name} - ${
          selectedPlan === 'monthly' ? 'Piano Mensile' :
          selectedPlan === 'yearly' ? 'Piano Annuale' :
          'Accesso a Vita'
        }`}
        price={selectedPlanPrice}
        originalPrice={selectedPlanOriginalPrice}
        productType={product.category === 'bot' || product.category === 'Bot' ? 'bot' :
                     product.category === 'indicator' || product.category === 'Indicatori' ? 'indicator' :
                     product.category === 'service' || product.category === 'Servizi' ? 'service' :
                     'course'}
        plan={selectedPlan}
      />
    </div>
  );
};

export default ProductModal;
