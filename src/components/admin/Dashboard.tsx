import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  LogOut,
  Package,
  Settings,
  BarChart3,
  Menu,
  X,
  Clock,
  BookOpen,
  Mail
} from 'lucide-react';
import UsersManagement from './UsersManagement';
import ProductsManagement from './ProductsManagement';
import TrialsManagement from './TrialsManagement';
import CourseManagement from './CourseManagement';
import OrdersManagement from './OrdersManagement';
import SubscriptionsManagement from './SubscriptionsManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import NewsletterManagement from './NewsletterManagement';

interface Stats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  newsletter: {
    subscribers: number;
  };
  products: {
    total: number;
    active: number;
  };
  recentUsers: any[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch('https://api.spartanofurioso.com/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'users', label: 'Utenti', icon: Users },
    { id: 'products', label: 'Prodotti', icon: Package },
    { id: 'courses', label: 'Corsi', icon: BookOpen },
    { id: 'trials', label: 'Trial', icon: Clock },
    { id: 'orders', label: 'Ordini', icon: ShoppingBag },
    { id: 'subscriptions', label: 'Abbonamenti', icon: CreditCard },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'settings', label: 'Impostazioni', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">
              {menuItems.find(item => item.id === activeSection)?.label}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === 'overview' && stats && (
            <div>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Utenti Totali</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.users.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Utenti Attivi</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.users.active}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nuovi Utenti (30gg)</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.users.newThisMonth}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Newsletter Subscribers</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.newsletter.subscribers}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Products Summary */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Prodotti</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Prodotti Totali</span>
                        <span className="font-semibold text-gray-800">{stats.products.total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Prodotti Attivi</span>
                        <span className="font-semibold text-green-600">{stats.products.active}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Newsletter Subscribers</span>
                        <span className="font-semibold text-blue-600">{stats.newsletter.subscribers}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Utenti Recenti</h3>
                  </div>
                  <div className="p-6">
                    {stats.recentUsers && stats.recentUsers.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentUsers.map((user) => (
                          <div key={user._id || user.id} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{user.name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center">Nessun utente recente</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'analytics' && <AnalyticsDashboard />}

          {activeSection === 'users' && <UsersManagement />}

          {activeSection === 'products' && <ProductsManagement />}
          
          {activeSection === 'courses' && <CourseManagement />}
          
          {activeSection === 'trials' && <TrialsManagement />}

          {activeSection === 'orders' && <OrdersManagement />}

          {activeSection === 'subscriptions' && <SubscriptionsManagement />}

          {activeSection === 'newsletter' && <NewsletterManagement />}

          {activeSection === 'settings' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Impostazioni</h2>
                <p className="text-gray-600">Configurazione del pannello di amministrazione.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
