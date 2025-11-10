import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  PlayCircle, 
  Download, 
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category?: string;
}

const TutorialInstallation: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // URL video tutorial - PERSONALIZZA QUESTI
  const INSTALLATION_VIDEO_URL = "https://www.youtube.com/embed/YOUR_VIDEO_ID"; // Sostituisci con il tuo video

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Prodotto non trovato</h2>
          <Link to="/dashboard" className="text-purple-500 hover:text-purple-400">
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-purple-900/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(`/trial/${productId}/manage`)}
              className="flex items-center gap-3 text-gray-400 hover:text-purple-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Torna al Trial</span>
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-800 rounded-lg">
              <PlayCircle className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 text-sm font-bold">TUTORIAL</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              <PlayCircle className="w-10 h-10 text-purple-500" />
              Installazione {product.name}
            </h1>
            <p className="text-gray-400">
              Guida passo-passo per installare correttamente l'EA su MetaTrader 4/5
            </p>
          </div>

          {/* Video Player */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-800 rounded-xl p-6 mb-8">
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <iframe
                width="100%"
                height="100%"
                src={INSTALLATION_VIDEO_URL}
                title="Tutorial Installazione"
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
                  <span>~10 minuti</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Livello: Principiante</span>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">📋 Passi da Seguire</h3>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-2">Scarica l'EA</h4>
                  <p className="text-gray-400 mb-3">
                    Dalla pagina del trial, clicca sul pulsante "Scarica Bot" per scaricare il file .ex4 o .ex5
                  </p>
                  <div className="flex items-center gap-2 text-sm text-purple-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>File: {product.name}.ex4</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-2">Apri la Cartella di MetaTrader</h4>
                  <p className="text-gray-400 mb-3">
                    In MetaTrader, vai su <code className="bg-black/50 px-2 py-1 rounded text-purple-400">File → Apri Cartella Dati</code>
                  </p>
                  <div className="bg-black/30 border border-purple-900/30 rounded p-3 text-sm text-gray-300">
                    <strong className="text-purple-400">Percorso:</strong> MQL4/Experts (per MT4) o MQL5/Experts (per MT5)
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-2">Copia il File EA</h4>
                  <p className="text-gray-400 mb-3">
                    Copia il file .ex4/.ex5 scaricato nella cartella <strong>Experts</strong>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-2">Riavvia MetaTrader</h4>
                  <p className="text-gray-400 mb-3">
                    Chiudi e riapri MetaTrader per caricare il nuovo EA
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-2">Applica l'EA al Grafico</h4>
                  <p className="text-gray-400 mb-3">
                    Nel Navigator, trascina l'EA sul grafico desiderato e inserisci il codice licenza
                  </p>
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded p-3 text-sm text-yellow-400">
                    ⚠️ <strong>Importante:</strong> Assicurati di abilitare "Consenti trading automatico" nelle impostazioni
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              Problemi Comuni
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-bold mb-2">❌ L'EA non appare nel Navigator</h4>
                <p className="text-gray-400 text-sm">
                  Soluzione: Verifica di aver copiato il file nella cartella corretta e riavvia MetaTrader
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-2">❌ Errore "DLL non consentite"</h4>
                <p className="text-gray-400 text-sm">
                  Soluzione: Vai su Strumenti → Opzioni → Expert Advisors e abilita "Consenti importazioni DLL"
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-2">❌ L'EA non fa trading</h4>
                <p className="text-gray-400 text-sm">
                  Soluzione: Verifica che il pulsante "AutoTrading" sia attivo (verde) nella toolbar di MetaTrader
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">🎯 Prossimo Passo</h3>
            <p className="text-gray-300 mb-4">
              Ora che hai installato l'EA, impara a configurare i parametri per ottimizzare le performance!
            </p>
            <button
              onClick={() => navigate(`/tutorial/parameters/${productId}`)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold text-white hover:from-blue-500 hover:to-purple-500 transition-all flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Guarda Tutorial Parametri
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialInstallation;
