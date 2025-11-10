import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  PauseCircle,
  PlayCircle,
  DollarSign,
  Clock,
  Package,
  ExternalLink
} from 'lucide-react';

interface Subscription {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName?: string;
  productId: string;
  productName: string;
  priceId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  amount: number;
  currency: string;
  interval: 'month' | 'year' | 'week' | 'day';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialEnd?: string;
  startDate: string;
  metadata?: any;
  stripeSubscriptionId?: string;
  nextPaymentDate?: string;
  paymentMethod?: string;
}

interface SubscriptionStats {
  totalActive: number;
  totalCanceled: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageSubscriptionValue: number;
  churnRate: number;
  growthRate: number;
  revenueByPlan: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

export default function SubscriptionsManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'canceled' | 'past_due'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/subscriptions/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSubscriptions();
    await fetchStats();
    setRefreshing(false);
  };

  const handleCancelSubscription = async (subscriptionId: string, immediate: boolean = false) => {
    if (!confirm(`Sei sicuro di voler cancellare questo abbonamento${immediate ? ' immediatamente' : ' alla fine del periodo corrente'}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ immediate })
      });

      if (response.ok) {
        alert('Abbonamento cancellato con successo');
        await fetchSubscriptions();
        await fetchStats();
      } else {
        alert('Errore nella cancellazione dell\'abbonamento');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Errore nella cancellazione dell\'abbonamento');
    }
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/subscriptions/${subscriptionId}/pause`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Abbonamento messo in pausa');
        await fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error pausing subscription:', error);
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/subscriptions/${subscriptionId}/resume`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Abbonamento riattivato');
        await fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Cliente', 'Email', 'Prodotto', 'Importo', 'Intervallo', 'Stato', 'Data Inizio', 'Prossimo Pagamento'];
    const rows = filteredSubscriptions.map(sub => [
      sub.id,
      sub.customerName || 'N/D',
      sub.customerEmail,
      sub.productName,
      `€${sub.amount / 100}`,
      sub.interval,
      sub.status,
      new Date(sub.startDate).toLocaleDateString('it-IT'),
      sub.nextPaymentDate ? new Date(sub.nextPaymentDate).toLocaleDateString('it-IT') : 'N/D'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `abbonamenti_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'paused':
        return <PauseCircle className="h-4 w-4 text-gray-500" />;
      case 'trialing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'canceled': return 'Cancellato';
      case 'past_due': return 'In ritardo';
      case 'paused': return 'In pausa';
      case 'trialing': return 'Trial';
      default: return status;
    }
  };

  const formatInterval = (interval: string) => {
    switch (interval) {
      case 'month': return 'Mensile';
      case 'year': return 'Annuale';
      case 'week': return 'Settimanale';
      case 'day': return 'Giornaliero';
      default: return interval;
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
          <CreditCard className="h-8 w-8 text-purple-600" />
          Gestione Abbonamenti
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
                <p className="text-sm text-gray-600">Abbonamenti Attivi</p>
                <p className="text-2xl font-bold">{stats.totalActive}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">MRR (Monthly Recurring Revenue)</p>
                <p className="text-2xl font-bold">€{(stats.monthlyRecurringRevenue / 100).toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valore Medio</p>
                <p className="text-2xl font-bold">€{(stats.averageSubscriptionValue / 100).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasso di Churn</p>
                <p className="text-2xl font-bold">{stats.churnRate.toFixed(1)}%</p>
                {stats.churnRate > 5 && (
                  <p className="text-xs text-red-500 mt-1">Alto - necessita attenzione</p>
                )}
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Revenue by Plan */}
      {stats && Object.keys(stats.revenueByPlan).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4">Ricavi per Piano</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.revenueByPlan).map(([plan, revenue]) => (
              <div key={plan} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">{plan}</span>
                </div>
                <span className="font-semibold text-green-600">€{(revenue / 100).toFixed(2)}</span>
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
          Tutti ({subscriptions.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Attivi ({subscriptions.filter(s => s.status === 'active').length})
        </button>
        <button
          onClick={() => setFilter('canceled')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'canceled'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cancellati ({subscriptions.filter(s => s.status === 'canceled').length})
        </button>
        <button
          onClick={() => setFilter('past_due')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'past_due'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          In Ritardo ({subscriptions.filter(s => s.status === 'past_due').length})
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prodotto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Piano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prossimo Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nessun abbonamento trovato
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.customerName || 'Cliente'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {subscription.customerEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.productName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {subscription.productId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        €{(subscription.amount / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatInterval(subscription.interval)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {getStatusIcon(subscription.status)}
                        {getStatusLabel(subscription.status)}
                      </span>
                      {subscription.cancelAtPeriodEnd && (
                        <p className="text-xs text-red-500 mt-1">
                          Cancella il {new Date(subscription.currentPeriodEnd).toLocaleDateString('it-IT')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {subscription.status === 'active' && subscription.currentPeriodEnd ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(subscription.currentPeriodEnd).toLocaleDateString('it-IT')}
                            </div>
                            <div className="text-xs text-gray-500">
                              tra {Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} giorni
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {subscription.status === 'active' && (
                          <>
                            <button
                              onClick={() => handlePauseSubscription(subscription.id)}
                              className="text-gray-600 hover:text-gray-700 p-1"
                              title="Metti in pausa"
                            >
                              <PauseCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCancelSubscription(subscription.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Cancella a fine periodo"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {subscription.status === 'paused' && (
                          <button
                            onClick={() => handleResumeSubscription(subscription.id)}
                            className="text-green-600 hover:text-green-700 p-1"
                            title="Riprendi"
                          >
                            <PlayCircle className="h-4 w-4" />
                          </button>
                        )}
                        {subscription.stripeSubscriptionId && (
                          <a
                            href={`https://dashboard.stripe.com/subscriptions/${subscription.stripeSubscriptionId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 p-1"
                            title="Vedi su Stripe"
                          >
                            <ExternalLink className="h-4 w-4" />
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

      {/* Subscription lifecycle chart placeholder */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-4">Ciclo di Vita Abbonamenti</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats?.totalActive || 0}</div>
            <div className="text-sm text-gray-600">Attivi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {subscriptions.filter(s => s.status === 'trialing').length}
            </div>
            <div className="text-sm text-gray-600">In Trial</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {subscriptions.filter(s => s.status === 'past_due').length}
            </div>
            <div className="text-sm text-gray-600">In Ritardo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats?.totalCanceled || 0}</div>
            <div className="text-sm text-gray-600">Cancellati</div>
          </div>
        </div>
      </div>
    </div>
  );
}
