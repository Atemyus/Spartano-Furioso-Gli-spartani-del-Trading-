import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, DollarSign, Calendar, Shield, Laptop } from 'lucide-react';

interface PricingPlan {
  price: number;
  originalPrice?: number;
  interval: string;
  savings?: string;
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  type: 'one-time' | 'subscription';
  interval?: string;
  features: string[];
  requirements?: string[];
  platforms?: string[];
  pricingPlans?: {
    monthly?: PricingPlan;
    yearly?: PricingPlan;
    lifetime?: PricingPlan;
    oneTime?: PricingPlan;
    payment3?: PricingPlan;
    vip?: PricingPlan;
  };
  category?: string;
  active: boolean;
  image?: string;
  popular?: boolean;
  badge?: string | null;
  badgeColor?: string;
  trialDays?: number;
  metrics?: {
    winRate?: number;
    avgProfit?: number;
  };
}

interface ProductFormExtendedProps {
  product?: ProductData;
  onSave: (data: ProductData) => void;
  onCancel: () => void;
}

const ProductFormExtended: React.FC<ProductFormExtendedProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    currency: 'eur',
    type: 'subscription',
    interval: 'month',
    features: [''],
    requirements: [''],
    platforms: [''],
    pricingPlans: {
      monthly: { price: 0, originalPrice: 0, interval: 'mese' },
      yearly: { price: 0, originalPrice: 0, interval: 'anno', savings: '2 mesi gratis' },
      lifetime: { price: 0, originalPrice: 0, interval: 'lifetime', savings: 'Risparmio 33%' }
    },
    category: '',
    active: true,
    image: '',
    popular: false,
    badge: '',
    badgeColor: 'blue',
    trialDays: 0,
    metrics: {
      winRate: 0,
      avgProfit: 0
    }
  });

  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        features: product.features?.length > 0 ? product.features : [''],
        requirements: (product.requirements?.length ?? 0) > 0 ? product.requirements : [''],
        platforms: (product.platforms?.length ?? 0) > 0 ? product.platforms : [''],
        pricingPlans: product.pricingPlans || {
          monthly: { price: product.price, originalPrice: product.originalPrice || 0, interval: 'mese' },
          yearly: { price: product.price * 10, originalPrice: (product.originalPrice || product.price) * 10, interval: 'anno', savings: '2 mesi gratis' },
          lifetime: { price: product.price * 30, originalPrice: (product.originalPrice || product.price) * 30, interval: 'lifetime', savings: 'Risparmio 33%' }
        }
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean up empty arrays
    const cleanedData = {
      ...formData,
      features: formData.features.filter(f => f.trim() !== ''),
      requirements: formData.requirements?.filter(r => r.trim() !== ''),
      platforms: formData.platforms?.filter(p => p.trim() !== '')
    };
    onSave(cleanedData);
  };

  const updatePricingPlan = (planType: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      pricingPlans: {
        ...prev.pricingPlans,
        [planType]: {
          ...(prev.pricingPlans?.[planType as keyof typeof prev.pricingPlans] || {}),
          [field]: value
        }
      }
    }));
  };

  const addArrayItem = (field: 'features' | 'requirements' | 'platforms') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeArrayItem = (field: 'features' | 'requirements' | 'platforms', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'features' | 'requirements' | 'platforms', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {['basic', 'pricing', 'features', 'requirements', 'metrics'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'basic' && 'Informazioni Base'}
                {tab === 'pricing' && 'Piani e Prezzi'}
                {tab === 'features' && 'Caratteristiche'}
                {tab === 'requirements' && 'Requisiti e Piattaforme'}
                {tab === 'metrics' && 'Metriche'}
              </button>
            ))}
          </nav>
        </div>

        {/* Basic Information */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Prodotto</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleziona categoria</option>
                  <option value="Bot Trading">Bot Trading</option>
                  <option value="Indicatori">Indicatori</option>
                  <option value="Formazione">Formazione</option>
                  <option value="Segnali">Segnali</option>
                  <option value="Servizi">Servizi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'one-time' | 'subscription' })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="subscription">Abbonamento</option>
                  <option value="one-time">Pagamento singolo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                <input
                  type="text"
                  value={formData.badge || ''}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="es. BEST SELLER"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trial (giorni)</label>
                <input
                  type="number"
                  value={formData.trialDays}
                  onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="mr-2"
                />
                <span>Prodotto Attivo</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.popular || false}
                  onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                  className="mr-2"
                />
                <span>Prodotto Popolare</span>
              </label>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Piani di Abbonamento
            </h3>
            
            {formData.type === 'subscription' ? (
              <>
                {/* Monthly Plan */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Piano Mensile</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Prezzo</label>
                      <input
                        type="number"
                        value={formData.pricingPlans?.monthly?.price || 0}
                        onChange={(e) => updatePricingPlan('monthly', 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Prezzo Originale</label>
                      <input
                        type="number"
                        value={formData.pricingPlans?.monthly?.originalPrice || 0}
                        onChange={(e) => updatePricingPlan('monthly', 'originalPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Note Risparmio</label>
                      <input
                        type="text"
                        value={formData.pricingPlans?.monthly?.savings || ''}
                        onChange={(e) => updatePricingPlan('monthly', 'savings', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="es. Prova gratuita"
                      />
                    </div>
                  </div>
                </div>

                {/* Yearly Plan */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Piano Annuale</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Prezzo</label>
                      <input
                        type="number"
                        value={formData.pricingPlans?.yearly?.price || 0}
                        onChange={(e) => updatePricingPlan('yearly', 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Prezzo Originale</label>
                      <input
                        type="number"
                        value={formData.pricingPlans?.yearly?.originalPrice || 0}
                        onChange={(e) => updatePricingPlan('yearly', 'originalPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Note Risparmio</label>
                      <input
                        type="text"
                        value={formData.pricingPlans?.yearly?.savings || ''}
                        onChange={(e) => updatePricingPlan('yearly', 'savings', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="es. 2 mesi gratis"
                      />
                    </div>
                  </div>
                </div>

                {/* Lifetime Plan */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Piano Lifetime</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Prezzo</label>
                      <input
                        type="number"
                        value={formData.pricingPlans?.lifetime?.price || 0}
                        onChange={(e) => updatePricingPlan('lifetime', 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Prezzo Originale</label>
                      <input
                        type="number"
                        value={formData.pricingPlans?.lifetime?.originalPrice || 0}
                        onChange={(e) => updatePricingPlan('lifetime', 'originalPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Note Risparmio</label>
                      <input
                        type="text"
                        value={formData.pricingPlans?.lifetime?.savings || ''}
                        onChange={(e) => updatePricingPlan('lifetime', 'savings', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="es. Risparmio 33%"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* One-time payment plans */
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Opzioni Pagamento</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Prezzo Completo</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Prezzo Originale</label>
                    <input
                      type="number"
                      value={formData.originalPrice || 0}
                      onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Caratteristiche</h3>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateArrayItem('features', index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="es. 🚀 Trading automatico 24/7"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('features', index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('features')}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-5 h-5 mr-1" />
              Aggiungi caratteristica
            </button>
          </div>
        )}

        {/* Requirements and Platforms */}
        {activeTab === 'requirements' && (
          <div className="space-y-6">
            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Requisiti
              </h3>
              {formData.requirements?.map((req, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="es. Capitale minimo: €1,000"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-5 h-5 mr-1" />
                Aggiungi requisito
              </button>
            </div>

            {/* Platforms */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Laptop className="w-5 h-5 mr-2" />
                Piattaforme Supportate
              </h3>
              {formData.platforms?.map((platform, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => updateArrayItem('platforms', index, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="es. MetaTrader 5"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('platforms', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('platforms')}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-5 h-5 mr-1" />
                Aggiungi piattaforma
              </button>
            </div>
          </div>
        )}

        {/* Metrics */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Metriche Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Win Rate (%)</label>
                <input
                  type="number"
                  value={formData.metrics?.winRate || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    metrics: { ...formData.metrics, winRate: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avg Profit (%)</label>
                <input
                  type="number"
                  value={formData.metrics?.avgProfit || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    metrics: { ...formData.metrics, avgProfit: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {product ? 'Aggiorna' : 'Crea'} Prodotto
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormExtended;
