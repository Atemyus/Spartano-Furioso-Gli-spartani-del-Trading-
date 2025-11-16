import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  PlayCircle,
  Video,
  ExternalLink,
  Rocket,
  Trophy,
  AlertTriangle,
  Monitor,
  Settings,
  Activity,
  Lock
} from 'lucide-react';
import PaymentOptionsModal from '../components/PaymentOptionsModal';
import EAParametersComplete from '../components/EAParametersComplete';

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
  price?: {
    monthly?: number;
    yearly?: number;
    lifetime?: number;
  } | number;
  currency?: string;
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

const TrialManagement: React.FC = () => {
  const { theme } = useTheme();
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime' | undefined>(undefined);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    license: false,
    systems: false,
    lotsize: false,
    tpsl: false,
    breakeven: false,
    risk: false,
    timefilter: false,
    newsfilter: false,
    advanced: false,
    htf: false,
    liquidity: false,
    volumeprofile: false
  });
  
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
      fetchData();
    }
  }, [productId, token, navigate]);

  const fetchData = async () => {
    try {
      // Fetch product data
      const productResponse = await fetch(`${API_ENDPOINTS.products}?t=${Date.now()}`, {});
      if (productResponse.ok) {
        const products = await productResponse.json();
        const foundProduct = products.find((p: Product) => p.id === productId);
        
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          console.error('Product not found');
          navigate('/products');
          return;
        }
      }

      // Fetch trial data
      const trialResponse = await fetch(API_ENDPOINTS.checkTrial(productId!), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (trialResponse.ok) {
        const data = await trialResponse.json();
        
        if (data.success && data.trial) {
          setTrial(data.trial);
          
          // Check if trial is expired
          if (data.trial.daysRemaining <= 0) {
            console.log('⚠️ Trial expired for product:', productId);
          }
        } else {
          // No active trial, redirect to trial activation
          navigate(`/trial/${productId}`);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!product) return;

    setDownloadStarted(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.spartanofurioso.com';

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

  const handleSelectPlan = (plan: 'monthly' | 'yearly' | 'lifetime') => {
    setSelectedPlan(plan);
    setShowPlanSelection(false);
    // Il PaymentOptionsModal si aprirà automaticamente quando selectedPlan è impostato
  };

  const getPlanLabel = (plan: 'monthly' | 'yearly' | 'lifetime') => {
    switch (plan) {
      case 'monthly': return 'Abbonamento Mensile';
      case 'yearly': return 'Abbonamento Annuale';
      case 'lifetime': return 'Acquisto Lifetime';
      default: return '';
    }
  };

  const isDownloadable = () => {
    if (!product) return false;
    const category = (product.category || '').toLowerCase();
    return category.includes('bot') || category.includes('indicator') || category.includes('indicat');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gradient-to-b from-black via-gray-950 to-black' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!product || !trial) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gradient-to-b from-black via-gray-950 to-black' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className={`text-3xl font-black mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>Trial Non Trovato</h1>
          <p className={`mb-8 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Non hai un trial attivo per questo prodotto.</p>
          <Link 
            to="/dashboard" 
            className="px-6 py-3 bg-red-600 rounded-lg text-white hover:bg-red-500"
          >
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Check if trial is expired
  if (trial.daysRemaining <= 0) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gradient-to-b from-black via-red-950/20 to-black' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className={`border-2 border-red-500 rounded-2xl p-8 text-center ${
              theme === 'dark' ? 'bg-red-900/20' : 'bg-white shadow-lg'
            }`}>
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
              <h1 className={`text-4xl font-black mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                TRIAL SCADUTO
              </h1>
              <p className={`text-xl mb-8 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Il tuo periodo di prova per <span className="text-yellow-500 font-bold">{product.name}</span> è terminato.
              </p>
              
              <div className={`border rounded-xl p-6 mb-8 ${
                theme === 'dark' ? 'bg-black/50 border-red-900/30' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Iniziato il</span>
                    <p className={`font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {new Date(trial.startDate).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Terminato il</span>
                    <p className="text-red-400 font-bold">
                      {new Date(trial.endDate).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowPlanSelection(true)}
                  className="w-full px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-bold text-white hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Rocket className="w-6 h-6" />
                  ACQUISTA VERSIONE COMPLETA
                </button>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full px-8 py-4 bg-gray-800 rounded-xl font-bold text-gray-400 hover:bg-gray-700 transition-all duration-300"
                >
                  Torna alla Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round(((product.trialDays - trial.daysRemaining) / product.trialDays) * 100);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' ? 'bg-gradient-to-b from-black via-gray-950 to-black' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`backdrop-blur-sm border-b ${
        theme === 'dark' ? 'bg-black/50 border-red-900/30' : 'bg-white border-red-200'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-yellow-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Dashboard</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-green-900/30 border border-green-800 rounded-lg">
                <span className="text-green-400 text-sm font-bold">TRIAL ATTIVO</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-yellow-500">{trial.daysRemaining}</div>
                <div className="text-xs text-gray-400">giorni rimanenti</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Info */}
        <div className="max-w-6xl mx-auto">
          <div className={`border rounded-2xl p-8 mb-8 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-800'
              : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className={`text-4xl font-black mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>{product.name}</h1>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {product.description}
                </p>
              </div>
              <Shield className="w-16 h-16 text-red-600" />
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progresso Trial</span>
                <span className="text-yellow-500 font-bold">{progressPercentage}%</span>
              </div>
              <div className={`w-full rounded-full h-3 overflow-hidden ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
              }`}>
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-red-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Trial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`border rounded-lg p-4 ${
                theme === 'dark' ? 'bg-black/30 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <Clock className="w-8 h-8 text-yellow-500 mb-2" />
                <div className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{trial.daysRemaining}</div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Giorni Rimanenti</div>
              </div>
              <div className={`border rounded-lg p-4 ${
                theme === 'dark' ? 'bg-black/30 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                <div className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>ATTIVO</div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Stato Trial</div>
              </div>
              <div className={`border rounded-lg p-4 ${
                theme === 'dark' ? 'bg-black/30 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <Activity className="w-8 h-8 text-blue-500 mb-2" />
                <div className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>FULL</div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Accesso</div>
              </div>
            </div>
          </div>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Download Section */}
            {isDownloadable() && (
              <div className={`border rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-red-900/30 to-red-800/30 border-red-800'
                  : 'bg-white border-red-300 shadow-lg'
              }`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <Download className="w-6 h-6 text-red-500" />
                  Download {product.category}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Versione:</span>
                    <span className={`font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{product.version || 'v3.2.1'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Dimensione:</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{product.fileSize || '45 MB'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Ultimo aggiornamento:</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{product.lastUpdated || 'Oggi'}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleDownload}
                  disabled={downloadStarted}
                  className={`w-full px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    downloadStarted 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed border-2 border-gray-600'
                      : 'bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-400 text-white hover:from-red-500 hover:to-red-600 hover:border-red-300 transform hover:scale-105'
                  }`}
                >
                  {downloadStarted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Download Avviato
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Scarica Ora
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Support Section */}
            <div className={`border rounded-xl p-6 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-blue-800'
                : 'bg-white border-blue-300 shadow-lg'
            }`}>
              <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <MessageCircle className="w-6 h-6 text-blue-500" />
                Supporto & Community
              </h3>
              
              <div className="space-y-3">
                <a 
                  href={TELEGRAM_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-black/30 hover:bg-black/50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-blue-400" />
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Canale Telegram</span>
                  </div>
                  <span className="text-gray-400 text-sm">Annunci</span>
                </a>
                
                <a 
                  href={TELEGRAM_CONTACT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-700/30 rounded-lg hover:border-yellow-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-yellow-400" />
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Richiedi Licenza</span>
                  </div>
                  <span className="text-gray-400 text-sm">@catiscrazy</span>
                </a>
                
                {/* Gruppo Supporto - Bloccato per Trial */}
                <div className="relative">
                  <div className={`flex items-center justify-between p-3 rounded-lg opacity-50 cursor-not-allowed border ${
                    theme === 'dark' ? 'bg-black/30 border-gray-700' : 'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-400">Gruppo Supporto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-500 text-xs font-bold">PREMIUM</span>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-400">
                    💎 Disponibile dopo l'acquisto del prodotto
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tutorial Section */}
          <div className={`border rounded-xl p-6 mb-8 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-800'
              : 'bg-white border-purple-300 shadow-lg'
          }`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <PlayCircle className="w-6 h-6 text-purple-500" />
              📚 Tutorial & Guida Completa
            </h3>
            <p className={`mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Guarda i video tutorial per imparare come installare e configurare {product.name}. 
              Ogni parametro è spiegato in dettaglio per massimizzare i risultati.
            </p>
            
            <div className="space-y-6">
              {/* Video 1 - Installazione */}
              <div className={`border rounded-lg p-4 ${
                theme === 'dark' ? 'bg-black/30 border-purple-700/50' : 'bg-white border-purple-300 shadow-sm'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-100'
                  }`}>
                    <Video className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Lezione 1: Installazione
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-purple-400">
                      <Clock className="w-3 h-3" />
                      <span>05:53</span>
                    </div>
                  </div>
                </div>
                <div className={`rounded-lg overflow-hidden ${
                  theme === 'dark' ? 'bg-black' : 'bg-gray-100'
                }`}>
                  <video 
                    controls 
                    className="w-full"
                    preload="metadata"
                  >
                    <source src="/videos/installazione.mp4" type="video/mp4" />
                    Il tuo browser non supporta il tag video.
                  </video>
                </div>
                <p className={`text-sm mt-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Guida passo-passo per installare l'EA su MetaTrader
                </p>
              </div>

              {/* Video 2 - Parametri */}
              <div className={`border rounded-lg p-4 ${
                theme === 'dark' ? 'bg-black/30 border-blue-700/50' : 'bg-white border-blue-300 shadow-sm'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
                  }`}>
                    <Settings className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Lezione 2: Parametri EA
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-blue-400">
                      <Clock className="w-3 h-3" />
                      <span>05:53</span>
                    </div>
                  </div>
                </div>
                <div className={`rounded-lg overflow-hidden ${
                  theme === 'dark' ? 'bg-black' : 'bg-gray-100'
                }`}>
                  <video 
                    controls 
                    className="w-full"
                    preload="metadata"
                  >
                    <source src="/videos/parametri.mp4" type="video/mp4" />
                    Il tuo browser non supporta il tag video.
                  </video>
                </div>
                <p className={`text-sm mt-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Spiegazione dettagliata di ogni parametro e come ottimizzarli
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg text-center">
              <p className="text-sm text-purple-300">
                💡 <strong>Consiglio:</strong> Guarda prima il video di installazione, poi quello sui parametri per ottenere il massimo dal tuo {product.category}.
              </p>
            </div>
          </div>

          {/* EA Parameters Section */}
          <EAParametersComplete 
            theme={theme}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className={`border rounded-xl p-6 mb-8 ${
              theme === 'dark'
                ? 'bg-gray-900/50 border-gray-800'
                : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                ✨ Caratteristiche Incluse nel Trial
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platforms */}
          <div className={`border rounded-xl p-6 mb-8 ${
            theme === 'dark'
              ? 'bg-gray-900/50 border-gray-800'
              : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Monitor className="w-6 h-6 text-purple-500" />
              Piattaforme Supportate
            </h3>
            <div className="flex flex-wrap gap-3">
              <span className={`px-4 py-2 border rounded-lg font-medium ${
                theme === 'dark'
                  ? 'bg-purple-900/30 border-purple-800 text-purple-300'
                  : 'bg-purple-50 border-purple-300 text-purple-700'
              }`}>
                MetaTrader 4
              </span>
              <span className={`px-4 py-2 border rounded-lg font-medium ${
                theme === 'dark'
                  ? 'bg-blue-900/30 border-blue-800 text-blue-300'
                  : 'bg-blue-50 border-blue-300 text-blue-700'
              }`}>
                MetaTrader 5
              </span>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-800 rounded-xl p-8 text-center">
            {showPlanSelection ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-4">
                  Scegli il Tuo Piano
                </h2>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Seleziona l'opzione di acquisto più adatta alle tue esigenze per {product.name}.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {/* Monthly Plan */}
                  <div className={`border rounded-xl p-6 hover:border-yellow-600 transition-all transform hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-gray-900/70 border-yellow-800/50'
                      : 'bg-white border-yellow-300 shadow-lg'
                  }`}>
                    <h3 className={`text-xl font-bold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Abbonamento Mensile</h3>
                    <div className="text-3xl font-black text-yellow-500 mb-4">
                      <span className="text-gray-500 line-through text-xl mr-2">€124,99</span>
                      €69,99
                      <span className="text-sm text-gray-400 font-normal">/mese</span>
                    </div>
                    <ul className={`text-sm mb-4 space-y-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <li>• Accesso completo</li>
                      <li>• Aggiornamenti inclusi</li>
                      <li>• Supporto tecnico</li>
                      <li>• Cancellazione anytime</li>
                    </ul>
                    <button
                      onClick={() => handleSelectPlan('monthly')}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 border-2 border-blue-400 rounded-lg font-bold text-white hover:from-blue-500 hover:to-blue-600 hover:border-blue-300 transition-all hover:scale-105"
                    >
                      Scegli Mensile
                    </button>
                  </div>

                  {/* Yearly Plan */}
                  <div className={`border-2 border-yellow-600 rounded-xl p-6 relative transform hover:scale-105 transition-all ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30'
                      : 'bg-gradient-to-br from-yellow-50 to-orange-50 shadow-xl'
                  }`}>
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      PIÙ POPOLARE
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Abbonamento Annuale</h3>
                    <div className="text-3xl font-black text-yellow-500 mb-4">
                      <span className="text-gray-500 line-through text-xl mr-2">€999,99</span>
                      €699,99
                      <span className="text-sm text-gray-400 font-normal">/anno</span>
                    </div>
                    <ul className={`text-sm mb-4 space-y-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <li>• Tutto del piano mensile</li>
                      <li>• Risparmio del 20%</li>
                      <li>• Priorità supporto</li>
                      <li>• Accesso anticipato</li>
                    </ul>
                    <button
                      onClick={() => handleSelectPlan('yearly')}
                      className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-300 transition-all hover:scale-105"
                    >
                      Scegli Annuale
                    </button>
                  </div>

                  {/* Lifetime Plan */}
                  <div className={`border rounded-xl p-6 hover:border-green-500 transition-all transform hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-gray-900/70 border-green-800/50'
                      : 'bg-white border-green-300 shadow-lg'
                  }`}>
                    <h3 className={`text-xl font-bold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Acquisto Lifetime</h3>
                    <div className="text-3xl font-black text-yellow-500 mb-4">
                      <span className="text-gray-500 line-through text-xl mr-2">€1899,99</span>
                      €1399,99
                      <span className="text-sm text-gray-400 font-normal">una tantum</span>
                    </div>
                    <ul className={`text-sm mb-4 space-y-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <li>• Accesso a vita</li>
                      <li>• Tutti gli aggiornamenti</li>
                      <li>• Supporto lifetime</li>
                      <li>• Nessun rinnovo</li>
                    </ul>
                    <button
                      onClick={() => handleSelectPlan('lifetime')}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 border-2 border-green-400 rounded-lg font-bold text-white hover:from-green-500 hover:to-emerald-500 hover:border-green-300 transition-all hover:scale-105"
                    >
                      Acquista Lifetime
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowPlanSelection(false)}
                  className="text-gray-400 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
                >
                  ← Torna indietro
                </button>
              </>
            ) : (
              <>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-4">
                  Soddisfatto del Trial?
                </h2>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Passa alla versione completa e sblocca tutto il potenziale di {product.name}. 
                  Accesso a vita, aggiornamenti gratuiti e supporto prioritario inclusi!
                </p>
                <button
                  onClick={() => setShowPlanSelection(true)}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400 rounded-xl font-bold text-white hover:from-yellow-500 hover:to-orange-500 hover:border-yellow-300 transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-yellow-500/50 animate-pulse inline-flex items-center gap-3"
                >
                  <Rocket className="w-6 h-6" />
                  ACQUISTA ORA - SCONTO SPECIALE TRIAL
                </button>
                {product.price && (
                  <p className="text-gray-400 mt-4">
                    Prezzo speciale per utenti trial: <span className="text-yellow-500 font-bold">
                      {typeof product.price === 'object' 
                        ? `€${product.price.lifetime || product.price.yearly || product.price.monthly}`
                        : `€${product.price}`
                      }
                    </span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payment Options Modal */}
      {selectedPlan && product && (
        <PaymentOptionsModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(undefined)}
          productId={product.id}
          productName={`${product.name} - ${getPlanLabel(selectedPlan)}`}
          price={selectedPlan === 'monthly' ? 69.99 : selectedPlan === 'yearly' ? 699.99 : 1399.99}
          originalPrice={selectedPlan === 'monthly' ? 124.99 : selectedPlan === 'yearly' ? 999.99 : 1899.99}
          productType={product.category === 'bot' || product.category === 'Bot' ? 'bot' : 'course'}
          plan={selectedPlan}
        />
      )}
    </div>
  );
};

export default TrialManagement;
