import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Package,
  Play,
  Pause,
  RefreshCw,
  Search,
  Filter,
  Download,
  TrendingUp,
  Trash2
} from 'lucide-react';

interface Trial {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'converted';
  daysRemaining: number;
  activated: boolean;
}

interface Product {
  id: string;
  name: string;
  trialDays: number;
}

const TrialsManagement: React.FC = () => {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);

  useEffect(() => {
    fetchData();
    // Auto-refresh ogni 30 secondi
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch prodotti
      const productsRes = await fetch('https://api.spartanofurioso.com/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.filter((p: Product) => p.trialDays > 0));
      }

      // Fetch trials reali dal database
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('token');
      const token = adminToken || userToken;
      
      console.log('🔐 Fetching trials with token:', token ? 'Token found' : 'No token');
      console.log('Admin token:', adminToken ? 'Present' : 'Not found');
      console.log('User token:', userToken ? 'Present' : 'Not found');
      
      if (token) {
        const trialsRes = await fetch('https://api.spartanofurioso.com/api/trials/admin/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('📡 Response status:', trialsRes.status);
        
        if (trialsRes.ok) {
          const trialsData = await trialsRes.json();
          console.log('✅ Trials data received:', trialsData);
          
          if (trialsData.success && trialsData.trials) {
            console.log(`📊 Found ${trialsData.trials.length} trials`);
            // Mappa i dati per includere lo stato activated
            const mappedTrials = trialsData.trials.map((trial: any) => ({
              ...trial,
              activated: true, // Assumiamo che se esiste nel DB è attivato
              status: trial.status || (trial.daysRemaining > 0 ? 'active' : 'expired')
            }));
            setTrials(mappedTrials);
          } else {
            console.log('⚠️ No trials in response or success=false');
            setTrials([]);
          }
        } else {
          console.error('❌ Failed to fetch trials:', trialsRes.status, trialsRes.statusText);
          const errorText = await trialsRes.text();
          console.error('Error response:', errorText);
        }
      } else {
        console.warn('⚠️ No token found, cannot fetch trials');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (trialId: string, newStatus: string) => {
    try {
      // TODO: Implementare API call
      // await fetch(`/api/admin/trials/${trialId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // Aggiorna stato locale
      setTrials(prev => prev.map(t => 
        t.id === trialId ? { ...t, status: newStatus as Trial['status'] } : t
      ));
      
      alert(`Trial ${trialId} aggiornato a ${newStatus}`);
    } catch (error) {
      console.error('Error updating trial:', error);
    }
  };

  const handleExtendTrial = async (trialId: string, days: number) => {
    try {
      // TODO: Implementare API call
      const trial = trials.find(t => t.id === trialId);
      if (trial) {
        const newEndDate = new Date(trial.endDate);
        newEndDate.setDate(newEndDate.getDate() + days);
        
        setTrials(prev => prev.map(t => 
          t.id === trialId 
            ? { 
                ...t, 
                endDate: newEndDate.toISOString(),
                daysRemaining: t.daysRemaining + days 
              } 
            : t
        ));
        
        alert(`Trial esteso di ${days} giorni`);
      }
    } catch (error) {
      console.error('Error extending trial:', error);
    }
  };

  const handleDeleteTrial = async (trialId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo trial? Questa azione è irreversibile.')) {
      return;
    }
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('token');
      const token = adminToken || userToken;
      
      if (!token) {
        alert('Errore: Token di autenticazione non trovato');
        return;
      }
      
      const response = await fetch(`https://api.spartanofurioso.com/api/trials/admin/${trialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Rimuovi il trial dalla lista locale
        setTrials(prev => prev.filter(t => t.id !== trialId));
        alert('✅ Trial eliminato con successo!');
        
        // Ricarica i dati per essere sicuri
        fetchData();
      } else {
        const error = await response.json();
        alert(`❌ Errore nell'eliminazione: ${error.error || 'Errore sconosciuto'}`);
      }
    } catch (error) {
      console.error('Error deleting trial:', error);
      alert('❌ Errore durante l\'eliminazione del trial');
    }
  };

  const filteredTrials = trials.filter(trial => {
    const matchesSearch = 
      trial.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trial.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trial.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || trial.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: trials.length,
    active: trials.filter(t => t.status === 'active').length,
    expired: trials.filter(t => t.status === 'expired').length,
    converted: trials.filter(t => t.status === 'converted').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'expired': return 'text-red-400 bg-red-900/20';
      case 'cancelled': return 'text-gray-400 bg-gray-900/20';
      case 'converted': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <Pause className="w-4 h-4" />;
      case 'converted': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-8 h-8 text-purple-400" />
            Gestione Trial
          </h2>
          <p className="text-gray-400 mt-1">Monitora e gestisci le prove gratuite degli utenti</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Aggiorna
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-gray-400 text-sm">Trial Totali</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Play className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{stats.active}</span>
          </div>
          <p className="text-gray-400 text-sm">Trial Attivi</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-red-400" />
            <span className="text-2xl font-bold text-white">{stats.expired}</span>
          </div>
          <p className="text-gray-400 text-sm">Trial Scaduti</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">{stats.converted}</span>
          </div>
          <p className="text-gray-400 text-sm">Convertiti</p>
          <p className="text-xs text-green-400">
            {stats.total > 0 ? `${Math.round((stats.converted / stats.total) * 100)}%` : '0%'} conversion rate
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per nome, email o prodotto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attivi</option>
            <option value="expired">Scaduti</option>
            <option value="cancelled">Cancellati</option>
            <option value="converted">Convertiti</option>
          </select>
          
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Esporta
          </button>
        </div>
      </div>

      {/* Trials Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Utente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Prodotto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Data Inizio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Giorni Rimasti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTrials.map((trial) => (
                <tr key={trial.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{trial.userName}</div>
                      <div className="text-xs text-gray-400">{trial.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-white">{trial.productName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {new Date(trial.startDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trial.status === 'active' ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">
                          {trial.daysRemaining} giorni
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trial.status)}`}>
                      {getStatusIcon(trial.status)}
                      {trial.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {trial.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleExtendTrial(trial.id, 30)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                            title="Estendi di 30 giorni"
                          >
                            +30gg
                          </button>
                          <button
                            onClick={() => handleStatusChange(trial.id, 'cancelled')}
                            className="text-red-400 hover:text-red-300 text-sm"
                            title="Cancella trial"
                          >
                            Cancella
                          </button>
                        </>
                      )}
                      {trial.status === 'expired' && (
                        <button
                          onClick={() => handleStatusChange(trial.id, 'active')}
                          className="text-green-400 hover:text-green-300 text-sm"
                          title="Riattiva trial"
                        >
                          Riattiva
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedTrial(trial)}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                        title="Visualizza dettagli"
                      >
                        Dettagli
                      </button>
                      <button
                        onClick={() => handleDeleteTrial(trial.id)}
                        className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1"
                        title="Elimina trial permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTrials.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nessun trial trovato</p>
          </div>
        )}
      </div>

      {/* Trial Details Modal */}
      {selectedTrial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Dettagli Trial</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Utente:</span>
                <p className="text-white">{selectedTrial.userName} ({selectedTrial.userEmail})</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Prodotto:</span>
                <p className="text-white">{selectedTrial.productName}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Periodo:</span>
                <p className="text-white">
                  {new Date(selectedTrial.startDate).toLocaleDateString('it-IT')} - 
                  {new Date(selectedTrial.endDate).toLocaleDateString('it-IT')}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Stato:</span>
                <p className="text-white">{selectedTrial.status}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTrial(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialsManagement;
