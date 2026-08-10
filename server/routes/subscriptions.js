import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import ordersDb from '../database/orders.js';

const router = express.Router();
const prisma = new PrismaClient();

// Considera "pagato" un ordine confermato/completato o con paymentStatus paid
function isPaidOrder(order) {
  return (
    order.paymentStatus === 'paid' ||
    order.status === 'confirmed' ||
    order.status === 'completed'
  );
}

// Get all subscriptions (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const orders = await ordersDb.getAllOrders();
    const users = await prisma.user.findMany();

    const subscriptions = [];

    // Dagli ordini in modalità subscription (MongoDB)
    orders.forEach(order => {
      if (order.mode === 'subscription') {
        subscriptions.push({
          id: order.metadata?.subscription || order.id,
          customerId: order.metadata?.stripeCustomerId || order.customerEmail,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          productId: order.productId || order.metadata?.productId || 'unknown',
          productName: order.productName || 'Abbonamento',
          amount: (order.amount || 0) * 100, // in centesimi
          currency: (order.currency || 'EUR').toUpperCase(),
          interval: order.metadata?.interval || 'month',
          status: isPaidOrder(order) ? 'active' : (order.status || 'active'),
          startDate: order.createdAt,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          stripeSubscriptionId: order.metadata?.subscription || null
        });
      }
    });

    // Dagli abbonamenti "embedded" negli utenti (MongoDB)
    users.forEach(user => {
      const sub = user.subscription;
      if (sub) {
        const existing = subscriptions.find(s => s.customerEmail === user.email);
        if (!existing) {
          subscriptions.push({
            id: sub.id || `sub_${user.id}`,
            customerId: user.stripeCustomerId || user.id,
            customerEmail: user.email,
            customerName: user.name,
            productId: sub.productId || 'unknown',
            productName: sub.productName || 'Abbonamento',
            amount: (sub.amount || 0) * 100,
            currency: (sub.currency || 'EUR').toUpperCase(),
            interval: sub.interval || 'month',
            status: sub.status || 'active',
            startDate: sub.startDate || user.createdAt,
            currentPeriodEnd: sub.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false,
            stripeSubscriptionId: sub.stripeId || null
          });
        }
      }
    });

    res.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Get subscription statistics
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const orders = await ordersDb.getAllOrders();
    const users = await prisma.user.findMany();

    let totalActive = 0;
    let totalCanceled = 0;
    let totalRevenue = 0;
    let monthlyRecurringRevenue = 0;
    const revenueByPlan = {};
    const statusBreakdown = { active: 0, canceled: 0, past_due: 0, trialing: 0 };

    // Dagli ordini subscription pagati
    orders.forEach(order => {
      if (order.mode === 'subscription' && isPaidOrder(order)) {
        const amount = order.amount || 0;
        totalRevenue += amount;
        totalActive++;
        statusBreakdown.active++;

        const interval = order.metadata?.interval || 'month';
        if (interval === 'month') monthlyRecurringRevenue += amount;
        else if (interval === 'year') monthlyRecurringRevenue += amount / 12;

        const planName = order.productName || 'Unknown';
        revenueByPlan[planName] = (revenueByPlan[planName] || 0) + amount;
      }
    });

    // Dagli abbonamenti embedded negli utenti
    users.forEach(user => {
      const sub = user.subscription;
      if (!sub) return;

      const alreadyCounted = orders.some(o =>
        o.customerEmail === user.email && o.mode === 'subscription'
      );
      if (alreadyCounted) return;

      if (sub.status === 'active') {
        totalActive++;
        statusBreakdown.active++;
        const amount = (sub.amount || 0);
        const interval = sub.interval || 'month';
        if (interval === 'month') monthlyRecurringRevenue += amount;
        else if (interval === 'year') monthlyRecurringRevenue += amount / 12;
      } else if (sub.status === 'canceled') {
        totalCanceled++;
        statusBreakdown.canceled++;
      }
    });

    const averageSubscriptionValue = totalActive > 0 ? monthlyRecurringRevenue / totalActive : 0;
    const churnRate = (totalActive + totalCanceled) > 0
      ? (totalCanceled / (totalActive + totalCanceled)) * 100
      : 0;

    res.json({
      stats: {
        totalActive,
        totalCanceled,
        totalRevenue: totalRevenue * 100,
        monthlyRecurringRevenue: monthlyRecurringRevenue * 100,
        averageSubscriptionValue: averageSubscriptionValue * 100,
        churnRate,
        growthRate: 0,
        revenueByPlan: Object.fromEntries(
          Object.entries(revenueByPlan).map(([k, v]) => [k, v * 100])
        ),
        statusBreakdown
      }
    });
  } catch (error) {
    console.error('Error calculating subscription stats:', error);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// Trova l'utente che possiede un certo abbonamento:
//  - prima nel campo embedded user.subscription
//  - poi via Order (subscription id == order id o stripe id) -> match per email
async function findUserBySubscriptionId(subscriptionId) {
  const users = await prisma.user.findMany();
  const direct = users.find(u =>
    u.subscription &&
    (u.subscription.id === subscriptionId || u.subscription.stripeId === subscriptionId)
  );
  if (direct) return direct;

  // Cerca tra gli ordini di tipo subscription
  const order = await prisma.order.findFirst({
    where: {
      mode: 'subscription',
      OR: [
        { id: subscriptionId },
        { paymentId: subscriptionId }
      ]
    }
  });
  if (!order?.customerEmail) return null;

  const byEmail = users.find(u => u.email === order.customerEmail);
  if (!byEmail) return null;

  // Se l'utente non ha ancora un sub embedded, lo crea dalle info dell'ordine
  // così cancel/pause/resume hanno qualcosa su cui agire
  if (!byEmail.subscription) {
    const seeded = {
      id: subscriptionId,
      productId: order.productId,
      productName: order.productName,
      amount: order.amount,
      currency: order.currency,
      interval: order.metadata?.interval || 'month',
      status: 'active',
      startDate: order.createdAt
    };
    await prisma.user.update({ where: { id: byEmail.id }, data: { subscription: seeded } });
    byEmail.subscription = seeded;
  }
  return byEmail;
}

// Cancel subscription
router.post('/:subscriptionId/cancel', authenticateAdmin, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { immediate } = req.body;

    const user = await findUserBySubscriptionId(subscriptionId);
    if (!user) return res.status(404).json({ error: 'Subscription not found' });

    // Anche la cancellazione "a fine periodo" deve risultare visibilmente
    // disattivata nella UI; usiamo lo stato dedicato 'cancel_pending'.
    const updatedSubscription = {
      ...user.subscription,
      status: immediate ? 'canceled' : 'cancel_pending',
      cancelAtPeriodEnd: !immediate,
      canceledAt: new Date().toISOString()
    };

    await prisma.user.update({
      where: { id: user.id },
      data: { subscription: updatedSubscription }
    });

    res.json({ success: true, message: 'Subscription canceled' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Pause subscription
router.post('/:subscriptionId/pause', authenticateAdmin, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const user = await findUserBySubscriptionId(subscriptionId);
    if (!user) return res.status(404).json({ error: 'Subscription not found' });

    const updatedSubscription = {
      ...user.subscription,
      status: 'paused',
      pausedAt: new Date().toISOString()
    };

    await prisma.user.update({
      where: { id: user.id },
      data: { subscription: updatedSubscription }
    });

    res.json({ success: true, message: 'Subscription paused' });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    res.status(500).json({ error: 'Failed to pause subscription' });
  }
});

// Resume subscription
router.post('/:subscriptionId/resume', authenticateAdmin, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const user = await findUserBySubscriptionId(subscriptionId);
    if (!user) return res.status(404).json({ error: 'Subscription not found' });

    const updatedSubscription = {
      ...user.subscription,
      status: 'active',
      pausedAt: null,
      resumedAt: new Date().toISOString()
    };

    await prisma.user.update({
      where: { id: user.id },
      data: { subscription: updatedSubscription }
    });

    res.json({ success: true, message: 'Subscription resumed' });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ error: 'Failed to resume subscription' });
  }
});

export default router;
