import { db } from '../database/index.js';

// Complete product data with all fields
const completeProductsData = [
  {
    id: 'spartan_fury_bot',
    name: 'SPARTAN FURY BOT',
    pricingPlans: {
      monthly: { price: 297, originalPrice: 497, interval: 'mese' },
      yearly: { price: 2970, originalPrice: 4970, interval: 'anno', savings: '2 mesi gratis' },
      lifetime: { price: 9997, originalPrice: 14997, interval: 'lifetime', savings: 'Risparmio 33%' }
    },
    requirements: [
      'Capitale minimo: €1,000',
      'VPS consigliato (incluso nel piano yearly)',
      'Connessione internet stabile',
      'Broker supportati: IC Markets, Pepperstone, XM'
    ],
    platforms: ['MetaTrader 4', 'MetaTrader 5', 'TradingView', 'cTrader'],
  },
  {
    id: 'leonidas_scalper',
    name: 'LEONIDAS SCALPER',
    pricingPlans: {
      monthly: { price: 197, originalPrice: 297, interval: 'mese' },
      yearly: { price: 1970, originalPrice: 2970, interval: 'anno', savings: '2 mesi gratis' },
      lifetime: { price: 6997, originalPrice: 9997, interval: 'lifetime', savings: 'Risparmio 30%' }
    },
    requirements: [
      'Capitale minimo: €500',
      'Broker con spread bassi',
      'VPS obbligatorio (non incluso)',
      'Leva minima 1:100'
    ],
    platforms: ['MetaTrader 4', 'MetaTrader 5'],
  },
  {
    id: 'thermopylae_defender',
    name: 'THERMOPYLAE DEFENDER',
    pricingPlans: {
      monthly: { price: 247, originalPrice: 397, interval: 'mese' },
      yearly: { price: 2470, originalPrice: 3970, interval: 'anno', savings: '2 mesi gratis' },
      lifetime: { price: 7997, originalPrice: 11997, interval: 'lifetime', savings: 'Risparmio 33%' }
    },
    requirements: [
      'Capitale minimo: €2,000',
      'Portfolio diversificato',
      'Account con hedging permesso',
      'VPS consigliato'
    ],
    platforms: ['MetaTrader 5', 'cTrader'],
  },
  {
    id: 'spartan_academy',
    name: 'SPARTAN ACADEMY',
    pricingPlans: {
      oneTime: { price: 1997, originalPrice: 2997, interval: 'unico' },
      payment3: { price: 699, originalPrice: 999, interval: '3 rate', savings: 'Paga in 3 rate mensili' },
      vip: { price: 4997, originalPrice: 7997, interval: 'VIP', savings: 'Include mentoring privato 6 mesi' }
    },
    requirements: [
      'Nessun requisito di capitale iniziale',
      'Dedicare almeno 2 ore al giorno',
      'Computer o tablet',
      'Conoscenza base dell\'inglese (materiale anche in italiano)'
    ],
    platforms: ['Piattaforma e-learning proprietaria', 'App mobile iOS/Android'],
  },
  {
    id: 'ares_indicator_pack',
    name: 'ARES INDICATOR PACK',
    pricingPlans: {
      monthly: { price: 47, originalPrice: 97, interval: 'mese' },
      yearly: { price: 470, originalPrice: 970, interval: 'anno', savings: '2 mesi gratis' },
      lifetime: { price: 997, originalPrice: 1997, interval: 'lifetime', savings: 'Aggiornamenti a vita' }
    },
    requirements: [
      'Nessun capitale minimo richiesto',
      'Piattaforma MT4, MT5 o TradingView',
      'Computer Windows o Mac',
      'Conoscenza base analisi tecnica'
    ],
    platforms: ['MetaTrader 4', 'MetaTrader 5', 'TradingView'],
  }
];

export function restoreProductData() {
  console.log('Starting product data restoration...');
  
  const allProducts = db.getAllProducts();
  console.log(`Found ${allProducts.length} products in database`);
  
  let updated = 0;
  let errors = 0;
  
  allProducts.forEach(product => {
    try {
      // Find the complete data for this product
      const completeData = completeProductsData.find(p => p.id === product.id);
      
      if (completeData) {
        // Update the product with complete data
        const updatedProduct = db.updateProduct(product.id, {
          pricingPlans: completeData.pricingPlans,
          requirements: completeData.requirements,
          platforms: completeData.platforms,
          active: true // Also ensure it's active
        });
        
        if (updatedProduct) {
          console.log(`✅ Updated: ${product.name}`);
          console.log(`   - PricingPlans: ${updatedProduct.pricingPlans ? 'YES' : 'NO'}`);
          console.log(`   - Requirements: ${updatedProduct.requirements?.length || 0} items`);
          console.log(`   - Platforms: ${updatedProduct.platforms?.length || 0} items`);
          updated++;
        }
      } else {
        console.log(`⚠️ No complete data found for: ${product.name} (${product.id})`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${product.name}:`, error);
      errors++;
    }
  });
  
  console.log('\n=== RESTORATION COMPLETE ===');
  console.log(`✅ Successfully updated: ${updated} products`);
  console.log(`❌ Errors: ${errors}`);
  
  return { updated, errors };
}

// Run the restoration if this file is executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  restoreProductData();
}
