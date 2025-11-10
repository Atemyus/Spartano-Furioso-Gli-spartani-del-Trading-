import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from '../database/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Path to product configs file
const PRODUCT_CONFIGS_FILE = path.join(__dirname, '../data/product-configs.json');

// Helper functions
async function loadProductConfigs() {
  try {
    const data = await fs.readFile(PRODUCT_CONFIGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading product configs:', error);
    return { products: {} };
  }
}

async function saveProductConfigs(data) {
  try {
    await fs.writeFile(PRODUCT_CONFIGS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving product configs:', error);
    return false;
  }
}

// Get all active products (public endpoint)
router.get('/', (req, res) => {
  try {
    // Get only active products for public view
    const activeProducts = db.getAllProducts(true);
    res.json(activeProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product configuration - PUT THIS BEFORE GENERIC /:id ROUTE
router.get('/:productId/config', async (req, res) => {
  try {
    const { productId } = req.params;
    const configs = await loadProductConfigs();
    
    if (configs.products[productId]) {
      res.json({ 
        success: true, 
        config: configs.products[productId] 
      });
    } else {
      // Return default config if not found
      res.json({ 
        success: true, 
        config: {
          platforms: ['MetaTrader 4', 'MetaTrader 5'],
          requirements: {},
          features: {}
        }
      });
    }
  } catch (error) {
    console.error('Error getting product config:', error);
    res.status(500).json({ error: 'Failed to get product configuration' });
  }
});

// Get product by ID (public endpoint)
router.get('/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (!product.active) {
      return res.status(404).json({ error: 'Product not available' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Update product platforms (temporarily without auth for testing)
router.patch('/:productId/platforms', async (req, res) => {
  try {
    const { productId } = req.params;
    const { platforms } = req.body;
    
    console.log('Updating platforms for product:', productId);
    console.log('Received platforms:', platforms);
    
    if (!platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Invalid platforms data' });
    }
    
    const configs = await loadProductConfigs();
    
    // Initialize product config if it doesn't exist
    if (!configs.products[productId]) {
      configs.products[productId] = {
        platforms: [],
        requirements: {},
        features: {}
      };
    }
    
    // Update platforms
    configs.products[productId].platforms = platforms;
    
    // Save updated configs
    console.log('Saving configs for product:', productId);
    const saved = await saveProductConfigs(configs);
    console.log('Save result:', saved);
    
    if (saved) {
      console.log('Platforms updated successfully for:', productId);
      res.json({ 
        success: true, 
        message: 'Platforms updated successfully',
        platforms 
      });
    } else {
      console.log('Failed to save platforms for:', productId);
      res.status(500).json({ error: 'Failed to save platforms' });
    }
  } catch (error) {
    console.error('Error updating platforms:', error);
    res.status(500).json({ error: 'Failed to update platforms' });
  }
});

// Start trial for a product (requires authentication)
router.post('/start-trial', authenticateToken, async (req, res) => {
  try {
    const { productId, trialDays } = req.body;
    const userId = req.user?.id || req.userId;
    
    // Get product from database
    const product = db.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (!product.active) {
      return res.status(400).json({ error: 'This product is not available' });
    }
    
    // Get user from Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { trials: true }
    });
    
    if (!user) {
      console.log('\u274c User not found in Prisma:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('\u2705 User found:', user.email);
    
    // Check if user already has a trial for this product
    const existingTrial = user.trials.find(t => t.productId === productId);
    if (existingTrial) {
      return res.status(400).json({ 
        error: 'You have already used the trial period for this product' 
      });
    }
    
    // Create trial in Prisma
    const daysToAdd = trialDays || product.trialDays || 7;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + daysToAdd);
    
    const newTrial = await prisma.trial.create({
      data: {
        userId,
        productId,
        productName: product.name,
        startDate: new Date(),
        endDate: trialEndDate,
        status: 'active',
        trialDays: daysToAdd
      }
    });
    
    console.log('\u2705 Trial created:', newTrial.id);
    
    res.json({
      success: true,
      message: `Trial of ${daysToAdd} days activated successfully`,
      trial: {
        id: newTrial.id,
        productId: newTrial.productId,
        productName: newTrial.productName,
        startDate: newTrial.startDate.toISOString(),
        endDate: newTrial.endDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    res.status(500).json({ error: 'Failed to activate trial' });
  }
});

// Check trial status for a product (requires authentication)
router.get('/trial-status/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id || req.userId;
    
    // Get user from Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { trials: true }
    });
    
    if (!user) {
      console.log('\u274c User not found in Prisma:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has a trial for this product
    const trial = user.trials.find(t => t.productId === productId);
    
    if (!trial) {
      return res.json({ hasTrial: false });
    }
    
    // Check if trial is still active
    const now = new Date();
    const endDate = new Date(trial.endDate);
    const isActive = now < endDate;
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    res.json({
      hasTrial: true,
      trial: {
        id: trial.id,
        productId: trial.productId,
        productName: trial.productName,
        startDate: trial.startDate.toISOString(),
        endDate: trial.endDate.toISOString(),
        active: isActive,
        daysRemaining
      }
    });
  } catch (error) {
    console.error('Error checking trial status:', error);
    res.status(500).json({ error: 'Failed to check trial status' });
  }
});

// Update product configuration
router.put('/:productId/config', async (req, res) => {
  try {
    const { productId } = req.params;
    const { platforms, requirements, features } = req.body;
    
    const configs = await loadProductConfigs();
    
    // Update or create product config
    configs.products[productId] = {
      ...configs.products[productId],
      platforms: platforms || configs.products[productId]?.platforms || [],
      requirements: requirements || configs.products[productId]?.requirements || {},
      features: features || configs.products[productId]?.features || {}
    };
    
    const saved = await saveProductConfigs(configs);
    
    if (saved) {
      res.json({ 
        success: true, 
        message: 'Configuration updated successfully',
        config: configs.products[productId]
      });
    } else {
      res.status(500).json({ error: 'Failed to save configuration' });
    }
  } catch (error) {
    console.error('Error updating product config:', error);
    res.status(500).json({ error: 'Failed to update product configuration' });
  }
});


export default router;
