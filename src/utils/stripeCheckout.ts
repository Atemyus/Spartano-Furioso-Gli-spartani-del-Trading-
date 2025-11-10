interface CheckoutParams {
  productId: string;
  productName: string;
  amount: number;
  currency?: string;
  interval?: 'month' | 'year' | 'one-time';
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
}

export const initializeStripeCheckout = async (params: CheckoutParams) => {
  const {
    productId,
    productName,
    amount,
    currency = 'eur',
    interval = 'one-time',
    successUrl,
    cancelUrl,
    customerEmail,
    metadata = {}
  } = params;

  try {
    // Aggiungi le informazioni dell'utente se loggato
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail') || customerEmail;
    
    const response = await fetch('http://localhost:3001/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        productName,
        amount: Math.round(amount * 100), // Converti in centesimi
        currency,
        interval,
        successUrl: successUrl || `${window.location.origin}/payment-success?product=${productId}`,
        cancelUrl: cancelUrl || window.location.href,
        customerEmail: userEmail,
        metadata: {
          ...metadata,
          productId,
          productType: 'course',
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error('Errore nella creazione della sessione di pagamento');
    }

    const { url, sessionId } = await response.json();
    
    if (url) {
      // Reindirizza direttamente a Stripe Checkout
      window.location.href = url;
    } else {
      throw new Error('URL di checkout non disponibile');
    }
    
    return { success: true, sessionId };
  } catch (error) {
    console.error('Errore checkout Stripe:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    };
  }
};

export const handleCourseCheckout = async (
  courseId: string,
  courseName: string,
  price: number,
  originalPrice?: number
) => {
  // Mostra un loading state prima del redirect
  const loadingDiv = document.createElement('div');
  loadingDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    ">
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
      ">
        <div style="
          width: 50px;
          height: 50px;
          border: 4px solid #ddd;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        "></div>
        <p style="color: #333; font-size: 1.1rem;">Reindirizzamento al pagamento sicuro...</p>
        <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">Attendi qualche secondo</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(loadingDiv);

  const result = await initializeStripeCheckout({
    productId: courseId,
    productName: courseName,
    amount: price,
    metadata: {
      originalPrice,
      courseId
    }
  });

  if (!result.success) {
    // Rimuovi il loading e mostra l'errore
    document.body.removeChild(loadingDiv);
    alert(`Errore nel processo di pagamento: ${result.error}`);
  }
  
  return result;
};
