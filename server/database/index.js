// Database with JSON file persistence
import persistence from './persistence.js';

class Database {
  constructor() {
    // Carica i dati persistenti
    const savedData = persistence.loadAll();
    
    this.users = savedData.users || [];
    this.orders = savedData.orders || [];
    this.subscriptions = savedData.subscriptions || [];
    this.analytics = savedData.analytics || [];
    
    // Se non ci sono prodotti salvati, inizializza con i prodotti di default
    if (!savedData.products || savedData.products.length === 0) {
      this.initializeProducts();
      persistence.saveProducts(this.products);
    } else {
      this.products = savedData.products;
    }
    
    console.log('📊 Database loaded:', {
      users: this.users.length,
      products: this.products.length,
      orders: this.orders.length,
      subscriptions: this.subscriptions.length,
      analytics: this.analytics.length
    });
  }

  initializeProducts() {
    this.products = [
      {
        id: 'spartan_fury_bot',
        name: 'SPARTAN FURY BOT',
        description: 'Il bot di trading più aggressivo e redditizio mai creato',
        price: 297,
        originalPrice: 497,
        currency: 'eur',
        // Piani di abbonamento
        pricingPlans: {
          monthly: { price: 297, originalPrice: 497, interval: 'mese' },
          yearly: { price: 2970, originalPrice: 4970, interval: 'anno', savings: '2 mesi gratis' },
          lifetime: { price: 9997, originalPrice: 14997, interval: 'lifetime', savings: 'Risparmio 33%' }
        },
        features: [
          '🟢 Trading automatico 24/7',
          '⚔️ Algoritmo proprietario "Phalanx"',
          '🛡️ Gestione del rischio militare',
          '📊 Dashboard analytics in tempo reale',
          '🎯 Target profit personalizzabili',
          '⚡ Esecuzione ultra-veloce',
          '📱 App mobile dedicata'
        ],
        // Requisiti
        requirements: [
          'Capitale minimo: €1,000',
          'VPS consigliato (incluso nel piano yearly)',
          'Connessione internet stabile',
          'Broker supportati: IC Markets, Pepperstone, XM'
        ],
        // Piattaforme supportate
        platforms: ['MetaTrader 4'],
        metrics: {
          winRate: 87,
          avgProfit: 22.3,
          totalTrades: 1847,
          profitableMonths: 11
        },
        stripeProductId: null,
        stripePriceId: null,
        type: 'subscription',
        interval: 'month',
        trialDays: 60,
        active: true,
        popular: false,
        badge: 'BEST SELLER',
        badgeColor: 'red',
        category: 'Bot Trading',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'leonidas_scalper',
        name: 'LEONIDAS SCALPER',
        description: 'Bot di scalping veloce come le lance spartane',
        price: 197,
        originalPrice: 297,
        currency: 'eur',
        pricingPlans: {
          monthly: { price: 197, originalPrice: 297, interval: 'mese' },
          yearly: { price: 1970, originalPrice: 2970, interval: 'anno', savings: '2 mesi gratis' },
          lifetime: { price: 6997, originalPrice: 9997, interval: 'lifetime', savings: 'Risparmio 30%' }
        },
        features: [
          '⚡ Scalping ultra-veloce',
          '🎯 300+ trades al giorno',
          '📊 Adattamento automatico alla volatilità',
          '🔄 Multi-timeframe analysis',
          '💹 Spread filter intelligente',
          '🌐 Multi-exchange support',
          '🔔 Alert sistema avanzato',
          '📈 Backtesting illimitato',
          '🛡️ Protection system integrato'
        ],
        requirements: [
          'Capitale minimo: €500',
          'Broker con spread bassi',
          'VPS obbligatorio (non incluso)',
          'Leva minima 1:100'
        ],
        platforms: ['MetaTrader 4', 'MetaTrader 5'],
        metrics: {
          winRate: 72,
          avgProfit: 18.7,
          dailyTrades: 300,
          avgPips: 12
        },
        stripeProductId: null,
        stripePriceId: null,
        type: 'subscription',
        interval: 'month',
        trialDays: 60,
        active: true,
        popular: false,
        badge: 'HIGH SPEED',
        badgeColor: 'blue',
        category: 'Bot Trading',
        image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=500&h=300&fit=crop',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'thermopylae_defender',
        name: 'THERMOPYLAE DEFENDER',
        description: 'Sistema di hedging e protezione del capitale',
        price: 247,
        originalPrice: 397,
        currency: 'eur',
        pricingPlans: {
          monthly: { price: 247, originalPrice: 397, interval: 'mese' },
          yearly: { price: 2470, originalPrice: 3970, interval: 'anno', savings: '2 mesi gratis' },
          lifetime: { price: 7997, originalPrice: 11997, interval: 'lifetime', savings: 'Risparmio 33%' }
        },
        features: [
          '🛡️ Hedging automatico intelligente',
          '🔒 Protezione del capitale al 95%',
          '⚖️ Bilanciamento dinamico del portfolio',
          '📉 Drawdown control system',
          '🎯 Risk management militare',
          '🔄 Recovery mode automatico',
          '📊 Correlation analysis',
          '💰 Profit lock system'
        ],
        requirements: [
          'Capitale minimo: €2,000',
          'Portfolio diversificato',
          'Account con hedging permesso',
          'VPS consigliato'
        ],
        platforms: ['MetaTrader 5', 'cTrader'],
        metrics: {
          winRate: 91,
          avgProfit: 12.5,
          maxDrawdown: 8,
          protectionRate: 95
        },
        stripeProductId: null,
        stripePriceId: null,
        type: 'subscription',
        interval: 'month',
        trialDays: 60,
        active: true,
        popular: false,
        badge: 'NUOVO',
        badgeColor: 'green',
        category: 'Bot Trading',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&h=300&fit=crop',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'spartan_academy',
        name: 'SPARTAN ACADEMY',
        description: 'Formazione completa per diventare un trader spartano',
        price: 1997,
        originalPrice: 2997,
        currency: 'eur',
        // Corso è one-time ma con opzioni di pagamento
        pricingPlans: {
          oneTime: { price: 1997, originalPrice: 2997, interval: 'unico' },
          payment3: { price: 699, originalPrice: 999, interval: '3 rate', savings: 'Paga in 3 rate mensili' },
          vip: { price: 4997, originalPrice: 7997, interval: 'VIP', savings: 'Include mentoring privato 6 mesi' }
        },
        features: [
          '🎓 12 settimane di formazione intensiva',
          '📹 300+ ore di contenuti video',
          '👨‍🏫 Mentoring settimanale 1-on-1',
          '📚 Materiale didattico esclusivo',
          '🏆 Certificazione Spartan Trader',
          '💬 Community privata a vita',
          '🔄 Aggiornamenti gratuiti per sempre',
          '💼 Trading plan personalizzato'
        ],
        requirements: [
          'Nessun requisito di capitale iniziale',
          'Dedicare almeno 2 ore al giorno',
          'Computer o tablet',
          'Conoscenza base dell\'inglese (materiale anche in italiano)'
        ],
        platforms: ['Piattaforma e-learning proprietaria', 'App mobile iOS/Android'],
        metrics: {
          students: 2847,
          successRate: 89,
          avgRating: 4.9,
          completionRate: 94
        },
        // Struttura del corso con moduli e lezioni
        courseModules: [
          {
            id: 'module_1',
            title: 'Introduzione al Trading Spartano',
            description: 'Le basi filosofiche e tecniche del trading professionale',
            order: 1,
            isTrialContent: true, // Disponibile nel trial di 7 giorni
            duration: '4 ore',
            lessons: [
              {
                id: 'lesson_1_1',
                title: 'Benvenuto nell\'Accademia Spartana',
                description: 'Presentazione del corso e del metodo Spartano',
                duration: '15:30',
                videoId: 'vimeo_123456789', // ID video Vimeo
                isTrialContent: true,
                order: 1
              },
              {
                id: 'lesson_1_2',
                title: 'La Mentalità del Guerriero Trader',
                description: 'Psicologia del trading e gestione emotiva',
                duration: '45:00',
                videoId: 'vimeo_123456790',
                isTrialContent: true,
                order: 2
              },
              {
                id: 'lesson_1_3',
                title: 'Setup della Postazione di Trading',
                description: 'Come configurare il tuo ambiente di lavoro',
                duration: '30:00',
                videoId: 'vimeo_123456791',
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
            isTrialContent: true, // Secondo modulo gratuito nel trial
            duration: '6 ore',
            lessons: [
              {
                id: 'lesson_2_1',
                title: 'I Pattern Spartani',
                description: 'Riconoscere i pattern ad alta probabilità',
                duration: '60:00',
                videoId: 'vimeo_123456792',
                isTrialContent: true,
                order: 1
              },
              {
                id: 'lesson_2_2',
                title: 'Support & Resistance Warfare',
                description: 'Identificare livelli chiave come un professionista',
                duration: '45:00',
                videoId: 'vimeo_123456793',
                isTrialContent: true,
                order: 2
              }
            ]
          },
          {
            id: 'module_3',
            title: 'Risk Management Militare',
            description: 'Proteggere il capitale come uno scudo spartano',
            order: 3,
            isTrialContent: false, // Bloccato nel trial
            duration: '5 ore',
            lessons: [
              {
                id: 'lesson_3_1',
                title: 'Position Sizing Strategico',
                description: 'Calcolare la dimensione ottimale delle posizioni',
                duration: '40:00',
                videoId: 'vimeo_123456794',
                isTrialContent: false,
                order: 1
              },
              {
                id: 'lesson_3_2',
                title: 'Stop Loss e Take Profit Avanzati',
                description: 'Tecniche professionali di uscita',
                duration: '50:00',
                videoId: 'vimeo_123456795',
                isTrialContent: false,
                order: 2
              }
            ]
          },
          {
            id: 'module_4',
            title: 'Strategie di Trading Spartane',
            description: 'Le strategie proprietarie dell\'accademia',
            order: 4,
            isTrialContent: false,
            duration: '8 ore',
            lessons: [
              {
                id: 'lesson_4_1',
                title: 'La Strategia Falange',
                description: 'Trading sistematico con alta win rate',
                duration: '90:00',
                videoId: 'vimeo_123456796',
                isTrialContent: false,
                order: 1
              },
              {
                id: 'lesson_4_2',
                title: 'Scalping Spartano',
                description: 'Tecniche di scalping veloce',
                duration: '75:00',
                videoId: 'vimeo_123456797',
                isTrialContent: false,
                order: 2
              }
            ]
          },
          {
            id: 'module_5',
            title: 'Trading Live e Pratica',
            description: 'Sessioni pratiche e trading dal vivo',
            order: 5,
            isTrialContent: false,
            duration: '10 ore',
            lessons: [
              {
                id: 'lesson_5_1',
                title: 'Sessione Live Trading 1',
                description: 'Trading in tempo reale con analisi',
                duration: '120:00',
                videoId: 'vimeo_123456798',
                isTrialContent: false,
                order: 1
              }
            ]
          },
          {
            id: 'module_6',
            title: 'Trading Plan e Laurea Spartana',
            description: 'Costruisci il tuo piano di trading e ottieni la certificazione',
            order: 6,
            isTrialContent: false,
            duration: '4 ore',
            lessons: [
              {
                id: 'lesson_6_1',
                title: 'Costruire il Trading Plan Perfetto',
                description: 'Template e guida completa',
                duration: '60:00',
                videoId: 'vimeo_123456799',
                isTrialContent: false,
                order: 1
              },
              {
                id: 'lesson_6_2',
                title: 'Esame Finale e Certificazione',
                description: 'Test finale per la certificazione Spartan Trader',
                duration: '30:00',
                videoId: 'vimeo_123456800',
                isTrialContent: false,
                order: 2
              }
            ]
          }
        ],
        totalModules: 6,
        totalLessons: 12,
        totalDuration: '37 ore',
        trialModules: 2, // Primi 2 moduli disponibili nel trial
        stripeProductId: null,
        stripePriceId: null,
        type: 'one-time',
        interval: null,
        trialDays: 7,
        active: true,
        popular: false,
        badge: 'FORMAZIONE',
        badgeColor: 'purple',
        category: 'Formazione',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ares_indicator_pack',
        name: 'ARES INDICATOR PACK',
        description: 'Set completo di indicatori proprietari spartani',
        price: 47,
        originalPrice: 97,
        currency: 'eur',
        pricingPlans: {
          monthly: { price: 47, originalPrice: 97, interval: 'mese' },
          yearly: { price: 470, originalPrice: 970, interval: 'anno', savings: '2 mesi gratis' },
          lifetime: { price: 997, originalPrice: 1997, interval: 'lifetime', savings: 'Aggiornamenti a vita' }
        },
        features: [
          '📊 12 indicatori proprietari',
          '⚙️ Personalizzazione completa',
          '📈 Trend Spartan Identifier',
          '🔄 Auto-optimization system',
          '📱 Multi-piattaforma (MT4/MT5/TV)',
          '🎯 Precision entry signals',
          '📚 Guide e tutorial completi',
          '🆘 Supporto tecnico dedicato'
        ],
        requirements: [
          'Nessun capitale minimo richiesto',
          'Piattaforma MT4, MT5 o TradingView',
          'Computer Windows o Mac',
          'Conoscenza base analisi tecnica'
        ],
        platforms: ['MetaTrader 4', 'MetaTrader 5', 'TradingView'],
        metrics: {
          indicators: 12,
          accuracy: 82,
          platforms: 3,
          updates: 'lifetime'
        },
        stripeProductId: null,
        stripePriceId: null,
        type: 'subscription',
        interval: 'month',
        trialDays: 30,
        active: true,
        popular: false,
        badge: 'PROSSIMAMENTE',
        badgeColor: 'yellow',
        category: 'Indicatori',
        image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=500&h=300&fit=crop',
        comingSoon: true,
        launchDate: '2024-02-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Statistics method
  getStatistics() {
    // Read orders file if exists
    let ordersData = [];
    try {
      const fs = require('fs');
      const path = require('path');
      const ordersPath = path.join(__dirname, '..', 'data', 'orders.json');
      if (fs.existsSync(ordersPath)) {
        const data = fs.readFileSync(ordersPath, 'utf-8');
        ordersData = JSON.parse(data);
      }
    } catch (error) {
      console.log('No orders file found');
    }
    
    // Filter completed orders
    const completedOrders = ordersData.filter(o => o.type === 'checkout' && o.status === 'completed');
    
    // Calculate total revenue
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    // Count active subscriptions
    let activeSubscriptions = 0;
    this.users.forEach(user => {
      if (user.subscription && user.subscription.status === 'active') {
        activeSubscriptions++;
      }
    });
    
    // Get recent orders
    const recentOrders = completedOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(o => ({
        id: o.id,
        amount: o.amount * 100, // Convert to cents
        status: o.status,
        createdAt: o.createdAt,
        customerEmail: o.customerEmail
      }));
    
    // Get recent users
    const recentUsers = this.users
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt
      }));
    
    return {
      totalUsers: this.users.length,
      totalOrders: completedOrders.length,
      totalRevenue: totalRevenue * 100, // Convert to cents
      activeSubscriptions,
      recentOrders,
      recentUsers,
      totalTrials: this.users.reduce((sum, user) => sum + (user.trials?.length || 0), 0),
      pendingOrders: ordersData.filter(o => o.status === 'pending').length,
      failedPayments: ordersData.filter(o => o.type === 'payment_failed').length
    };
  }

  // Users
  createUser(userData) {
    const user = {
      id: `user_${Date.now()}`,
      name: userData.name || '',
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user',
      status: userData.status || 'pending', // Default to pending until email verified
      emailVerified: userData.emailVerified || false,
      verificationToken: userData.verificationToken || null,
      verificationTokenExpiry: userData.verificationTokenExpiry || null,
      subscription: userData.subscription || null,
      trials: userData.trials || [],
      subscriptions: userData.subscriptions || [],
      lastLogin: userData.lastLogin || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(user);
    persistence.saveUsers(this.users); // Salva su file
    return user;
  }

  getUserByVerificationToken(token) {
    return this.users.find(user => user.verificationToken === token);
  }

  getUserById(id) {
    return this.users.find(user => user.id === id);
  }

  getUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  updateUser(id, updates) {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      persistence.saveUsers(this.users); // Salva su file
      return this.users[index];
    }
    return null;
  }

  deleteUser(id) {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      const deleted = this.users.splice(index, 1);
      persistence.saveUsers(this.users); // Salva su file
      return deleted[0];
    }
    return null;
  }

  getAllUsers() {
    return this.users;
  }

  // Products
  createProduct(productData) {
    const product = {
      id: `prod_${Date.now()}`,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.products.push(product);
    persistence.saveProducts(this.products); // Salva su file
    return product;
  }

  getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  updateProduct(id, updates) {
    const index = this.products.findIndex(product => product.id === id);
    if (index !== -1) {
      this.products[index] = {
        ...this.products[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      persistence.saveProducts(this.products); // Salva su file
      return this.products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const index = this.products.findIndex(product => product.id === id);
    if (index !== -1) {
      const deleted = this.products.splice(index, 1);
      persistence.saveProducts(this.products); // Salva su file
      return deleted[0];
    }
    return null;
  }

  getAllProducts(active = null) {
    if (active !== null) {
      return this.products.filter(product => product.active === active);
    }
    return this.products;
  }

  // Orders
  createOrder(orderData) {
    const order = {
      id: `order_${Date.now()}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.orders.push(order);
    persistence.saveOrders(this.orders); // Salva su file
    return order;
  }

  getOrderById(id) {
    return this.orders.find(order => order.id === id);
  }

  getOrdersByUserId(userId) {
    return this.orders.filter(order => order.userId === userId);
  }

  updateOrder(id, updates) {
    const index = this.orders.findIndex(order => order.id === id);
    if (index !== -1) {
      this.orders[index] = {
        ...this.orders[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      persistence.saveOrders(this.orders); // Salva su file
      return this.orders[index];
    }
    return null;
  }

  getAllOrders() {
    return this.orders;
  }

  deleteOrder(id) {
    const index = this.orders.findIndex(order => order.id === id);
    if (index !== -1) {
      const deleted = this.orders.splice(index, 1);
      persistence.saveOrders(this.orders); // Salva su file
      return deleted[0];
    }
    return null;
  }

  // Subscriptions
  createSubscription(subscriptionData) {
    const subscription = {
      id: `sub_${Date.now()}`,
      ...subscriptionData,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.subscriptions.push(subscription);
    persistence.saveSubscriptions(this.subscriptions); // Salva su file
    return subscription;
  }

  getSubscriptionById(id) {
    return this.subscriptions.find(sub => sub.id === id);
  }

  getSubscriptionsByUserId(userId) {
    return this.subscriptions.filter(sub => sub.userId === userId);
  }

  updateSubscription(id, updates) {
    const index = this.subscriptions.findIndex(sub => sub.id === id);
    if (index !== -1) {
      this.subscriptions[index] = {
        ...this.subscriptions[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      persistence.saveSubscriptions(this.subscriptions); // Salva su file
      return this.subscriptions[index];
    }
    return null;
  }

  getAllSubscriptions() {
    return this.subscriptions;
  }

  deleteSubscription(id) {
    const index = this.subscriptions.findIndex(sub => sub.id === id);
    if (index !== -1) {
      const deleted = this.subscriptions.splice(index, 1);
      persistence.saveSubscriptions(this.subscriptions); // Salva su file
      return deleted[0];
    }
    return null;
  }

  // Statistics
  getStatistics() {
    const totalUsers = this.users.length;
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.amount, 0);
    const activeSubscriptions = this.subscriptions
      .filter(sub => sub.status === 'active').length;

    return {
      totalUsers,
      totalOrders,
      totalRevenue,
      activeSubscriptions,
      recentOrders: this.orders.slice(-10).reverse(),
      recentUsers: this.users.slice(-10).reverse()
    };
  }

  // Analytics - Visitor Tracking
  trackPageView(viewData) {
    const pageView = {
      id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      page: viewData.page || '/',
      referrer: viewData.referrer || null,
      userAgent: viewData.userAgent || null,
      sessionId: viewData.sessionId || null,
      ip: viewData.ip || null,
      country: viewData.country || null,
      device: viewData.device || 'unknown',
      browser: viewData.browser || 'unknown'
    };
    
    this.analytics.push(pageView);
    persistence.saveAnalytics(this.analytics);
    return pageView;
  }

  getAnalytics(filters = {}) {
    let result = [...this.analytics];

    // Filter by date range
    if (filters.startDate) {
      result = result.filter(view => new Date(view.timestamp) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      result = result.filter(view => new Date(view.timestamp) <= new Date(filters.endDate));
    }

    // Filter by page
    if (filters.page) {
      result = result.filter(view => view.page === filters.page);
    }

    return result;
  }

  getAnalyticsStats(days = 7) {
    const now = new Date();
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const recentViews = this.analytics.filter(view => 
      new Date(view.timestamp) >= startDate
    );

    // Visitatori unici (basati su sessionId)
    const uniqueSessions = new Set(recentViews.map(v => v.sessionId).filter(Boolean));
    
    // Pagine più visitate
    const pageViews = {};
    recentViews.forEach(view => {
      pageViews[view.page] = (pageViews[view.page] || 0) + 1;
    });

    // Visite per giorno
    const viewsByDay = {};
    recentViews.forEach(view => {
      const day = view.timestamp.split('T')[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

    // Device breakdown
    const deviceBreakdown = {};
    recentViews.forEach(view => {
      deviceBreakdown[view.device] = (deviceBreakdown[view.device] || 0) + 1;
    });

    // Browser breakdown
    const browserBreakdown = {};
    recentViews.forEach(view => {
      browserBreakdown[view.browser] = (browserBreakdown[view.browser] || 0) + 1;
    });

    // Calcola conversion rate (visite -> ordini)
    const ordersInPeriod = this.orders.filter(order => 
      new Date(order.createdAt) >= startDate
    ).length;
    const conversionRate = uniqueSessions.size > 0 
      ? ((ordersInPeriod / uniqueSessions.size) * 100).toFixed(2)
      : '0.00';

    return {
      totalPageViews: recentViews.length,
      uniqueVisitors: uniqueSessions.size,
      topPages: Object.entries(pageViews)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([page, views]) => ({ page, views })),
      viewsByDay,
      deviceBreakdown,
      browserBreakdown,
      conversionRate,
      ordersInPeriod,
      averagePageViewsPerVisitor: uniqueSessions.size > 0 
        ? (recentViews.length / uniqueSessions.size).toFixed(2)
        : '0.00'
    };
  }

  clearOldAnalytics(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const before = this.analytics.length;
    this.analytics = this.analytics.filter(view => 
      new Date(view.timestamp) >= cutoffDate
    );
    const after = this.analytics.length;
    
    if (before !== after) {
      persistence.saveAnalytics(this.analytics);
      console.log(`🗑️ Cleared ${before - after} old analytics entries`);
    }
    
    return { before, after, deleted: before - after };
  }
}

// Create singleton instance
export const db = new Database();

export default db;
