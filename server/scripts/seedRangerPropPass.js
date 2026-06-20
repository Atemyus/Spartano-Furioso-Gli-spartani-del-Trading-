/**
 * Seed dei 3 prodotti "Ranger Prop Pass" nel database MongoDB.
 *
 * USO:
 *   cd server
 *   node scripts/seedRangerPropPass.js
 *
 * Lo script e' IDEMPOTENTE: se i prodotti esistono gia' (productId match),
 * vengono aggiornati invece di duplicati. Puoi rilanciarlo in sicurezza.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Descrizione condivisa da tutti e 3 i prodotti, con coda specifica per tier
const sharedDescription = (tierSpecific) => `Ranger Prop Pass è il servizio premium di Ranger Signals Hub (partner Nexora Lab) dedicato alla gestione professionale delle challenge prop firm.

Molti trader possiedono strategie valide ma falliscono le challenge per overtrading, mancanza di disciplina, gestione emotiva inadeguata o violazione delle regole della prop firm. Il problema raramente è la strategia: è l'esecuzione.

Ranger Prop Pass risolve questo problema affidando la gestione operativa della tua challenge a un team professionale che opera con un approccio basato su:

✓ Controllo rigoroso del rischio
✓ Consistenza operativa
✓ Disciplina ferrea
✓ Gestione strutturata delle operazioni

═══════════════════════════════════════════════════════
COME FUNZIONA

1. Acquisto del servizio Ranger Prop Pass su Nexora Lab
2. Acquisto della challenge tramite il link partner Ranger
3. Contatto diretto con il team (Telegram: @BayekTrader)
4. Verifica info e attivazione del servizio
5. Gestione professionale della challenge da parte del team
6. Aggiornamenti periodici fino al funding
7. Completamento della challenge e conclusione del servizio

═══════════════════════════════════════════════════════
IMPORTANTE

Il prezzo si riferisce ESCLUSIVAMENTE al servizio di gestione professionale Ranger. Il costo della challenge prop firm (pagato direttamente alla prop firm tramite il link partner Ranger) è separato e a carico del cliente.

${tierSpecific}`;

// Features condivise da tutti i prodotti
const sharedFeatures = [
  '🎯 Gestione professionale della challenge fino al funding',
  '🛡️ Controllo rigoroso del rischio e money management',
  '💬 Accesso VIP Ranger Signals incluso',
  '🎓 Accesso al Ranger Learning Hub incluso',
  '📊 Soluzioni Copy Trading incluse',
  '👥 Supporto Prop Firm dedicato',
  '📞 Assistenza diretta via Telegram (@BayekTrader)',
  '🔄 Aggiornamenti periodici durante il percorso',
  '🏆 Approccio basato su Disciplina, Struttura, Esecuzione',
];

// Requirements condivisi
const sharedRequirements = [
  'Acquisto della challenge tramite link partner ufficiale Ranger (obbligatorio)',
  'Account Telegram per il contatto con il team',
  'Pagamento integrale al momento dell\'attivazione',
  'Disponibilità a fornire le credenziali della challenge in modo sicuro',
  'NB: il prezzo non include il costo della challenge prop firm',
];

const products = [
  {
    productId: 'ranger_prop_pass_bullwaves_100k',
    name: 'Ranger Prop Pass — Bullwaves 100K',
    description: sharedDescription(
      'TIER: Bullwaves account fino a 100.000$. La prop firm consigliata dal team per processo rapido, regole chiare e ottima esperienza utente.'
    ),
    price: 1000,
    originalPrice: null,
    currency: 'eur',
    type: 'one-time',
    interval: null,
    pricingPlans: {
      oneTime: { price: 1000, originalPrice: null, interval: 'one-time' },
    },
    features: sharedFeatures,
    requirements: sharedRequirements,
    platforms: ['Bullwaves'],
    metrics: null,
    trialDays: 0,
    active: true,
    popular: false,
    badge: 'BULLWAVES',
    badgeColor: '#38bdf8',
    category: 'service',
    image: '/products/ranger-prop-pass.svg',
    comingSoon: false,
  },
  {
    productId: 'ranger_prop_pass_bullwaves_200k',
    name: 'Ranger Prop Pass — Bullwaves 200K',
    description: sharedDescription(
      'TIER: Bullwaves account 200.000$. Capitale operativo raddoppiato, stesso approccio professionale e stesso team Ranger dedicato.'
    ),
    price: 1500,
    originalPrice: null,
    currency: 'eur',
    type: 'one-time',
    interval: null,
    pricingPlans: {
      oneTime: { price: 1500, originalPrice: null, interval: 'one-time' },
    },
    features: sharedFeatures,
    requirements: sharedRequirements,
    platforms: ['Bullwaves'],
    metrics: null,
    trialDays: 0,
    active: true,
    popular: true, // Il piano "più popolare" è il 200K
    badge: 'BULLWAVES PRO',
    badgeColor: '#2563eb',
    category: 'service',
    image: '/products/ranger-prop-pass.svg',
    comingSoon: false,
  },
  {
    productId: 'ranger_prop_pass_multi_firm',
    name: 'Ranger Prop Pass — FTMO / FundedNext / +',
    description: sharedDescription(
      'TIER: servizio per FTMO, FundedNext, Funding Pips e altre prop firm internazionali. Il prezzo indicato è la base di partenza: il prezzo finale viene concordato in base alla prop firm e alle condizioni della challenge scelta. Contatta il team per un preventivo personalizzato.'
    ),
    price: 4000,
    originalPrice: null,
    currency: 'eur',
    type: 'one-time',
    interval: null,
    pricingPlans: {
      oneTime: { price: 4000, originalPrice: null, interval: 'one-time' },
    },
    features: sharedFeatures,
    requirements: [
      ...sharedRequirements,
      'Il prezzo è indicativo: prezzo finale concordato in base alla prop firm scelta',
    ],
    platforms: ['FTMO', 'FundedNext', 'Funding Pips', 'Altre prop firm internazionali'],
    metrics: null,
    trialDays: 0,
    active: true,
    popular: false,
    badge: 'MULTI-FIRM',
    badgeColor: '#a855f7',
    category: 'service',
    image: '/products/ranger-prop-pass.svg',
    comingSoon: false,
  },
];

async function main() {
  console.log('\n🚀 Seed Ranger Prop Pass — inizio...\n');

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { productId: p.productId } });

    if (existing) {
      await prisma.product.update({
        where: { productId: p.productId },
        data: p,
      });
      console.log(`✏️  Aggiornato: ${p.name}  (€${p.price})`);
    } else {
      await prisma.product.create({ data: p });
      console.log(`✅ Creato:    ${p.name}  (€${p.price})`);
    }
  }

  // Conta totale prodotti nella categoria service
  const totalService = await prisma.product.count({ where: { category: 'service', active: true } });
  console.log(`\n📦 Prodotti attivi in categoria "service": ${totalService}`);
  console.log('\n✨ Fatto! I 3 prodotti Ranger Prop Pass sono nel catalogo.\n');

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('❌ Errore durante il seed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
