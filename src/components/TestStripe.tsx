import React, { useState } from 'react';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';

const TestStripe = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const testStripeConfig = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/stripe/config');
      const data = await response.json();
      
      if (data.publishableKey && data.publishableKey !== 'pk_test_your_stripe_publishable_key') {
        setResult({ 
          success: true, 
          message: `✅ Stripe configurato correttamente!\nPublishable Key: ${data.publishableKey.substring(0, 20)}...` 
        });
      } else {
        setResult({ 
          success: false, 
          message: '❌ Stripe NON configurato. Aggiungi le chiavi nel file .env del server.' 
        });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: `❌ Errore connessione: ${error instanceof Error ? error.message : 'Server non raggiungibile su porta 3001'}` 
      });
    } finally {
      setTesting(false);
    }
  };

  const testStripeCheckout = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: 'Test Prodotto',
          amount: 9900, // €99.00
          currency: 'EUR',
          interval: 'one-time',
          successUrl: `${window.location.origin}/success`,
          cancelUrl: window.location.href,
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          setResult({ 
            success: true, 
            message: '✅ Stripe funziona! Session creata correttamente.\nClicca "Apri Checkout" per testare il pagamento.' 
          });
          
          // Opzionale: apri Stripe Checkout
          // window.location.href = data.url;
        }
      } else {
        const error = await response.json();
        setResult({ 
          success: false, 
          message: `❌ Errore: ${error.error || 'Creazione session fallita'}` 
        });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: `❌ Errore: ${error instanceof Error ? error.message : 'Connessione fallita'}` 
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border-2 border-blue-500 rounded-lg shadow-2xl p-6 max-w-md">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-500" />
          Test Stripe Payment
        </h3>
        
        <div className="space-y-3 mb-4">
          <button
            onClick={testStripeConfig}
            disabled={testing}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
          >
            {testing ? 'Testing...' : '1. Test Configurazione'}
          </button>
          
          <button
            onClick={testStripeCheckout}
            disabled={testing}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
          >
            {testing ? 'Testing...' : '2. Test Checkout Session'}
          </button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm whitespace-pre-line ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestStripe;
