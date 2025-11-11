import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables - FORZA IL PATH CORRETTO
dotenv.config({ path: join(__dirname, '.env') });

// Verifica DATABASE_URL all'avvio
console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
  console.error('❌ ERRORE: DATABASE_URL non configurato!');
  console.error('   File .env path:', join(__dirname, '.env'));
  process.exit(1);
}

// Verifica tipo di database
if (process.env.DATABASE_URL.startsWith('file:')) {
  console.log('✅ Database: SQLite');
} else if (process.env.DATABASE_URL.startsWith('mongodb')) {
  console.log('✅ Database: MongoDB');
} else if (process.env.DATABASE_URL.startsWith('postgresql')) {
  console.log('✅ Database: PostgreSQL');
} else {
  console.warn('⚠️  Database type non riconosciuto');
}

// Auto-setup per Railway (MongoDB)
import autoSetup from './scripts/autoSetup.js';
if (process.env.DATABASE_URL?.startsWith('mongodb')) {
  autoSetup().catch(err => console.error('Auto-setup error:', err));
}

// Routes imports
import stripeRoutes from './routes/stripe.js';
import stripeWebhookRoutes from './routes/stripe-webhook.js';
import paypalWebhookRoutes from './routes/paypal-webhook.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import trialsRoutes from './routes/trials.js';
import coursesRoutes from './routes/courses.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import paymentsRoutes from './routes/payments.js';
import ordersRoutes from './routes/orders.js';
import analyticsRoutes from './routes/analytics.js';
import newsletterRoutes from './routes/newsletter.js';
import { initializeTrialScheduler } from './services/trialScheduler.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${extension}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types including videos
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      // Video types
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/webm'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo di file non supportato: ${file.mimetype}`), false);
    }
  }
});

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Webhook routes (must be before body parser for raw body)
app.use('/webhook/stripe', stripeWebhookRoutes);
app.use('/webhook/paypal', paypalWebhookRoutes);

// Body parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/stripe', stripeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/trials', trialsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/admin/subscriptions', subscriptionsRoutes); // Subscriptions management
app.use('/api/payments', paymentsRoutes); // PayPal and Crypto payments
app.use('/api/orders', ordersRoutes); // Orders management
app.use('/api/analytics', analyticsRoutes); // Analytics tracking
app.use('/api/newsletter', newsletterRoutes); // Newsletter management

// Serve uploaded files statically
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Download endpoint with custom filename
app.get('/api/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const customName = req.query.name || filename;
    const filePath = join(__dirname, 'uploads', filename);
    
    console.log('📥 Download request:', filename, '→', customName);
    
    // Set headers to force download with custom name
    res.setHeader('Content-Disposition', `attachment; filename="${customName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.download(filePath, customName, (err) => {
      if (err) {
        console.error('❌ Download error:', err);
        if (!res.headersSent) {
          res.status(404).json({ error: 'File non trovato' });
        }
      } else {
        console.log('✅ Download completed:', customName);
      }
    });
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ error: 'Errore durante il download' });
  }
});

// File upload endpoint
app.post('/api/upload', (req, res) => {
  console.log('📤 Upload request received');
  console.log('Headers:', req.headers);
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false,
            error: 'File troppo grande. Dimensione massima: 1GB' 
          });
        }
        return res.status(400).json({ 
          success: false,
          error: `Errore upload: ${err.message}` 
        });
      }
      return res.status(500).json({ 
        success: false,
        error: err.message || 'Errore durante l\'upload del file' 
      });
    }

    try {
      if (!req.file) {
        console.error('❌ No file in request');
        return res.status(400).json({ 
          success: false,
          error: 'Nessun file caricato' 
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      console.log('✅ File uploaded successfully:', fileUrl);
      
      res.json({
        success: true,
        fileUrl,
        filename: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('❌ Upload error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Errore durante l\'upload del file' 
      });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Stripe Webhook configured`);
  
  // Initialize trial scheduler
  initializeTrialScheduler();
});
