import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  PlayCircle, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  Sliders,
  TrendingUp,
  Shield
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category?: string;
}

const TutorialParameters: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // URL video tutorial - PERSONALIZZA QUESTI
  const PARAMETERS_VIDEO_URL = "https://www.youtube.com/embed/YOUR_VIDEO_ID"; // Sostituisci con il tuo video

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/products?t=${Date.now()}`);
      if (response.ok) {
        const products = await response.json();
        const foundProduct = products.find((p: Product) => p.id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Prodotto non trovato</h2>
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-400">
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-blue-900/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(`/trial/${productId}/manage`)}
              className="flex items-center gap-3 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Torna al Trial</span>
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-800 rounded-lg">
              <Settings className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 text-sm font-bold">PARAMETRI</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              <Settings className="w-10 h-10 text-blue-500" />
              Parametri {product.name}
            </h1>
            <p className="text-gray-400">
              Guida completa per configurare e ottimizzare ogni parametro dell'EA
            </p>
          </div>

          {/* Video Player */}
          <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-800 rounded-xl p-6 mb-8">
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <iframe
                width="100%"
                height="100%"
                src={PARAMETERS_VIDEO_URL}
                title="Tutorial Parametri EA"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>~15 minuti</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Livello: Intermedio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Parameters Categories */}
          <div className="space-y-6 mb-8">
            {/* Risk Management */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-500" />
                Gestione del Rischio
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/30 border border-green-900/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Risk Percentage</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        Percentuale del capitale da rischiare per ogni trade. Consigliato: 1-2%
                      </p>
                      <div className="bg-green-900/20 border border-green-700/30 rounded p-2 text-xs text-green-400">
                        <strong>Esempio:</strong> Con $10,000 e Risk 2%, ogni trade rischia $200
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 border border-green-900/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Max Spread</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        Spread massimo consentito per aprire un trade (in pips). Previene trade durante alta volatilità.
                      </p>
                      <div className="bg-green-900/20 border border-green-700/30 rounded p-2 text-xs text-green-400">
                        <strong>Consigliato:</strong> 20-30 pips per EUR/USD
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 border border-green-900/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Stop Loss / Take Profit</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        Distanza in pips per chiudere automaticamente il trade in perdita o profitto.
                      </p>
                      <div className="bg-green-900/20 border border-green-700/30 rounded p-2 text-xs text-green-400">
                        <strong>Ratio consigliato:</strong> TP = 2x SL (es. SL 50 pips, TP 100 pips)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trading Strategy */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                Strategia di Trading
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/30 border border-blue-900/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Timeframe</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        Intervallo temporale su cui l'EA analizza il mercato (M1, M5, M15, H1, H4, D1).
                      </p>
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded p-2 text-xs text-blue-400">
                        <strong>Consigliato:</strong> H1 o H4 per trading più stabile
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 border border-blue-900/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Magic Number</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        Numero identificativo univoco per i trade dell'EA. Utile se usi più EA sullo stesso account.
                      </p>
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded p-2 text-xs text-blue-400">
                        <strong>Esempio:</strong> 12345 (qualsiasi numero univoco)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 border border-blue-900/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Max Trades</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        Numero massimo di trade aperti contemporaneamente.
                      </p>
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded p-2 text-xs text-blue-400">
                        <strong>Consigliato:</strong> 1-3 per account piccoli, 5-10 per account grandi
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-500" />
                Impostazioni Avanzate
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/30 border border-purple-900/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Trailing Stop</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        Sposta automaticamente lo Stop Loss in profitto man mano che il trade guadagna.
                      </p>
                      <div className="bg-purple-900/20 border border-purple-700/30 rounded p-2 text-xs text-purple-400">
                        <strong>Esempio:</strong> Trailing 20 pips = SL si sposta ogni 20 pips di profitto
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 border border-purple-900/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">News Filter</h4>
                      <p className="text-gray-400 text-sm mb-2">
                        Blocca il trading durante eventi economici ad alto impatto.
                      </p>
                      <div className="bg-purple-900/20 border border-purple-700/30 rounded p-2 text-xs text-purple-400">
                        <strong>Consigliato:</strong> Attivare per evitare alta volatilità
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              💡 Best Practices
            </h3>
            
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span><strong>Inizia con Risk basso:</strong> Usa 0.5-1% finché non capisci bene l'EA</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span><strong>Testa su Demo:</strong> Prova le impostazioni su account demo prima di usare soldi reali</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span><strong>Monitora regolarmente:</strong> Controlla i risultati e aggiusta i parametri se necessario</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span><strong>Non cambiare troppo spesso:</strong> Dai tempo all'EA di mostrare risultati (almeno 1-2 settimane)</span>
              </li>
            </ul>
          </div>

          {/* Back to Trial */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">🎯 Pronto per Iniziare?</h3>
            <p className="text-gray-300 mb-4">
              Ora che conosci tutti i parametri, torna al trial e inizia a fare trading!
            </p>
            <button
              onClick={() => navigate(`/trial/${productId}/manage`)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold text-white hover:from-purple-500 hover:to-blue-500 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Torna al Trial Management
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialParameters;
