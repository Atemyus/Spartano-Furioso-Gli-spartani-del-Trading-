import { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  CreditCard,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber?: string;
  type?: string;
  paymentProvider?: string;
  paymentId?: string;
  customerEmail: string;
  customerName?: string;
  productId?: string;
  productName?: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus?: string;
  mode?: string;
  metadata?: any;
  stripeCustomerId?: string;
  paymentIntent?: string;
  subscription?: string;
  createdAt: string;
  updatedAt?: string;
  confirmedAt?: string;
  error?: string;
  accessDetails?: {
    telegramLink?: string;
    vimeoLink?: string;
    vimeoPassword?: string;
  };
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  subscriptions: number;
  oneTimePayments: number;
  failedPayments: number;
  revenueByMonth: Record<string, number>;
  revenueByProduct: Record<string, number>;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [telegramLink, setTelegramLink] = useState('https://t.me/+YOUR_PRIVATE_GROUP_LINK');
  const [vimeoLink, setVimeoLink] = useState('');
  const [vimeoPassword, setVimeoPassword] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const authHeader = (): Record<string, string> => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token') || '';
    return { Authorization: `Bearer ${token}` };
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://api.nexoralab.solutions/api/orders', { headers: authHeader() });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (order: Order) => {
    setSelectedOrder(order);
    setShowConfirmModal(true);
  };

  const confirmOrder = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`https://api.nexoralab.solutions/api/orders/${selectedOrder.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          telegramLink,
          vimeoLink,
          vimeoPassword
        })
      });

      if (response.ok) {
        alert('Ordine confermato! Email con credenziali inviata al cliente.');
        setShowConfirmModal(false);
        fetchOrders();
      } else {
        const error = await response.json();
        alert(`Errore: ${error.error}`);
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Errore nella conferma dell\'ordine');
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Sei sicuro di voler annullare questo ordine?')) return;

    try {
      const response = await fetch(`https://api.nexoralab.solutions/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          reason: 'Annullato da admin'
        })
      });

      if (response.ok) {
        alert('Ordine annullato');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://api.nexoralab.solutions/api/orders/stats', { headers: authHeader() });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    await fetchStats();
    setRefreshing(false);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Data', 'Cliente', 'Email', 'Importo', 'Tipo', 'Stato'];
    const rows = filteredOrders.map(order => [
      order.id,
      new Date(order.createdAt).toLocaleDateString('it-IT'),
      order.customerName || 'N/D',
      order.customerEmail,
      `€${order.amount} ${order.currency}`,
      order.mode === 'subscription' ? 'Abbonamento' : 'Pagamento singolo',
      order.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ordini_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'pending';
    if (filter === 'confirmed') return order.status === 'confirmed';
    if (filter === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-cyan-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8 text-purple-600" />
          Gestione Ordini
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Aggiorna
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Esporta CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ordini Totali</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ricavi Totali</p>
                <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abbonamenti</p>
                <p className="text-2xl font-bold">{stats.subscriptions}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagamenti Falliti</p>
                <p className="text-2xl font-bold">{stats.failedPayments}</p>
              </div>
              <XCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Revenue by Product */}
      {stats && Object.keys(stats.revenueByProduct).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4">Ricavi per Prodotto</h3>
          <div className="space-y-2">
            {Object.entries(stats.revenueByProduct).map(([product, revenue]) => (
              <div key={product} className="flex justify-between items-center">
                <span className="text-gray-700">{product}</span>
                <span className="font-semibold">€{revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tutti ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'pending'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          In Attesa ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'confirmed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Confermati ({orders.filter(o => o.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'cancelled'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Annullati ({orders.filter(o => o.status === 'cancelled').length})
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nessun ordine trovato
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString('it-IT')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString('it-IT')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName || 'Cliente'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.customerEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.amount ? (
                        <div className="text-sm font-semibold text-gray-900">
                          €{order.amount.toFixed(2)} {order.currency?.toUpperCase()}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          {order.type === 'checkout' ? (
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-4 w-4" />
                              {order.mode === 'subscription' ? 'Abbonamento' : 'Pagamento'}
                            </span>
                          ) : order.type === 'subscription_event' ? (
                            'Evento Abbonamento'
                          ) : order.type === 'payment_failed' ? (
                            'Pagamento Fallito'
                          ) : (
                            order.type
                          )}
                        </div>
                        {/* Payment Provider Badge */}
                        {order.paymentProvider && (
                          <div className="flex items-center gap-1">
                            {order.paymentProvider === 'stripe' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                💳 Stripe
                              </span>
                            ) : order.paymentProvider === 'paypal' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                💰 PayPal
                              </span>
                            ) : order.paymentProvider === 'crypto-nowpayments' || order.paymentProvider === 'crypto' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-100 text-sky-800">
                                ₿ Crypto
                                {order.metadata?.payCurrency && (
                                  <span className="ml-1 text-[10px]">
                                    ({order.metadata.payCurrency.toUpperCase()})
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {order.paymentProvider}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmOrder(order)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
                              title="Conferma ordine e invia credenziali"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Conferma
                            </button>
                            <button
                              onClick={() => cancelOrder(order.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                              title="Annulla ordine"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Annulla
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            title="Annulla ordine"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Annulla
                          </button>
                        )}
                        {(order.paymentIntent || order.subscription) && (
                          <a
                            href={`https://dashboard.stripe.com/${order.mode === 'subscription' ? 'subscriptions' : 'payments'}/${order.subscription || order.paymentIntent}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                          >
                            Stripe →
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error messages */}
      {filteredOrders.some(o => o.error) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Errori nei pagamenti:</h4>
          {filteredOrders.filter(o => o.error).map(order => (
            <div key={order.id} className="text-sm text-blue-600 mb-1">
              {new Date(order.createdAt).toLocaleString('it-IT')}: {order.error}
            </div>
          ))}
        </div>
      )}

      {/* Modal di conferma ordine */}
      {showConfirmModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Conferma ordine
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedOrder.productName || 'Prodotto'} · {selectedOrder.customerEmail}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Confermando l'ordine verrà inviata al cliente un'email con le credenziali
                di accesso. Puoi personalizzare i link qui sotto (opzionale).
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Telegram</label>
                <input
                  type="text"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500"
                  placeholder="https://t.me/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Vimeo / Corso</label>
                <input
                  type="text"
                  value={vimeoLink}
                  onChange={(e) => setVimeoLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500"
                  placeholder="https://vimeo.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Vimeo (opzionale)</label>
                <input
                  type="text"
                  value={vimeoPassword}
                  onChange={(e) => setVimeoPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500"
                  placeholder="Password di accesso"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={confirmOrder}
                className="px-4 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Conferma e invia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
