import express from 'express';
import dotenv from 'dotenv';
import { sendOrderConfirmation, sendVimeoAccessInstructions } from '../services/emailService.js';
import db from '../database/index.js';

dotenv.config();

const router = express.Router();

// ============================================
// PAYPAL INTEGRATION
// ============================================

/**
 * Crea un ordine PayPal
 * POST /api/payments/paypal/create-order
 */
router.post('/paypal/create-order', async (req, res) => {
  try {
    const { amount, currency = 'EUR', productName, productId, customerEmail } = req.body;

    if (!amount || !productName) {
      return res.status(400).json({ error: 'Amount e productName sono richiesti' });
    }

    // PayPal REST API - Crea ordine
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalSecret = process.env.PAYPAL_SECRET;
    const paypalEnv = process.env.PAYPAL_ENV || 'sandbox'; // 'sandbox' o 'live'
    
    if (!paypalClientId || !paypalSecret) {
      return res.status(500).json({ 
        error: 'PayPal non configurato. Aggiungi PAYPAL_CLIENT_ID e PAYPAL_SECRET nel file .env' 
      });
    }

    const paypalApiUrl = paypalEnv === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // Ottieni access token
    const auth = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64');
    const tokenResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error('Errore autenticazione PayPal');
    }

    const { access_token } = await tokenResponse.json();

    // Crea ordine PayPal
    const orderResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          description: productName,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          },
          custom_id: productId // ID prodotto per riferimento futuro
        }],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/payment-success?provider=paypal&product=${productId}`,
          cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?provider=paypal`
        }
      })
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('Errore creazione ordine PayPal:', errorData);
      throw new Error('Errore creazione ordine PayPal');
    }

    const orderData = await orderResponse.json();
    
    console.log('✅ Ordine PayPal creato:', orderData.id);

    // Trova il link di approvazione
    const approveLink = orderData.links?.find(link => link.rel === 'approve')?.href;

    res.json({
      success: true,
      orderId: orderData.id,
      approveUrl: approveLink,
      orderData
    });

  } catch (error) {
    console.error('Errore PayPal create-order:', error);
    res.status(500).json({ 
      error: error.message || 'Errore nella creazione dell\'ordine PayPal' 
    });
  }
});

/**
 * Cattura il pagamento PayPal dopo l'approvazione
 * POST /api/payments/paypal/capture-order
 */
router.post('/paypal/capture-order', async (req, res) => {
  try {
    const { orderId, customerEmail, productId, productName } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'orderId richiesto' });
    }

    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalSecret = process.env.PAYPAL_SECRET;
    const paypalEnv = process.env.PAYPAL_ENV || 'sandbox';

    const paypalApiUrl = paypalEnv === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // Ottieni access token
    const auth = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64');
    const tokenResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const { access_token } = await tokenResponse.json();

    // Cattura il pagamento
    const captureResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      console.error('Errore cattura pagamento PayPal:', errorData);
      throw new Error('Errore cattura pagamento');
    }

    const captureData = await captureResponse.json();
    
    console.log('✅ Pagamento PayPal catturato:', captureData.id);

    const purchaseUnit = captureData.purchase_units?.[0];
    const amount = parseFloat(purchaseUnit?.amount?.value || '0');
    const currency = purchaseUnit?.amount?.currency_code || 'EUR';
    const customerName = captureData.payer?.name?.given_name || 'Studente';

    // Salva l'ordine nel database con status 'pending' (attesa conferma admin)
    const order = db.createOrder({
      orderNumber: `ORD-PP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      paymentProvider: 'paypal',
      paymentId: captureData.id,
      customerEmail,
      customerName,
      productId,
      productName: productName || 'Corso Completo',
      amount,
      currency,
      status: 'pending', // Attende conferma admin
      paymentStatus: 'paid',
      metadata: {
        paypalOrderId: orderId,
        payerEmail: captureData.payer?.email_address
      }
    });

    console.log('💾 Ordine salvato nel database:', order.orderNumber);

    // Invia email di conferma ordine (NON le credenziali Vimeo - arriveranno dopo conferma admin)
    if (customerEmail) {
      await sendOrderConfirmation({
        customerName,
        customerEmail,
        orderNumber: order.orderNumber,
        productName: productName || 'Corso Completo',
        amount,
        currency,
        date: new Date(),
        isPending: true // Indica che l'ordine è in attesa di conferma
      });
    }

    res.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      status: 'pending',
      message: 'Ordine ricevuto! Riceverai le credenziali di accesso dopo la conferma.'
    });

  } catch (error) {
    console.error('Errore PayPal capture-order:', error);
    res.status(500).json({ 
      error: error.message || 'Errore nella cattura del pagamento PayPal' 
    });
  }
});

// ============================================
// CRYPTO PAYMENT INTEGRATION (NOWPayments)
// ============================================

/**
 * Crea un pagamento crypto con NOWPayments
 * POST /api/payments/crypto/create-charge
 */
router.post('/crypto/create-charge', async (req, res) => {
  try {
    const { amount, currency = 'EUR', productName, productId, customerEmail, productType, plan } = req.body;

    if (!amount || !productName) {
      return res.status(400).json({ error: 'Amount e productName sono richiesti' });
    }

    const nowpaymentsApiKey = process.env.NOWPAYMENTS_API_KEY;
    
    if (!nowpaymentsApiKey) {
      return res.status(500).json({ 
        error: 'NOWPayments non configurato. Aggiungi NOWPAYMENTS_API_KEY nel file .env' 
      });
    }

    // NOWPayments richiede l'importo in formato numerico con 2 decimali
    const priceAmount = parseFloat(amount).toFixed(2);

    // Crea invoice con NOWPayments API
    const invoiceResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': nowpaymentsApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: priceAmount,
        price_currency: currency.toLowerCase(),
        order_id: `${productId}-${Date.now()}`,
        order_description: `${productName} - Customer: ${customerEmail || 'N/A'} - Type: ${productType} - Plan: ${plan}`,
        success_url: `${process.env.FRONTEND_URL}/payment-success?provider=crypto&product=${productId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?provider=crypto`,
        ipn_callback_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payments/crypto/webhook`
      })
    });

    if (!invoiceResponse.ok) {
      const errorData = await invoiceResponse.json();
      console.error('Errore creazione invoice NOWPayments:', errorData);
      throw new Error(errorData.message || 'Errore creazione pagamento crypto');
    }

    const invoiceData = await invoiceResponse.json();
    
    console.log('✅ Invoice crypto creato (NOWPayments):', invoiceData.id);

    res.json({
      success: true,
      chargeId: invoiceData.id,
      chargeUrl: invoiceData.invoice_url,
      chargeData: invoiceData
    });

  } catch (error) {
    console.error('Errore crypto create-charge:', error);
    res.status(500).json({ 
      error: error.message || 'Errore nella creazione del pagamento crypto' 
    });
  }
});

/**
 * Webhook per notifiche NOWPayments (IPN)
 * POST /api/payments/crypto/webhook
 */
router.post('/crypto/webhook', async (req, res) => {
  try {
    // NOWPayments invia webhook con firma HMAC
    const signature = req.headers['x-nowpayments-sig'];
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    // Verifica firma se configurata (raccomandato in produzione)
    if (ipnSecret && signature) {
      const crypto = await import('crypto');
      const payload = JSON.stringify(req.body);
      const computedSignature = crypto.createHmac('sha512', ipnSecret)
        .update(payload)
        .digest('hex');
      
      if (computedSignature !== signature) {
        console.error('⚠️ Firma webhook NOWPayments non valida');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const payment = req.body;
    
    console.log('📨 Webhook NOWPayments ricevuto:', payment.payment_status);
    console.log('Payment ID:', payment.payment_id);

    // Gestisci gli stati del pagamento
    switch (payment.payment_status) {
      case 'finished':
      case 'confirmed': {
        console.log('✅ Pagamento crypto confermato:', payment.payment_id);
        
        // Recupera metadata dall'order_description (formato: "ProductName - Customer: email - Type: type - Plan: plan")
        let metadata = {};
        const description = payment.order_description || '';
        try {
          // Estrai customer email dalla descrizione
          const customerMatch = description.match(/Customer:\s*([^-\s]+)/);
          const typeMatch = description.match(/Type:\s*([^-\s]+)/);
          const planMatch = description.match(/Plan:\s*([^-\s]+)/);
          
          metadata.customer_email = customerMatch ? customerMatch[1] : payment.payer_email;
          metadata.product_type = typeMatch ? typeMatch[1] : 'course';
          metadata.plan = planMatch ? planMatch[1] : 'lifetime';
          metadata.product_name = description.split(' - ')[0] || payment.order_description;
        } catch (e) {
          console.warn('Impossibile parsare order_description:', e);
        }

        const customerEmail = metadata.customer_email || payment.payer_email;
        const productId = payment.order_id?.split('-')[0] || 'unknown'; // Estrai productId dal order_id
        const productName = metadata.product_name || payment.order_description || 'Corso Completo';
        const productType = metadata.product_type;
        const plan = metadata.plan;
        const amount = parseFloat(payment.price_amount || '0');
        const currency = (payment.price_currency || 'EUR').toUpperCase();

        // Salva l'ordine nel database con status 'pending'
        const order = db.createOrder({
          orderNumber: `ORD-CR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          paymentProvider: 'crypto-nowpayments',
          paymentId: payment.payment_id.toString(),
          customerEmail,
          customerName: 'Studente Crypto',
          productId,
          productName,
          productType,
          plan,
          amount,
          currency,
          status: 'pending', // Attende conferma admin
          paymentStatus: 'paid',
          metadata: {
            invoiceId: payment.invoice_id,
            payCurrency: payment.pay_currency,
            payAmount: payment.pay_amount,
            actuallyPaid: payment.actually_paid,
            outcomeAmount: payment.outcome_amount
          }
        });

        console.log('💾 Ordine crypto salvato nel database:', order.orderNumber);

        // Invia email di conferma ordine
        if (customerEmail) {
          await sendOrderConfirmation({
            customerName: 'Studente Crypto',
            customerEmail,
            orderNumber: order.orderNumber,
            productName,
            amount,
            currency,
            date: new Date(),
            isPending: true
          });
        }

        break;
      }
      
      case 'failed':
      case 'expired':
        console.log('❌ Pagamento crypto fallito/scaduto:', payment.payment_id);
        break;
        
      case 'waiting':
      case 'confirming':
      case 'sending':
        console.log('⏳ Pagamento crypto in attesa:', payment.payment_id, '-', payment.payment_status);
        break;
        
      default:
        console.log('Stato pagamento non gestito:', payment.payment_status);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Errore webhook crypto:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
