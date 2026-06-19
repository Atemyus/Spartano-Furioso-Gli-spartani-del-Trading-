import React, { useState } from 'react';
import { X, CreditCard, Bitcoin, Clock, CheckCircle, CalendarClock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface PaymentOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;  // Rinominato da courseId per essere più generico
  productName: string;  // Rinominato da courseName per essere più generico
  price: number;
  originalPrice?: number;
  productType?: 'course' | 'bot' | 'indicator' | 'service';  // Tipo di prodotto
  plan?: 'monthly' | 'yearly' | 'lifetime';  // Piano selezionato
}

type PaymentMethod = 'stripe' | 'klarna' | 'crypto';

const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  price,
  originalPrice,
  productType = 'course',
  plan = 'lifetime'
}) => {
  const { theme } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const submitStripeCheckout = async (paymentMethod: 'card' | 'klarna') => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');

      // Determina l'intervallo in base al piano
      let interval = 'one-time';
      if (plan === 'monthly') interval = 'month';
      else if (plan === 'yearly') interval = 'year';

      const response = await fetch('https://api.nexoralab.solutions/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId,
          productName: productName,
          amount: Math.round(price * 100), // Converti in centesimi
          currency: 'EUR',
          interval: interval,
          paymentMethod, // 'card' o 'klarna'
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
          productType: productType,
          plan: plan
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        
        if (url) {
          // Redirect to Stripe Checkout
          window.location.href = url;
        } else {
          alert('Errore nella creazione della sessione di pagamento');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Errore durante il processo di pagamento');
      }
    } catch (error) {
      console.error('Errore checkout:', error);
      alert('Errore nel processo di pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePayment = () => submitStripeCheckout('card');
  const handleKlarnaPayment = () => submitStripeCheckout('klarna');

  const handleCryptoPayment = async () => {
    setIsProcessing(true);
    try {
      const userEmail = localStorage.getItem('userEmail');
      
      const response = await fetch('https://api.nexoralab.solutions/api/payments/crypto/create-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: price,
          currency: 'EUR',
          productName: productName,
          productId: productId,
          customerEmail: userEmail,
          productType: productType,
          plan: plan
        })
      });

      if (!response.ok) {
        throw new Error('Errore nella creazione del pagamento crypto');
      }

      const data = await response.json();
      
      if (data.chargeUrl) {
        // Reindirizza a Coinbase Commerce per il pagamento
        window.location.href = data.chargeUrl;
      } else {
        throw new Error('URL Coinbase non disponibile');
      }
    } catch (error) {
      console.error('Errore Crypto:', error);
      alert('Errore nel processo di pagamento Crypto');
      setIsProcessing(false);
    }
  };

  const isSubscriptionPlan = plan === 'monthly' || plan === 'yearly';

  const handlePayment = () => {
    switch (selectedMethod) {
      case 'stripe':
        handleStripePayment();
        break;
      case 'klarna':
        handleKlarnaPayment();
        break;
      case 'crypto':
        handleCryptoPayment();
        break;
    }
  };

  // Se l'utente seleziona Klarna ma poi cambia piano in abbonamento, resetta a stripe
  React.useEffect(() => {
    if (selectedMethod === 'klarna' && isSubscriptionPlan) {
      setSelectedMethod('stripe');
    }
  }, [isSubscriptionPlan, selectedMethod]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
      theme === 'dark' ? 'bg-black/80' : 'bg-gray-900/50'
    }`}>
      <div className={`relative w-full max-w-2xl rounded-2xl border-2 shadow-2xl overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-cyan-600/50 shadow-cyan-900/50'
          : 'bg-white border-cyan-400 shadow-cyan-200'
      }`}>
        {/* Header */}
        <div className={`relative border-b p-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-cyan-600/20 to-sky-600/20 border-cyan-600/50'
            : 'bg-gradient-to-r from-cyan-50 to-sky-50 border-cyan-300'
        }`}>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={`absolute top-4 right-4 transition-colors disabled:opacity-50 ${
              theme === 'dark'
                ? 'text-white hover:text-cyan-500'
                : 'text-gray-700 hover:text-cyan-600'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            🔒 Pagamento Sicuro
          </h2>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Seleziona il metodo di pagamento che preferisci
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dettagli corso */}
          <div className={`border rounded-xl p-4 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-cyan-900/30 to-sky-900/30 border-cyan-600/50'
              : 'bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-400'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{productName}</h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {productType === 'course' ? 'Accesso completo a vita' : 
                   plan === 'monthly' ? 'Abbonamento mensile' :
                   plan === 'yearly' ? 'Abbonamento annuale' :
                   'Accesso a vita'}
                </p>
              </div>
              <div className="text-right">
                {originalPrice && originalPrice > price && (
                  <div className="text-gray-400 line-through text-sm">
                    €{originalPrice}
                  </div>
                )}
                <div className="text-2xl font-black text-cyan-500">
                  €{price}
                </div>
              </div>
            </div>
          </div>

          {/* Metodi di pagamento */}
          <div className="space-y-3">
            {/* Stripe - Carta di Credito */}
            <button
              onClick={() => setSelectedMethod('stripe')}
              disabled={isProcessing}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left disabled:opacity-50 ${
                selectedMethod === 'stripe'
                  ? 'border-blue-500 bg-blue-500/10'
                  : theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedMethod === 'stripe'
                    ? 'bg-blue-500'
                    : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Carta di Credito/Debito
                    {selectedMethod === 'stripe' && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Pagamento sicuro con Stripe</p>
                </div>
                <div className="flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4 brightness-200" />
                </div>
              </div>
            </button>

            {/* Klarna — paga in 3 rate (solo su pagamenti unici) */}
            {!isSubscriptionPlan && (
              <button
                onClick={() => setSelectedMethod('klarna')}
                disabled={isProcessing}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left disabled:opacity-50 ${
                  selectedMethod === 'klarna'
                    ? 'border-[#ffa8cd] bg-[#ffa8cd]/10'
                    : theme === 'dark'
                      ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedMethod === 'klarna'
                      ? 'bg-[#ffa8cd]'
                      : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <CalendarClock className={`w-6 h-6 ${selectedMethod === 'klarna' ? 'text-black' : 'text-white'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold flex items-center gap-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Klarna — Paga in 3 rate
                      {selectedMethod === 'klarna' && (
                        <CheckCircle className="w-5 h-5 text-[#ffa8cd]" />
                      )}
                    </h3>
                    <p className={`text-sm flex items-center gap-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Clock className="w-3 h-3" />
                      3 rate senza interessi · approvazione istantanea
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded font-bold text-xs ${
                    selectedMethod === 'klarna'
                      ? 'bg-[#ffa8cd] text-black'
                      : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    Klarna.
                  </div>
                </div>
              </button>
            )}

            {/* Crypto */}
            <button
              onClick={() => setSelectedMethod('crypto')}
              disabled={isProcessing}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left disabled:opacity-50 ${
                selectedMethod === 'crypto'
                  ? 'border-sky-500 bg-sky-500/10'
                  : theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedMethod === 'crypto'
                    ? 'bg-sky-500'
                    : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Bitcoin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold flex items-center gap-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Criptovalute
                    {selectedMethod === 'crypto' && (
                      <CheckCircle className="w-5 h-5 text-sky-500" />
                    )}
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>200+ crypto: BTC, ETH, USDT, BNB, TRX...</p>
                </div>
                <div className="text-sky-500 font-bold text-xs">
                  CRYPTO
                </div>
              </div>
            </button>
          </div>

          {/* Benefits */}
          <div className={`rounded-xl p-4 border ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className={`font-bold mb-3 text-sm ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>✅ Incluso nell'acquisto:</h4>
            <ul className={`space-y-2 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Accesso immediato a tutti i contenuti</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Certificato di completamento</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Supporto dedicato e aggiornamenti gratuiti</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Garanzia soddisfatto o rimborsato 30 giorni</span>
              </li>
            </ul>
          </div>

          {/* Pulsante Procedi */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-sky-600 border-2 border-cyan-400 rounded-xl font-bold text-white text-lg hover:from-cyan-500 hover:to-sky-500 hover:border-cyan-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Reindirizzamento...
              </span>
            ) : (
              `Procedi al Pagamento - €${price}`
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            🔒 I tuoi dati sono protetti con crittografia SSL
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsModal;
