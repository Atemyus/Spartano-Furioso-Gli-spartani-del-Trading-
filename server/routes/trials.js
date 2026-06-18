import express from 'express';
import { authenticateToken, authenticateAdmin } from '../middleware/auth.js';
import { db } from '../database/index.js';
import { PrismaClient } from '@prisma/client';
import { recordTrialActivation } from '../middleware/trialProtection.js';

const prisma = new PrismaClient();

const router = express.Router();

// Get user trials
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { trials: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calcola giorni rimanenti per ogni trial
    const trialsWithDays = user.trials.map(trial => {
      const endDate = new Date(trial.endDate);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Get product info to include category
      const product = db.getProductById(trial.productId);
      
      return {
        id: trial.id,
        productId: trial.productId,
        productName: trial.productName,
        startDate: trial.startDate.toISOString(),
        endDate: trial.endDate.toISOString(),
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        status: daysRemaining > 0 ? 'active' : 'expired',
        trialDays: trial.trialDays,
        productCategory: product?.category || 'unknown'
      };
    });

    res.json({
      success: true,
      trials: trialsWithDays
    });
  } catch (error) {
    console.error('Error fetching user trials:', error);
    res.status(500).json({ error: 'Failed to fetch trials' });
  }
});

// Get user subscriptions
router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Sorgente unica = MongoDB. Combina:
    //  (1) l'abbonamento "embedded" gestito dall'admin (user.subscription)
    //  (2) gli ordini di tipo subscription per email dell'utente
    const subscriptions = [];

    if (user.subscription) {
      const sub = user.subscription;
      subscriptions.push({
        id: sub.id || `sub_${user.id}`,
        productId: sub.productId || 'unknown',
        productName: sub.productName || 'Abbonamento',
        amount: sub.amount || 0,
        currency: sub.currency || 'EUR',
        interval: sub.interval || 'month',
        status: sub.status || 'active',
        startDate: sub.startDate || user.createdAt,
        currentPeriodEnd: sub.currentPeriodEnd || null,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false
      });
    }

    const orders = await prisma.order.findMany({
      where: { customerEmail: user.email, mode: 'subscription' },
      orderBy: { createdAt: 'desc' }
    });
    orders.forEach(o => {
      // Evita di duplicare se è già presente come embedded
      const already = subscriptions.find(s => s.productId === o.productId);
      if (already) return;
      const paid = o.paymentStatus === 'paid' || o.status === 'confirmed' || o.status === 'completed';
      subscriptions.push({
        id: o.id,
        productId: o.productId || 'unknown',
        productName: o.productName || 'Abbonamento',
        amount: o.amount || 0,
        currency: (o.currency || 'EUR').toUpperCase(),
        interval: o.metadata?.interval || 'month',
        status: paid ? 'active' : (o.status || 'pending'),
        startDate: o.createdAt,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      });
    });

    res.json({ success: true, subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Start a new trial
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { trials: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if trial already exists
    const existingTrial = user.trials.find(t => t.productId === productId);
    if (existingTrial) {
      return res.status(400).json({ error: 'Trial already active for this product' });
    }

    // Get the product to find its trial duration and name
    const product = db.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const trialDays = product.trialDays || 60; // Default 60 if not specified
    const productName = req.body.productName || product.name; // Use product name from DB if not provided
    
    console.log(`🕒 Creating trial for ${productName} with ${trialDays} days`);

    // Get IP from request
    const ip = req.headers['x-real-ip'] || 
                req.headers['x-forwarded-for']?.split(',')[0] || 
                req.connection.remoteAddress ||
                req.socket.remoteAddress;

    // Create new trial in Prisma
    const newTrial = await prisma.trial.create({
      data: {
        userId,
        productId,
        productName,
        startDate: new Date(),
        endDate: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
        status: 'active',
        trialDays,
        activationIP: ip
      }
    });

    // Record trial activation for abuse tracking
    await recordTrialActivation(user.email, ip, user.deviceHash);
    
    console.log(`✅ Trial created for user ${user.email}:`, newTrial.id);

    res.json({
      success: true,
      trial: {
        id: newTrial.id,
        productId: newTrial.productId,
        productName: newTrial.productName,
        startDate: newTrial.startDate.toISOString(),
        endDate: newTrial.endDate.toISOString(),
        status: newTrial.status,
        trialDays: newTrial.trialDays
      },
      message: 'Trial activated successfully'
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    res.status(500).json({ error: 'Failed to start trial' });
  }
});

// Check trial status for a product
router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { trials: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const trial = user.trials.find(t => t.productId === productId);
    
    if (trial) {
      const endDate = new Date(trial.endDate);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      res.json({
        success: true,
        isActive: daysRemaining > 0,
        trial: {
          id: trial.id,
          productId: trial.productId,
          productName: trial.productName,
          startDate: trial.startDate.toISOString(),
          endDate: trial.endDate.toISOString(),
          status: trial.status,
          trialDays: trial.trialDays,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0
        }
      });
    } else {
      res.json({
        success: true,
        isActive: false,
        trial: null
      });
    }
  } catch (error) {
    console.error('Error checking trial:', error);
    res.status(500).json({ error: 'Failed to check trial status' });
  }
});

// Admin: Get all trials
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    console.log('📊 Admin fetching all trials from Prisma...');
    
    const allTrials = await prisma.trial.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedTrials = allTrials.map(trial => {
      const endDate = new Date(trial.endDate);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      return {
        id: trial.id,
        productId: trial.productId,
        productName: trial.productName,
        startDate: trial.startDate.toISOString(),
        endDate: trial.endDate.toISOString(),
        trialDays: trial.trialDays,
        activationIP: trial.activationIP,
        userId: trial.user.id,
        userName: trial.user.name || 'N/A',
        userEmail: trial.user.email,
        daysRemaining: trial.status === 'cancelled' ? 0 : (daysRemaining > 0 ? daysRemaining : 0),
        // Lo stato "cancelled" (impostato dall'admin) ha priorità; altrimenti
        // si deriva dalla data di scadenza.
        status: trial.status === 'cancelled'
          ? 'cancelled'
          : (daysRemaining > 0 ? 'active' : 'expired')
      };
    });

    console.log(`✅ Found ${formattedTrials.length} total trials from Prisma`);
    res.json({
      success: true,
      trials: formattedTrials
    });
  } catch (error) {
    console.error('Error fetching all trials:', error);
    res.status(500).json({ error: 'Failed to fetch trials' });
  }
});

// Admin: Delete a trial
router.delete('/admin/:trialId', authenticateAdmin, async (req, res) => {
  try {
    // Verifica autenticazione
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const { trialId } = req.params;
    console.log(`🗑️ Attempting to delete trial: ${trialId}`);
    
    // Delete trial from Prisma
    const deletedTrial = await prisma.trial.delete({
      where: { id: trialId },
      include: {
        user: {
          select: { email: true }
        }
      }
    });
    
    console.log(`✅ Trial ${trialId} deleted from user ${deletedTrial.user.email}`);
    
    res.json({
      success: true,
      message: 'Trial deleted successfully',
      deletedTrial: {
        id: deletedTrial.id,
        productName: deletedTrial.productName,
        userEmail: deletedTrial.user.email
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      console.log(`⚠️ Trial not found`);
      return res.status(404).json({ error: 'Trial not found' });
    }
    console.error('Error deleting trial:', error);
    res.status(500).json({ error: 'Failed to delete trial' });
  }
});

// Admin: Aggiorna lo stato di un trial (active / cancelled / expired)
router.patch('/admin/:trialId', authenticateAdmin, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.split(' ')[1]) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { trialId } = req.params;
    const { status } = req.body;
    const valid = ['active', 'cancelled', 'expired'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existing = await prisma.trial.findUnique({ where: { id: trialId } });
    if (!existing) return res.status(404).json({ error: 'Trial not found' });

    const data = { status };
    if (status === 'cancelled') {
      // Revoca immediata: scade ora
      data.endDate = new Date();
    } else if (status === 'active') {
      // Riattiva concedendo di nuovo il periodo di prova pieno
      data.startDate = new Date();
      data.endDate = new Date(Date.now() + (existing.trialDays || 60) * 24 * 60 * 60 * 1000);
    } else if (status === 'expired') {
      data.endDate = new Date();
    }

    const updated = await prisma.trial.update({ where: { id: trialId }, data });
    console.log(`✅ Trial ${trialId} -> status ${status}`);
    res.json({ success: true, trial: { id: updated.id, status: updated.status } });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Trial not found' });
    console.error('Error updating trial status:', error);
    res.status(500).json({ error: 'Failed to update trial' });
  }
});

// Admin: Estendi un trial di N giorni
router.post('/admin/:trialId/extend', authenticateAdmin, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.split(' ')[1]) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { trialId } = req.params;
    const days = parseInt(req.body?.days, 10);
    if (!days || days <= 0) {
      return res.status(400).json({ error: 'Invalid days' });
    }

    const existing = await prisma.trial.findUnique({ where: { id: trialId } });
    if (!existing) return res.status(404).json({ error: 'Trial not found' });

    // Estendi dalla scadenza attuale (o da ora se già scaduto)
    const base = existing.endDate > new Date() ? existing.endDate : new Date();
    const newEnd = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    const updated = await prisma.trial.update({
      where: { id: trialId },
      data: { endDate: newEnd, status: 'active' }
    });

    console.log(`✅ Trial ${trialId} esteso di ${days} giorni -> ${newEnd.toISOString()}`);
    res.json({ success: true, trial: { id: updated.id, endDate: updated.endDate } });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Trial not found' });
    console.error('Error extending trial:', error);
    res.status(500).json({ error: 'Failed to extend trial' });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const allProducts = db.getAllProducts(true); // Solo prodotti attivi
    
    // Conta utenti da Prisma
    const totalUsers = await prisma.user.count();
    
    // Conta trial attivi
    const activeTrials = await prisma.trial.count({
      where: {
        endDate: { gt: new Date() },
        status: 'active'
      }
    });
    
    // Subscriptions dal vecchio db (temporaneo)
    const allUsers = db.getAllUsers();
    const activeSubscriptions = allUsers.reduce((count, user) => {
      return count + (user.subscriptions?.length || 0);
    }, 0);
    
    res.json({
      success: true,
      stats: {
        totalProducts: allProducts.length,
        totalUsers,
        activeTrials,
        activeSubscriptions
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
