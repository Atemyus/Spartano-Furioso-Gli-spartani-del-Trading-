import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  DollarSign,
  Tag,
  Image,
  ToggleLeft,
  ToggleRight,
  Eye,
  Copy,
  X,
  Monitor,
  CheckCircle,
  Save,
  RefreshCw
} from 'lucide-react';
import Modal from './Modal';

// ============= INTERFACES =============
interface PricingPlan {
  price: number;
  originalPrice?: number;
  interval: string;
  savings?: string;
  stripePriceId?: string;
}

interface FormPricingPlan {
  price: number;
  originalPrice: number;
  interval: string;
  savings: string;
  enabled: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  type: 'one-time' | 'subscription';
  interval?: 'day' | 'week' | 'month' | 'year';
  pricingPlans?: {
    monthly?: PricingPlan;
    yearly?: PricingPlan;
    lifetime?: PricingPlan;
    oneTime?: PricingPlan;
  };
  features: string[];
  metrics?: {
    winRate?: number;
    avgProfit?: number;
    avgPips?: number;
    dailyTrades?: number;
    totalTrades?: number;
    profitableMonths?: number;
    maxDrawdown?: number;
    protectionRate?: number;
    students?: number;
    successRate?: number;
    avgRating?: number;
    completionRate?: number;
    monthlySignals?: number;
    indicators?: number;
    accuracy?: number;
    platforms?: number;
    updates?: string;
  };
  trialDays?: number;
  stripeProductId?: string;
  stripePriceId?: string;
  active: boolean; // Campo principale per attivo/inattivo
  status: 'active' | 'coming-soon' | 'beta' | 'soldout';
  image?: string;
  category?: string;
  stock?: number;
  popular?: boolean;
  badge?: string | null;
  badgeColor?: string;
  comingSoon?: boolean;
  launchDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  currency: string;
  type: 'one-time' | 'subscription';
  interval: 'day' | 'week' | 'month' | 'year';
  category: string;
  stock: number;
  active: boolean; // Campo principale per attivo/inattivo
  status: 'active' | 'coming-soon' | 'beta' | 'soldout';
  image: string;
  popular: boolean;
  badge: string;
  badgeColor: string;
  trialDays: number;
  comingSoon: boolean;
  launchDate: string;
  metrics: {
    winRate: number;
    avgProfit: number;
  };
  pricingPlans: {
    monthly: FormPricingPlan;
    yearly: FormPricingPlan;
    lifetime: FormPricingPlan;
    oneTime: FormPricingPlan;
  };
}

// ============= COMPONENT =============
const ProductsManagement: React.FC = () => {
  // ============= STATE =============
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [features, setFeatures] = useState<string[]>(['']);
  const [platforms, setPlatforms] = useState<string[]>([]);
  
  const [availablePlatforms] = useState([
    'MetaTrader 4',
    'MetaTrader 5',
    'cTrader',
    'TradingView',
    'NinjaTrader',
    'Sierra Chart',
    'Telegram',
    'Discord',
    'WhatsApp',
    'Web',
    'Mobile App'
  ]);

  const initialFormData: FormData = {
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    currency: 'eur',
    type: 'subscription',
    interval: 'month',
    category: '',
    stock: 0,
    active: true, // Prodotto attivo di default
    status: 'active' as 'active' | 'coming-soon' | 'beta' | 'soldout',
    image: '',
    popular: false,
    badge: '',
    badgeColor: 'blue',
    trialDays: 0,
    comingSoon: false,
    launchDate: '',
    metrics: {
      winRate: 0,
      avgProfit: 0
    },
    pricingPlans: {
      monthly: { price: 0, originalPrice: 0, interval: 'mese', savings: '', enabled: false },
      yearly: { price: 0, originalPrice: 0, interval: 'anno', savings: '2 mesi gratis', enabled: false },
      lifetime: { price: 0, originalPrice: 0, interval: 'lifetime', savings: 'Paga una volta, accesso per sempre', enabled: false },
      oneTime: { price: 0, originalPrice: 0, interval: 'unico', savings: '', enabled: false }
    }
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // ============= EFFECTS =============
  useEffect(() => {
    fetchProducts();
  }, []);

  // ============= API FUNCTIONS =============
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('https://api.spartanofurioso.com/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Products API response:', data);
        if (data.success && data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.error('Invalid products data format:', data);
          setProducts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
  };

  const loadProductPlatforms = async (productId: string) => {
    try {
      const response = await fetch(`https://api.spartanofurioso.com/api/products/${productId}/config`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.config.platforms) {
          setPlatforms(data.config.platforms);
        }
      }
    } catch (error) {
      console.error('Error loading platforms:', error);
    }
  };

  const handleUpdatePlatforms = async () => {
    if (!selectedProduct) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://api.spartanofurioso.com/api/products/${selectedProduct.id}/platforms`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ platforms })
      });

      if (response.ok) {
        alert('Piattaforme aggiornate con successo!');
        setIsPlatformModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating platforms:', error);
      alert('Errore durante l\'aggiornamento delle piattaforme');
    }
  };

  const handleEditPlatforms = (product: Product) => {
    setSelectedProduct(product);
    loadProductPlatforms(product.id);
    setIsPlatformModalOpen(true);
  };

  const prepareProductData = (data: FormData) => {
    // Filtra solo i piani abilitati
    const enabledPlans: any = {};
    if (data.pricingPlans.monthly.enabled) enabledPlans.monthly = data.pricingPlans.monthly;
    if (data.pricingPlans.yearly.enabled) enabledPlans.yearly = data.pricingPlans.yearly;
    if (data.pricingPlans.lifetime.enabled) enabledPlans.lifetime = data.pricingPlans.lifetime;
    if (data.pricingPlans.oneTime.enabled) enabledPlans.oneTime = data.pricingPlans.oneTime;
    
    // Determina il prezzo principale e il prezzo originale dai piani attivi
    let mainPrice = data.price;
    let mainOriginalPrice = data.originalPrice;
    
    if (Object.keys(enabledPlans).length > 0) {
      // Priorità: mensile > oneTime > yearly > lifetime
      if (enabledPlans.monthly?.price > 0) {
        mainPrice = enabledPlans.monthly.price;
        mainOriginalPrice = enabledPlans.monthly.originalPrice || 0;
      } else if (enabledPlans.oneTime?.price > 0) {
        mainPrice = enabledPlans.oneTime.price;
        mainOriginalPrice = enabledPlans.oneTime.originalPrice || 0;
      } else if (enabledPlans.yearly?.price > 0) {
        mainPrice = enabledPlans.yearly.price;
        mainOriginalPrice = enabledPlans.yearly.originalPrice || 0;
      } else if (enabledPlans.lifetime?.price > 0) {
        mainPrice = enabledPlans.lifetime.price;
        mainOriginalPrice = enabledPlans.lifetime.originalPrice || 0;
      }
    }
    
    return {
      ...data,
      price: mainPrice,
      originalPrice: mainOriginalPrice,
      features: features.filter(f => f.trim() !== ''),
      pricingPlans: Object.keys(enabledPlans).length > 0 ? enabledPlans : undefined
    };
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const productData = prepareProductData(formData);

      const response = await fetch('https://api.spartanofurioso.com/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        await fetchProducts();
        setIsCreateModalOpen(false);
        resetForm();
        alert('✅ Prodotto creato con successo!');
      } else {
        const errorData = await response.json();
        alert(`❌ Errore: ${errorData.error || 'Impossibile creare il prodotto'}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('❌ Errore di connessione. Riprova più tardi.');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const token = localStorage.getItem('adminToken');
      const productData = prepareProductData(formData);
      
      console.log('Dati da salvare (update):', productData);

      const response = await fetch(`https://api.spartanofurioso.com/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        await fetchProducts();
        setIsEditModalOpen(false);
        resetForm();
        alert('✅ Prodotto aggiornato con successo!');
      } else {
        const errorData = await response.json();
        alert(`❌ Errore: ${errorData.error || 'Impossibile aggiornare il prodotto'}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('❌ Errore di connessione. Riprova più tardi.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://api.spartanofurioso.com/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchProducts();
        alert('✅ Prodotto eliminato con successo!');
      } else {
        const errorData = await response.json();
        alert(`❌ Errore: ${errorData.error || 'Impossibile eliminare il prodotto'}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Errore di connessione. Riprova più tardi.');
    }
  };

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const newActive = !currentActive;

      const response = await fetch(`https://api.spartanofurioso.com/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: newActive })
      });

      if (response.ok) {
        await fetchProducts();
        // Mostra notifica di successo
        const action = newActive ? 'attivato' : 'disattivato';
        alert(`✅ Prodotto ${action} con successo!`);
        console.log(`Prodotto ${productId} aggiornato: active ${currentActive} -> ${newActive}`);
      } else {
        const errorData = await response.json();
        alert(`❌ Errore: ${errorData.error || 'Impossibile aggiornare il prodotto'}`);
        console.error('Errore nell\'aggiornamento del prodotto:', errorData);
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('❌ Errore di connessione. Riprova più tardi.');
    }
  };

  // ============= UTILITY FUNCTIONS =============
  const resetForm = () => {
    setFormData(initialFormData);
    setFeatures(['']);
    setSelectedProduct(null);
  };

  const convertProductToPricingPlans = (product: Product): {
    monthly: FormPricingPlan;
    yearly: FormPricingPlan;
    lifetime: FormPricingPlan;
    oneTime: FormPricingPlan;
  } => {
    const pricingPlans = {
      monthly: { price: 0, originalPrice: 0, interval: 'mese', savings: '', enabled: false },
      yearly: { price: 0, originalPrice: 0, interval: 'anno', savings: '2 mesi gratis', enabled: false },
      lifetime: { price: 0, originalPrice: 0, interval: 'lifetime', savings: 'Paga una volta, accesso per sempre', enabled: false },
      oneTime: { price: 0, originalPrice: 0, interval: 'unico', savings: '', enabled: false }
    };
    
    if (product.pricingPlans) {
      if (product.pricingPlans.monthly) {
        pricingPlans.monthly = {
          price: product.pricingPlans.monthly.price || 0,
          originalPrice: product.pricingPlans.monthly.originalPrice ?? 0,
          interval: product.pricingPlans.monthly.interval || 'mese',
          savings: product.pricingPlans.monthly.savings || '',
          enabled: true
        };
      }
      
      if (product.pricingPlans.yearly) {
        pricingPlans.yearly = {
          price: product.pricingPlans.yearly.price || 0,
          originalPrice: product.pricingPlans.yearly.originalPrice ?? 0,
          interval: product.pricingPlans.yearly.interval || 'anno',
          savings: product.pricingPlans.yearly.savings || '2 mesi gratis',
          enabled: true
        };
      }
      
      if (product.pricingPlans.lifetime) {
        pricingPlans.lifetime = {
          price: product.pricingPlans.lifetime.price || 0,
          originalPrice: product.pricingPlans.lifetime.originalPrice ?? 0,
          interval: product.pricingPlans.lifetime.interval || 'lifetime',
          savings: product.pricingPlans.lifetime.savings || 'Paga una volta, accesso per sempre',
          enabled: true
        };
      }
      
      if (product.pricingPlans.oneTime) {
        pricingPlans.oneTime = {
          price: product.pricingPlans.oneTime.price || 0,
          originalPrice: product.pricingPlans.oneTime.originalPrice ?? 0,
          interval: product.pricingPlans.oneTime.interval || 'unico',
          savings: product.pricingPlans.oneTime.savings || '',
          enabled: true
        };
      }
    }
    
    return pricingPlans;
  };

  const openEditModal = (product: Product) => {
    console.log('Prodotto da modificare:', product);
    console.log('Piani esistenti:', product.pricingPlans);
    
    setSelectedProduct(product);
    
    const pricingPlans = convertProductToPricingPlans(product);
    
    const formDataToSet: FormData = {
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      currency: product.currency,
      type: product.type,
      interval: product.interval || 'month',
      category: product.category || '',
      stock: product.stock || 0,
      active: product.active,
      status: product.status,
      image: product.image || '',
      popular: product.popular || false,
      badge: product.badge || '',
      badgeColor: product.badgeColor || 'blue',
      trialDays: product.trialDays || 0,
      comingSoon: product.comingSoon || false,
      launchDate: product.launchDate || '',
      metrics: {
        winRate: product.metrics?.winRate || 0,
        avgProfit: product.metrics?.avgProfit || 0
      },
      pricingPlans: pricingPlans
    };
    
    console.log('FormData che verrà impostato:', formDataToSet);
    console.log('Piani processati:', pricingPlans);
    
    setFormData(formDataToSet);
    setFeatures(product.features.length > 0 ? product.features : ['']);
    setIsEditModalOpen(true);
  };

  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const duplicateProduct = (product: Product) => {
    const pricingPlans = convertProductToPricingPlans(product);

    setFormData({
      name: `${product.name} (Copia)`,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      currency: product.currency,
      type: product.type,
      interval: product.interval || 'month',
      category: product.category || '',
      stock: product.stock || 0,
      active: false, // Prodotto duplicato inattivo di default
      status: 'coming-soon' as 'active' | 'coming-soon' | 'beta' | 'soldout',
      image: product.image || '',
      popular: product.popular || false,
      badge: product.badge || '',
      badgeColor: product.badgeColor || 'blue',
      trialDays: product.trialDays || 0,
      comingSoon: product.comingSoon || false,
      launchDate: product.launchDate || '',
      metrics: {
        winRate: product.metrics?.winRate || 0,
        avgProfit: product.metrics?.avgProfit || 0
      },
      pricingPlans: pricingPlans
    });
    setFeatures(product.features.length > 0 ? product.features : ['']);
    setIsCreateModalOpen(true);
  };

  // ============= FEATURE MANAGEMENT =============
  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  // ============= FILTERING =============
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || product.type === filterType;
    const matchesActive = filterActive === 'all' ||
                         (filterActive === 'active' && product.active === true) ||
                         (filterActive === 'inactive' && product.active === false);
    return matchesSearch && matchesType && matchesActive;
  }) : [];

  // ============= UTILITY =============
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price);
  };

  // ============= LOADING STATE =============
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ============= RENDER =============
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestione Prodotti</h2>
          <p className="text-gray-600 mt-1">Gestisci prodotti e piani di abbonamento</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Aggiorna</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nuovo Prodotto</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca prodotti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tutti i tipi</option>
              <option value="one-time">Pagamento singolo</option>
              <option value="subscription">Abbonamento</option>
            </select>
          </div>

          {/* Active Filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attivi</option>
            <option value="inactive">Inattivi</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Product Image */}
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <Image className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <button
                    onClick={() => handleToggleActive(product.id, product.active)}
                    className={`${product.active ? 'text-green-600' : 'text-gray-400'}`}
                    title={product.active ? 'Disattiva' : 'Attiva'}
                  >
                    {product.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                
                {/* Price */}
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  {product.type === 'subscription' && product.interval && (
                    <span className="text-gray-500">/{product.interval}</span>
                  )}
                </div>

                {/* Type Badge */}
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.type === 'subscription' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {product.type === 'subscription' ? 'Abbonamento' : 'Pagamento singolo'}
                  </span>
                  {product.popular && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⭐ Popolare
                    </span>
                  )}
                  {product.badge && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.badge}
                    </span>
                  )}
                  {!product.active && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inattivo
                    </span>
                  )}
                </div>

                {/* Features Preview */}
                {product.features && product.features.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-1">Caratteristiche:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                      {product.features.length > 3 && (
                        <li className="text-gray-400">+{product.features.length - 3} altre...</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Stripe IDs */}
                {(product.stripeProductId || product.stripePriceId) && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Tag className="w-3 h-3" />
                      <span>Stripe: {product.stripeProductId ? '✓' : '✗'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openViewModal(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visualizza"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Modifica"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => duplicateProduct(product)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Duplica"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  {(product.category === 'Bot Trading' || product.category === 'Indicators' || product.category === 'bot' || 
                    product.category === 'indicator' || product.category === 'Bot' || product.category === 'Indicatori') && (
                    <button
                      onClick={() => handleEditPlatforms(product)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Gestisci Piattaforme"
                    >
                      <Monitor className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Elimina"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Product Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }}
        title={isEditModalOpen ? 'Modifica Prodotto' : 'Crea Nuovo Prodotto'}
        size="large"
      >
        <form onSubmit={isEditModalOpen ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Prodotto
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                required
              />
            </div>

            {/* Sezione Piani di Prezzo */}
            <div className="col-span-2 border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Piani di Prezzo
              </h3>
              
              {formData.type === 'subscription' ? (
                <div className="space-y-4">
                  {/* Piano Mensile */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.pricingPlans.monthly.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricingPlans: {
                              ...formData.pricingPlans,
                              monthly: { ...formData.pricingPlans.monthly, enabled: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">Piano Mensile</span>
                      </label>
                    </div>
                    {formData.pricingPlans.monthly.enabled && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600">Prezzo</label>
                          <input
                            type="number"
                            value={formData.pricingPlans.monthly.price}
                            onChange={(e) => setFormData({
                              ...formData,
                              pricingPlans: {
                                ...formData.pricingPlans,
                                monthly: { ...formData.pricingPlans.monthly, price: parseFloat(e.target.value) || 0 }
                              }
                            })}
                            className="w-full px-2 py-1 text-sm border rounded text-gray-900 bg-white"
                            placeholder="97"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Prezzo Barrato</label>
                          <input
                            type="number"
                            value={formData.pricingPlans.monthly.originalPrice}
                            onChange={(e) => setFormData({
                              ...formData,
                              pricingPlans: {
                                ...formData.pricingPlans,
                                monthly: { ...formData.pricingPlans.monthly, originalPrice: parseFloat(e.target.value) || 0 }
                              }
                            })}
                            className="w-full px-2 py-1 text-sm border rounded text-gray-900 bg-white"
                            placeholder="197"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Piano Annuale */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.pricingPlans.yearly.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricingPlans: {
                              ...formData.pricingPlans,
                              yearly: { ...formData.pricingPlans.yearly, enabled: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">Piano Annuale</span>
                      </label>
                      <span className="text-xs text-green-600 font-medium">Più popolare!</span>
                    </div>
                    {formData.pricingPlans.yearly.enabled && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-600">Prezzo</label>
                            <input
                              type="number"
                              value={formData.pricingPlans.yearly.price}
                              onChange={(e) => setFormData({
                                ...formData,
                                pricingPlans: {
                                  ...formData.pricingPlans,
                                  yearly: { ...formData.pricingPlans.yearly, price: parseFloat(e.target.value) || 0 }
                                }
                              })}
                              className="w-full px-2 py-1 text-sm border rounded text-gray-900 bg-white"
                              placeholder="970"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Prezzo Barrato</label>
                            <input
                              type="number"
                              value={formData.pricingPlans.yearly.originalPrice}
                              onChange={(e) => setFormData({
                                ...formData,
                                pricingPlans: {
                                  ...formData.pricingPlans,
                                  yearly: { ...formData.pricingPlans.yearly, originalPrice: parseFloat(e.target.value) || 0 }
                                }
                              })}
                              className="w-full px-2 py-1 text-sm border rounded text-gray-900 bg-white"
                              placeholder="1970"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Messaggio Risparmio</label>
                          <input
                            type="text"
                            value={formData.pricingPlans.yearly.savings}
                            onChange={(e) => setFormData({
                              ...formData,
                              pricingPlans: {
                                ...formData.pricingPlans,
                                yearly: { ...formData.pricingPlans.yearly, savings: e.target.value }
                              }
                            })}
                            className="w-full px-2 py-1 text-sm border rounded text-gray-900 bg-white"
                            placeholder="2 mesi gratis"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Piano Lifetime */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.pricingPlans.lifetime.enabled}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricingPlans: {
                              ...formData.pricingPlans,
                              lifetime: { ...formData.pricingPlans.lifetime, enabled: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">Piano Lifetime</span>
                      </label>
                      <span className="text-xs text-purple-600 font-medium">Miglior valore!</span>
                    </div>
                    {formData.pricingPlans.lifetime.enabled && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-600">Prezzo</label>
                            <input
                              type="number"
                              value={formData.pricingPlans.lifetime.price}
                              onChange={(e) => setFormData({
                                ...formData,
                                pricingPlans: {
                                  ...formData.pricingPlans,
                                  lifetime: { ...formData.pricingPlans.lifetime, price: parseFloat(e.target.value) || 0 }
                                }
                              })}
                              className="w-full px-2 py-1 text-sm border rounded text-gray-900 bg-white"
                              placeholder="2997"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Prezzo Barrato</label>
                            <input
                              type="number"
                              value={formData.pricingPlans.lifetime.originalPrice}
                              onChange={(e) => setFormData({
                                ...formData,
                                pricingPlans: {
                                  ...formData.pricingPlans,
                                  lifetime: { ...formData.pricingPlans.lifetime, originalPrice: parseFloat(e.target.value) || 0 }
                                }
                              })}
                              className="w-full px-2 py-1 text-sm border rounded text-gray-900 bg-white"
                              placeholder="4997"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Messaggio Risparmio</label>
                          <input
                            type="text"
                            value={formData.pricingPlans.lifetime.savings}
                            onChange={(e) => setFormData({
                              ...formData,
                              pricingPlans: {
                                ...formData.pricingPlans,
                                lifetime: { ...formData.pricingPlans.lifetime, savings: e.target.value }
                              }
                            })}
                            className="w-full px-2 py-1 text-sm border rounded text-gray-900 bg-white"
                            placeholder="Paga una volta, accesso per sempre"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Pagamento Singolo per Formazioni */
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Pagamento Una Tantum</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Prezzo</label>
                      <input
                        type="number"
                        value={formData.pricingPlans.oneTime.price}
                        onChange={(e) => setFormData({
                          ...formData,
                          pricingPlans: {
                            ...formData.pricingPlans,
                            oneTime: { ...formData.pricingPlans.oneTime, price: parseFloat(e.target.value) || 0, enabled: true }
                          }
                        })}
                        className="w-full px-2 py-1 text-sm border rounded text-gray-900 bg-white"
                        placeholder="1997"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Prezzo Barrato</label>
                      <input
                        type="number"
                        value={formData.pricingPlans.oneTime.originalPrice}
                        onChange={(e) => setFormData({
                          ...formData,
                          pricingPlans: {
                            ...formData.pricingPlans,
                            oneTime: { ...formData.pricingPlans.oneTime, originalPrice: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="w-full px-2 py-1 text-sm border rounded text-gray-900 bg-white"
                        placeholder="2997"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valuta
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="eur">EUR</option>
                <option value="usd">USD</option>
                <option value="gbp">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'one-time' | 'subscription' })}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="one-time">Pagamento singolo</option>
                <option value="subscription">Abbonamento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="es. Trading, Formazione"
              />
            </div>

            {formData.type === 'one-time' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock (opzionale)
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Immagine (opzionale)
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://esempio.com/immagine.jpg"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caratteristiche
              </label>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Inserisci una caratteristica"
                    />
                    {features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Aggiungi caratteristica
                </button>
              </div>
            </div>

            <div className="col-span-2 space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Prodotto attivo</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm font-medium text-gray-700">⭐ Prodotto popolare (evidenziato)</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badge (opzionale)
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="es. BEST SELLER, HIGH SPEED"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colore Badge
              </label>
              <select
                value={formData.badgeColor}
                onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="red">Rosso</option>
                <option value="blue">Blu</option>
                <option value="green">Verde</option>
                <option value="yellow">Giallo</option>
                <option value="purple">Viola</option>
                <option value="orange">Arancione</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giorni di Prova
              </label>
              <input
                type="number"
                value={formData.trialDays}
                onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                placeholder="Es: 60 giorni"
              />
            </div>

            <div className="col-span-2 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Metriche Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Win Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.metrics.winRate}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      metrics: { ...formData.metrics, winRate: parseFloat(e.target.value) || 0 } 
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                    placeholder="Es: 87"
                  />
                  <p className="mt-1 text-xs text-gray-500">Percentuale di trades vincenti</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avg Profit (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.metrics.avgProfit}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      metrics: { ...formData.metrics, avgProfit: parseFloat(e.target.value) || 0 } 
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Es: 22.3"
                  />
                  <p className="mt-1 text-xs text-gray-500">Profitto medio mensile</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {isEditModalOpen ? 'Salva Modifiche' : 'Crea Prodotto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Product Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Dettagli Prodotto"
        size="large"
      >
        {selectedProduct && (
          <div className="space-y-6">
            {selectedProduct.image && (
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">Nome</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{selectedProduct.name}</p>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">Descrizione</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProduct.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Prezzo</label>
                <p className="mt-1 text-lg font-bold text-blue-600">
                  {formatPrice(selectedProduct.price, selectedProduct.currency)}
                  {selectedProduct.type === 'subscription' && selectedProduct.interval && (
                    <span className="text-sm text-gray-500"> /{selectedProduct.interval}</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Tipo</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedProduct.type === 'subscription' ? 'Abbonamento' : 'Pagamento singolo'}
                </p>
              </div>

              {selectedProduct.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Categoria</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct.category}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500">Stato</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedProduct.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedProduct.active ? 'Attivo' : 'Inattivo'}
                  </span>
                </p>
              </div>

              {selectedProduct.metrics && (selectedProduct.metrics?.winRate || selectedProduct.metrics?.avgProfit) && (
                <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">📊 Metriche Performance</label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedProduct.metrics?.winRate && selectedProduct.metrics.winRate > 0 && (
                      <div>
                        <span className="text-xs text-gray-500">Win Rate</span>
                        <p className="text-2xl font-bold text-green-600">{selectedProduct.metrics.winRate}%</p>
                      </div>
                    )}
                    {selectedProduct.metrics?.avgProfit && selectedProduct.metrics.avgProfit > 0 && (
                      <div>
                        <span className="text-xs text-gray-500">Avg Profit</span>
                        <p className="text-2xl font-bold text-blue-600">+{selectedProduct.metrics.avgProfit}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedProduct.trialDays && selectedProduct.trialDays > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Periodo di Prova</label>
                  <p className="mt-1 text-sm text-gray-900">🎆 {selectedProduct.trialDays} giorni gratuiti</p>
                </div>
              )}

              {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Sconto</label>
                  <p className="mt-1">
                    <span className="line-through text-gray-500">{formatPrice(selectedProduct.originalPrice, selectedProduct.currency)}</span>
                    <span className="ml-2 text-red-600 font-semibold">-{Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}%</span>
                  </p>
                </div>
              )}

              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Caratteristiche</label>
                  <ul className="mt-1 space-y-1">
                    {selectedProduct.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-900">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProduct.stripeProductId && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Stripe Product ID</label>
                  <p className="mt-1 text-sm font-mono text-gray-900">{selectedProduct.stripeProductId}</p>
                </div>
              )}

              {selectedProduct.stripePriceId && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Stripe Price ID</label>
                  <p className="mt-1 text-sm font-mono text-gray-900">{selectedProduct.stripePriceId}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500">Creato il</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedProduct.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Modificato il</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedProduct.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
              >
                Chiudi
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Platform Management Modal */}
      <Modal
        isOpen={isPlatformModalOpen}
        onClose={() => {
          setIsPlatformModalOpen(false);
          setPlatforms([]);
        }}
        title="Gestione Piattaforme Supportate"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                {selectedProduct.name}
              </h3>
              <p className="text-sm text-gray-600">
                Seleziona le piattaforme supportate da questo prodotto
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Piattaforme Disponibili
              </label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg">
                {availablePlatforms.map((platform) => (
                  <label
                    key={platform}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={platforms.includes(platform)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlatforms([...platforms, platform]);
                        } else {
                          setPlatforms(platforms.filter(p => p !== platform));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Piattaforme Selezionate:</h4>
              <div className="flex flex-wrap gap-2">
                {platforms.length > 0 ? (
                  platforms.map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {platform}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Nessuna piattaforma selezionata</span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setIsPlatformModalOpen(false);
                  setPlatforms([]);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleUpdatePlatforms}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salva Piattaforme
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductsManagement;