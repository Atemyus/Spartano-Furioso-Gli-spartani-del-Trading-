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
          trialDays: product.trialDays || 7
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
        alert(`Trial attivato con successo! Hai ${product.trialDays || 7} giorni di accesso completo.`);
        
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
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
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Prodotto non trovato</h2>
          <Link to="/products" className="text-yellow-500 hover:text-yellow-400">
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
          ? 'bg-gradient-to-b from-black via-red-950/20 to-black'
          : 'bg-gradient-to-b from-white via-red-50/40 to-white'
      }`}>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-900/20 border-2 border-red-500 rounded-2xl p-8 text-center">
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
              <h1 className={`text-4xl font-black mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                TRIAL SCADUTO
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Il tuo periodo di prova per <span className="text-yellow-500 font-bold">{product.name}</span> è terminato.
              </p>
              
              <div className="bg-black/50 border border-red-900/30 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-gray-400 text-sm">Iniziato il</span>
                    <p className="text-white font-bold">
                      {new Date(trialData.startDate).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Terminato il</span>
                    <p className="text-red-400 font-bold">
                      {new Date(trialData.endDate).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Link
                  to={(product.category === 'course' || product.category === 'Formazione') ? `/course/${productId}` : `/products`}
                  className="block w-full px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-bold text-white hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105"
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
            <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                🎯 Perché acquistare {product.name}?
              </h3>
              <ul className="space-y-2 text-gray-300">
                {product.metrics?.winRate && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Win Rate del {product.metrics.winRate}%</span>
                  </li>
                )}
                {product.metrics?.avgProfit && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>Profitto medio del {product.metrics.avgProfit}%</span>
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

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-black via-gray-950 to-black'
        : 'bg-gradient-to-b from-white via-gray-50 to-white'
    }`}>
      {/* Header */}
      <div className={`backdrop-blur-sm border-b ${
        theme === 'dark'
          ? 'bg-black/50 border-red-900/30'
          : 'bg-white/50 border-red-200'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-yellow-500/50 text-yellow-400 hover:text-yellow-300 hover:bg-gray-900/70 hover:border-yellow-400'
                  : 'bg-white border-yellow-400/50 text-yellow-600 hover:text-yellow-700 hover:border-yellow-500'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Indietro</span>
            </button>
            
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-yellow-500" />
              <h1 className="text-2xl font-black">
                <span className="text-red-600">TRIAL</span>
                <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>ACTIVATION</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Product Header */}
          <div className="bg-gray-900/50 border border-red-900/30 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-3xl font-black text-white">{product.name}</h2>
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
                    <span className="text-2xl font-black text-yellow-500">{product.trialDays || 60} GIORNI</span>
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
                        <div className="text-2xl font-black text-white">{product.metrics.winRate}%</div>
                      </div>
                    )}
                    {product.metrics.avgProfit && (
                      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-400 text-sm">Profit Medio</span>
                        </div>
                        <div className="text-2xl font-black text-white">+{product.metrics.avgProfit}%</div>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {!trialActivated ? (
                    <button
                      onClick={activateTrial}
                      className="flex-1 py-4 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-red-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
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
                    <span className="text-yellow-500 font-bold">{product.category}</span>
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
                <div className="bg-gray-900/50 border border-red-900/30 rounded-xl p-6">
                  <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
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
                <div className="bg-gray-900/50 border border-yellow-900/30 rounded-xl p-6">
                  <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                    REQUISITI
                  </h3>
                  <ul className="space-y-3">
                    {product.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Platforms - Use dynamic config if available, fallback to product.platforms */}
              {((config?.platforms && config.platforms.length > 0) || (product.platforms && product.platforms.length > 0)) && (
                <div className="bg-gray-900/50 border border-blue-900/30 rounded-xl p-6">
                  <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
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
            <div className="space-y-8">
              {/* Telegram Links */}
              <div className="bg-gradient-to-r from-blue-950/50 to-cyan-950/50 border-2 border-blue-500/50 rounded-xl p-6">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                  SUPPORTO TELEGRAM
                </h3>
                
                <div className="space-y-4">
                  {/* Canale Annunci */}
                  <a
                    href={TELEGRAM_CHANNEL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-black/30 border border-blue-800 rounded-lg p-4 hover:bg-blue-900/20 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">Canale Ufficiale</h4>
                          <p className="text-gray-400 text-sm">Annunci e aggiornamenti</p>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-blue-400" />
                    </div>
                  </a>

                  {/* Gruppo Supporto - Bloccato per Trial */}
                  <div className="block bg-black/30 border border-gray-700 rounded-lg p-4 opacity-50 cursor-not-allowed relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="text-gray-400 font-bold">Gruppo Community</h4>
                          <p className="text-gray-500 text-sm">Supporto e discussioni</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-yellow-500" />
                        <span className="text-yellow-500 text-xs font-bold">PREMIUM</span>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-400 text-center">
                      💎 Disponibile dopo l'acquisto del prodotto
                    </div>
                  </div>

                  {/* Richiedi Licenza */}
                  <a
                    href={TELEGRAM_CONTACT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border border-yellow-700/30 rounded-xl p-6 hover:border-yellow-500/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-600/30 transition-colors">
                        <Key className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">Richiedi Licenza</h4>
                        <p className="text-gray-400 text-sm">Contatta @catiscrazy per la licenza 60 giorni</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gray-900/50 border border-purple-900/30 rounded-xl p-6">
                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                  COME INIZIARE
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Attiva il Trial</h4>
                      <p className="text-gray-400 text-sm">Clicca sul pulsante "Attiva Trial" per iniziare i tuoi 60 giorni gratuiti</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Scarica il Software</h4>
                      <p className="text-gray-400 text-sm">Scarica il bot o l'indicatore sul tuo computer</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Ottieni la Licenza</h4>
                      <p className="text-gray-400 text-sm">Contatta @catiscrazy su Telegram per ricevere il codice licenza di 60 giorni</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
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
              <div className="bg-red-950/30 border border-red-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
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
