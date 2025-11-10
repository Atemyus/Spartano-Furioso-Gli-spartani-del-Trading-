import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { db } from '../database/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to read orders/subscriptions from file
async function readOrdersFile() {
  try {
    const ordersPath = path.join(__dirname, '..', 'data', 'orders.json');
    const data = await fs.readFile(ordersPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper to save orders/subscriptions to file
async function saveOrdersFile(orders) {
  const ordersPath = path.join(__dirname, '..', 'data', 'orders.json');
  await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));
}

// Get all subscriptions (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const orders = await readOrdersFile();
    const users = db.getAllUsers();
    
    // Extract subscriptions from orders and users
    const subscriptions = [];
    
    // From orders file (Stripe webhook data)
    orders.forEach(order => {
      if (order.type === 'checkout' && order.mode === 'subscription') {
        subscriptions.push({
          id: order.subscription || order.id,
          customerId: order.stripeCustomerId,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          productId: order.metadata?.productId || 'unknown',
          productName: order.metadata?.productName || 'Abbonamento',
          amount: order.amount * 100, // Convert to cents
          currency: order.currency || 'EUR',
          interval: order.metadata?.interval || 'month',
          status: 'active',
          startDate: order.createdAt,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          stripeSubscriptionId: order.subscription
        });
      }
    });
    
    // From user data (local subscriptions)
    users.forEach(user => {
      if (user.subscription) {
        const existing = subscriptions.find(s => s.customerEmail === user.email);
        if (!existing) {
          subscriptions.push({
            id: user.subscription.id || `sub_${user.id}`,
            customerId: user.stripeCustomerId || user.id,
            customerEmail: user.email,
            customerName: user.name,
            productId: user.subscription.productId || 'unknown',
            productName: user.subscription.productName || 'Abbonamento',
            amount: (user.subscription.amount || 0) * 100,
            currency: user.subscription.currency || 'EUR',
            interval: user.subscription.interval || 'month',
            status: user.subscription.status || 'active',
            startDate: user.subscription.startDate || user.createdAt,
            currentPeriodEnd: user.subscription.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd || false,
            stripeSubscriptionId: user.subscription.stripeId
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
    const orders = await readOrdersFile();
    const users = db.getAllUsers();
    
    // Calculate statistics
    let totalActive = 0;
    let totalCanceled = 0;
    let totalRevenue = 0;
    let monthlyRecurringRevenue = 0;
    const revenueByPlan = {};
    const statusBreakdown = { active: 0, canceled: 0, past_due: 0, trialing: 0 };
    
    // From orders
    orders.forEach(order => {
      if (order.type === 'checkout' && order.status === 'completed') {
        totalRevenue += order.amount || 0;
        
        if (order.mode === 'subscription') {
          if (order.status === 'completed') {
            totalActive++;
            statusBreakdown.active++;
            
            // Calculate MRR
            const amount = order.amount || 0;
            const interval = order.metadata?.interval || 'month';
            if (interval === 'month') {
              monthlyRecurringRevenue += amount;
            } else if (interval === 'year') {
              monthlyRecurringRevenue += amount / 12;
            }
            
            // Revenue by plan
            const planName = order.metadata?.productName || 'Unknown';
            revenueByPlan[planName] = (revenueByPlan[planName] || 0) + amount;
          }
        }
      }
      
      if (order.type === 'subscription_event') {
        if (order.event === 'customer.subscription.deleted') {
          totalCanceled++;
          statusBreakdown.canceled++;
        }
      }
    });
    
    // From user subscriptions
    users.forEach(user => {
      if (user.subscription && user.subscription.status === 'active') {
        // Check if not already counted
        const alreadyCounted = orders.some(o => 
          o.customerEmail === user.email && o.type === 'checkout' && o.mode === 'subscription'
        );
        
        if (!alreadyCounted) {
          totalActive++;
          statusBreakdown.active++;
          
          const amount = (user.subscription.amount || 0) / 100;
          const interval = user.subscription.interval || 'month';
          
          if (interval === 'month') {
            monthlyRecurringRevenue += amount;
          } else if (interval === 'year') {
            monthlyRecurringRevenue += amount / 12;
          }
        }
      }
    });
    
    // Calculate metrics
    const averageSubscriptionValue = totalActive > 0 ? monthlyRecurringRevenue / totalActive : 0;
    const churnRate = totalActive > 0 ? (totalCanceled / (totalActive + totalCanceled)) * 100 : 0;
    const growthRate = 0; // Placeholder - would need historical data
    
    const stats = {
      totalActive,
      totalCanceled,
      totalRevenue: totalRevenue * 100, // Convert to cents
      monthlyRecurringRevenue: monthlyRecurringRevenue * 100, // Convert to cents
      averageSubscriptionValue: averageSubscriptionValue * 100, // Convert to cents
      churnRate,
      growthRate,
      revenueByPlan: Object.fromEntries(
        Object.entries(revenueByPlan).map(([k, v]) => [k, v * 100])
      ),
      statusBreakdown
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Error calculating subscription stats:', error);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// Cancel subscription
router.post('/:subscriptionId/cancel', authenticateAdmin, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { immediate } = req.body;
    
    // Find user with this subscription
    const users = db.getAllUsers();
    const user = users.find(u => 
      u.subscription && (u.subscription.id === subscriptionId || u.subscription.stripeId === subscriptionId)
    );
    
    if (user) {
      // Update user subscription status
      const updatedSubscription = {
        ...user.subscription,
        status: immediate ? 'canceled' : user.subscription.status,
        cancelAtPeriodEnd: !immediate,
        canceledAt: new Date().toISOString()
      };
      
      db.updateUser(user.id, { subscription: updatedSubscription });
      
      // Log cancellation in orders
      const orders = await readOrdersFile();
      orders.push({
        id: `cancel_${Date.now()}`,
        type: 'subscription_event',
        event: 'subscription.canceled',
        subscriptionId,
        customerEmail: user.email,
        immediate,
        createdAt: new Date().toISOString()
      });
      await saveOrdersFile(orders);
      
      res.json({ success: true, message: 'Subscription canceled' });
    } else {
      res.status(404).json({ error: 'Subscription not found' });
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Pause subscription
router.post('/:subscriptionId/pause', authenticateAdmin, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    // Find user with this subscription
    const users = db.getAllUsers();
    const user = users.find(u => 
      u.subscription && (u.subscription.id === subscriptionId || u.subscription.stripeId === subscriptionId)
    );
    
    if (user) {
      // Update subscription status to paused
      const updatedSubscription = {
        ...user.subscription,
        status: 'paused',
        pausedAt: new Date().toISOString()
      };
      
      db.updateUser(user.id, { subscription: updatedSubscription });
      
      res.json({ success: true, message: 'Subscription paused' });
    } else {
      res.status(404).json({ error: 'Subscription not found' });
    }
  } catch (error) {
    console.error('Error pausing subscription:', error);
    res.status(500).json({ error: 'Failed to pause subscription' });
  }
});

// Resume subscription
router.post('/:subscriptionId/resume', authenticateAdmin, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    // Find user with this subscription
    const users = db.getAllUsers();
    const user = users.find(u => 
      u.subscription && (u.subscription.id === subscriptionId || u.subscription.stripeId === subscriptionId)
    );
    
    if (user) {
      // Update subscription status to active
      const updatedSubscription = {
        ...user.subscription,
        status: 'active',
        pausedAt: null,
        resumedAt: new Date().toISOString()
      };
      
      db.updateUser(user.id, { subscription: updatedSubscription });
      
      res.json({ success: true, message: 'Subscription resumed' });
    } else {
      res.status(404).json({ error: 'Subscription not found' });
    }
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ error: 'Failed to resume subscription' });
  }
});

export default router;
