import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductConfig } from '../hooks/useProductConfig';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import { 
  Shield, 
  Download, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Clock,
  Key,
  MessageCircle,
  Users,
  BookOpen,
  Zap,
  FileText,
  ExternalLink,
  Rocket,
  Trophy,
  Star,
  Lock
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category?: string;
  type: string;
  features: string[];
  requirements?: string[];
  platforms?: string[];
  trialDays: number;
  downloadUrl?: string;
  version?: string;
  fileSize?: string;
  lastUpdated?: string;
  metrics?: {
    winRate?: number;
    avgProfit?: number;
  };
}

const TrialActivation: React.FC = () => {
  const { theme } = useTheme();
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [trialActivated, setTrialActivated] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);
  const [trialData, setTrialData] = useState<any>(null);
  
  // Load dynamic product configuration (platforms, etc.)
  const { config, loading: configLoading } = useProductConfig(productId);
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const userData = user ? JSON.parse(user) : null;

  // Link Telegram - puoi personalizzarli
  const TELEGRAM_CHANNEL = 'https://t.me/spartanofurioso_channel'; // Canale per annunci
  const TELEGRAM_GROUP = 'https://t.me/spartanofurioso_support'; // Gruppo per supporto
  const TELEGRAM_CONTACT = 'https://t.me/catiscrazy'; // Contatto per licenze

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (productId) {
      fetchProduct();
    }
  }, [productId, token, navigate]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.products}?t=${Date.now()}`, {});
      if (response.ok) {
        const products = await response.json();
        const foundProduct = products.find((p: Product) => p.id === productId);
        
        if (foundProduct) {
          setProduct(foundProduct);
          // Controlla se il trial è già attivo, passando anche i dati del prodotto
          checkTrialStatus(foundProduct.id, foundProduct);
        } else {
          console.error('Product not found');
          navigate('/products');
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTrialStatus = async (productId: string, productData?: Product) => {
    try {
      // Check if trial exists using the correct endpoint
      const response = await fetch(API_ENDPOINTS.checkTrial(productId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.trial) {
          setTrialData(data.trial);
          
          // Check if trial is expired
          if (data.trial.daysRemaining <= 0) {
            console.log('⚠️ Trial expired for product:', productId);
            setTrialExpired(true);
            setTrialActivated(true); // Mark as activated but expired
          } else if (data.isActive) {
            // Trial is still active
            setTrialActivated(true);
            // Redirect to appropriate management page
            // Use productData passed as parameter or fallback to state
            const currentProduct = productData || product;
            if (currentProduct?.category === 'Formazione') {
              navigate(`/course/${productId}/manage-trial`);
            } else {
              // For bot/indicators, create a specific management page URL
              navigate(`/trial/${productId}/manage`);
            }
          }
        } else {
          setTrialActivated(false);
        }
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    }
  };

  const activateTrial = async () => {
    try {
      if (!product) return;
      
      // Chiamata API per attivare il trial
      const response = await fetch(API_ENDPOINTS.startTrial, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          productId: product.id,
          trialDays: product.trialDays || 11
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTrialActivated(true);
        
        // Aggiorna i dati dell'utente nel localStorage
        if (userData) {
          const updatedUser = {
            ...userData,
            trials: [...(userData.trials || []), data.trial]
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        // Mostra messaggio di successo
        alert(`Trial attivato con successo! Hai ${product.trialDays || 11} giorni di accesso completo.`);
        
        // Reindirizza dopo 2 secondi
        setTimeout(() => {
          if (product.category === 'Formazione') {
            // Per corsi di formazione, vai alla gestione del trial
            navigate(`/course/${product.id}/manage-trial`);
          } else {
            // Per altri prodotti, vai alla dashboard
            navigate('/dashboard', { state: { activeTab: 'trials' } });
          }
        }, 2000);
      } else {
        alert(data.error || 'Errore nell\'attivazione del trial');
      }
    } catch (error) {
      console.error('Error activating trial:', error);
      alert('Errore nell\'attivazione del trial');
    }
  };

  const handleDownload = async () => {
    if (!product) return;

    setDownloadStarted(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.nexoralab.solutions';

      console.log('📥 Inizio download per prodotto:', product.id);

      // Chiamata all'endpoint di download
      const response = await fetch(`${apiUrl}/api/products/${product.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore durante il download');
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${product.name}.zip`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('✅ Download completato:', filename);
      alert(`✅ Download di ${product.name} completato con successo!\n\nFile: ${filename}`);
    } catch (error) {
      console.error('❌ Errore download:', error);
      alert(error instanceof Error ? error.message : 'Errore durante il download. Riprova più tardi.');
      setDownloadStarted(false);
    }
  };

  const isDownloadable = () => {
    if (!product) return false;
    const category = (product.category || '').toLowerCase();
    return category.includes('bot') || category.includes('indicator') || category.includes('indicat');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-black via-gray-950 to-black'
          : 'bg-gradient-to-b from-white via-gray-50 to-white'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-black via-gray-950 to-black'
          : 'bg-gradient-to-b from-white via-gray-50 to-white'
      }`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Prodotto non trovato</h2>
          <Link to="/products" className="text-cyan-500 hover:text-cyan-400">
            Torna ai prodotti
          </Link>
        </div>
      </div>
    );
  }

  // Check if trial is expired
  if (trialExpired && trialData) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-black via-blue-950/20 to-black'
          : 'bg-gradient-to-b from-white via-blue-50/40 to-white'
      }`}>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-blue-900/20 border-2 border-blue-500 rounded-2xl p-8 text-center">
              <AlertCircle className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-pulse" />
              <h1 className={`text-4xl font-display font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                TRIAL SCADUTO
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Il tuo periodo di prova per <span className="text-cyan-500 font-bold">{product.name}</span> è terminato.
              </p>
              
              <div className="bg-black/50 border border-slate-800 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-gray-400 text-sm">Iniziato il</span>
                    <p className="text-white font-bold">
                      {new Date(trialData.startDate).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Terminato il</span>
                    <p className="text-blue-400 font-bold">
                      {new Date(trialData.endDate).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Link
                  to={(product.category === 'course' || product.category === 'Formazione') ? `/course/${productId}` : `/products`}
                  className="block w-full px-8 py-4 bg-gradient-to-r from-cyan-600 to-sky-600 rounded-xl font-bold text-white hover:from-cyan-500 hover:to-sky-500 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Rocket className="w-6 h-6" />
                    ACQUISTA LA VERSIONE COMPLETA
                  </div>
                </Link>
                
                <Link
                  to="/dashboard"
                  className="block w-full px-8 py-4 bg-gray-800 rounded-xl font-bold text-gray-400 hover:bg-gray-700 transition-all duration-300"
                >
                  Torna alla Dashboard
                </Link>
              </div>
            </div>
            
            {/* Product benefits reminder */}
            <div className="mt-8 bg-slate-900/60 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                🎯 Perché acquistare {product.name}?
              </h3>
              <ul className="space-y-2 text-gray-300">
                {product.metrics?.winRate && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Win Rate del {pct(product.metrics.winRate)}</span>
                  </li>
                )}
                {product.metrics?.avgProfit && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Profitto medio del {pctSigned(product.metrics.avgProfit)}</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Supporto tecnico dedicato 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Aggiornamenti gratuiti a vita</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Community esclusiva Telegram</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dark = theme === 'dark';
  const bg = dark ? 'bg-black' : 'bg-slate-50';

  // Normalizza valori % (DB puo' avere "72", "72%", "+18.7%", ecc.)
  const pct = (raw: any): string => {
    if (raw == null || raw === '') return '';
    const s = String(raw).trim();
    if (s.endsWith('%') || /[a-zA-Z]/.test(s)) return s; // gia' formattato o "N/A"
    const n = parseFloat(s.replace(',', '.'));
    return Number.isNaN(n) ? '' : `${n}%`;
  };
  const pctSigned = (raw: any): string => {
    if (raw == null || raw === '') return '';
    const s = String(raw).trim();
    if (s.startsWith('+') || s.startsWith('-')) return pct(s);
    const n = parseFloat(s.replace('%', '').replace(',', '.'));
    if (Number.isNaN(n)) return pct(s);
    const sign = n > 0 ? '+' : '';
    return `${sign}${n}%`;
  };
  const headerBg = dark ? 'bg-black/70 border-slate-800/80' : 'bg-white/70 border-slate-200';
  const textMain = dark ? 'text-white' : 'text-slate-900';
  const textDim = dark ? 'text-slate-500' : 'text-slate-500';
  const secondaryBtn = dark
    ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40'
    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50';

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Topbar */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${headerBg}`}>
        <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-semibold transition-all ${secondaryBtn}`}>
            <ArrowLeft className="w-3.5 h-3.5" /> Indietro
          </button>
          <div className="text-center hidden md:block">
            <div className={`font-mono-lab text-[0.65rem] tracking-[0.3em] uppercase ${textDim}`}>// Nexora Lab</div>
            <div className={`font-display text-sm font-semibold ${textMain}`}>Attivazione prova gratuita</div>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display font-semibold ${
            dark ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/30'
          }`}>
            <Shield className="w-3.5 h-3.5" /> {product.trialDays || 60}g gratis
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Product Header */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-3xl font-display font-semibold text-white">{product.name}</h2>
                  {trialActivated && (
                    <span className="px-3 py-1 bg-green-600 rounded-full text-white text-sm font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      TRIAL ATTIVO
                    </span>
                  )}
                </div>
                
                <p className="text-gray-300 mb-6">{product.description}</p>
                
                {/* Trial Info */}
                <div className="bg-black/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400">Durata Trial:</span>
                    <span className="text-2xl font-display font-semibold text-cyan-500">{product.trialDays || 60} GIORNI</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Accesso completo a tutte le funzionalità</span>
                  </div>
                </div>

                {/* Metrics */}
                {product.metrics && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {product.metrics.winRate && (
                      <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-5 h-5 text-green-500" />
                          <span className="text-gray-400 text-sm">Win Rate</span>
                        </div>
                        <div className="text-2xl font-display font-semibold text-white">{pct(product.metrics.winRate)}</div>
                      </div>
                    )}
                    {product.metrics.avgProfit && (
                      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-400 text-sm">Profit Medio</span>
                        </div>
                        <div className="text-2xl font-display font-semibold text-white">{pctSigned(product.metrics.avgProfit)}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {!trialActivated ? (
                    <button
                      onClick={activateTrial}
                      className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold text-white hover:from-cyan-500 hover:to-blue-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Rocket className="w-6 h-6" />
                      ATTIVA TRIAL {product.trialDays || 60} GIORNI
                    </button>
                  ) : (
                    <>
                      {isDownloadable() && (
                        <button
                          onClick={handleDownload}
                          className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold text-white hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <Download className="w-6 h-6" />
                          SCARICA {product.category?.toUpperCase()}
                        </button>
                      )}
                      <button
                        onClick={() => window.open(TELEGRAM_CONTACT, '_blank')}
                        className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-bold text-white hover:from-blue-500 hover:to-cyan-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <Key className="w-6 h-6" />
                        RICHIEDI LICENZA
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Product Info Sidebar */}
              <div className="w-full md:w-80">
                <div className="bg-black/30 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white mb-4">Informazioni Prodotto</h3>
                  
                  {product.version && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Versione:</span>
                      <span className="text-white font-bold">{product.version}</span>
                    </div>
                  )}
                  
                  {product.fileSize && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Dimensione:</span>
                      <span className="text-white">{product.fileSize}</span>
                    </div>
                  )}
                  
                  {product.lastUpdated && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Aggiornato:</span>
                      <span className="text-white">{product.lastUpdated}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Categoria:</span>
                    <span className="text-cyan-500 font-bold">{product.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two columns layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Features & Requirements */}
            <div className="space-y-8">
              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-xl font-display font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-cyan-500" />
                    FUNZIONALITÀ
                  </h3>
                  <ul className="space-y-3">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {product.requirements && product.requirements.length > 0 && (
                <div className="bg-slate-900/60 border border-cyan-900/30 rounded-xl p-6">
                  <h3 className="text-xl font-display font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-cyan-500" />
                    REQUISITI
                  </h3>
                  <ul className="space-y-3">
                    {product.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Platforms - Use dynamic config if available, fallback to product.platforms */}
              {((config?.platforms && config.platforms.length > 0) || (product.platforms && product.platforms.length > 0)) && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-xl font-display font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-500" />
                    PIATTAFORME SUPPORTATE
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(config?.platforms || product.platforms || []).map((platform, idx) => (
                      <span 
                        key={idx}
                        className="px-4 py-2 bg-blue-900/30 border border-blue-800 rounded-lg text-blue-300 font-bold"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Telegram & Support */}
            <div className="space-y-6">
              {/* Telegram Links */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MessageCircle className="w-3.5 h-3.5 text-cyan-500" />
                  <h3 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// supporto telegram</h3>
                </div>

                <div className="space-y-3">
                  {/* Canale Annunci */}
                  <a
                    href={TELEGRAM_CHANNEL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 hover:border-cyan-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-cyan-500/10 ring-1 ring-cyan-500/30">
                        <MessageCircle className="w-4 h-4 text-cyan-500" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-semibold text-sm text-white">Canale Ufficiale</h4>
                        <p className="text-xs text-slate-400">Annunci e aggiornamenti</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                  </a>

                  {/* Gruppo Supporto - Bloccato per Trial */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 opacity-70">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-800">
                          <Users className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display font-semibold text-sm text-slate-400">Gruppo Community</h4>
                          <p className="text-xs text-slate-500">Supporto e discussioni</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Lock className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="font-mono-lab text-[0.55rem] tracking-widest uppercase font-bold text-cyan-500">Premium</span>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-cyan-500/5 ring-1 ring-cyan-500/20 px-3 py-2 text-xs text-cyan-300 text-center">
                      Disponibile dopo l'acquisto del prodotto
                    </div>
                  </div>

                  {/* Richiedi Licenza */}
                  <a
                    href={TELEGRAM_CONTACT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 hover:border-cyan-500/60 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Key className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-semibold text-sm text-white">Richiedi Licenza</h4>
                      <p className="text-xs text-slate-400">Contatta @catiscrazy per la licenza 60 giorni</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                  </a>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-slate-900/60 border border-cyan-700/30 rounded-xl p-6">
                <h3 className="text-xl font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-cyan-500" />
                  COME INIZIARE
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Attiva il Trial</h4>
                      <p className="text-gray-400 text-sm">Clicca sul pulsante "Attiva Trial" per iniziare i tuoi 60 giorni gratuiti</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Scarica il Software</h4>
                      <p className="text-gray-400 text-sm">Scarica il bot o l'indicatore sul tuo computer</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Ottieni la Licenza</h4>
                      <p className="text-gray-400 text-sm">Contatta @catiscrazy su Telegram per ricevere il codice licenza di 60 giorni</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Inizia a Tradare</h4>
                      <p className="text-gray-400 text-sm">Configura il software e inizia a guadagnare!</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Important Notice */}
              <div className="bg-blue-950/30 border border-blue-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-bold mb-2">Informazioni Importanti</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• Il trial dura 60 giorni dalla data di attivazione</li>
                      <li>• Hai accesso completo a tutte le funzionalità</li>
                      <li>• Nessun addebito automatico alla fine del periodo</li>
                      <li>• Supporto tecnico incluso via Telegram</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialActivation;
