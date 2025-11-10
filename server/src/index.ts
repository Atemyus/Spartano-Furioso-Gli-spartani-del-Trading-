import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import trialRoutes from './routes/trial.routes';
import { trialService } from './services/trial.service';

const app = express();

// Import database configuration
import { connectDatabase } from './config/database';

// Connect to MongoDB
connectDatabase();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Troppe richieste, riprova più tardi.',
});
app.use('/api', limiter);

// Trial-specific rate limit (stricter)
const trialLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 trial requests per hour per IP
  message: 'Hai raggiunto il limite di richieste per la prova. Riprova tra un\'ora.',
});
app.use('/api/trial/create', trialLimiter);

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/trial', trialRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Spartano Furioso Backend - Operativo',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trovato',
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`⚔️  Spartano Furioso Backend`);
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`🌐 CORS enabled for ${config.corsOrigin}`);
  console.log(`📧 Email service: ${config.smtp.host ? 'Configured' : 'Dev mode (console)'}`);
  
  // Schedule periodic tasks
  setInterval(async () => {
    await trialService.expireTrials();
    await trialService.sendExpiringReminders();
  }, 24 * 60 * 60 * 1000); // Run once per day
});

export default app;
