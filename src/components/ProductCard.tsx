import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Shield, Clock, CheckCircle, TrendingUp, Zap, Star,
  ArrowRight, Lock, Unlock, Package,
} from 'lucide-react';
import { useTrialStatus } from '../hooks/useTrialStatus';
import { PRICE_ON_REQUEST, CALL_BOOKING_URL, PRICE_ON_REQUEST_LABEL, CALL_CTA_LABEL } from '../config/sales';

interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number | { monthly?: number; yearly?: number; lifetime?: number };
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
  trial?: { available: boolean; days: number; features?: string[] };
  status?: 'active' | 'coming-soon' | 'beta' | 'soldout';
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onStartTrial: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const navigate = useNavigate();
  const trialStatus = useTrialStatus(product.id);

  // ===== styling helpers (dashboard-style) =====
  const surface = dark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const surfaceHover = dark ? 'hover:border-cyan-500/50' : 'hover:border-cyan-500/70';
  const textMain = dark ? 'text-white' : 'text-slate-900';
  const textBody = dark ? 'text-slate-300' : 'text-slate-700';
  const textMuted = dark ? 'text-slate-400' : 'text-slate-600';
  const textDim = dark ? 'text-slate-500' : 'text-slate-500';
  const innerCard = dark ? 'bg-slate-950/40 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200';
  const primaryBtn = 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-md hover:shadow-cyan-500/20';
  const secondaryBtn = dark
    ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40'
    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50';

  const handleStartTrial = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) { navigate('/register'); return; }
    if (trialStatus.isActive) {
      if (product.category === 'Formazione' || product.category === 'course') {
        navigate(`/course/${product.id}/manage-trial`);
      } else {
        navigate('/dashboard', { state: { activeTab: 'trials' } });
      }
    } else if (trialStatus.hasExpired) {
      if (product.category === 'Formazione' || product.category === 'course') {
        navigate(`/course/${product.id}`);
      } else {
        navigate('/products');
      }
    } else {
      if (product.category === 'Formazione' || product.category === 'course') {
        navigate(`/course/${product.id}/trial`);
      } else {
        navigate(`/trial-activation/${product.id}`);
      }
    }
  };

  const getCategoryIcon = () => {
    switch (product.category) {
      case 'bot': return Shield;
      case 'indicator': return TrendingUp;
      case 'course':
      case 'Formazione': return Star;
      case 'service':
      case 'Servizi': return Zap;
      default: return Package;
    }
  };

  const getCategoryLabel = () => {
    switch (product.category) {
      case 'bot': return 'bot';
      case 'indicator': return 'indicator';
      case 'course':
      case 'Formazione': return 'course';
      case 'service':
      case 'Servizi': return 'service';
      default: return product.category || 'tool';
    }
  };

  const getStatusDot = () => {
    switch (product.status) {
      case 'active': return 'bg-emerald-500';
      case 'beta': return 'bg-cyan-500';
      case 'coming-soon': return 'bg-amber-500';
      case 'soldout': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const formatPrice = (p: number) => (p === 0 ? 'Gratis' : `€${p.toLocaleString('it-IT')}`);

  // Calcolo prezzo corrente / originale (gestisce tutti i formati)
  const pricing = (() => {
    let current = 0, original = 0;
    if (typeof product.price === 'number') current = product.price;
    else if (product.pricingPlans?.monthly?.price) current = product.pricingPlans.monthly.price;
    else if (product.pricingPlans?.oneTime?.price) current = product.pricingPlans.oneTime.price;
    else if (product.price && typeof product.price === 'object' && product.price.monthly) current = product.price.monthly;

    if (product.originalPrice && product.originalPrice > 0) original = product.originalPrice;
    else if (product.pricingPlans?.monthly?.originalPrice) original = product.pricingPlans.monthly.originalPrice;
    else if (product.pricingPlans?.oneTime?.originalPrice) original = product.pricingPlans.oneTime.originalPrice;

    const discount = original > 0 && original > current ? Math.round(((original - current) / original) * 100) : 0;
    return { current, original, discount };
  })();

  const Icon = getCategoryIcon();
  const isFormazione = product.category === 'Formazione' || product.category === 'course';
  const isComingSoon = product.status === 'coming-soon';

  return (
    <div className={`group relative rounded-xl border p-5 flex flex-col transition-all duration-300 ${surface} ${surfaceHover}`}>
      {/* Top accent line on hover */}
      <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/40 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'
          }`}>
            <Icon className="w-4 h-4 text-cyan-500" />
          </div>
          <span className="font-mono-lab text-[0.6rem] tracking-[0.25em] uppercase text-cyan-500">
            {getCategoryLabel()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {product.badge && (
            <span className={`px-2 py-0.5 rounded-md text-[0.55rem] font-mono-lab tracking-widest uppercase font-bold ${
              dark ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/30'
            }`}>{product.badge}</span>
          )}
          <span className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
        </div>
      </div>

      {/* Title */}
      <h3 className={`font-display text-lg font-semibold tracking-tight ${textMain}`}>{product.name}</h3>

      {/* Description */}
      <p className={`text-sm mt-1.5 mb-4 line-clamp-2 ${textMuted}`}>
        {product.shortDescription || product.description}
      </p>

      {/* Performance Stats — solo bot / indicator / service */}
      {product.performance && !isFormazione && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className={`rounded-lg p-2.5 ${innerCard}`}>
            <div className={`font-mono-lab text-[0.55rem] tracking-widest uppercase ${textDim}`}>Win Rate</div>
            <div className={`font-display text-sm font-semibold mt-0.5 ${textMain}`}>{product.performance.winRate}</div>
          </div>
          <div className={`rounded-lg p-2.5 ${innerCard}`}>
            <div className={`font-mono-lab text-[0.55rem] tracking-widest uppercase ${textDim}`}>Avg Profit</div>
            <div className={`font-display text-sm font-semibold mt-0.5 ${textMain}`}>{product.performance.avgProfit}</div>
          </div>
        </div>
      )}

      {/* Features preview (max 3) */}
      <ul className="space-y-1.5 mb-4">
        {product.features.slice(0, 3).map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
            <span className={`${textBody} line-clamp-1`}>{f}</span>
          </li>
        ))}
        {product.features.length > 3 && (
          <li className={`text-xs font-mono-lab tracking-wider ml-5 text-cyan-500`}>
            +{product.features.length - 3} altre funzionalità
          </li>
        )}
      </ul>

      {/* Pricing */}
      <div className={`mt-auto pt-4 border-t ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-end justify-between gap-3 mb-4">
          <div className="min-w-0">
            {PRICE_ON_REQUEST ? (
              <>
                <div className={`font-mono-lab text-[0.55rem] tracking-widest uppercase ${textDim} mb-0.5`}>
                  Accesso
                </div>
                <div className={`font-display text-xl font-semibold ${textMain}`}>{PRICE_ON_REQUEST_LABEL}</div>
                <div className={`text-xs ${textDim} mt-0.5`}>su misura, in call</div>
              </>
            ) : (
              <>
                <div className={`font-mono-lab text-[0.55rem] tracking-widest uppercase ${textDim} mb-0.5`}>
                  {product.type === 'subscription' ? 'A partire da' : 'Prezzo'}
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  {pricing.original > 0 && pricing.original > pricing.current && (
                    <span className={`text-sm line-through ${textDim}`}>{formatPrice(pricing.original)}</span>
                  )}
                  <span className={`font-display text-2xl font-semibold ${textMain}`}>{formatPrice(pricing.current)}</span>
                  {product.type === 'subscription' && <span className={`text-xs ${textDim}`}>/mese</span>}
                  {product.type === 'one-time' && isFormazione && <span className={`text-xs ${textDim}`}>una tantum</span>}
                </div>
                {pricing.discount > 0 && (
                  <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[0.55rem] font-mono-lab tracking-widest uppercase font-bold ${
                    dark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                  }`}>−{pricing.discount}%</span>
                )}
              </>
            )}
          </div>
          {product.trial?.available && (
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-cyan-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-display font-semibold text-sm">{product.trial.days}g</span>
              </div>
              <div className={`font-mono-lab text-[0.55rem] tracking-widest uppercase mt-0.5 ${textDim}`}>di prova</div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (isFormazione && trialStatus.isActive) navigate(`/course/${product.id}/manage-trial`);
              else onViewDetails(product);
            }}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-display font-semibold transition-all group/btn ${secondaryBtn}`}
          >
            {isFormazione && trialStatus.isActive ? 'Accedi al corso' : 'Dettagli'}
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>

          {isComingSoon ? (
            <button
              disabled
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-display font-semibold cursor-not-allowed ${
                dark ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Coming soon
            </button>
          ) : product.trial?.available && product.status === 'active' && !trialStatus.hasExpired ? (
            <button
              onClick={handleStartTrial}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-display font-semibold transition-all ${primaryBtn}`}
            >
              <Unlock className="w-3.5 h-3.5" /> Prova gratis
            </button>
          ) : PRICE_ON_REQUEST && !isFormazione && product.status === 'active' ? (
            <a
              href={CALL_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-display font-semibold transition-all ${primaryBtn}`}
            >
              <Clock className="w-3.5 h-3.5" /> {CALL_CTA_LABEL}
            </a>
          ) : product.trial?.available && product.status === 'active' ? (
            <button
              onClick={handleStartTrial}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-display font-semibold transition-all ${primaryBtn}`}
            >
              <Lock className="w-3.5 h-3.5" /> Acquista ora
            </button>
          ) : product.status === 'active' ? (
            <button
              onClick={() => onViewDetails(product)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-display font-semibold transition-all ${primaryBtn}`}
            >
              <Lock className="w-3.5 h-3.5" />
              {isFormazione ? 'Inizia il corso' : 'Acquista ora'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
