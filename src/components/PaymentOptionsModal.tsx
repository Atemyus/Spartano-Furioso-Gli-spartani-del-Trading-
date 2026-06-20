import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Bitcoin, Clock, CheckCircle, CalendarClock, Lock, Loader2 } from 'lucide-react';
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

  const isSubscriptionPlan = plan === 'monthly' || plan === 'yearly';

  // Klarna disponibile solo per pagamenti unici: se diventa abbonamento, resetta a card
  useEffect(() => {
    if (selectedMethod === 'klarna' && isSubscriptionPlan) {
      setSelectedMethod('stripe');
    }
  }, [isSubscriptionPlan, selectedMethod]);

  // NB: niente early return su !isOpen — AnimatePresence (sotto) gestisce
  // mount/unmount animato del modale tramite la prop isOpen.

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

  // ====== styling helpers (dashboard-style) ======
  const dark = theme === 'dark';
  const textMain = dark ? 'text-white' : 'text-slate-900';
  const textMuted = dark ? 'text-slate-400' : 'text-slate-600';
  const textDim = dark ? 'text-slate-500' : 'text-slate-500';
  const surface = dark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200';
  const tag = (label: string) => (
    <span className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">{label}</span>
  );

  const methods: {
    id: PaymentMethod;
    title: string;
    desc: string;
    Icon: React.ElementType;
    badge: string;
    available: boolean;
  }[] = [
    {
      id: 'stripe',
      title: 'Carta di credito / debito',
      desc: 'Pagamento sicuro con Stripe',
      Icon: CreditCard,
      badge: 'Stripe',
      available: true,
    },
    {
      id: 'klarna',
      title: 'Klarna — paga in 3 rate',
      desc: '3 rate senza interessi · approvazione istantanea',
      Icon: CalendarClock,
      badge: 'Klarna',
      available: !isSubscriptionPlan,
    },
    {
      id: 'crypto',
      title: 'Criptovalute',
      desc: '200+ crypto: BTC, ETH, USDT, BNB, TRX...',
      Icon: Bitcoin,
      badge: 'Crypto',
      available: true,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="payment-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${
            dark ? 'bg-black/80' : 'bg-slate-900/60'
          }`}
        >
          <motion.div
            key="payment-card"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col ${surface}`}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            {/* Header */}
            <div className={`relative px-6 pt-6 pb-5 border-b ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={onClose}
                disabled={isProcessing}
                aria-label="Chiudi"
                className={`absolute top-4 right-4 p-2 rounded-lg transition-all disabled:opacity-50 ${
                  dark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-3.5 h-3.5 text-cyan-500" />
                {tag('// pagamento sicuro')}
              </div>
              <h2 className={`font-display text-2xl font-semibold tracking-tight ${textMain}`}>
                Completa il tuo acquisto
              </h2>
              <p className={`mt-1 text-sm ${textMuted}`}>
                Seleziona il metodo di pagamento che preferisci
              </p>
            </div>

            {/* Body scrollabile */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto">
              {/* Product summary card */}
              <div className={`rounded-xl p-4 flex items-center justify-between gap-4 ${
                dark ? 'bg-slate-950/60 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'
              }`}>
                <div className="min-w-0">
                  <div className={`font-display font-semibold ${textMain} truncate`}>{productName}</div>
                  <div className={`text-xs mt-0.5 ${textMuted}`}>
                    {productType === 'course' ? 'Accesso completo a vita' :
                     plan === 'monthly' ? 'Abbonamento mensile' :
                     plan === 'yearly' ? 'Abbonamento annuale' :
                     'Accesso a vita'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {originalPrice && originalPrice > price && (
                    <div className={`text-xs line-through ${textDim}`}>€{originalPrice}</div>
                  )}
                  <div className="font-display text-2xl font-semibold text-cyan-500">€{price}</div>
                </div>
              </div>

              {/* Metodi di pagamento */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-500" />
                  {tag('// metodo di pagamento')}
                </div>

                {methods.filter(m => m.available).map((m) => {
                  const active = selectedMethod === m.id;
                  const Icon = m.Icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      disabled={isProcessing}
                      className={`w-full p-4 rounded-xl border transition-all text-left disabled:opacity-50 flex items-center gap-3 ${
                        active
                          ? dark
                            ? 'bg-cyan-500/5 border-cyan-500/50 ring-1 ring-cyan-500/30'
                            : 'bg-cyan-50 border-cyan-500/50 ring-1 ring-cyan-500/40'
                          : dark
                            ? 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/40'
                            : 'bg-white border-slate-200 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        active
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          : dark ? 'bg-slate-800' : 'bg-slate-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-cyan-500'}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`flex items-center gap-1.5 font-display font-semibold text-sm ${textMain}`}>
                          {m.title}
                          {active && <CheckCircle className="w-3.5 h-3.5 text-cyan-500 shrink-0" />}
                        </div>
                        <div className={`text-xs mt-0.5 flex items-center gap-1 ${textMuted}`}>
                          {m.id === 'klarna' && <Clock className="w-3 h-3" />}
                          {m.desc}
                        </div>
                      </div>

                      <span className={`font-mono-lab text-[0.6rem] tracking-[0.2em] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                        active
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                      }`}>{m.badge}</span>
                    </button>
                  );
                })}
              </div>

              {/* Incluso nell'acquisto */}
              <div className={`rounded-xl p-4 ${dark ? 'bg-slate-950/40 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  {tag('// incluso')}
                </div>
                <ul className="space-y-1.5 text-sm">
                  {[
                    'Accesso immediato a tutti i contenuti',
                    'Certificato di completamento',
                    'Supporto dedicato e aggiornamenti gratuiti',
                    'Garanzia soddisfatto o rimborsato 30 giorni',
                  ].map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className={textMuted}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer fisso */}
            <div className={`px-6 py-4 border-t ${dark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/50'}`}>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-display font-semibold text-sm hover:shadow-md hover:shadow-cyan-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Reindirizzamento in corso...
                  </>
                ) : (
                  <>Procedi al pagamento · €{price}</>
                )}
              </button>
              <p className={`mt-3 text-center text-[0.65rem] font-mono-lab tracking-widest uppercase flex items-center justify-center gap-1.5 ${textDim}`}>
                <Lock className="w-3 h-3" />
                Dati protetti con crittografia SSL
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentOptionsModal;
