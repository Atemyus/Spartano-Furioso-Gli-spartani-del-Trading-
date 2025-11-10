import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Percorsi dei file di persistenza
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// Crea la directory data se non esiste
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Funzioni di utilità per leggere e scrivere JSON
const readJSON = (filePath, defaultValue = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
};

const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Esporta le funzioni per il database
export const persistence = {
  // Carica tutti i dati
  loadAll: () => {
    return {
      users: readJSON(USERS_FILE, []),
      products: readJSON(PRODUCTS_FILE, null), // null per indicare che deve essere inizializzato
      orders: readJSON(ORDERS_FILE, []),
      subscriptions: readJSON(SUBSCRIPTIONS_FILE, []),
      analytics: readJSON(ANALYTICS_FILE, [])
    };
  },

  // Salva tutti i dati
  saveAll: (data) => {
    writeJSON(USERS_FILE, data.users || []);
    writeJSON(PRODUCTS_FILE, data.products || []);
    writeJSON(ORDERS_FILE, data.orders || []);
    writeJSON(SUBSCRIPTIONS_FILE, data.subscriptions || []);
    writeJSON(ANALYTICS_FILE, data.analytics || []);
  },

  // Salva singole entità
  saveUsers: (users) => writeJSON(USERS_FILE, users),
  saveProducts: (products) => writeJSON(PRODUCTS_FILE, products),
  saveOrders: (orders) => writeJSON(ORDERS_FILE, orders),
  saveSubscriptions: (subscriptions) => writeJSON(SUBSCRIPTIONS_FILE, subscriptions),
  saveAnalytics: (analytics) => writeJSON(ANALYTICS_FILE, analytics),

  // Carica singole entità
  loadUsers: () => readJSON(USERS_FILE, []),
  loadProducts: () => readJSON(PRODUCTS_FILE, null),
  loadOrders: () => readJSON(ORDERS_FILE, []),
  loadSubscriptions: () => readJSON(SUBSCRIPTIONS_FILE, []),
  loadAnalytics: () => readJSON(ANALYTICS_FILE, [])
};

export default persistence;
