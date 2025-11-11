import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval?: string;
}

interface StripeCheckoutProps {
  product: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ product, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchStripeConfig();
  }, []);

  const fetchStripeConfig = async () => {
    try {
      const response = await fetch('https://api.spartanofurioso.com/api/stripe/config');
      const { publishableKey } = await response.json();
      
      if (publishableKey) {
        const stripe = loadStripe(publishableKey);
        setStripePromise(stripe);
      }
    } catch (err) {
      console.error('Error loading Stripe:', err);
      setError('Errore nel caricamento del sistema di pagamento');
    }
  };

  const handleCheckout = async () => {
    if (!stripePromise) {
      setError('Sistema di pagamento non disponibile');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const stripe = await stripePromise;
      
      // Create checkout session
      const response = await fetch('https://api.spartanofurioso.com/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: product.name,
          amount: Math.round(product.price * 100), // Convert to cents
          currency: product.currency,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      const { sessionId, url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else if (sessionId) {
        // Redirect using Stripe SDK
        const { error } = await stripe.redirectToCheckout({ sessionId });
        
        if (error) {
          setError(error.message || 'Errore durante il checkout');
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Errore durante il processo di pagamento');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-blue-600">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.interval && (
            <span className="text-gray-600">/{product.interval}</span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading || !stripePromise}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Elaborazione...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Procedi al Pagamento</span>
          </>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Lock className="w-4 h-4" />
          <span>Pagamento sicuro</span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-4 h-4" />
          <span>SSL Criptato</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
            alt="Powered by Stripe" 
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;
