import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Zap, 
  Star,
  ArrowRight,
  Lock,
  Unlock
} from 'lucide-react';
import { useTrialStatus } from '../hooks/useTrialStatus';

// Interfaccia Product aggiornata
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
  pricingPlans?: any;
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
  status?: string;
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onStartTrial: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onStartTrial }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const trialStatus = useTrialStatus(product.id);
  
  const handleStartTrial = () => {
    // Verifica se l'utente è loggato controllando il token
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/register');
    } else {
      // Se ha già un trial attivo, vai direttamente alla gestione
      if (trialStatus.isActive) {
        if (product.category === 'Formazione' || product.category === 'course') {
          // Per formazione con trial attivo, vai alla gestione del trial
          navigate(`/course/${product.id}/manage-trial`);
        } else {
          // Per altri prodotti, vai alla dashboard sezione trials
          navigate('/dashboard', { state: { activeTab: 'trials' } });
        }
      } else if (trialStatus.hasExpired) {
        // Se il trial è scaduto, vai direttamente alla pagina di acquisto
        if (product.category === 'Formazione' || product.category === 'course') {
          navigate(`/course/${product.id}`);
        } else {
          navigate('/products');
        }
      } else {
        // Se non ha trial attivo, vai alla pagina di attivazione
        // Per i corsi, usa la route dedicata
        if (product.category === 'Formazione' || product.category === 'course') {
          navigate(`/course/${product.id}/trial`);
        } else {
          navigate(`/trial-activation/${product.id}`);
        }
      }
    }
  };
  const getCategoryIcon = () => {
    switch (product.category) {
      case 'bot':
        return <Shield className="w-5 h-5" />;
      case 'indicator':
        return <TrendingUp className="w-5 h-5" />;
      case 'course':
        return <Star className="w-5 h-5" />;
      case 'service':
        return <Zap className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (product.status) {
      case 'active':
        return 'bg-green-500';
      case 'beta':
        return 'bg-blue-500';
      case 'coming-soon':
        return 'bg-yellow-500';
      case 'soldout':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBadgeColor = () => {
    switch (product.badge) {
      case 'BEST SELLER':
        return 'from-red-600 to-orange-600';
      case 'NUOVO':
        return 'from-green-600 to-emerald-600';
      case 'HIGH SPEED':
        return 'from-blue-600 to-purple-600';
      case 'POPOLARE':
        return 'from-yellow-600 to-orange-600';
      case 'FORMAZIONE':
        return 'from-purple-600 to-pink-600';
      case 'PROSSIMAMENTE':
        return 'from-gray-600 to-gray-800';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return `€${price.toLocaleString('it-IT')}`;
  };

  return (
    <div className={`group relative border-2 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/20 ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-gray-900/90 to-black/90 border-red-800/30'
        : 'bg-gradient-to-b from-white to-gray-50 border-red-200'
    }`}>
      {/* Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`w-3 h-3 ${getStatusColor()} rounded-full animate-pulse`}></div>
      </div>

      {/* Card Content */}
      <div className="p-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              {getCategoryIcon()}
              <span className="text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
            </div>
            <h3 className={`text-2xl font-black group-hover:text-yellow-500 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {product.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm mb-6 line-clamp-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {product.shortDescription}
        </p>

        {/* Performance Stats (if available) */}
        {product.performance && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className={`border rounded-lg p-3 ${
              theme === 'dark'
                ? 'bg-black/50 border-red-900/30'
                : 'bg-white border-red-200'
            }`}>
              <div className={`text-xs mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Win Rate</div>
              <div className="text-lg font-bold text-green-400">{product.performance.winRate}</div>
            </div>
            <div className={`border rounded-lg p-3 ${
              theme === 'dark'
                ? 'bg-black/50 border-red-900/30'
                : 'bg-white border-red-200'
            }`}>
              <div className={`text-xs mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Avg Profit</div>
              <div className="text-lg font-bold text-yellow-400">{product.performance.avgProfit}</div>
            </div>
          </div>
        )}

        {/* Features Preview */}
        <div className="space-y-2 mb-6">
          {product.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{feature}</span>
            </div>
          ))}
          {product.features.length > 3 && (
            <div className="text-sm text-yellow-500 font-semibold">
              +{product.features.length - 3} altre funzionalità
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className={`border-t pt-6 ${
          theme === 'dark' ? 'border-red-900/30' : 'border-red-200'
        }`}>
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className={`text-xs mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>A partire da</div>
              <div className="flex items-baseline gap-2">
                {/* Prezzo originale barrato */}
                {(() => {
                  let originalPrice = 0;
                  // Determina il prezzo originale
                  if (product.originalPrice && product.originalPrice > 0) {
                    originalPrice = product.originalPrice;
                  } else if (product.pricingPlans?.monthly?.originalPrice) {
                    originalPrice = product.pricingPlans.monthly.originalPrice;
                  } else if (product.pricingPlans?.oneTime?.originalPrice) {
                    originalPrice = product.pricingPlans.oneTime.originalPrice;
                  }
                  
                  // Determina il prezzo corrente per il confronto
                  let currentPrice = 0;
                  if (typeof product.price === 'number') {
                    currentPrice = product.price;
                  } else if (product.pricingPlans?.monthly?.price) {
                    currentPrice = product.pricingPlans.monthly.price;
                  } else if (product.pricingPlans?.oneTime?.price) {
                    currentPrice = product.pricingPlans.oneTime.price;
                  }
                  
                  // Mostra il prezzo barrato solo se diverso dal prezzo corrente e maggiore di zero
                  if (originalPrice > 0 && originalPrice > currentPrice) {
                    return (
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    );
                  }
                  return null;
                })()}
                
                <span className="text-3xl font-black text-white">
                  {(() => {
                    // Gestisci diversi formati di prezzo
                    if (typeof product.price === 'number') {
                      return formatPrice(product.price);
                    } else if (product.pricingPlans?.monthly) {
                      return formatPrice(product.pricingPlans.monthly.price);
                    } else if (product.pricingPlans?.oneTime) {
                      return formatPrice(product.pricingPlans.oneTime.price);
                    } else if (product.price?.monthly) {
                      return formatPrice(product.price.monthly);
                    } else {
                      return formatPrice(0);
                    }
                  })()}
                </span>
                {product.type === 'subscription' && (
                  <span className="text-sm text-gray-400">/mese</span>
                )}
                {product.type === 'one-time' && product.category === 'Formazione' && (
                  <span className="text-sm text-gray-400">pagamento unico</span>
                )}
              </div>
              
              {/* Mostra il risparmio percentuale se c'è uno sconto */}
              {(() => {
                let originalPrice = 0;
                let currentPrice = 0;
                
                if (product.originalPrice && product.originalPrice > 0) {
                  originalPrice = product.originalPrice;
                } else if (product.pricingPlans?.monthly?.originalPrice) {
                  originalPrice = product.pricingPlans.monthly.originalPrice;
                } else if (product.pricingPlans?.oneTime?.originalPrice) {
                  originalPrice = product.pricingPlans.oneTime.originalPrice;
                }
                
                if (typeof product.price === 'number') {
                  currentPrice = product.price;
                } else if (product.pricingPlans?.monthly?.price) {
                  currentPrice = product.pricingPlans.monthly.price;
                } else if (product.pricingPlans?.oneTime?.price) {
                  currentPrice = product.pricingPlans.oneTime.price;
                }
                
                if (originalPrice > 0 && originalPrice > currentPrice) {
                  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
                  return (
                    <div className="mt-1">
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">
                        Risparmi {discount}%
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            {product.trial && product.trial.available && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-bold">{product.trial.days} giorni</span>
                </div>
                <div className="text-xs text-gray-400">di prova</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Se ha un trial attivo per formazione, vai direttamente alla gestione trial
                if (product.category === 'Formazione' && trialStatus.isActive) {
                  navigate(`/course/${product.id}/manage-trial`);
                } else {
                  // Altrimenti mostra sempre la pagina dettagli standard
                  onViewDetails(product);
                }
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 border border-red-800/50 rounded-xl font-bold text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group/btn"
            >
              {product.category === 'Formazione' && trialStatus.isActive ? 'Accedi al Corso' : 'Dettagli'}
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            
            {product.trial && product.trial.available && product.status === 'active' && (
              <button
                onClick={handleStartTrial}
                className={`flex-1 px-4 py-3 border-2 rounded-xl font-bold text-white hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group/trial ${
                  trialStatus.hasExpired 
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-400 hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-300'
                    : 'bg-gradient-to-r from-red-600 to-red-800 border-red-400 hover:from-red-500 hover:to-red-700 hover:border-red-300'
                }`}>
                {trialStatus.hasExpired ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Acquista Ora
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 group-hover/trial:rotate-12 transition-transform" />
                    Prova Gratis
                  </>
                )}
              </button>
            )}
            
            {product.trial && !product.trial.available && product.status === 'active' && (
              <button
                onClick={() => onViewDetails(product)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-xl font-bold text-white hover:from-yellow-500 hover:to-yellow-700 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {product.category === 'Formazione' ? 'Inizia il Corso' : 'Acquista Ora'}
              </button>
            )}
            
            {product.status === 'coming-soon' && (
              <button
                disabled
                className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl font-bold text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Coming Soon
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

export default ProductCard;
