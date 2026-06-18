export interface Product {
  id: string;
  name: string;
  category: 'bot' | 'indicator' | 'course' | 'service';
  description: string;
  shortDescription: string;
  price: {
    monthly: number;
    yearly: number;
    lifetime?: number;
  };
  features: string[];
  performance?: {
    winRate: string;
    avgProfit: string;
    drawdown: string;
    trades: string;
  };
  trial: {
    available: boolean;
    days: number;
    features?: string[]; // Features limitate durante il trial
  };
  status: 'active' | 'coming-soon' | 'beta' | 'soldout';
  badge?: string;
  image?: string;
  videoUrl?: string;
  documentation?: string;
  requirements?: string[];
  platforms?: string[];
  courseModules?: {
    id: string;
    title: string;
    description: string;
    order: number;
    isTrialContent: boolean;
    duration: string;
    lessons: {
      id: string;
      title: string;
      description: string;
      duration: string;
      isTrialContent: boolean;
      order: number;
    }[];
  }[];
  totalModules?: number;
  totalLessons?: number;
  totalDuration?: string;
  trialDays?: number;
  metrics?: {
    students?: number;
    avgRating?: number;
    successRate?: number;
    completionRate?: number;
  };
}

export const products: Product[] = [
  {
    id: 'spartan_fury_bot',
    name: 'NEXORA FURY BOT',
    category: 'bot',
    shortDescription: 'Il bot di trading più aggressivo e redditizio del lab',
    description: `Nexora Fury Bot è il nostro algoritmo di punta, costruito con un approccio metodico e rigoroso alla gestione del rischio.
    Utilizza un'intelligenza artificiale avanzata per analizzare i mercati 24/7 e identificare le migliori opportunità di trading.
    Testato in live per oltre 3 anni con risultati straordinari.`,
    price: {
      monthly: 297,
      yearly: 2970,
      lifetime: 9997
    },
    features: [
      '🔥 Trading automatico 24/7',
      '⚙️ Algoritmo proprietario "Phalanx"',
      '🛡️ Gestione del rischio rigorosa',
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
    id: 'leonidas_scalper',
    name: 'NEXORA SCALPER',
    category: 'bot',
    shortDescription: 'Bot di scalping ad alta frequenza per mercati volatili',
    description: `Nexora Scalper è progettato per operazioni rapide e precise.
    Specializzato in scalping su timeframe bassi con un'efficacia notevole sui mercati volatili.`,
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
    id: 'thermopylae_defender',
    name: 'NEXORA SHIELD',
    category: 'bot',
    shortDescription: 'Sistema di hedging e protezione del capitale',
    description: `Nexora Shield difende il tuo capitale con strategie di hedging avanzate.
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
  },
  {
    id: 'spartan_academy',
    name: 'NEXORA ACADEMY',
    category: 'course',
    shortDescription: 'Formazione completa per diventare un trader professionista',
    description: `L'accademia di formazione più completa per trasformarti in un trader professionista dei mercati.
    12 settimane di training intensivo con i nostri migliori mentor.`,
    price: {
      monthly: 0,
      yearly: 0,
      lifetime: 1997
    },
    features: [
      '🎓 12 settimane di formazione intensiva',
      '📚 300+ ore di contenuti video',
      '👨‍🏫 Mentoring settimanale 1-on-1',
      '📊 Analisi live dei mercati',
      '🏆 Certificazione Nexora Trader',
      '💬 Gruppo Telegram esclusivo',
      '📈 Strategie proprietarie',
      '🔄 Aggiornamenti a vita'
    ],
    trial: {
      available: true,
      days: 7,
      features: [
        'Primo modulo completo',
        '10 ore di contenuti',
        'Accesso community base'
      ]
    },
    status: 'active',
    badge: 'FORMAZIONE',
    requirements: [
      'Nessuna esperienza richiesta',
      '2-3 ore al giorno di studio',
      'Commitment totale'
    ],
    courseModules: [
      {
        id: 'module_1',
        title: 'Introduzione al Trading Professionale',
        description: 'Le basi filosofiche e tecniche del trading professionale',
        order: 1,
        isTrialContent: true,
        duration: '4 ore',
        lessons: [
          {
            id: 'lesson_1_1',
            title: 'Benvenuto in Nexora Academy',
            description: 'Presentazione del corso e del metodo Nexora Lab',
            duration: '15:30',
            isTrialContent: true,
            order: 1
          },
          {
            id: 'lesson_1_2',
            title: 'La Mentalità del Trader Professionista',
            description: 'Psicologia del trading e gestione emotiva',
            duration: '45:00',
            isTrialContent: true,
            order: 2
          },
          {
            id: 'lesson_1_3',
            title: 'Setup della Postazione di Trading',
            description: 'Come configurare il tuo ambiente di lavoro',
            duration: '30:00',
            isTrialContent: true,
            order: 3
          }
        ]
      },
      {
        id: 'module_2',
        title: 'Analisi Tecnica Avanzata',
        description: 'Pattern, indicatori e strategie tecniche',
        order: 2,
        isTrialContent: true,
        duration: '6 ore',
        lessons: [
          {
            id: 'lesson_2_1',
            title: 'I Pattern Vincenti',
            description: 'Riconoscere i pattern ad alta probabilità',
            duration: '60:00',
            isTrialContent: true,
            order: 1
          },
          {
            id: 'lesson_2_2',
            title: 'Support & Resistance Warfare',
            description: 'Identificare livelli chiave come un professionista',
            duration: '45:00',
            isTrialContent: true,
            order: 2
          }
        ]
      },
      {
        id: 'module_3',
        title: 'Risk Management Militare',
        description: 'Gestione del rischio e money management professionale',
        order: 3,
        isTrialContent: false,
        duration: '5 ore',
        lessons: [
          {
            id: 'lesson_3_1',
            title: 'Le Regole del Risk Management',
            description: 'Come proteggere il capitale con metodo',
            duration: '40:00',
            isTrialContent: false,
            order: 1
          }
        ]
      }
    ],
    totalModules: 12,
    totalLessons: 150,
    totalDuration: '300+',
    trialDays: 7
  },
  {
    id: 'oracle_signals',
    name: 'ORACLE SIGNALS PRO',
    category: 'service',
    shortDescription: 'Segnali di trading premium dall\'Oracolo di Delfi',
    description: `Ricevi i segnali di trading più accurati direttamente sul tuo telefono.
    Il nostro team di analisti lavora 24/7 per identificare le migliori opportunità.`,
    price: {
      monthly: 97,
      yearly: 970
    },
    features: [
      '📱 15-20 segnali al giorno',
      '🎯 Accuracy dell\'85%+',
      '⚡ Segnali in tempo reale',
      '📊 Analisi tecnica dettagliata',
      '🔔 Alert Telegram/WhatsApp',
      '💹 Tutti i mercati principali',
      '📈 Track record verificato',
      '🆘 Supporto 24/7'
    ],
    performance: {
      winRate: '85%',
      avgProfit: '+750 pips',
      drawdown: 'N/A',
      trades: '450/mese'
    },
    trial: {
      available: true,
      days: 14,
      features: [
        '5 segnali al giorno',
        'Mercati Forex principali',
        'Supporto base'
      ]
    },
    status: 'active',
    badge: 'POPOLARE',
    requirements: [
      'Smartphone con Telegram/WhatsApp',
      'Broker a scelta',
      'Capitale minimo consigliato: €500'
    ]
  },
  {
    id: 'ares_indicator_pack',
    name: 'NEXORA INDICATOR PACK',
    category: 'indicator',
    shortDescription: 'Set completo di indicatori proprietari',
    description: `12 indicatori proprietari sviluppati e testati in anni di esperienza sui mercati.
    Compatibili con tutte le principali piattaforme di trading.`,
    price: {
      monthly: 47,
      yearly: 470,
      lifetime: 997
    },
    features: [
      '📊 12 indicatori proprietari',
      '🎨 Personalizzazione completa',
      '📈 Trend Identifier proprietario',
      '🎯 Entry/Exit point precisi',
      '⚡ Zero lag technology',
      '🔄 Auto-adattamento al mercato',
      '📱 Alert personalizzabili',
      '📚 Video tutorial inclusi'
    ],
    trial: {
      available: true,
      days: 30,
      features: [
        '3 indicatori base',
        'Funzionalità complete',
        'Tutorial base'
      ]
    },
    status: 'coming-soon',
    badge: 'PROSSIMAMENTE',
    platforms: ['TradingView', 'MetaTrader 4', 'MetaTrader 5', 'NinjaTrader'],
    requirements: [
      'Piattaforma di trading compatibile',
      'Conoscenza base del trading'
    ]
  }
];

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return products.filter(p => p.category === category);
}

export function getActiveProducts(): Product[] {
  return products.filter(p => p.status === 'active' || p.status === 'beta');
}
