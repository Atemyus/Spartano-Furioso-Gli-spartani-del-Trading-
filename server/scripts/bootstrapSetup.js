// Bootstrap setup: crea admin + semina i prodotti nel database MongoDB (via Prisma).
//
// Pensato per girare automaticamente all'avvio del server quando la variabile
// d'ambiente SEED_ON_BOOT === 'true'. È IDEMPOTENTE: se admin/prodotti esistono
// già, non li duplica. Sicuro da lasciare attivo, ma conviene rimuovere
// SEED_ON_BOOT dopo il primo avvio andato a buon fine.
//
// Variabili lette:
//   ADMIN_EMAIL     (default: admin@nexoralab.com)
//   ADMIN_PASSWORD  (obbligatoria per creare l'admin; se assente, salta l'admin)
//   ADMIN_NAME      (default: Admin)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Catalogo prodotti (allineato a src/data/products.ts del frontend).
const PRODUCTS = [
  {
    productId: 'spartan_fury_bot',
    name: 'SPARTAN FURY BOT',
    category: 'bot',
    description:
      'Algoritmo di trading automatico di punta. Analizza i mercati 24/7 e identifica le migliori opportunità con gestione del rischio rigorosa.',
    price: { monthly: 297, yearly: 2970, lifetime: 9997 },
    features: [
      '🔥 Trading automatico 24/7',
      '⚔️ Algoritmo proprietario "Phalanx"',
      '🛡️ Gestione del rischio avanzata',
      '📊 Dashboard real-time',
      '🎯 Precisione del 87% sui segnali',
      '💰 ROI medio mensile: 15-25%',
      '🔐 Stop loss automatici',
      '📱 App mobile inclusa',
      '👥 Accesso alla community VIP',
      '🎓 Formazione 1-on-1 inclusa',
    ],
    metrics: { winRate: '87%', avgProfit: '+22.3%', drawdown: '-8.5%', trades: '3,450+' },
    platforms: ['MetaTrader 4', 'MetaTrader 5', 'TradingView'],
    requirements: [
      'Capitale minimo: €1,000',
      'VPS consigliato (incluso nel piano yearly)',
      'Connessione internet stabile',
    ],
    badge: 'BEST SELLER',
    popular: true,
    trialDays: 60,
    comingSoon: false,
  },
  {
    productId: 'leonidas_scalper',
    name: 'LEONIDAS SCALPER',
    category: 'bot',
    description:
      'Bot di scalping per operazioni rapide e precise su timeframe bassi. Efficace sui mercati volatili.',
    price: { monthly: 197, yearly: 1970, lifetime: 6997 },
    features: [
      '⚡ Scalping ultra-veloce',
      '🎯 300+ trades al giorno',
      '🔄 Adattamento automatico alla volatilità',
      '📈 Profitto medio per trade: 0.3-0.5%',
      '🛡️ Protezione anti-slippage',
      '💎 Funziona su 15+ coppie forex',
      '🔔 Alert telegram in tempo reale',
      '📊 Report giornalieri dettagliati',
    ],
    metrics: { winRate: '72%', avgProfit: '+18.7%', drawdown: '-5.2%', trades: '9,000+' },
    platforms: ['MetaTrader 4', 'MetaTrader 5'],
    requirements: [
      'Capitale minimo: €500',
      'Broker con spread bassi',
      'VPS obbligatorio (non incluso)',
    ],
    badge: 'HIGH SPEED',
    popular: false,
    trialDays: 60,
    comingSoon: false,
  },
  {
    productId: 'thermopylae_defender',
    name: 'THERMOPYLAE DEFENDER',
    category: 'bot',
    description:
      'Sistema di hedging e protezione del capitale con strategie avanzate. Ideale per mercati incerti e alta volatilità.',
    price: { monthly: 247, yearly: 2470, lifetime: 7997 },
    features: [
      '🛡️ Hedging automatico intelligente',
      '🔒 Protezione del capitale al 95%',
      '⚖️ Bilanciamento dinamico del portfolio',
      '🌪️ Gestione eventi Black Swan',
      '📉 Riduzione drawdown del 70%',
      '🔄 Correlazione multi-asset',
      '🎯 Risk/Reward ottimizzato',
      '📱 Notifiche di protezione attivata',
    ],
    metrics: { winRate: '91%', avgProfit: '+12.5%', drawdown: '-3.1%', trades: '1,200+' },
    platforms: ['MetaTrader 5', 'cTrader'],
    requirements: [
      'Capitale minimo: €2,000',
      'Portfolio diversificato',
      'Account con hedging permesso',
    ],
    badge: 'NUOVO',
    popular: false,
    trialDays: 60,
    comingSoon: false,
  },
  {
    productId: 'spartan_academy',
    name: 'SPARTAN ACADEMY',
    category: 'course',
    description:
      'Percorso di formazione completo: 12 settimane di training intensivo con mentoring e strategie proprietarie.',
    price: { monthly: 0, yearly: 0, lifetime: 1997 },
    features: [
      '🎓 12 settimane di formazione intensiva',
      '📚 300+ ore di contenuti video',
      '👨‍🏫 Mentoring settimanale 1-on-1',
      '📊 Analisi live dei mercati',
      '🏆 Certificazione Spartan Trader',
      '💬 Gruppo Telegram esclusivo',
      '📈 Strategie proprietarie',
      '🔄 Aggiornamenti a vita',
    ],
    metrics: null,
    platforms: [],
    requirements: [
      'Nessuna esperienza richiesta',
      '2-3 ore al giorno di studio',
      'Commitment totale',
    ],
    badge: 'FORMAZIONE',
    popular: false,
    trialDays: 7,
    comingSoon: false,
  },
  {
    productId: 'oracle_signals',
    name: 'ORACLE SIGNALS PRO',
    category: 'service',
    description:
      'Segnali di trading premium in tempo reale dal team di analisti, direttamente sul tuo telefono.',
    price: { monthly: 97, yearly: 970 },
    features: [
      '📱 15-20 segnali al giorno',
      "🎯 Accuracy dell'85%+",
      '⚡ Segnali in tempo reale',
      '📊 Analisi tecnica dettagliata',
      '🔔 Alert Telegram/WhatsApp',
      '💹 Tutti i mercati principali',
      '📈 Track record verificato',
      '🆘 Supporto 24/7',
    ],
    metrics: { winRate: '85%', avgProfit: '+750 pips', drawdown: 'N/A', trades: '450/mese' },
    platforms: [],
    requirements: [
      'Smartphone con Telegram/WhatsApp',
      'Broker a scelta',
      'Capitale minimo consigliato: €500',
    ],
    badge: 'POPOLARE',
    popular: true,
    trialDays: 14,
    comingSoon: false,
  },
  {
    productId: 'ares_indicator_pack',
    name: 'ARES INDICATOR PACK',
    category: 'indicator',
    description:
      '12 indicatori proprietari testati negli anni, compatibili con le principali piattaforme di trading.',
    price: { monthly: 47, yearly: 470, lifetime: 997 },
    features: [
      '📊 12 indicatori proprietari',
      '🎨 Personalizzazione completa',
      '📈 Trend Spartan Identifier',
      '🎯 Entry/Exit point precisi',
      '⚡ Zero lag technology',
      '🔄 Auto-adattamento al mercato',
      '📱 Alert personalizzabili',
      '📚 Video tutorial inclusi',
    ],
    metrics: null,
    platforms: ['TradingView', 'MetaTrader 4', 'MetaTrader 5', 'NinjaTrader'],
    requirements: ['Piattaforma di trading compatibile', 'Conoscenza base del trading'],
    badge: 'PROSSIMAMENTE',
    popular: false,
    trialDays: 30,
    comingSoon: true,
  },
];

function buildPricingPlans(price) {
  const plans = {};
  if (price.monthly && price.monthly > 0) plans.monthly = { price: price.monthly, interval: 'mese' };
  if (price.yearly && price.yearly > 0) plans.yearly = { price: price.yearly, interval: 'anno' };
  if (price.lifetime && price.lifetime > 0)
    plans.lifetime = { price: price.lifetime, interval: 'lifetime' };
  return plans;
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@nexoralab.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (existing) {
    console.log(`👤 [bootstrap] Admin già presente: ${existing.email} — salto la creazione.`);
    return;
  }

  if (!password || password.length < 8) {
    console.log(
      '⚠️  [bootstrap] ADMIN_PASSWORD mancante o troppo corta (<8). Salto la creazione admin. ' +
        'Imposta ADMIN_EMAIL e ADMIN_PASSWORD su Railway e riavvia.'
    );
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      role: 'ADMIN',
      isActive: true,
      status: 'active',
      emailVerified: true,
    },
  });
  console.log(`✅ [bootstrap] Admin creato: ${admin.email}`);
}

async function seedProducts() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`📦 [bootstrap] Prodotti già presenti (${count}) — salto il seeding.`);
    return;
  }

  let created = 0;
  for (const p of PRODUCTS) {
    const pricingPlans = buildPricingPlans(p.price);
    const monthly = p.price.monthly || 0;
    await prisma.product.upsert({
      where: { productId: p.productId },
      update: {},
      create: {
        productId: p.productId,
        name: p.name,
        description: p.description,
        price: monthly > 0 ? monthly : p.price.lifetime || 0,
        currency: 'eur',
        pricingPlans,
        features: p.features || [],
        requirements: p.requirements || [],
        platforms: p.platforms || [],
        metrics: p.metrics || undefined,
        type: monthly > 0 ? 'subscription' : 'one-time',
        interval: monthly > 0 ? 'month' : null,
        trialDays: p.trialDays ?? 60,
        active: true,
        popular: !!p.popular,
        badge: p.badge || null,
        category: p.category,
        comingSoon: !!p.comingSoon,
      },
    });
    created += 1;
    console.log(`   + ${p.name}`);
  }
  console.log(`✅ [bootstrap] Prodotti seminati: ${created}`);
}

export async function runBootstrap() {
  console.log('🚀 [bootstrap] Avvio auto-setup database...');
  try {
    await seedAdmin();
    await seedProducts();
    console.log('🎉 [bootstrap] Auto-setup completato.');
  } catch (error) {
    console.error('❌ [bootstrap] Errore durante auto-setup:', error.message);
  }
}

// Esecuzione standalone: `node scripts/bootstrapSetup.js`
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runBootstrap().finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
