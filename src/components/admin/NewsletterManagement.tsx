import React, { useState, useEffect } from 'react';
import { Mail, Users, Send, TrendingUp, Search, Filter, Plus, Edit, Trash2, Eye, CheckCircle, MessageSquare } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: string;
  source: string;
  subscribedAt: string;
  unsubscribedAt?: string;
}

interface NewsletterMessage {
  id: string;
  subject: string;
  content: string;
  type: string;
  status: string;
  scheduledFor?: string;
  sentAt?: string;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
}

interface Stats {
  totalSubscribers: number;
  totalUnsubscribed: number;
  subscribersThisMonth: number;
  totalMessagesSent: number;
  avgOpenRate: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const NewsletterManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'messages' | 'create'>('subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [messages, setMessages] = useState<NewsletterMessage[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSubscribers: 0,
    totalUnsubscribed: 0,
    subscribersThisMonth: 0,
    totalMessagesSent: 0,
    avgOpenRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Form state per creare/modificare messaggi
  const [messageForm, setMessageForm] = useState({
    subject: '',
    content: '',
    type: 'promotional',
    scheduledFor: ''
  });
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab, searchTerm, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/api/newsletter/admin/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        console.error('Errore recupero stats:', await statsRes.text());
      }

      if (activeTab === 'subscribers') {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (filterStatus !== 'all') params.append('status', filterStatus);
        
        const res = await fetch(`${API_URL}/api/newsletter/admin/subscribers?${params}`);
        if (res.ok) {
          const data = await res.json();
          setSubscribers(data.subscribers || []);
        } else {
          console.error('Errore recupero iscritti:', await res.text());
          setSubscribers([]);
        }
      } else if (activeTab === 'messages') {
        const res = await fetch(`${API_URL}/api/newsletter/admin/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        } else {
          console.error('Errore recupero messaggi:', await res.text());
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Assicura che gli array siano inizializzati anche in caso di errore
      setSubscribers([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMessageId 
        ? `${API_URL}/api/newsletter/admin/messages/${editingMessageId}`
        : `${API_URL}/api/newsletter/admin/messages`;
      
      const method = editingMessageId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageForm)
      });

      if (res.ok) {
        alert(editingMessageId ? 'Messaggio aggiornato!' : 'Messaggio creato!');
        setMessageForm({ subject: '', content: '', type: 'promotional', scheduledFor: '' });
        setEditingMessageId(null);
        setActiveTab('messages');
        fetchData();
      }
    } catch (error) {
      console.error('Error creating message:', error);
      alert('Errore durante la creazione del messaggio');
    }
  };

  const handleSendMessage = async (messageId: string) => {
    if (!confirm('Sei sicuro di voler inviare questa newsletter a tutti gli iscritti?')) return;

    try {
      const res = await fetch(`${API_URL}/api/newsletter/admin/messages/${messageId}/send`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        fetchData();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Errore durante l\'invio della newsletter');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo messaggio?')) return;

    try {
      const res = await fetch(`${API_URL}/api/newsletter/admin/messages/${messageId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Messaggio eliminato!');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Errore durante l\'eliminazione del messaggio');
    }
  };

  const handleEditMessage = (message: NewsletterMessage) => {
    setMessageForm({
      subject: message.subject,
      content: message.content,
      type: message.type,
      scheduledFor: message.scheduledFor || ''
    });
    setEditingMessageId(message.id);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Mail className="w-8 h-8 text-yellow-500" />
            Gestione Newsletter - FALANGE
          </h1>
          <p className="text-gray-400">Gestisci gli iscritti e invia messaggi alla tua armata</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-400" />
              <span className="text-sm text-green-300 font-bold">ATTIVI</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">{stats.totalSubscribers}</div>
            <div className="text-sm text-gray-400">Guerrieri Iscritti</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-blue-300 font-bold">MESE</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">+{stats.subscribersThisMonth}</div>
            <div className="text-sm text-gray-400">Nuovi questo mese</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Send className="w-8 h-8 text-purple-400" />
              <span className="text-sm text-purple-300 font-bold">INVIATE</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">{stats.totalMessagesSent}</div>
            <div className="text-sm text-gray-400">Newsletter inviate</div>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-700/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-red-400" />
              <span className="text-sm text-red-300 font-bold">TASSO</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">{(stats.avgOpenRate || 0).toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Tasso apertura</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-1 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'subscribers'
                ? 'bg-gradient-to-r from-yellow-600 to-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            Iscritti ({stats.totalSubscribers})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'messages'
                ? 'bg-gradient-to-r from-yellow-600 to-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Messaggi ({messages.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              setEditingMessageId(null);
              setMessageForm({ subject: '', content: '', type: 'promotional', scheduledFor: '' });
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-yellow-600 to-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-5 h-5" />
            Crea Messaggio
          </button>
        </div>

        {/* Content */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          {/* Subscribers Tab */}
          {activeTab === 'subscribers' && (
            <div>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cerca per email o nome..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">Tutti</option>
                    <option value="ACTIVE">Attivi</option>
                    <option value="UNSUBSCRIBED">Disiscritti</option>
                  </select>
                </div>
              </div>

              {/* Subscribers Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase">Email</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase">Nome</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase">Stato</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase">Fonte</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 uppercase">Data Iscrizione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">
                          Caricamento...
                        </td>
                      </tr>
                    ) : subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">
                          Nessun iscritto trovato
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((sub) => (
                        <tr key={sub.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                          <td className="py-4 px-4 text-white">{sub.email}</td>
                          <td className="py-4 px-4 text-gray-300">{sub.name || '-'}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              sub.status === 'ACTIVE' 
                                ? 'bg-green-900/30 text-green-400 border border-green-700'
                                : 'bg-red-900/30 text-red-400 border border-red-700'
                            }`}>
                              {sub.status === 'ACTIVE' ? 'Attivo' : 'Disiscritto'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-300 capitalize">{sub.source}</td>
                          <td className="py-4 px-4 text-gray-300">
                            {new Date(sub.subscribedAt).toLocaleDateString('it-IT')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Caricamento...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Nessun messaggio trovato. Crea il primo!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{msg.subject}</h3>
                          <div className="flex gap-3 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              msg.status === 'sent' 
                                ? 'bg-green-900/30 text-green-400 border border-green-700'
                                : msg.status === 'scheduled'
                                ? 'bg-blue-900/30 text-blue-400 border border-blue-700'
                                : 'bg-gray-700/30 text-gray-400 border border-gray-600'
                            }`}>
                              {msg.status === 'sent' ? 'Inviata' : msg.status === 'scheduled' ? 'Programmata' : 'Bozza'}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-900/30 text-purple-400 border border-purple-700 capitalize">
                              {msg.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {msg.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleEditMessage(msg)}
                                className="p-2 bg-blue-900/30 border border-blue-700 rounded-lg text-blue-400 hover:bg-blue-900/50 transition-colors"
                                title="Modifica"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleSendMessage(msg.id)}
                                className="p-2 bg-green-900/30 border border-green-700 rounded-lg text-green-400 hover:bg-green-900/50 transition-colors"
                                title="Invia ora"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-2 bg-red-900/30 border border-red-700 rounded-lg text-red-400 hover:bg-red-900/50 transition-colors"
                            title="Elimina"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {msg.status === 'sent' && (
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
                          <div>
                            <div className="text-sm text-gray-400">Destinatari</div>
                            <div className="text-lg font-bold text-white">{msg.recipientCount}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Aperture</div>
                            <div className="text-lg font-bold text-white">{msg.openCount}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Click</div>
                            <div className="text-lg font-bold text-white">{msg.clickCount}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-400 mt-4">
                        Creata: {new Date(msg.createdAt).toLocaleString('it-IT')}
                        {msg.sentAt && ` • Inviata: ${new Date(msg.sentAt).toLocaleString('it-IT')}`}
                        {msg.scheduledFor && ` • Programmata per: ${new Date(msg.scheduledFor).toLocaleString('it-IT')}`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Create/Edit Message Tab */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateMessage} className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingMessageId ? 'Modifica Messaggio' : 'Crea Nuovo Messaggio'}
              </h2>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Oggetto Email *
                </label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="Es: 🔥 Nuova Strategia Spartana - Profitti Garantiti!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Tipo Messaggio
                </label>
                <select
                  value={messageForm.type}
                  onChange={(e) => setMessageForm({ ...messageForm, type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="promotional">Promozionale</option>
                  <option value="educational">Educativo</option>
                  <option value="announcement">Annuncio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Contenuto Email (HTML) *
                </label>
                <textarea
                  value={messageForm.content}
                  onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none font-mono text-sm"
                  rows={12}
                  placeholder="<h1>Ciao Guerriero! 🛡️</h1><p>Contenuto della tua email...</p>"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Puoi usare HTML. L'email sarà automaticamente formattata con il template Spartano Furioso.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Programma Invio (Opzionale)
                </label>
                <input
                  type="datetime-local"
                  value={messageForm.scheduledFor}
                  onChange={(e) => setMessageForm({ ...messageForm, scheduledFor: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Lascia vuoto per salvare come bozza. Invia manualmente dalla sezione "Messaggi".
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-red-500 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {editingMessageId ? 'Aggiorna Messaggio' : 'Salva Messaggio'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('messages');
                    setEditingMessageId(null);
                    setMessageForm({ subject: '', content: '', type: 'promotional', scheduledFor: '' });
                  }}
                  className="px-6 py-3 bg-gray-700 rounded-lg font-bold text-white hover:bg-gray-600 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterManagement;
