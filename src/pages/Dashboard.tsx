import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  Package, 
  Clock, 
  CreditCard,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  Gift,
  Rocket,
  Flame,
  Zap,
  Star,
  User,
  BookOpen,
  Trophy,
  Bell,
  Calendar,
  Home,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Save,
  Trash2
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPassword, setShowPassword] = useState(false);
  const [settingsData, setSettingsData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  
  // Ottieni dati utente reali dal localStorage
  const getUserData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      // Estrai nome e cognome dal campo name
      const nameParts = (userData.name || '').split(' ');
      return {
        firstName: nameParts[0] || 'Utente',
        lastName: nameParts.slice(1).join(' ') || '',
        email: userData.email,
        joinDate: new Date(userData.createdAt || Date.now()).toLocaleDateString('it-IT', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      };
    }
    return {
      firstName: 'Guerriero',
      lastName: '',
      email: 'utente@esempio.com',
      joinDate: new Date().toLocaleDateString('it-IT')
    };
  };
  
  const user = getUserData();
  
  // Initialize settings data
  React.useEffect(() => {
    const userData = getUserData();
    setSettingsData(prev => ({
      ...prev,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email
    }));
  }, []);
  
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsData({
      ...settingsData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSaveSettings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Reset messages
    setSettingsError('');
    setSettingsSaved(false);
    
    // Validate password confirmation
    if (settingsData.newPassword && settingsData.newPassword !== settingsData.confirmPassword) {
      setSettingsError('Le password non corrispondono');
      return;
    }
    
    // Validate password length
    if (settingsData.newPassword && settingsData.newPassword.length < 8) {
      setSettingsError('La nuova password deve essere di almeno 8 caratteri');
      return;
    }
    
    // Validate that current password is provided if new password is set
    if (settingsData.newPassword && !settingsData.currentPassword) {
      setSettingsError('Inserisci la password attuale per cambiarla');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${settingsData.firstName} ${settingsData.lastName}`,
          email: settingsData.email,
          currentPassword: settingsData.currentPassword,
          newPassword: settingsData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
        // Clear password fields
        setSettingsData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        setSettingsError(data.message || 'Errore durante l\'aggiornamento del profilo');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSettingsError('Errore di connessione. Riprova più tardi.');
    }
  };

  // Dati reali dall'utente
  const [trials, setTrials] = React.useState<any[]>([]);
  const [subscriptions, setSubscriptions] = React.useState<any[]>([]);
  const [totalProducts, setTotalProducts] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [trialsProgress, setTrialsProgress] = React.useState<{ [key: string]: number }>({});
  
  React.useEffect(() => {
    loadUserData();
    // Ricarica i dati ogni 30 secondi
    const interval = setInterval(loadUserData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Load progress for course trials
  React.useEffect(() => {
    const loadTrialProgress = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) return;
      
      const userData = JSON.parse(userStr);
      const courseTrials = trials.filter(t => t.productCategory === 'Formazione' && t.status === 'active');
      const progressMap: { [key: string]: number } = {};
      
      for (const trial of courseTrials) {
        try {
          const response = await fetch(
            `http://localhost:3001/api/courses/${trial.productId}/progress/${userData.id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          if (response.ok) {
            const data = await response.json();
            progressMap[trial.productId] = data.progress || 0;
          }
        } catch (error) {
          console.error('Error loading trial progress:', error);
        }
      }
      
      setTrialsProgress(progressMap);
    };
    
    if (trials.length > 0) {
      loadTrialProgress();
    }
  }, [trials]);
  
  const loadUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      // Carica i trial dell'utente
      const trialsResponse = await fetch('http://localhost:3001/api/trials/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (trialsResponse.ok) {
        const trialsData = await trialsResponse.json();
        if (trialsData.success) {
          console.log('🔍 Trials received:', trialsData.trials);
          setTrials(trialsData.trials || []);
        }
      }
      
      // Carica gli abbonamenti dell'utente
      const subsResponse = await fetch('http://localhost:3001/api/trials/subscriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (subsResponse.ok) {
        const subsData = await subsResponse.json();
        if (subsData.success) {
          setSubscriptions(subsData.subscriptions || []);
        }
      }
      
      // Carica il numero totale di prodotti disponibili
      const productsResponse = await fetch('http://localhost:3001/api/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setTotalProducts(productsData.length);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Rimuovi token e dati utente
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect alla home
    navigate('/');
  };

  return (
    <AnimatedPage>
      <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gradient-to-b from-black via-gray-950 to-black' : 'bg-white'
      }`}>
        {/* Epic Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Epic Header */}
        <div className={`relative z-10 backdrop-blur-md border-b-2 transition-colors ${
          theme === 'dark' ? 'bg-black/50 border-red-900/30' : 'bg-white border-red-200'
        }`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse"></div>
                  <img 
                    src="/logo.png" 
                    alt="Spartano Logo" 
                    className="relative w-16 h-16 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] group-hover:scale-110 transition-transform"
                  />
                  <Flame className="absolute -top-1 -right-1 w-6 h-6 text-orange-500 animate-fire" />
                </div>
                <h1 className="text-3xl font-black">
                  <span className="bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 bg-clip-text text-transparent">SPARTANO</span>
                  <span className={`ml-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>DASHBOARD</span>
                </h1>
              </Link>
              
              <div className="flex items-center gap-4">
                <button className={`p-3 rounded-lg transition-all duration-300 hover:scale-110 ${
                  theme === 'dark' ? 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10' : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-100'
                }`}>
                  <Bell className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-900 via-red-700 to-red-900 border-2 border-red-600 rounded-lg text-white hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  <span>LOGOUT</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`relative z-10 border-b ${
          theme === 'dark' ? 'border-red-900/30 bg-black/30' : 'border-red-200 bg-white/50'
        } backdrop-blur-sm`}>
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'overview', label: 'Panoramica', icon: Home },
                { id: 'trials', label: 'Trial', icon: Clock },
                { id: 'subscriptions', label: 'Abbonamenti', icon: CreditCard },
                { id: 'settings', label: 'Impostazioni', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-bold transition-all duration-300 border-b-4 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-500'
                      : theme === 'dark'
                        ? 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'
                        : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
        {/* Epic Welcome Section */}
        <div className="mb-10 relative">
          <div className={`p-8 rounded-2xl backdrop-blur-sm border-2 ${
            theme === 'dark' ? 'bg-gradient-to-r from-red-900/20 to-yellow-900/20 border-yellow-500/30' : 'bg-white border-yellow-400/50 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-4xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  <span className="bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    Benvenuto, {user.firstName}!
                  </span>
                </h2>
                <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Shield className="w-5 h-5 text-yellow-500" />
                  Spartano dal {user.joinDate}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Trophy className="w-16 h-16 text-yellow-500 animate-bounce-slow" />
              </div>
            </div>
          </div>
        </div>

        {/* Epic Stats Grid with 3D Effects */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {[
            { icon: Package, value: totalProducts, label: 'Prodotti Disponibili', color: 'from-yellow-600 to-orange-600', iconColor: 'text-yellow-500', glow: 'shadow-yellow-500/50' },
            { icon: Clock, value: trials.filter(t => t.status === 'active').length, label: 'Trial Attivi', color: 'from-blue-600 to-cyan-600', iconColor: 'text-blue-500', glow: 'shadow-blue-500/50' },
            { icon: CreditCard, value: subscriptions.length, label: 'Abbonamenti', color: 'from-green-600 to-emerald-600', iconColor: 'text-green-500', glow: 'shadow-green-500/50' },
            { icon: TrendingUp, value: '+24%', label: 'Performance Mese', color: 'from-purple-600 to-pink-600', iconColor: 'text-purple-500', glow: 'shadow-purple-500/50' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="group relative"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-500`}></div>
              
              {/* Card */}
              <div className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gray-900/70 backdrop-blur-sm border-gray-700 hover:border-yellow-500' 
                  : 'bg-white border-gray-200 hover:border-yellow-400 shadow-md'
              } ${stat.glow} hover:shadow-2xl`}>
                {/* Top shine */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <stat.icon className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-black'} group-hover:text-yellow-500 transition-colors`}>
                    {stat.value}
                  </span>
                </div>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                
                {/* Bottom glow */}
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Trials */}
        <div className="mb-8">
          <h3 className={`text-2xl font-black mb-6 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            <Clock className="w-6 h-6 text-yellow-500" />
            PROVE GRATUITE ATTIVE
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {trials.length > 0 ? trials.filter(trial => trial.status === 'active').map(trial => {
              const isCourse = trial.productCategory === 'Formazione';
              const courseProgress = isCourse ? trialsProgress[trial.productId] || 0 : 0;
              
              return (
                <div key={trial.id} className={`border rounded-xl p-6 ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 border-yellow-500/30'
                    : 'bg-white border-yellow-400/50 shadow-md'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className={`text-lg font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}>{trial.productName}</h4>
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Trial Attivo</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Iniziato il {new Date(trial.startDate).toLocaleDateString('it-IT')}
                      </p>
                      
                      {/* Progress bar for courses */}
                      {isCourse && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Progresso Corso
                            </span>
                            <span className="text-yellow-500 font-bold">{courseProgress}%</span>
                          </div>
                          <div className={`w-full rounded-full h-2 ${
                            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                          }`}>
                            <div 
                              className="bg-gradient-to-r from-yellow-600 to-orange-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${courseProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-black text-yellow-500">{trial.daysRemaining}</div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>giorni rimanenti</div>
                    </div>
                  </div>
                
                <div className="flex gap-3">
                  <Link 
                    to={trial.productCategory === 'Formazione' 
                      ? `/course/${trial.productId}/manage-trial` 
                      : `/trial-activation/${trial.productId}`
                    }
                    className="flex-1 px-4 py-2 bg-green-600 rounded-lg font-bold text-white hover:bg-green-500 transition-colors text-center"
                  >
                    Gestisci Trial
                  </Link>
                  <Link
                    to={`/products?product=${trial.productId}`}
                    className="px-4 py-2 bg-yellow-600 rounded-lg font-bold text-white hover:bg-yellow-500 transition-colors"
                  >
                    Abbonati
                  </Link>
                </div>
                </div>
              );
            }) : (
              <div className={`col-span-2 border rounded-xl p-8 text-center ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-gray-700'
                  : 'bg-white border-gray-200 shadow-md'
              }`}>
                <Clock className={`w-12 h-12 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Nessuna prova gratuita attiva
                </p>
                <Link to="/products" className="inline-block mt-4 px-6 py-2 bg-yellow-600 rounded-lg text-white hover:bg-yellow-500 transition-colors">
                  Scopri i nostri prodotti
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="mb-8">
          <h3 className={`text-2xl font-black mb-6 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}>
            <CreditCard className="w-6 h-6 text-green-500" />
            ABBONAMENTI ATTIVI
          </h3>
          <div className="space-y-4">
            {subscriptions.length > 0 ? subscriptions.map(sub => (
              <div key={sub.id} className={`border rounded-xl p-6 ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-green-500/30'
                  : 'bg-white border-green-400/50 shadow-md'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-lg font-bold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>{sub.productName}</h4>
                    <div className={`flex items-center gap-4 text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span>Piano: <span className="text-yellow-500 font-bold">{sub.plan || 'Mensile'}</span></span>
                      <span>Stato: <span className="text-green-400 font-bold">Attivo</span></span>
                    </div>
                    {sub.nextBilling && (
                      <p className="text-xs text-gray-500 mt-1">
                        Prossimo rinnovo: {new Date(sub.nextBilling).toLocaleDateString('it-IT')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Link 
                      to="/dashboard" 
                      className="px-4 py-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
                    >
                      Gestisci
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className={`border rounded-xl p-8 text-center ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-gray-700'
                  : 'bg-white border-gray-200 shadow-md'
              }`}>
                <CreditCard className={`w-12 h-12 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Nessun abbonamento attivo</p>
                <Link to="/products" className="inline-block mt-4 px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-500 transition-colors">
                  Attiva un abbonamento
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Special Banner for Trials */}
        <div className="mb-8 bg-gradient-to-r from-yellow-950/50 via-red-950/50 to-yellow-950/50 border-2 border-yellow-500/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-red-600 rounded-xl flex items-center justify-center animate-pulse">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  60 GIORNI DI PROVA GRATUITA
                  <Rocket className="w-5 h-5 text-yellow-500 animate-pulse" />
                </h3>
                <p className="text-gray-300">
                  Prova qualsiasi bot o servizio. 
                  <span className="text-yellow-500 font-bold"> Nessuna carta di credito richiesta!</span>
                </p>
              </div>
            </div>
            <Link 
              to="/trials"
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-red-500 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              SCOPRI LE PROVE GRATUITE
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link 
            to="/products"
            className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-800 rounded-xl p-6 hover:from-red-900/50 hover:to-red-800/50 transition-all group"
          >
            <Package className="w-8 h-8 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-bold text-white mb-2">Esplora Prodotti</h4>
            <p className="text-gray-400 text-sm">Scopri nuovi bot e servizi</p>
          </Link>

          <Link 
            to="/trials"
            className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-800 rounded-xl p-6 hover:from-yellow-900/50 hover:to-yellow-800/50 transition-all group"
          >
            <Gift className="w-8 h-8 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-bold text-white mb-2">Prove Gratuite</h4>
            <p className="text-gray-400 text-sm">60 giorni gratis</p>
          </Link>
          
          <Link 
            to="/support"
            className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-800 rounded-xl p-6 hover:from-green-900/50 hover:to-green-800/50 transition-all group"
          >
            <AlertCircle className="w-8 h-8 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-bold text-white mb-2">Supporto</h4>
            <p className="text-gray-400 text-sm">Assistenza 24/7</p>
          </Link>
          
          <Link 
            to="/community"
            className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-800 rounded-xl p-6 hover:from-purple-900/50 hover:to-purple-800/50 transition-all group"
          >
            <Shield className="w-8 h-8 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-bold text-white mb-2">Community</h4>
            <p className="text-gray-400 text-sm">Unisciti ai guerrieri</p>
          </Link>
        </div>
        </>
        )}

        {/* Trials Tab */}
        {activeTab === 'trials' && (
          <div>
            <div className="mb-8">
              <h2 className={`text-3xl font-black mb-2 flex items-center gap-3 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                <Clock className="w-8 h-8 text-blue-500" />
                GESTIONE PROVE GRATUITE
              </h2>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Monitora e gestisci tutte le tue prove gratuite attive
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className={`rounded-xl p-6 border-2 ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-blue-500/30'
                  : 'bg-white border-blue-400/50 shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-blue-500" />
                  <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {trials.filter(t => t.status === 'active').length}
                  </span>
                </div>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Trial Attivi
                </p>
              </div>

              <div className={`rounded-xl p-6 border-2 ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-yellow-500/30'
                  : 'bg-white border-yellow-400/50 shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {trials.filter(t => t.status === 'completed').length}
                  </span>
                </div>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Trial Completati
                </p>
              </div>

              <div className={`rounded-xl p-6 border-2 ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-red-500/30'
                  : 'bg-white border-red-400/50 shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {trials.filter(t => t.status === 'expired').length}
                  </span>
                </div>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Trial Scaduti
                </p>
              </div>
            </div>

            {/* Active Trials List */}
            <div className="mb-8">
              <h3 className={`text-2xl font-black mb-6 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                <Rocket className="w-6 h-6 text-blue-500" />
                TRIAL ATTIVI
              </h3>
              
              {trials.filter(t => t.status === 'active').length > 0 ? (
                <div className="space-y-4">
                  {trials.filter(t => t.status === 'active').map(trial => {
                    const isCourse = trial.productCategory === 'Formazione';
                    const courseProgress = isCourse ? trialsProgress[trial.productId] || 0 : 0;
                    const daysLeft = trial.daysRemaining;
                    const isExpiringSoon = daysLeft <= 7;
                    
                    return (
                      <div key={trial.id} className={`border-2 rounded-xl p-6 transition-all hover:scale-[1.02] ${
                        theme === 'dark'
                          ? 'bg-gray-900/50 border-blue-500/30 hover:border-blue-500/50'
                          : 'bg-white border-blue-400/50 hover:border-blue-500 shadow-md'
                      }`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg">
                                {isCourse ? (
                                  <BookOpen className="w-6 h-6 text-white" />
                                ) : (
                                  <Package className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className={`text-xl font-bold mb-1 ${
                                  theme === 'dark' ? 'text-white' : 'text-black'
                                }`}>{trial.productName}</h4>
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <span className="flex items-center gap-1 text-green-400">
                                    <CheckCircle className="w-4 h-4" />
                                    Attivo
                                  </span>
                                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                                    Iniziato: {new Date(trial.startDate).toLocaleDateString('it-IT')}
                                  </span>
                                  {isCourse && (
                                    <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs font-bold">
                                      CORSO
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Progress bar for courses */}
                            {isCourse && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Progresso Corso
                                  </span>
                                  <span className="text-blue-500 font-bold">{courseProgress}%</span>
                                </div>
                                <div className={`w-full rounded-full h-3 ${
                                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                                }`}>
                                  <div 
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${courseProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Time remaining */}
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                              isExpiringSoon 
                                ? 'bg-red-900/20 border border-red-500/50' 
                                : 'bg-blue-900/20 border border-blue-500/50'
                            }`}>
                              <Clock className={`w-4 h-4 ${isExpiringSoon ? 'text-red-400' : 'text-blue-400'}`} />
                              <span className={`text-sm font-bold ${isExpiringSoon ? 'text-red-400' : 'text-blue-400'}`}>
                                {daysLeft} giorni rimanenti
                                {isExpiringSoon && ' - In scadenza!'}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <Link 
                              to={isCourse 
                                ? `/course/${trial.productId}/manage-trial` 
                                : `/trial-activation/${trial.productId}`
                              }
                              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-bold text-white hover:from-blue-500 hover:to-cyan-500 transition-all text-center"
                            >
                              Gestisci Trial
                            </Link>
                            <Link
                              to={`/products?product=${trial.productId}`}
                              className="px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-orange-500 transition-all text-center"
                            >
                              Abbonati Ora
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`border-2 rounded-xl p-12 text-center ${
                  theme === 'dark'
                    ? 'bg-gray-900/50 border-gray-700'
                    : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <Clock className={`w-16 h-16 mx-auto mb-4 ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <h3 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>Nessun Trial Attivo</h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Inizia una prova gratuita di 60 giorni per qualsiasi prodotto!
                  </p>
                  <Link 
                    to="/trials"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-bold text-white hover:from-blue-500 hover:to-cyan-500 transition-all"
                  >
                    <Rocket className="w-5 h-5" />
                    Scopri le Prove Gratuite
                  </Link>
                </div>
              )}
            </div>

            {/* Expired/Completed Trials */}
            {(trials.filter(t => t.status === 'expired' || t.status === 'completed').length > 0) && (
              <div>
                <h3 className={`text-2xl font-black mb-6 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  <Trophy className="w-6 h-6 text-gray-500" />
                  STORICO TRIAL
                </h3>
                
                <div className="space-y-3">
                  {trials.filter(t => t.status === 'expired' || t.status === 'completed').map(trial => (
                    <div key={trial.id} className={`border rounded-lg p-4 ${
                      theme === 'dark'
                        ? 'bg-gray-900/30 border-gray-700'
                        : 'bg-gray-50 border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {trial.productName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {trial.status === 'expired' ? 'Scaduto' : 'Completato'} il {new Date(trial.endDate || trial.startDate).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                        <Link
                          to={`/products?product=${trial.productId}`}
                          className="px-4 py-2 bg-yellow-600 rounded-lg text-white hover:bg-yellow-500 transition-colors text-sm font-bold"
                        >
                          Abbonati
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div>
            <div className="mb-8">
              <h2 className={`text-3xl font-black mb-2 flex items-center gap-3 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                <CreditCard className="w-8 h-8 text-green-500" />
                GESTIONE ABBONAMENTI
              </h2>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Visualizza e gestisci tutti i tuoi abbonamenti attivi
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className={`rounded-xl p-6 border-2 ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-green-500/30'
                  : 'bg-white border-green-400/50 shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {subscriptions.length}
                  </span>
                </div>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Abbonamenti Attivi
                </p>
              </div>

              <div className={`rounded-xl p-6 border-2 ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-yellow-500/30'
                  : 'bg-white border-yellow-400/50 shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                  <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {totalProducts}
                  </span>
                </div>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Prodotti Disponibili
                </p>
              </div>

              <div className={`rounded-xl p-6 border-2 ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-purple-500/30'
                  : 'bg-white border-purple-400/50 shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-8 h-8 text-purple-500" />
                  <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    VIP
                  </span>
                </div>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Stato Membro
                </p>
              </div>
            </div>

            {/* Active Subscriptions */}
            {subscriptions.length > 0 ? (
              <div className="space-y-6">
                {subscriptions.map(sub => (
                  <div key={sub.id} className={`border-2 rounded-xl p-6 transition-all hover:scale-[1.01] ${
                    theme === 'dark'
                      ? 'bg-gray-900/50 border-green-500/30 hover:border-green-500/50'
                      : 'bg-white border-green-400/50 hover:border-green-500 shadow-md'
                  }`}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
                            <Package className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-2xl font-black mb-2 ${
                              theme === 'dark' ? 'text-white' : 'text-black'
                            }`}>{sub.productName}</h3>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-3">
                              <span className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-500/50 rounded-full">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-bold text-green-400">Attivo</span>
                              </span>
                              <span className="flex items-center gap-2 px-3 py-1 bg-yellow-900/30 border border-yellow-500/50 rounded-full">
                                <Star className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-bold text-yellow-400">{sub.plan || 'Piano Mensile'}</span>
                              </span>
                            </div>

                            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              <p className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Attivato il: {new Date(sub.startDate || Date.now()).toLocaleDateString('it-IT')}
                              </p>
                              {sub.nextBilling && (
                                <p className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  Prossimo rinnovo: {new Date(sub.nextBilling).toLocaleDateString('it-IT')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Benefits */}
                        <div className={`p-4 rounded-lg ${
                          theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'
                        }`}>
                          <h4 className={`text-sm font-bold mb-2 ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-700'
                          }`}>Vantaggi Inclusi:</h4>
                          <ul className={`space-y-1 text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Accesso completo al prodotto
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Supporto prioritario 24/7
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Aggiornamenti automatici
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        <Link
                          to={`/products?product=${sub.productId}`}
                          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold text-white hover:from-green-500 hover:to-emerald-500 transition-all text-center"
                        >
                          Gestisci
                        </Link>
                        <button
                          className={`px-6 py-3 rounded-lg font-bold transition-all text-center ${
                            theme === 'dark'
                              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Modifica Piano
                        </button>
                        <button
                          className="px-6 py-3 bg-red-900/20 border border-red-500/50 rounded-lg font-bold text-red-400 hover:bg-red-900/30 transition-all text-center"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`border-2 rounded-xl p-12 text-center ${
                theme === 'dark'
                  ? 'bg-gray-900/50 border-gray-700'
                  : 'bg-white border-gray-200 shadow-md'
              }`}>
                <CreditCard className={`w-16 h-16 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <h3 className={`text-xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>Nessun Abbonamento Attivo</h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Inizia con una prova gratuita o attiva un abbonamento per accedere ai nostri prodotti premium!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/trials"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-bold text-white hover:from-blue-500 hover:to-cyan-500 transition-all"
                  >
                    <Clock className="w-5 h-5" />
                    Prova Gratuita 60 Giorni
                  </Link>
                  <Link 
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold text-white hover:from-green-500 hover:to-emerald-500 transition-all"
                  >
                    <Package className="w-5 h-5" />
                    Esplora Prodotti
                  </Link>
                </div>
              </div>
            )}

            {/* Upgrade Banner */}
            <div className="mt-8 bg-gradient-to-r from-purple-950/50 via-pink-950/50 to-purple-950/50 border-2 border-purple-500/50 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center animate-pulse">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2 mb-1">
                      DIVENTA MEMBRO VIP
                      <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                    </h3>
                    <p className="text-gray-300">
                      Accesso illimitato a tutti i prodotti con un unico abbonamento.
                      <span className="text-purple-400 font-bold"> Risparmia fino al 40%!</span>
                    </p>
                  </div>
                </div>
                <Link 
                  to="/products"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-white hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                >
                  <Rocket className="w-5 h-5" />
                  SCOPRI DI PIÙ
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className={`text-3xl font-black mb-2 flex items-center gap-3 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                <Settings className="w-8 h-8 text-yellow-500" />
                IMPOSTAZIONI ACCOUNT
              </h2>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Gestisci il tuo profilo e le preferenze
              </p>
            </div>

            {/* Success Message */}
            {settingsSaved && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-600/50 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-400 font-medium">Impostazioni salvate con successo!</p>
              </div>
            )}

            {/* Error Message */}
            {settingsError && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-400 font-medium">{settingsError}</p>
              </div>
            )}

            {/* Profile Settings */}
            <div className={`rounded-2xl p-8 mb-6 border-2 ${
              theme === 'dark'
                ? 'bg-gray-900/50 border-yellow-500/30'
                : 'bg-white border-yellow-400/50 shadow-md'
            }`}>
              <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                <User className="w-6 h-6 text-yellow-500" />
                Informazioni Profilo
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nome
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={settingsData.firstName}
                    onChange={handleSettingsChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                      theme === 'dark'
                        ? 'bg-black/50 border-red-900/50 text-white focus:border-yellow-500'
                        : 'bg-white border-gray-300 text-gray-800 focus:border-yellow-600'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Cognome
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={settingsData.lastName}
                    onChange={handleSettingsChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                      theme === 'dark'
                        ? 'bg-black/50 border-red-900/50 text-white focus:border-yellow-500'
                        : 'bg-white border-gray-300 text-gray-800 focus:border-yellow-600'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-bold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="email"
                      name="email"
                      value={settingsData.email}
                      onChange={handleSettingsChange}
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none transition-colors ${
                        theme === 'dark'
                          ? 'bg-black/50 border-red-900/50 text-white focus:border-yellow-500'
                          : 'bg-white border-gray-300 text-gray-800 focus:border-yellow-600'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className={`rounded-2xl p-8 mb-6 border-2 ${
              theme === 'dark'
                ? 'bg-gray-900/50 border-red-500/30'
                : 'bg-white border-red-400/50 shadow-md'
            }`}>
              <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                <Lock className="w-6 h-6 text-red-500" />
                Cambia Password
              </h3>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password Attuale
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={settingsData.currentPassword}
                      onChange={handleSettingsChange}
                      className={`w-full px-4 py-3 pl-12 pr-12 border-2 rounded-lg focus:outline-none transition-colors ${
                        theme === 'dark'
                          ? 'bg-black/50 border-red-900/50 text-white focus:border-yellow-500'
                          : 'bg-white border-gray-300 text-gray-800 focus:border-yellow-600'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                        theme === 'dark' ? 'text-gray-500 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-600'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nuova Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={settingsData.newPassword}
                      onChange={handleSettingsChange}
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none transition-colors ${
                        theme === 'dark'
                          ? 'bg-black/50 border-red-900/50 text-white focus:border-yellow-500'
                          : 'bg-white border-gray-300 text-gray-800 focus:border-yellow-600'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Conferma Nuova Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={settingsData.confirmPassword}
                      onChange={handleSettingsChange}
                      className={`w-full px-4 py-3 pl-12 border-2 rounded-lg focus:outline-none transition-colors ${
                        theme === 'dark'
                          ? 'bg-black/50 border-red-900/50 text-white focus:border-yellow-500'
                          : 'bg-white border-gray-300 text-gray-800 focus:border-yellow-600'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveSettings}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-lg font-bold text-white hover:from-yellow-500 hover:to-yellow-700 transition-all transform hover:scale-105"
              >
                <Save className="w-5 h-5" />
                SALVA MODIFICHE
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-8 py-4 rounded-lg font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ANNULLA
              </button>
            </div>

            {/* Danger Zone */}
            <div className={`rounded-2xl p-8 mt-8 border-2 ${
              theme === 'dark'
                ? 'bg-red-900/10 border-red-500/50'
                : 'bg-red-50 border-red-300'
            }`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-500">
                <AlertCircle className="w-6 h-6" />
                Zona Pericolosa
              </h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Una volta eliminato l'account, non c'è modo di tornare indietro. Sii sicuro.
              </p>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-red-600 rounded-lg font-bold text-white hover:bg-red-500 transition-all"
              >
                <Trash2 className="w-5 h-5" />
                ELIMINA ACCOUNT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </AnimatedPage>
  );
};

export default Dashboard;
