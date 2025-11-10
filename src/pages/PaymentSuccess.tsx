import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Mail, MessageCircle } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

// Telegram VIP Link - aggiorna questo link con il tuo gruppo privato
const TELEGRAM_VIP_LINK = 'https://t.me/+YOUR_PRIVATE_GROUP_LINK';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  const sessionId = searchParams.get('session_id');
  const productId = searchParams.get('product');

  useEffect(() => {
    // Simula il caricamento dei dettagli dell'ordine
    setTimeout(() => {
      setOrderDetails({
        productName: 'Corso Completo',
        amount: 1500,
        currency: 'EUR',
        orderNumber: `ORD-${Date.now()}`,
        date: new Date().toLocaleDateString('it-IT')
      });
      setLoading(false);
    }, 1500);
  }, [sessionId]);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-gradient-to-b from-black via-green-950/20 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-white text-xl">Elaborazione del pagamento...</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-b from-black via-green-950/20 to-black">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black text-white mb-4">
                Pagamento Completato con Successo! 🎉
              </h1>
              <p className="text-xl text-gray-300 mb-4">
                Grazie per il tuo acquisto!
              </p>
              <div className="bg-yellow-900/30 border-2 border-yellow-600/50 rounded-xl p-6 max-w-xl mx-auto">
                <p className="text-yellow-200 font-semibold mb-2">
                  ⏳ Il tuo ordine è in fase di verifica
                </p>
                <p className="text-gray-300 text-sm">
                  Riceverai le credenziali di accesso Vimeo via email entro 24 ore dopo la conferma dell'ordine.
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-gray-900/50 border-2 border-green-600/50 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Dettagli Ordine</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Numero Ordine:</span>
                  <span className="text-white font-mono">{orderDetails?.orderNumber}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Prodotto:</span>
                  <span className="text-white">{orderDetails?.productName}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-400">Data:</span>
                  <span className="text-white">{orderDetails?.date}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-400">Totale Pagato:</span>
                  <span className="text-2xl font-bold text-green-400">
                    €{orderDetails?.amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Telegram VIP Access */}
            <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-2 border-blue-600/50 rounded-xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Accesso Gruppo Telegram VIP</h3>
                  <p className="text-gray-300">Community esclusiva per studenti del corso</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">
                Unisciti al nostro gruppo privato Telegram dove potrai:
              </p>
              <ul className="space-y-2 mb-6 text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Ricevere segnali di trading in tempo reale</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Confrontarti con altri trader quantitativi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Partecipare a sessioni live di analisi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Ottenere supporto diretto dal team</span>
                </li>
              </ul>
              
              <a
                href={TELEGRAM_VIP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-bold text-white hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/50"
              >
                <MessageCircle className="w-6 h-6" />
                Entra nel Gruppo VIP Telegram
                <ArrowRight className="w-5 h-5" />
              </a>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                💡 Clicca sul pulsante per accedere immediatamente al gruppo privato
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border-2 border-purple-600/50 rounded-xl p-8 mb-8">
              <h3 className="text-xl font-bold text-white mb-4">I Prossimi Passi</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-white font-semibold">1. Controlla la tua email</p>
                    <p className="text-gray-400 text-sm">
                      Ti abbiamo inviato la conferma dell'ordine. Riceverai le credenziali Vimeo dopo la verifica (entro 24h).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-white font-semibold">2. Unisciti alla community VIP</p>
                    <p className="text-gray-400 text-sm">
                      Accedi subito al gruppo Telegram esclusivo usando il link qui sopra
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-white font-semibold">3. Preparati al corso</p>
                    <p className="text-gray-400 text-sm">
                      Una volta ricevute le credenziali Vimeo, potrai accedere a tutti i contenuti del corso
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 rounded-lg font-bold text-white hover:from-green-500 hover:to-green-600 transition-all flex items-center justify-center gap-2"
              >
                Vai alla Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
              {productId && (
                <Link
                  to={`/course/${productId}/viewer`}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg font-bold text-white hover:from-purple-500 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                >
                  Inizia il Corso
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Support Info */}
            <div className="text-center mt-12 text-gray-400">
              <p>Hai bisogno di aiuto? Contattaci su</p>
              <a 
                href="https://t.me/codextrading" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Telegram @codextrading
              </a>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default PaymentSuccess;
