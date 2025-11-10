import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { db } from '../database/index.js';
import { PrismaClient } from '@prisma/client';
import { getAbuseReport } from '../middleware/trialProtection.js';

const prisma = new PrismaClient();

const router = express.Router();

// Protect all admin routes
router.use(authenticateAdmin);

// Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Calcola statistiche da Prisma
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Conta utenti
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { isActive: true, emailVerified: true }
    });
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    
    // Conta newsletter subscribers
    const newsletterSubscribers = await prisma.newsletter.count({
      where: { status: 'ACTIVE' }
    });
    
    // Utenti recenti (ultimi 5)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
        status: true
      }
    });
    
    // Usa stats dal db per products e orders (se necessario)
    const dbStats = db.getStatistics();
    
    const stats = {
      totalUsers,
      activeUsers,
      totalRevenue: dbStats.totalRevenue || 0,
      totalOrders: dbStats.totalOrders || 0,
      activeSubscriptions: dbStats.activeSubscriptions || 0,
      recentOrders: dbStats.recentOrders || [],
      recentUsers: recentUsers.map(user => ({
        id: user.id,
        name: user.name || 'N/A',
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        role: user.role,
        status: user.status
      })),
      newUsersThisMonth,
      newsletterSubscribers,
      conversionRate: totalUsers > 0 ? ((dbStats.totalOrders || 0) / totalUsers * 100).toFixed(2) : '0.00'
    };
    
    console.log('📊 Admin Dashboard Stats:', {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newsletterSubscribers
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Users management
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map to frontend format
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'N/A',
      email: user.email,
      role: user.role.toLowerCase(),
      status: user.isActive ? 'active' : 'inactive',
      subscription: null,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString()
    }));
    
    console.log(`📊 Admin: Fetched ${formattedUsers.length} users from Prisma`);
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { password, ...updates } = req.body; // Don't allow password update through this endpoint
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });
    
    console.log(`✅ Admin: Updated user ${user.email}`);
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.delete({
      where: { id: req.params.id }
    });
    
    console.log(`🗑️  Admin: Deleted user ${user.email}`);
    res.json({ message: 'User deleted successfully', userId: user.id });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Products management
router.get('/products', (req, res) => {
  try {
    const products = db.getAllProducts();
    console.log('Admin: Total products:', products.length);
    console.log('Admin: Product statuses:', products.map(p => ({ name: p.name, active: p.active })));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Fix all products to be active (temporary endpoint for fixing the issue)
router.post('/products/fix-active', (req, res) => {
  try {
    const products = db.getAllProducts();
    let fixed = 0;
    products.forEach(product => {
      if (product.active !== true) {
        db.updateProduct(product.id, { active: true });
        fixed++;
      }
    });
    res.json({ 
      message: `Fixed ${fixed} products`, 
      totalProducts: products.length 
    });
  } catch (error) {
    console.error('Error fixing products:', error);
    res.status(500).json({ error: 'Failed to fix products' });
  }
});

// Restore complete product data including pricing plans, requirements, and platforms
router.post('/products/restore-data', (req, res) => {
  try {
    // Complete product data with all fields
    const completeProductsData = [
      {
        id: 'spartan_fury_bot',
        pricingPlans: {
          monthly: { price: 297, originalPrice: 497, interval: 'mese' },
          yearly: { price: 2970, originalPrice: 4970, interval: 'anno', savings: '2 mesi gratis' },
          lifetime: { price: 9997, originalPrice: 14997, interval: 'lifetime', savings: 'Risparmio 33%' }
        },
        requirements: [
          'Capitale minimo: €1,000',
          'VPS consigliato (incluso nel piano yearly)',
          'Connessione internet stabile',
          'Broker supportati: IC Markets, Pepperstone, XM'
        ],
        platforms: ['MetaTrader 4', 'MetaTrader 5', 'TradingView', 'cTrader'],
      },
      {
        id: 'leonidas_scalper',
        pricingPlans: {
          monthly: { price: 197, originalPrice: 297, interval: 'mese' },
          yearly: { price: 1970, originalPrice: 2970, interval: 'anno', savings: '2 mesi gratis' },
          lifetime: { price: 6997, originalPrice: 9997, interval: 'lifetime', savings: 'Risparmio 30%' }
        },
        requirements: [
          'Capitale minimo: €500',
          'Broker con spread bassi',
          'VPS obbligatorio (non incluso)',
          'Leva minima 1:100'
        ],
        platforms: ['MetaTrader 4', 'MetaTrader 5'],
      },
      {
        id: 'thermopylae_defender',
        pricingPlans: {
          monthly: { price: 247, originalPrice: 397, interval: 'mese' },
          yearly: { price: 2470, originalPrice: 3970, interval: 'anno', savings: '2 mesi gratis' },
          lifetime: { price: 7997, originalPrice: 11997, interval: 'lifetime', savings: 'Risparmio 33%' }
        },
        requirements: [
          'Capitale minimo: €2,000',
          'Portfolio diversificato',
          'Account con hedging permesso',
          'VPS consigliato'
        ],
        platforms: ['MetaTrader 5', 'cTrader'],
      },
      {
        id: 'spartan_academy',
        pricingPlans: {
          oneTime: { price: 1997, originalPrice: 2997, interval: 'unico' },
          payment3: { price: 699, originalPrice: 999, interval: '3 rate', savings: 'Paga in 3 rate mensili' },
          vip: { price: 4997, originalPrice: 7997, interval: 'VIP', savings: 'Include mentoring privato 6 mesi' }
        },
        requirements: [
          'Nessun requisito di capitale iniziale',
          'Dedicare almeno 2 ore al giorno',
          'Computer o tablet',
          'Conoscenza base dell\'inglese (materiale anche in italiano)'
        ],
        platforms: ['Piattaforma e-learning proprietaria', 'App mobile iOS/Android'],
      },
      {
        id: 'ares_indicator_pack',
        pricingPlans: {
          monthly: { price: 47, originalPrice: 97, interval: 'mese' },
          yearly: { price: 470, originalPrice: 970, interval: 'anno', savings: '2 mesi gratis' },
          lifetime: { price: 997, originalPrice: 1997, interval: 'lifetime', savings: 'Aggiornamenti a vita' }
        },
        requirements: [
          'Nessun capitale minimo richiesto',
          'Piattaforma MT4, MT5 o TradingView',
          'Computer Windows o Mac',
          'Conoscenza base analisi tecnica'
        ],
        platforms: ['MetaTrader 4', 'MetaTrader 5', 'TradingView'],
      }
    ];

    const allProducts = db.getAllProducts();
    let updated = 0;
    let errors = 0;
    
    allProducts.forEach(product => {
      try {
        const completeData = completeProductsData.find(p => p.id === product.id);
        
        if (completeData) {
          const updatedProduct = db.updateProduct(product.id, {
            ...completeData,
            active: true
          });
          
          if (updatedProduct) {
            console.log(`Restored: ${product.name}`);
            updated++;
          }
        }
      } catch (error) {
        console.error(`Error updating ${product.name}:`, error);
        errors++;
      }
    });
    
    res.json({ 
      message: 'Product data restoration complete',
      updated,
      errors,
      totalProducts: allProducts.length 
    });
  } catch (error) {
    console.error('Error restoring products:', error);
    res.status(500).json({ error: 'Failed to restore products' });
  }
});

router.get('/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/products', (req, res) => {
  try {
    const product = db.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', (req, res) => {
  try {
    const productId = req.params.id;
    const oldProduct = db.getProductById(productId);
    
    if (!oldProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = db.updateProduct(productId, req.body);
    
    // Se il nome del prodotto è cambiato, aggiorna tutti i trial esistenti
    if (product && oldProduct.name !== product.name) {
      console.log(`📝 Product name changed from "${oldProduct.name}" to "${product.name}"`);
      console.log('🔄 Updating all existing trials...');
      
      const allUsers = db.getAllUsers();
      let updatedTrials = 0;
      
      allUsers.forEach(user => {
        if (user.trials && user.trials.length > 0) {
          let userUpdated = false;
          const updatedUserTrials = user.trials.map(trial => {
            if (trial.productId === productId) {
              updatedTrials++;
              userUpdated = true;
              return { ...trial, productName: product.name };
            }
            return trial;
          });
          
          if (userUpdated) {
            db.updateUser(user.id, { trials: updatedUserTrials });
            console.log(`  ✅ Updated trials for user: ${user.email}`);
          }
        }
      });
      
      if (updatedTrials > 0) {
        console.log(`✅ Successfully updated ${updatedTrials} trial(s) with new product name`);
      }
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', (req, res) => {
  try {
    const product = db.deleteProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', productId: product.id });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Orders management
router.get('/orders', (req, res) => {
  try {
    const orders = db.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/orders', (req, res) => {
  try {
    const { userId, amount, currency = 'eur', items = [], status = 'pending', notes = '' } = req.body;
    const order = db.createOrder({ userId, amount, currency, items, status, notes });
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/orders/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.put('/orders/:id', (req, res) => {
  try {
    const order = db.updateOrder(req.params.id, req.body);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

router.delete('/orders/:id', (req, res) => {
  try {
    const order = db.deleteOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully', orderId: order.id });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Subscriptions management
router.get('/subscriptions', (req, res) => {
  try {
    const subscriptions = db.getAllSubscriptions();
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

router.post('/subscriptions', (req, res) => {
  try {
    const { userId, productId, status = 'active', stripeSubscriptionId = null, startDate = new Date().toISOString(), endDate = null } = req.body;
    const subscription = db.createSubscription({ userId, productId, status, stripeSubscriptionId, startDate, endDate });
    res.status(201).json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

router.get('/subscriptions/:id', (req, res) => {
  try {
    const subscription = db.getSubscriptionById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

router.put('/subscriptions/:id', (req, res) => {
  try {
    const subscription = db.updateSubscription(req.params.id, req.body);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

router.delete('/subscriptions/:id', (req, res) => {
  try {
    const sub = db.deleteSubscription(req.params.id);
    if (!sub) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json({ message: 'Subscription deleted successfully', subscriptionId: sub.id });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

// Get trial abuse report
router.get('/abuse-report', async (req, res) => {
  try {
    const report = await getAbuseReport();
    
    if (!report) {
      return res.status(500).json({ error: 'Failed to generate abuse report' });
    }
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error fetching abuse report:', error);
    res.status(500).json({ error: 'Failed to fetch abuse report' });
  }
});

export default router;
