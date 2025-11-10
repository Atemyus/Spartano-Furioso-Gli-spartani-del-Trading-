import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendEmail, sendOrderConfirmation } from '../services/emailService.js';
import db from '../database/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Store orders in a JSON file
const ordersFilePath = path.join(__dirname, '..', 'data', 'orders.json');

// Helper function to read orders
async function readOrders() {
  try {
    const data = await fs.readFile(ordersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper function to save orders
async function saveOrders(orders) {
  await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
}

// Helper function to update user subscription in database
async function updateUserSubscription(email, subscriptionData) {
  const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
  
  try {
    const usersData = await fs.readFile(usersFilePath, 'utf-8');
    const users = JSON.parse(usersData);
    
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      users[userIndex].subscription = subscriptionData;
      users[userIndex].updatedAt = new Date().toISOString();
      
      await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
      console.log(`✅ Subscription updated for user: ${email}`);
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

// Webhook endpoint - MUST use raw body, not JSON parsed
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📨 Received event: ${event.type}`);

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('✅ Checkout session completed:', session.id);
        
        const customerEmail = session.customer_details?.email || session.customer_email;
        const customerName = session.customer_details?.name || 'Cliente';
        const amount = session.amount_total / 100; // Convert from cents
        const currency = session.currency.toUpperCase();
        
        // Salva l'ordine nel database con status 'pending' (attesa conferma admin)
        const order = db.createOrder({
          orderNumber: `ORD-ST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          paymentProvider: 'stripe',
          paymentId: session.payment_intent || session.id,
          customerEmail,
          customerName,
          productId: session.metadata?.productId || session.metadata?.courseId,
          productName: session.metadata?.productName || 'Corso Completo',
          amount,
          currency,
          status: 'pending', // Attende conferma admin
          paymentStatus: 'paid',
          mode: session.mode, // 'payment' or 'subscription'
          metadata: {
            stripeSessionId: session.id,
            stripeCustomerId: session.customer,
            subscription: session.subscription,
            ...session.metadata
          }
        });
        
        console.log('💾 Ordine Stripe salvato nel database:', order.orderNumber);
        
        // Salva anche nel vecchio sistema JSON per retrocompatibilità
        try {
          const orders = await readOrders();
          orders.push({
            id: session.id,
            orderNumber: order.orderNumber,
            type: 'checkout',
            customerEmail,
            customerName,
            amount,
            currency,
            status: 'pending',
            mode: session.mode,
            metadata: session.metadata,
            stripeCustomerId: session.customer,
            paymentIntent: session.payment_intent,
            subscription: session.subscription,
            createdAt: new Date().toISOString()
          });
          await saveOrders(orders);
        } catch (err) {
          console.error('Error saving to JSON:', err);
        }
        
        // Invia email di conferma ordine (NON le credenziali Vimeo - arriveranno dopo conferma admin)
        if (customerEmail) {
          try {
            await sendOrderConfirmation({
              customerName,
              customerEmail,
              orderNumber: order.orderNumber,
              productName: session.metadata?.productName || 'Corso Completo',
              amount,
              currency,
              date: new Date(),
              isPending: true
            });
            console.log(`📧 Email di conferma inviata a ${customerEmail}`);
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }
        }
        
        // Send admin notification
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@furyofsparta.com';
        try {
          await sendEmail({
            to: adminEmail,
            subject: `🎉 Nuovo Ordine - €${newOrder.amount}`,
            html: `
              <h2>Nuovo ordine ricevuto!</h2>
              <h3>Dettagli cliente:</h3>
              <ul>
                <li>Email: ${newOrder.customerEmail}</li>
                <li>Nome: ${newOrder.customerName || 'N/D'}</li>
              </ul>
              <h3>Dettagli ordine:</h3>
              <ul>
                <li>ID: ${newOrder.id}</li>
                <li>Importo: €${newOrder.amount} ${newOrder.currency}</li>
                <li>Tipo: ${newOrder.mode === 'subscription' ? 'Abbonamento' : 'Pagamento singolo'}</li>
                <li>Metadata: ${JSON.stringify(newOrder.metadata, null, 2)}</li>
              </ul>
              <p><a href="https://dashboard.stripe.com/payments/${session.payment_intent || session.subscription}">Vedi su Stripe Dashboard</a></p>
            `
          });
        } catch (emailError) {
          console.error('Error sending admin notification:', emailError);
        }
        
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log(`📊 Subscription ${event.type}:`, subscription.id);
        
        // Get customer email
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        // Update user subscription status
        if (customer.email) {
          await updateUserSubscription(customer.email, {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            priceId: subscription.items.data[0]?.price.id,
            productId: subscription.items.data[0]?.price.product
          });
        }
        
        // Save subscription event
        const orders = await readOrders();
        orders.push({
          id: `sub_event_${Date.now()}`,
          type: 'subscription_event',
          event: event.type,
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          customerEmail: customer.email,
          status: subscription.status,
          metadata: subscription.metadata,
          createdAt: new Date().toISOString()
        });
        await saveOrders(orders);
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('❌ Subscription cancelled:', subscription.id);
        
        // Get customer email
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        // Update user subscription status
        if (customer.email) {
          await updateUserSubscription(customer.email, {
            id: subscription.id,
            status: 'cancelled',
            cancelledAt: new Date().toISOString()
          });
        }
        
        // Send cancellation email
        if (customer.email) {
          try {
            await sendEmail({
              to: customer.email,
              subject: 'Abbonamento Cancellato - Fury Of Sparta',
              html: `
                <h2>Abbonamento cancellato</h2>
                <p>Il tuo abbonamento è stato cancellato con successo.</p>
                <p>Ci dispiace vederti andare via. Se hai avuto problemi o suggerimenti, non esitare a contattarci.</p>
                <p>Potrai sempre riattivare il tuo abbonamento dal tuo pannello utente.</p>
                <p>Cordiali saluti,<br>Team Fury Of Sparta</p>
              `
            });
          } catch (emailError) {
            console.error('Error sending cancellation email:', emailError);
          }
        }
        
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('💰 Payment succeeded:', paymentIntent.id);
        
        // Save payment record
        const orders = await readOrders();
        orders.push({
          id: paymentIntent.id,
          type: 'payment',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          status: 'succeeded',
          customerId: paymentIntent.customer,
          metadata: paymentIntent.metadata,
          createdAt: new Date().toISOString()
        });
        await saveOrders(orders);
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('❌ Payment failed:', paymentIntent.id);
        
        // Log failed payment
        const orders = await readOrders();
        orders.push({
          id: paymentIntent.id,
          type: 'payment_failed',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          status: 'failed',
          error: paymentIntent.last_payment_error?.message,
          customerId: paymentIntent.customer,
          metadata: paymentIntent.metadata,
          createdAt: new Date().toISOString()
        });
        await saveOrders(orders);
        
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('📄 Invoice paid:', invoice.id);
        
        // Send receipt email
        if (invoice.customer_email) {
          try {
            await sendEmail({
              to: invoice.customer_email,
              subject: 'Ricevuta Pagamento - Fury Of Sparta',
              html: `
                <h2>Ricevuta di pagamento</h2>
                <p>Il tuo pagamento è stato ricevuto con successo.</p>
                <h3>Dettagli:</h3>
                <ul>
                  <li>Numero fattura: ${invoice.number || invoice.id}</li>
                  <li>Importo: €${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}</li>
                  <li>Data: ${new Date().toLocaleDateString('it-IT')}</li>
                </ul>
                <p><a href="${invoice.hosted_invoice_url}">Visualizza fattura online</a></p>
                <p>Cordiali saluti,<br>Team Fury Of Sparta</p>
              `
            });
          } catch (emailError) {
            console.error('Error sending receipt email:', emailError);
          }
        }
        
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
});

// Admin endpoint to get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await readOrders();
    
    // Sort by date, most recent first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Admin endpoint to get order statistics
router.get('/orders/stats', async (req, res) => {
  try {
    const orders = await readOrders();
    
    // Calculate statistics
    const stats = {
      totalOrders: 0,
      totalRevenue: 0,
      subscriptions: 0,
      oneTimePayments: 0,
      failedPayments: 0,
      revenueByMonth: {},
      revenueByProduct: {}
    };
    
    orders.forEach(order => {
      if (order.type === 'checkout' && order.status === 'completed') {
        stats.totalOrders++;
        stats.totalRevenue += order.amount;
        
        if (order.mode === 'subscription') {
          stats.subscriptions++;
        } else {
          stats.oneTimePayments++;
        }
        
        // Group by month
        const month = new Date(order.createdAt).toISOString().slice(0, 7);
        stats.revenueByMonth[month] = (stats.revenueByMonth[month] || 0) + order.amount;
        
        // Group by product (if metadata contains product info)
        if (order.metadata?.productName) {
          const product = order.metadata.productName;
          stats.revenueByProduct[product] = (stats.revenueByProduct[product] || 0) + order.amount;
        }
      } else if (order.type === 'payment_failed') {
        stats.failedPayments++;
      }
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({ error: 'Error calculating stats' });
  }
});

export default router;
