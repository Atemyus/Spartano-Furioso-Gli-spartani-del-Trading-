import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const connectDatabase = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // Use in-memory MongoDB for development if no URI is provided
    if (!mongoUri || mongoUri.includes('localhost')) {
      console.log('🔧 Starting MongoDB in-memory server...');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'spartano-furioso',
          port: 27017
        }
      });
      mongoUri = mongoServer.getUri();
      console.log('✅ MongoDB in-memory server started');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Seed initial data if database is empty
    await seedDatabase();

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

// Seed initial products data
async function seedDatabase() {
  const Product = require('../models/Product').default;
  
  const productCount = await Product.countDocuments();
  if (productCount > 0) {
    console.log(`📊 Database already has ${productCount} products`);
    return;
  }

  console.log('🌱 Seeding database with initial products...');

  const products = [
    {
      id: 'spartan-fury-bot',
      name: 'SPARTAN FURY BOT',
      category: 'bot',
      shortDescription: 'Il bot di trading più aggressivo e redditizio mai creato',
      description: `Il Spartan Fury Bot è il nostro algoritmo di punta, forgiato con la disciplina e la strategia dei guerrieri spartani. 
      Utilizza un'intelligenza artificiale avanzata per analizzare i mercati 24/7 e identificare le migliori opportunità di trading.
      Testato in battaglia per oltre 3 anni con risultati straordinari.`,
      price: {
        monthly: 297,
        yearly: 2970,
        lifetime: 9997
      },
      features: [
        '🔥 Trading automatico 24/7',
        '⚔️ Algoritmo proprietario "Phalanx"',
        '🛡️ Gestione del rischio militare',
        '📊 Dashboard real-time',
        '🎯 Precisione del 87% sui segnali',
        '💰 ROI medio mensile: 15-25%',
        '🔐 Stop loss automatici',
        '📱 App mobile inclusa',
        '👥 Accesso alla community VIP',
        '🎓 Formazione 1-on-1 inclusa'
      ],
      performance: {
        winRate: '87%',
        avgProfit: '+22.3%',
        drawdown: '-8.5%',
        trades: '3,450+'
      },
      trial: {
        available: true,
        days: 60,
        features: [
          'Trading su conto demo',
          'Accesso completo alle funzionalità',
          'Supporto prioritario',
          'Garanzia soddisfatti o rimborsati'
        ]
      },
      status: 'active',
      badge: 'BEST SELLER',
      platforms: ['MetaTrader 4', 'MetaTrader 5', 'TradingView'],
      requirements: [
        'Capitale minimo: €1,000',
        'VPS consigliato (incluso nel piano yearly)',
        'Connessione internet stabile'
      ]
    },
    {
      id: 'leonidas-scalper',
      name: 'LEONIDAS SCALPER',
      category: 'bot',
      shortDescription: 'Bot di scalping veloce come le lance spartane',
      description: `Il Leonidas Scalper è progettato per operazioni rapide e precise, proprio come le tattiche del Re Leonida.
      Specializzato in scalping su timeframe bassi con un'efficacia letale sui mercati volatili.`,
      price: {
        monthly: 197,
        yearly: 1970,
        lifetime: 6997
      },
      features: [
        '⚡ Scalping ultra-veloce',
        '🎯 300+ trades al giorno',
        '🔄 Adattamento automatico alla volatilità',
        '📈 Profitto medio per trade: 0.3-0.5%',
        '🛡️ Protezione anti-slippage',
        '💎 Funziona su 15+ coppie forex',
        '🔔 Alert telegram in tempo reale',
        '📊 Report giornalieri dettagliati'
      ],
      performance: {
        winRate: '72%',
        avgProfit: '+18.7%',
        drawdown: '-5.2%',
        trades: '9,000+'
      },
      trial: {
        available: true,
        days: 60,
        features: [
          'Test su conto demo',
          '100 trades al giorno max',
          'Report base'
        ]
      },
      status: 'active',
      badge: 'HIGH SPEED',
      platforms: ['MetaTrader 4', 'MetaTrader 5'],
      requirements: [
        'Capitale minimo: €500',
        'Broker con spread bassi',
        'VPS obbligatorio (non incluso)'
      ]
    },
    {
      id: 'thermopylae-defender',
      name: 'THERMOPYLAE DEFENDER',
      category: 'bot',
      shortDescription: 'Sistema di hedging e protezione del capitale',
      description: `Come i 300 spartani alle Termopili, questo bot difende il tuo capitale con strategie di hedging avanzate.
      Perfetto per mercati incerti e protezione durante eventi di alta volatilità.`,
      price: {
        monthly: 247,
        yearly: 2470,
        lifetime: 7997
      },
      features: [
        '🛡️ Hedging automatico intelligente',
        '🔒 Protezione del capitale al 95%',
        '⚖️ Bilanciamento dinamico del portfolio',
        '🌪️ Gestione eventi Black Swan',
        '📉 Riduzione drawdown del 70%',
        '🔄 Correlazione multi-asset',
        '🎯 Risk/Reward ottimizzato',
        '📱 Notifiche di protezione attivata'
      ],
      performance: {
        winRate: '91%',
        avgProfit: '+12.5%',
        drawdown: '-3.1%',
        trades: '1,200+'
      },
      trial: {
        available: true,
        days: 60,
        features: [
          'Protezione base attiva',
          'Monitoraggio portfolio',
          'Alert principali'
        ]
      },
      status: 'beta',
      badge: 'NUOVO',
      platforms: ['MetaTrader 5', 'cTrader'],
      requirements: [
        'Capitale minimo: €2,000',
        'Portfolio diversificato',
        'Account con hedging permesso'
      ]
    }
  ];

  try {
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products successfully`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}
