import { Router, Request, Response } from 'express';
import Product from '../models/Product';
import User from '../models/User';
import { authenticate, authenticateOptional, requireAdmin } from '../middleware/auth';

const router = Router();

// Get all products
router.get('/', authenticateOptional, async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    // Non-authenticated users can only see active products
    if (!req.user || req.user.role !== 'admin') {
      filter.status = { $in: ['active', 'beta'] };
    }
    
    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei prodotti.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single product
router.get('/:id', authenticateOptional, async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Prodotto non trovato.'
      });
    }
    
    // Check if user can view this product
    if (product.status === 'coming-soon' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Questo prodotto non è ancora disponibile.'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del prodotto.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Start trial for a product
router.post('/:id/start-trial', authenticate, async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Prodotto non trovato.'
      });
    }
    
    if (!product.trial.available) {
      return res.status(400).json({
        success: false,
        message: 'Questo prodotto non offre una prova gratuita.'
      });
    }
    
    if (!product.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Questo prodotto non è attualmente disponibile.'
      });
    }
    
    const user = req.user!;
    
    // Check if user already has an active trial for this product
    const existingTrial = user.trials.find(t => 
      t.productId === product.id && 
      (t.status === 'active' || (t.status === 'expired' && new Date(t.endDate) > new Date()))
    );
    
    if (existingTrial) {
      return res.status(400).json({
        success: false,
        message: 'Hai già una prova attiva o completata per questo prodotto.'
      });
    }
    
    // Check if user has an active subscription for this product
    const hasSubscription = user.subscriptions.some(s => 
      s.productId === product.id && s.status === 'active'
    );
    
    if (hasSubscription) {
      return res.status(400).json({
        success: false,
        message: 'Hai già un abbonamento attivo per questo prodotto.'
      });
    }
    
    // Create trial
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + product.trial.days);
    
    user.trials.push({
      productId: product.id,
      startDate,
      endDate,
      status: 'active',
      convertedToSubscription: false
    });
    
    await user.save();
    
    // Increment trial count for product
    await product.incrementTrialCount();
    
    // Send trial started email
    const { sendEmail } = require('../services/email.service');
    await sendEmail({
      to: user.email,
      subject: `Prova Gratuita Attivata - ${product.name}`,
      html: `
        <h1>Prova Gratuita Attivata!</h1>
        <p>Ciao ${user.firstName},</p>
        <p>La tua prova gratuita di <strong>${product.trial.days} giorni</strong> per ${product.name} è stata attivata con successo!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Dettagli della prova:</h3>
          <ul>
            <li><strong>Prodotto:</strong> ${product.name}</li>
            <li><strong>Inizio:</strong> ${startDate.toLocaleDateString('it-IT')}</li>
            <li><strong>Fine:</strong> ${endDate.toLocaleDateString('it-IT')}</li>
            <li><strong>Durata:</strong> ${product.trial.days} giorni</li>
          </ul>
        </div>
        
        <h3>Cosa include la tua prova:</h3>
        <ul>
          ${product.trial.features?.map(f => `<li>${f}</li>`).join('') || '<li>Accesso completo a tutte le funzionalità</li>'}
        </ul>
        
        <p>Durante il periodo di prova avrai accesso completo al prodotto. Riceverai dei promemoria prima della scadenza.</p>
        <p>Se hai domande o necessiti di supporto, non esitare a contattarci!</p>
        
        <br>
        <p>Forza e Onore,<br>Il Team Spartano Furioso</p>
      `
    });
    
    res.json({
      success: true,
      message: `Prova gratuita di ${product.trial.days} giorni attivata con successo!`,
      data: {
        trial: {
          productId: product.id,
          productName: product.name,
          startDate,
          endDate,
          daysRemaining: product.trial.days
        }
      }
    });
  } catch (error: any) {
    console.error('Start trial error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'attivazione della prova gratuita.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's trials
router.get('/trials/my', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    
    // Get product details for each trial
    const trialsWithProducts = await Promise.all(
      user.trials.map(async (trial) => {
        const product = await Product.findOne({ id: trial.productId });
        return {
          ...trial.toObject(),
          product: product ? {
            id: product.id,
            name: product.name,
            category: product.category,
            shortDescription: product.shortDescription
          } : null
        };
      })
    );
    
    res.json({
      success: true,
      data: trialsWithProducts
    });
  } catch (error: any) {
    console.error('Get user trials error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle prove.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin: Create/Update product
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    
    let product = await Product.findOne({ id: productData.id });
    
    if (product) {
      // Update existing product
      Object.assign(product, productData);
      product.lastUpdated = new Date();
    } else {
      // Create new product
      product = new Product(productData);
    }
    
    await product.save();
    
    res.json({
      success: true,
      message: product.isNew ? 'Prodotto creato con successo!' : 'Prodotto aggiornato con successo!',
      data: product
    });
  } catch (error: any) {
    console.error('Create/Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il salvataggio del prodotto.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin: Delete product
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Prodotto non trovato.'
      });
    }
    
    // Check if product has active users
    if (product.totalUsers > 0) {
      return res.status(400).json({
        success: false,
        message: 'Non puoi eliminare un prodotto con utenti attivi. Imposta lo stato su "soldout" invece.'
      });
    }
    
    await product.deleteOne();
    
    res.json({
      success: true,
      message: 'Prodotto eliminato con successo!'
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'eliminazione del prodotto.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get featured products
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const products = await (Product as any).getFeatured();
    
    res.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei prodotti in evidenza.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
