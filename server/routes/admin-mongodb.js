import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Protect all admin routes
router.use(authenticateAdmin);

// MongoDB Product Schema
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  price: {
    monthly: Number,
    yearly: Number,
    lifetime: Number
  },
  features: [String],
  performance: {
    winRate: String,
    avgProfit: String,
    drawdown: String,
    trades: String
  },
  trial: {
    available: Boolean,
    days: Number,
    features: [String]
  },
  status: { type: String, default: 'active' },
  badge: String,
  platforms: [String],
  requirements: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// User Schema (semplificato per admin)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, default: 'user' },
  status: { type: String, default: 'active' },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Newsletter Schema
const newsletterSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Conta utenti da MongoDB
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      isActive: true, 
      emailVerified: true
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Conta newsletter subscribers da MongoDB
    const newsletterSubscribers = await Newsletter.countDocuments({
      status: 'ACTIVE'
    });
    
    // Utenti recenti (ultimi 5)
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('id name email createdAt role status');
    
    // Statistiche prodotti da MongoDB
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    
    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth
        },
        newsletter: {
          subscribers: newsletterSubscribers
        },
        products: {
          total: totalProducts,
          active: activeProducts
        },
        recentUsers
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('id name email role status isActive emailVerified createdAt');
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('id name email role status isActive emailVerified createdAt');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Utente non trovato' 
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Admin get user error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, status, isActive, emailVerified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        email, 
        role, 
        status, 
        isActive, 
        emailVerified,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Utente non trovato' 
      });
    }
    
    res.json({
      success: true,
      user,
      message: 'Utente aggiornato con successo'
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Utente non trovato' 
      });
    }
    
    res.json({
      success: true,
      message: 'Utente eliminato con successo'
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Prodotto non trovato' 
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Admin get product error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create product
router.post('/products', async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const product = new Product(productData);
    await product.save();
    
    res.json({
      success: true,
      product,
      message: 'Prodotto creato con successo'
    });
  } catch (error) {
    console.error('Admin create product error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Prodotto non trovato' 
      });
    }
    
    res.json({
      success: true,
      product,
      message: 'Prodotto aggiornato con successo - MODIFICA APPLICATA SU MONGODB!'
    });
  } catch (error) {
    console.error('Admin update product error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Prodotto non trovato' 
      });
    }
    
    res.json({
      success: true,
      message: 'Prodotto eliminato con successo'
    });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get newsletter subscribers
router.get('/newsletter', async (req, res) => {
  try {
    const subscribers = await Newsletter.find({})
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      subscribers
    });
  } catch (error) {
    console.error('Admin newsletter error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
