import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { sendOrderConfirmation, sendVimeoAccessInstructions } from '../services/emailService.js';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get Stripe publishable key
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// Create checkout session for one-time payment or subscription
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { 
      priceId, 
      productName, 
      amount, 
      currency = 'eur',
      interval, // 'month', 'year', or 'one-time'
      successUrl = `${process.env.FRONTEND_URL}/success`,
      cancelUrl = `${process.env.FRONTEND_URL}/cancel`,
      customerEmail,
      metadata = {}
    } = req.body;

    // Determina se è un abbonamento o pagamento singolo
    const isSubscription = interval && interval !== 'one-time';
    
    const sessionConfig = {
      payment_method_types: ['card'],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        interval: interval || 'one-time'
      },
    };

    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    // If priceId is provided, use it
    if (priceId) {
      sessionConfig.line_items = [{
        price: priceId,
        quantity: 1,
      }];
    } else {
      // Otherwise create a price on the fly
      const priceData = {
        currency,
        product_data: {
          name: productName || 'Product',
        },
        unit_amount: amount, // Amount in cents
      };
      
      // Se è una subscription, aggiungi il recurring
      if (isSubscription) {
        priceData.recurring = {
          interval: interval === 'year' ? 'year' : 'month',
          interval_count: 1
        };
      }
      
      sessionConfig.line_items = [{
        price_data: priceData,
        quantity: 1,
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Create subscription checkout session
router.post('/create-subscription-session', async (req, res) => {
  try {
    const { 
      priceId,
      successUrl = `${process.env.FRONTEND_URL}/subscription-success`,
      cancelUrl = `${process.env.FRONTEND_URL}/pricing`,
      customerEmail,
      trialDays = 0,
      metadata = {}
    } = req.body;

    if (!priceId) {
      return res.status(400).json({ 
        error: 'Price ID is required for subscriptions' 
      });
    }

    const sessionConfig = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    };

    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    if (trialDays > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: trialDays,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating subscription session:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Create payment intent for custom payment flow
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'eur',
      customerEmail,
      metadata = {}
    } = req.body;

    const paymentIntentConfig = {
      amount, // Amount in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    };

    if (customerEmail) {
      // Create or retrieve customer
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      let customer;
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
        });
      }
      
      paymentIntentConfig.customer = customer.id;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Webhook per gestire gli eventi Stripe
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verifica la firma del webhook
    event = stripe.webhooks.constructEvent(
      req.rawBody || req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Gestisci gli eventi
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Salva l'ordine nel database
        const orderData = {
          stripeSessionId: session.id,
          customerId: session.customer,
          customerEmail: session.customer_email || session.customer_details?.email,
          amount: session.amount_total / 100, // Converti da centesimi
          currency: session.currency,
          paymentStatus: session.payment_status,
          metadata: session.metadata,
          productId: session.metadata?.productId,
          productType: session.metadata?.productType || 'course',
          interval: session.metadata?.interval || 'one-time',
          createdAt: new Date()
        };

        // TODO: Salvare orderData nel database
        console.log('✅ Payment successful:', orderData);
        
        // Genera numero ordine
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Invia email di conferma ordine
        await sendOrderConfirmation({
          customerName: session.customer_details?.name || 'Studente',
          customerEmail: orderData.customerEmail,
          orderNumber,
          productName: session.metadata?.productName || 'Corso Completo',
          amount: orderData.amount,
          currency: orderData.currency.toUpperCase(),
          date: new Date()
        });
        
        // Se è un corso, invia anche le istruzioni Vimeo
        if (orderData.productType === 'course' && orderData.productId) {
          console.log('🎓 Activating full course access for:', orderData.customerEmail);
          
          // Invia email con accesso Vimeo (con delay di 2 secondi)
          setTimeout(async () => {
            await sendVimeoAccessInstructions({
              customerName: session.customer_details?.name || 'Studente',
              customerEmail: orderData.customerEmail,
              productName: session.metadata?.productName || 'Corso Completo',
              vimeoLink: process.env.VIMEO_COURSE_LINK || 'https://vimeo.com/showcase/spartancodex',
              vimeoPassword: process.env.VIMEO_COURSE_PASSWORD || 'spartan2024',
              telegramLink: 'https://t.me/codextrading'
            });
          }, 2000);
        }
        
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('💰 Payment intent succeeded:', paymentIntent.id);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error('❌ Payment failed:', paymentIntent.id);
        // TODO: Notificare l'utente del fallimento
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('📅 Subscription event:', event.type, subscription.id);
        // TODO: Gestire gli abbonamenti
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('🚫 Subscription cancelled:', subscription.id);
        // TODO: Rimuovere l'accesso quando l'abbonamento viene cancellato
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get customer subscriptions
router.get('/subscriptions/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    res.json(subscriptions.data);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd = true } = req.body;

    let subscription;
    if (cancelAtPeriodEnd) {
      // Cancel at the end of the billing period
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      // Cancel immediately
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    }

    res.json(subscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Create customer portal session
router.post('/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl = process.env.FRONTEND_URL } = req.body;

    if (!customerId) {
      return res.status(400).json({ 
        error: 'Customer ID is required' 
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Get payment history
router.get('/payment-history/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 10 } = req.query;

    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: parseInt(limit),
    });

    res.json(paymentIntents.data);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Verify checkout session
router.get('/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription', 'customer']
    });

    if (session.payment_status === 'paid') {
      // Pagamento completato con successo
      res.json({
        success: true,
        message: 'Pagamento completato con successo!',
        session: {
          id: session.id,
          customer: session.customer,
          customerEmail: session.customer_details?.email,
          amountTotal: session.amount_total,
          currency: session.currency,
          paymentStatus: session.payment_status,
          mode: session.mode,
          metadata: session.metadata
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Il pagamento non è stato completato',
        paymentStatus: session.payment_status
      });
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ 
      error: 'Errore durante la verifica della sessione' 
    });
  }
});

export default router;
