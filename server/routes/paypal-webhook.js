import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import db from '../database/index.js';
import { sendOrderConfirmation, sendVimeoAccessInstructions } from '../services/emailService.js';

dotenv.config();

const router = express.Router();

/**
 * Webhook PayPal per ricevere notifiche di pagamento
 * POST /api/paypal-webhook
 * 
 * Eventi gestiti:
 * - PAYMENT.CAPTURE.COMPLETED: Pagamento completato con successo
 * - PAYMENT.CAPTURE.DENIED: Pagamento negato
 * - PAYMENT.CAPTURE.REFUNDED: Pagamento rimborsato
 */
router.post('/', express.json(), async (req, res) => {
  try {
    const webhookEvent = req.body;
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    console.log('📨 Webhook PayPal ricevuto:', webhookEvent.event_type);

    // Verifica la firma del webhook (opzionale ma raccomandato)
    if (webhookId) {
      const isValid = await verifyPayPalWebhook(req, webhookId);
      if (!isValid) {
        console.error('❌ Firma webhook PayPal non valida');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    // Gestisci i diversi tipi di eventi
    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        console.log('✅ Pagamento PayPal completato');
        
        const capture = webhookEvent.resource;
        const orderId = capture.id;
        const amount = parseFloat(capture.amount.value);
        const currency = capture.amount.currency_code;
        
        // Estrai metadata dall'ordine
        const customId = capture.custom_id; // Puoi passare dati custom quando crei l'ordine
        const metadata = customId ? JSON.parse(customId) : {};
        
        const customerEmail = metadata.customerEmail || capture.payer?.email_address;
        const customerName = metadata.customerName || 
          `${capture.payer?.name?.given_name || ''} ${capture.payer?.name?.surname || ''}`.trim();
        const productId = metadata.productId;
        const productName = metadata.productName || 'Corso Completo';
        const productType = metadata.productType || 'course';
        const plan = metadata.plan;

        // Cerca se l'ordine esiste già nel database
        let order = db.getOrderByPaymentId(orderId);
        
        if (!order) {
          // Crea nuovo ordine
          order = db.createOrder({
            orderNumber: `ORD-PP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            paymentProvider: 'paypal',
            paymentId: orderId,
            customerEmail,
            customerName: customerName || 'Cliente PayPal',
            productId,
            productName,
            productType,
            plan,
            amount,
            currency,
            status: 'pending', // Attende conferma admin
            paymentStatus: 'paid',
            metadata: {
              paypalOrderId: capture.supplementary_data?.related_ids?.order_id,
              payerId: capture.payer?.payer_id,
              captureId: capture.id
            }
          });

          console.log('💾 Ordine PayPal salvato nel database:', order.orderNumber);

          // Invia email di conferma ordine (senza credenziali Vimeo)
          if (customerEmail) {
            await sendOrderConfirmation({
              customerName: customerName || 'Cliente',
              customerEmail,
              orderNumber: order.orderNumber,
              productName,
              amount,
              currency,
              date: new Date(),
              isPending: true // Indica che l'ordine è in attesa di conferma admin
            });
          }
        } else {
          console.log('ℹ️ Ordine già esistente:', order.orderNumber);
        }

        break;
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        console.log('❌ Pagamento PayPal negato');
        const capture = webhookEvent.resource;
        
        // Aggiorna lo stato dell'ordine se esiste
        const order = db.getOrderByPaymentId(capture.id);
        if (order) {
          db.updateOrder(order.id, {
            status: 'failed',
            paymentStatus: 'denied'
          });
        }
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        console.log('💰 Pagamento PayPal rimborsato');
        const refund = webhookEvent.resource;
        
        // Aggiorna lo stato dell'ordine
        const order = db.getOrderByPaymentId(refund.id);
        if (order) {
          db.updateOrder(order.id, {
            status: 'refunded',
            paymentStatus: 'refunded'
          });
        }
        break;
      }

      default:
        console.log('ℹ️ Evento PayPal non gestito:', webhookEvent.event_type);
    }

    // Rispondi sempre con 200 OK per confermare la ricezione
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Errore nel webhook PayPal:', error);
    // Anche in caso di errore, rispondi con 200 per evitare retry continui
    res.status(200).json({ error: error.message });
  }
});

/**
 * Verifica la firma del webhook PayPal
 */
async function verifyPayPalWebhook(req, webhookId) {
  try {
    const paypalEnv = process.env.PAYPAL_ENV || 'sandbox';
    const paypalApiUrl = paypalEnv === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // Ottieni access token
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64');

    const tokenResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const { access_token } = await tokenResponse.json();

    // Verifica la firma del webhook
    const verifyResponse = await fetch(
      `${paypalApiUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          transmission_id: req.headers['paypal-transmission-id'],
          transmission_time: req.headers['paypal-transmission-time'],
          cert_url: req.headers['paypal-cert-url'],
          auth_algo: req.headers['paypal-auth-algo'],
          transmission_sig: req.headers['paypal-transmission-sig'],
          webhook_id: webhookId,
          webhook_event: req.body
        })
      }
    );

    const verifyData = await verifyResponse.json();
    return verifyData.verification_status === 'SUCCESS';

  } catch (error) {
    console.error('Errore nella verifica del webhook PayPal:', error);
    return false;
  }
}

export default router;
