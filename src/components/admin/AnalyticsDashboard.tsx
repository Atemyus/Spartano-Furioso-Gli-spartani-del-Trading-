import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointerClick, 
  Monitor, 
  Smartphone, 
  Tablet,
  RefreshCw,
  Calendar
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AnalyticsStats {
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: { page: string; views: number }[];
  viewsByDay: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  conversionRate: string;
  ordersInPeriod: number;
  averagePageViewsPerVisitor: string;
}

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/analytics/stats?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Impossibile caricare le statistiche');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [days]);

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getMaxViews = () => {
    if (!stats) return 1;
    return Math.max(...Object.values(stats.viewsByDay), 1);
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border-2 border-red-600/50 rounded-xl p-6 text-center">
        <p className="text-red-200">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">
          📊 Analytics Dashboard
        </h2>
        <div className="flex items-center gap-3">
          {/* Filtro periodo */}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
          >
            <option value={7}>Ultimi 7 giorni</option>
            <option value={30}>Ultimi 30 giorni</option>
            <option value={90}>Ultimi 90 giorni</option>
          </select>
          
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg transition"
          >
            <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visitatori Unici */}
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-2 border-blue-600/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-xs text-gray-400">UNICI</span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats.uniqueVisitors.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Visitatori Unici</div>
        </div>

        {/* Pageviews Totali */}
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-2 border-purple-600/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-purple-400" />
            <span className="text-xs text-gray-400">TOTALI</span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats.totalPageViews.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Visualizzazioni Pagina</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border-2 border-green-600/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <MousePointerClick className="w-8 h-8 text-green-400" />
            <span className="text-xs text-gray-400">TASSO</span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats.conversionRate}%
          </div>
          <div className="text-sm text-gray-400">Conversion Rate</div>
        </div>

        {/* Media Pageviews */}
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 border-2 border-orange-600/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            <span className="text-xs text-gray-400">MEDIA</span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats.averagePageViewsPerVisitor}
          </div>
          <div className="text-sm text-gray-400">Pagine per Visitatore</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visite per Giorno */}
        <div className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Visite per Giorno</h3>
          </div>
          
          <div className="space-y-2">
            {Object.entries(stats.viewsByDay)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, views]) => (
                <div key={date} className="flex items-center gap-3">
                  <div className="text-sm text-gray-400 w-24">
                    {new Date(date).toLocaleDateString('it-IT', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${(views / getMaxViews()) * 100}%` }}
                    >
                      {views > 0 && (
                        <span className="text-xs font-semibold text-white">
                          {views}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white">Pagine Più Visitate</h3>
          </div>
          
          <div className="space-y-2">
            {stats.topPages.slice(0, 8).map((page, index) => (
              <div key={page.page} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{page.page}</div>
                </div>
                <div className="px-3 py-1 bg-gray-800 rounded-full text-sm font-semibold text-purple-400">
                  {page.views}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device & Browser Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Dispositivi</h3>
          </div>
          
          <div className="space-y-3">
            {Object.entries(stats.deviceBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([device, count]) => (
                <div key={device} className="flex items-center gap-3">
                  <div className="text-gray-400">
                    {getDeviceIcon(device)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white capitalize mb-1">{device}</div>
                    <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 h-full transition-all duration-500"
                        style={{ width: `${(count / stats.totalPageViews) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-blue-400">
                    {count} ({((count / stats.totalPageViews) * 100).toFixed(1)}%)
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Browser</h3>
          </div>
          
          <div className="space-y-3">
            {Object.entries(stats.browserBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([browser, count]) => (
                <div key={browser} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm text-white mb-1">{browser}</div>
                    <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-500"
                        style={{ width: `${(count / stats.totalPageViews) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-purple-400">
                    {count} ({((count / stats.totalPageViews) * 100).toFixed(1)}%)
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Summary Info */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-2 border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">Ordini nel Periodo</div>
            <div className="text-2xl font-black text-white">{stats.ordersInPeriod}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Tasso di Conversione</div>
            <div className="text-2xl font-black text-green-400">{stats.conversionRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
