import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  Clock,
  CreditCard,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  Rocket,
  User,
  BookOpen,
  Bell,
  Calendar,
  Home,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Menu,
  X,
  ChevronRight,
  Activity,
  Sparkles,
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS, API_URL } from '../config/api';

type Tab = 'overview' | 'trials' | 'subscriptions' | 'settings';

const NAV: { id: Tab; label: string; icon: React.ElementType; tag: string }[] = [
  { id: 'overview',      label: 'Panoramica',  icon: Home,       tag: '01' },
  { id: 'trials',        label: 'Prove gratuite', icon: Clock,    tag: '02' },
  { id: 'subscriptions', label: 'Abbonamenti', icon: CreditCard, tag: '03' },
  { id: 'settings',      label: 'Profilo',     icon: Settings,   tag: '04' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [settingsData, setSettingsData] = useState({
    firstName: '', lastName: '', email: '',
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  const [trials, setTrials] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [trialsProgress, setTrialsProgress] = useState<{ [k: string]: number }>({});
  const [loading, setLoading] = useState(true);

  // ====== utility ======
  const getUserData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      const np = (u.name || '').split(' ');
      return {
        firstName: np[0] || 'Trader',
        lastName: np.slice(1).join(' ') || '',
        email: u.email,
        joinDate: new Date(u.createdAt || Date.now()).toLocaleDateString('it-IT', {
          day: 'numeric', month: 'long', year: 'numeric',
        }),
      };
    }
    return {
      firstName: 'Trader', lastName: '',
      email: 'utente@esempio.com',
      joinDate: new Date().toLocaleDateString('it-IT'),
    };
  };
  const user = getUserData();

  useEffect(() => {
    const d = getUserData();
    setSettingsData((p) => ({ ...p, firstName: d.firstName, lastName: d.lastName, email: d.email }));
  }, []);

  // ====== data loading ======
  const loadUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const tRes = await fetch(API_ENDPOINTS.userTrials, { headers: { Authorization: `Bearer ${token}` } });
      if (tRes.ok) {
        const d = await tRes.json();
        if (d.success) setTrials(d.trials || []);
      }
      const sRes = await fetch(API_ENDPOINTS.subscriptions, { headers: { Authorization: `Bearer ${token}` } });
      if (sRes.ok) {
        const d = await sRes.json();
        if (d.success) setSubscriptions(d.subscriptions || []);
      }
      const pRes = await fetch(API_ENDPOINTS.products);
      if (pRes.ok) setTotalProducts((await pRes.json()).length);
    } catch (e) {
      console.error('Error loading user data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
    const id = setInterval(loadUserData, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) return;
      const u = JSON.parse(userStr);
      const courseT = trials.filter((t) => t.productCategory === 'Formazione' && t.status === 'active');
      const map: { [k: string]: number } = {};
      for (const tr of courseT) {
        try {
          const r = await fetch(`${API_URL}/api/courses/${tr.productId}/progress/${u.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (r.ok) {
            const d = await r.json();
            map[tr.productId] = d.progress || 0;
          }
        } catch {}
      }
      setTrialsProgress(map);
    };
    if (trials.length > 0) loadProgress();
  }, [trials]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsData({ ...settingsData, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSettingsError('');
    setSettingsSaved(false);
    if (settingsData.newPassword && settingsData.newPassword !== settingsData.confirmPassword) {
      setSettingsError('Le password non corrispondono'); return;
    }
    if (settingsData.newPassword && settingsData.newPassword.length < 8) {
      setSettingsError('La nuova password deve essere di almeno 8 caratteri'); return;
    }
    if (settingsData.newPassword && !settingsData.currentPassword) {
      setSettingsError('Inserisci la password attuale per cambiarla'); return;
    }
    try {
      const res = await fetch(API_ENDPOINTS.updateProfile, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: `${settingsData.firstName} ${settingsData.lastName}`,
          email: settingsData.email,
          currentPassword: settingsData.currentPassword,
          newPassword: settingsData.newPassword,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(d.user));
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
        setSettingsData((p) => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }));
      } else {
        setSettingsError(d.message || 'Errore durante l\'aggiornamento del profilo');
      }
    } catch {
      setSettingsError('Errore di connessione. Riprova più tardi.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // ====== styling helpers ======
  const surface = dark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const surfaceHover = dark ? 'hover:border-cyan-500/50' : 'hover:border-cyan-500/70';
  const textMain = dark ? 'text-white' : 'text-slate-900';
  const textMuted = dark ? 'text-slate-400' : 'text-slate-600';
  const textDim = dark ? 'text-slate-500' : 'text-slate-500';
  const inputBase = dark
    ? 'bg-slate-950/60 border-slate-800 text-white focus:border-cyan-500 focus:ring-cyan-500/20'
    : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500 focus:ring-cyan-500/20';

  const activeTitle = NAV.find((n) => n.id === activeTab);

  // ====== components ======
  const Sidebar = () => (
    <aside
      className={`flex flex-col justify-between border-r ${
        dark ? 'bg-black/80 border-slate-800/80' : 'bg-white border-slate-200'
      } backdrop-blur-md`}
    >
      <div>
        {/* Logo */}
        <div className={`px-6 py-6 border-b ${dark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Nexora Lab" className={`h-9 w-auto ${dark ? '' : 'bg-slate-900 rounded-lg px-2 py-1'}`} />
          </Link>
          <p className={`mt-3 font-mono-lab text-[0.65rem] tracking-[0.28em] uppercase ${textDim}`}>
            // Dashboard
          </p>
        </div>

        {/* Nav */}
        <nav className="px-3 py-6 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileNavOpen(false); }}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-display text-sm transition-all ${
                  active
                    ? dark
                      ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/40'
                      : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/40'
                    : dark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className={`font-mono-lab text-[0.65rem] tracking-widest ${active ? 'text-cyan-500' : 'text-slate-500'}`}>
                  {item.tag}
                </span>
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-cyan-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User block */}
      <div className={`px-3 py-4 border-t ${dark ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <div className={`px-3 py-3 mb-3 rounded-lg ${dark ? 'bg-slate-900/60' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-display font-semibold">
              {user.firstName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className={`text-sm font-display font-semibold truncate ${textMain}`}>
                {user.firstName} {user.lastName}
              </div>
              <div className={`text-xs truncate ${textDim}`}>{user.email}</div>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-display text-sm font-medium transition-all ${
            dark
              ? 'text-slate-300 hover:text-white hover:bg-slate-900/80 ring-1 ring-slate-800 hover:ring-cyan-500/40'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 ring-1 ring-slate-200 hover:ring-cyan-500/40'
          }`}
        >
          <LogOut className="w-4 h-4" />
          Esci
        </button>
      </div>
    </aside>
  );

  // Reusable stat card
  const StatCard = ({ icon: Icon, label, value, tag }: { icon: React.ElementType; label: string; value: React.ReactNode; tag: string }) => (
    <div className={`relative overflow-hidden rounded-xl p-5 border transition-all duration-300 ${surface} ${surfaceHover}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'
        }`}>
          <Icon className="w-5 h-5 text-cyan-500" />
        </div>
        <span className={`font-mono-lab text-[0.6rem] tracking-[0.25em] uppercase ${textDim}`}>{tag}</span>
      </div>
      <div className={`font-display text-3xl font-semibold tracking-tight ${textMain}`}>{value}</div>
      <div className={`font-mono-lab text-[0.65rem] tracking-[0.2em] uppercase mt-1 ${textMuted}`}>{label}</div>
    </div>
  );

  // ====== Tab: Overview ======
  const OverviewTab = () => {
    const activeTrials = trials.filter((t) => t.status === 'active');
    return (
      <div className="space-y-10">
        {/* Welcome */}
        <section className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 ${surface}`}>
          <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500 mb-3">
                // Benvenuto
              </p>
              <h1 className={`font-display text-3xl md:text-4xl font-semibold tracking-tight ${textMain}`}>
                Ciao, <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{user.firstName}</span>
              </h1>
              <p className={`mt-2 text-sm ${textMuted}`}>
                Membro dal {user.joinDate}. Hai <span className="text-cyan-500 font-semibold">{activeTrials.length}</span> prove
                e <span className="text-cyan-500 font-semibold">{subscriptions.length}</span> abbonamenti attivi.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-display text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/30 transition-all"
              >
                <Package className="w-4 h-4" /> Esplora catalogo
              </Link>
              <Link
                to="/trials"
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-display text-sm font-semibold transition-all ${
                  dark ? 'bg-slate-900 text-slate-200 ring-1 ring-slate-800 hover:ring-cyan-500/40' : 'bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-cyan-500/50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-cyan-500" /> Prove gratuite
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-3.5 h-3.5 text-cyan-500" />
            <h2 className={`font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500`}>// Metriche</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Package} label="Catalogo" value={totalProducts} tag="01" />
            <StatCard icon={Clock} label="Prove attive" value={activeTrials.length} tag="02" />
            <StatCard icon={CreditCard} label="Abbonamenti" value={subscriptions.length} tag="03" />
            <StatCard icon={TrendingUp} label="Performance mese" value="+24%" tag="04" />
          </div>
        </section>

        {/* Active trials */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <h2 className={`font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500`}>// Prove in corso</h2>
            </div>
            {activeTrials.length > 0 && (
              <button onClick={() => setActiveTab('trials')} className="text-xs text-cyan-500 hover:text-cyan-400 font-display">
                Vedi tutte →
              </button>
            )}
          </div>
          {activeTrials.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {activeTrials.slice(0, 4).map((trial) => {
                const isCourse = trial.productCategory === 'Formazione';
                const progress = isCourse ? trialsProgress[trial.productId] || 0 : 0;
                return (
                  <div key={trial.id} className={`rounded-xl border p-5 ${surface} ${surfaceHover} transition-all`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
                          {isCourse ? <BookOpen className="w-4 h-4 text-cyan-500" /> : <Package className="w-4 h-4 text-cyan-500" />}
                        </div>
                        <div className="min-w-0">
                          <div className={`font-display font-semibold truncate ${textMain}`}>{trial.productName}</div>
                          <div className={`text-xs ${textDim}`}>Avviata il {new Date(trial.startDate).toLocaleDateString('it-IT')}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display text-2xl font-semibold text-cyan-500">{trial.daysRemaining}</div>
                        <div className={`font-mono-lab text-[0.55rem] tracking-[0.25em] uppercase ${textDim}`}>giorni</div>
                      </div>
                    </div>
                    {isCourse && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className={textMuted}>Progresso</span>
                          <span className="text-cyan-500 font-semibold">{progress}%</span>
                        </div>
                        <div className={`w-full rounded-full h-1.5 ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(isCourse ? `/course/${trial.productId}/manage-trial` : `/trial-activation/${trial.productId}`)}
                        className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-cyan-500/20 transition-all"
                      >Gestisci</button>
                      <Link
                        to={`/products?product=${trial.productId}`}
                        className={`px-3 py-2 rounded-lg text-sm font-display font-semibold transition-all ${dark ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50'}`}
                      >Abbonati</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="Nessuna prova attiva"
              desc="Attiva una prova gratuita per esplorare tool e corsi senza impegno."
              ctaLabel="Scopri le prove"
              ctaTo="/trials"
            />
          )}
        </section>

        {/* Active subscriptions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-cyan-500" />
              <h2 className={`font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500`}>// Abbonamenti attivi</h2>
            </div>
            {subscriptions.length > 0 && (
              <button onClick={() => setActiveTab('subscriptions')} className="text-xs text-cyan-500 hover:text-cyan-400 font-display">
                Vedi tutti →
              </button>
            )}
          </div>
          {subscriptions.length > 0 ? (
            <div className="space-y-3">
              {subscriptions.slice(0, 3).map((s) => (
                <div key={s.id} className={`rounded-xl border p-5 ${surface} ${surfaceHover} transition-all flex items-center justify-between gap-4`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
                      <Package className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div className="min-w-0">
                      <div className={`font-display font-semibold truncate ${textMain}`}>{s.productName}</div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={textMuted}>{s.plan || 'Mensile'}</span>
                        <span className="inline-flex items-center gap-1 text-emerald-500">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Attivo
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('subscriptions')}
                    className={`px-3 py-2 rounded-lg text-sm font-display font-semibold transition-all ${dark ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50'}`}
                  >Gestisci</button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CreditCard}
              title="Nessun abbonamento attivo"
              desc="Esplora il catalogo o avvia una prova prima di sottoscrivere un piano."
              ctaLabel="Vedi catalogo"
              ctaTo="/products"
            />
          )}
        </section>

        {/* Quick actions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-3.5 h-3.5 text-cyan-500" />
            <h2 className={`font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500`}>// Azioni rapide</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { to: '/products', icon: Package, title: 'Catalogo', desc: 'Tool e corsi disponibili' },
              { to: '/trials', icon: Sparkles, title: 'Prove gratuite', desc: '60 giorni senza carta' },
              { to: '/centro-aiuto', icon: AlertCircle, title: 'Supporto', desc: 'Assistenza dedicata' },
              { to: '/community', icon: User, title: 'Community', desc: 'Unisciti al lab' },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.to} to={a.to} className={`group rounded-xl border p-4 transition-all ${surface} ${surfaceHover}`}>
                  <Icon className="w-5 h-5 text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
                  <div className={`font-display font-semibold text-sm ${textMain}`}>{a.title}</div>
                  <div className={`text-xs mt-1 ${textDim}`}>{a.desc}</div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    );
  };

  // ====== Tab: Trials ======
  const TrialsTab = () => {
    const active = trials.filter((t) => t.status === 'active');
    const completed = trials.filter((t) => t.status === 'completed' || t.status === 'expired');
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={Clock} label="Attive" value={active.length} tag="01" />
          <StatCard icon={CheckCircle} label="Completate" value={trials.filter((t) => t.status === 'completed').length} tag="02" />
          <StatCard icon={AlertCircle} label="Scadute" value={trials.filter((t) => t.status === 'expired').length} tag="03" />
        </div>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-3.5 h-3.5 text-cyan-500" />
            <h2 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Prove attive</h2>
          </div>
          {active.length > 0 ? (
            <div className="space-y-3">
              {active.map((trial) => {
                const isCourse = trial.productCategory === 'Formazione';
                const progress = isCourse ? trialsProgress[trial.productId] || 0 : 0;
                const expiring = trial.daysRemaining <= 7;
                return (
                  <div key={trial.id} className={`rounded-xl border p-5 ${surface} ${surfaceHover} transition-all`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
                            {isCourse ? <BookOpen className="w-5 h-5 text-cyan-500" /> : <Package className="w-5 h-5 text-cyan-500" />}
                          </div>
                          <div className="min-w-0">
                            <div className={`font-display text-lg font-semibold ${textMain}`}>{trial.productName}</div>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                              <span className="inline-flex items-center gap-1 text-emerald-500">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Attiva
                              </span>
                              <span className={textDim}>· avviata {new Date(trial.startDate).toLocaleDateString('it-IT')}</span>
                              {isCourse && (
                                <span className={`font-mono-lab text-[0.55rem] tracking-widest uppercase px-1.5 py-0.5 rounded ${
                                  dark ? 'bg-cyan-500/10 text-cyan-300' : 'bg-cyan-50 text-cyan-700'
                                }`}>Corso</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isCourse && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className={textMuted}>Progresso</span>
                              <span className="text-cyan-500 font-semibold">{progress}%</span>
                            </div>
                            <div className={`w-full rounded-full h-1.5 ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        )}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display font-medium ${
                          expiring
                            ? dark ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/30'
                            : dark ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/30'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          {trial.daysRemaining} giorni rimanenti{expiring && ' · in scadenza'}
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-2 md:min-w-[180px]">
                        <button
                          onClick={() => navigate(isCourse ? `/course/${trial.productId}/manage-trial` : `/trial-activation/${trial.productId}`)}
                          className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-cyan-500/20 transition-all"
                        >Gestisci</button>
                        <Link
                          to={`/products?product=${trial.productId}`}
                          className={`flex-1 text-center px-4 py-2 rounded-lg text-sm font-display font-semibold transition-all ${dark ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50'}`}
                        >Abbonati</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="Nessuna prova attiva"
              desc="Attiva una prova gratuita di 60 giorni — nessuna carta richiesta."
              ctaLabel="Scopri le prove"
              ctaTo="/trials"
            />
          )}
        </section>

        {completed.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-500" />
              <h2 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Storico</h2>
            </div>
            <div className="space-y-2">
              {completed.map((trial) => (
                <div key={trial.id} className={`rounded-lg border p-4 flex items-center justify-between gap-3 ${
                  dark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="min-w-0">
                    <div className={`font-display font-medium text-sm truncate ${textMain}`}>{trial.productName}</div>
                    <div className={`text-xs ${textDim}`}>
                      {trial.status === 'expired' ? 'Scaduta' : 'Completata'} il{' '}
                      {new Date(trial.endDate || trial.startDate).toLocaleDateString('it-IT')}
                    </div>
                  </div>
                  <Link
                    to={`/products?product=${trial.productId}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold text-cyan-500 hover:text-cyan-400"
                  >Abbonati →</Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  // ====== Tab: Subscriptions ======
  const SubscriptionsTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={CheckCircle} label="Attivi" value={subscriptions.length} tag="01" />
        <StatCard icon={Package} label="Catalogo" value={totalProducts} tag="02" />
        <StatCard icon={TrendingUp} label="Performance" value="+24%" tag="03" />
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-3.5 h-3.5 text-cyan-500" />
          <h2 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// I tuoi abbonamenti</h2>
        </div>
        {subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className={`rounded-xl border p-6 ${surface} ${surfaceHover} transition-all`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${dark ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : 'bg-cyan-50 ring-1 ring-cyan-500/30'}`}>
                        <Package className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div className="min-w-0">
                        <div className={`font-display text-xl font-semibold ${textMain}`}>{sub.productName}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                          <span className="inline-flex items-center gap-1 text-emerald-500">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Attivo
                          </span>
                          <span className={textDim}>· {sub.plan || 'Piano mensile'}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`space-y-1.5 text-sm ${textMuted}`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Attivato il {new Date(sub.startDate || Date.now()).toLocaleDateString('it-IT')}
                      </div>
                      {sub.nextBilling && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          Rinnovo previsto: {new Date(sub.nextBilling).toLocaleDateString('it-IT')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex lg:flex-col gap-2 lg:min-w-[180px]">
                    <Link
                      to={`/products?product=${sub.productId}`}
                      className="flex-1 text-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-cyan-500/20 transition-all"
                    >Gestisci</Link>
                    <button className={`flex-1 px-4 py-2 rounded-lg text-sm font-display font-semibold transition-all ${dark ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50'}`}>
                      Modifica piano
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CreditCard}
            title="Nessun abbonamento attivo"
            desc="Avvia un piano per accedere a tool e corsi senza limiti di tempo."
            ctaLabel="Vedi catalogo"
            ctaTo="/products"
          />
        )}
      </section>
    </div>
  );

  // ====== Tab: Settings ======
  const SettingsTab = () => (
    <div className="max-w-3xl space-y-6">
      {settingsSaved && (
        <div className={`rounded-lg px-4 py-3 flex items-center gap-3 ${dark ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30' : 'bg-emerald-50 ring-1 ring-emerald-500/30'}`}>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-500">Impostazioni salvate</p>
        </div>
      )}
      {settingsError && (
        <div className={`rounded-lg px-4 py-3 flex items-center gap-3 ${dark ? 'bg-rose-500/10 ring-1 ring-rose-500/30' : 'bg-rose-50 ring-1 ring-rose-500/30'}`}>
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <p className="text-sm font-medium text-rose-500">{settingsError}</p>
        </div>
      )}

      <section className={`rounded-xl border p-6 ${surface}`}>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-3.5 h-3.5 text-cyan-500" />
          <h3 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Profilo</h3>
        </div>
        <p className={`text-sm mb-6 ${textMuted}`}>Le informazioni del tuo account</p>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={`block text-xs font-display font-medium mb-1.5 ${textMain}`}>Nome</label>
            <input
              type="text" name="firstName" value={settingsData.firstName} onChange={handleSettingsChange}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${inputBase}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-display font-medium mb-1.5 ${textMain}`}>Cognome</label>
            <input
              type="text" name="lastName" value={settingsData.lastName} onChange={handleSettingsChange}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${inputBase}`}
            />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-xs font-display font-medium mb-1.5 ${textMain}`}>Email</label>
            <div className="relative">
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${textDim}`} />
              <input
                type="email" name="email" value={settingsData.email} onChange={handleSettingsChange}
                className={`w-full pl-10 pr-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${inputBase}`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={`rounded-xl border p-6 ${surface}`}>
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-3.5 h-3.5 text-cyan-500" />
          <h3 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Sicurezza</h3>
        </div>
        <p className={`text-sm mb-6 ${textMuted}`}>Cambia la password del tuo account</p>

        <div className="space-y-5">
          {[
            { name: 'currentPassword', label: 'Password attuale' },
            { name: 'newPassword',     label: 'Nuova password' },
            { name: 'confirmPassword', label: 'Conferma nuova password' },
          ].map((f) => (
            <div key={f.name}>
              <label className={`block text-xs font-display font-medium mb-1.5 ${textMain}`}>{f.label}</label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${textDim}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name={f.name}
                  value={(settingsData as any)[f.name]}
                  onChange={handleSettingsChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${inputBase}`}
                />
                {f.name === 'currentPassword' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${textDim} hover:text-cyan-500`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-cyan-500/20 transition-all"
        >
          <Save className="w-4 h-4" /> Salva modifiche
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-lg text-sm font-display font-semibold transition-all ${dark ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50'}`}
        >Annulla</button>
      </div>

      <section className={`rounded-xl border p-6 ${dark ? 'bg-rose-500/5 border-rose-500/30' : 'bg-rose-50 border-rose-300'}`}>
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <h3 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-rose-500">// Zona pericolosa</h3>
        </div>
        <p className={`text-sm mb-4 ${textMuted}`}>L'eliminazione dell'account è permanente e non reversibile.</p>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/30 text-sm font-display font-semibold hover:bg-rose-500/20 transition-all">
          <Trash2 className="w-4 h-4" /> Elimina account
        </button>
      </section>
    </div>
  );

  // ====== Empty state ======
  function EmptyState({ icon: Icon, title, desc, ctaLabel, ctaTo }: { icon: React.ElementType; title: string; desc: string; ctaLabel: string; ctaTo: string }) {
    return (
      <div className={`rounded-xl border p-10 text-center ${surface}`}>
        <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${dark ? 'bg-slate-900' : 'bg-slate-100'}`}>
          <Icon className={`w-5 h-5 ${textDim}`} />
        </div>
        <h3 className={`font-display text-lg font-semibold mb-1 ${textMain}`}>{title}</h3>
        <p className={`text-sm max-w-md mx-auto mb-5 ${textMuted}`}>{desc}</p>
        <Link
          to={ctaTo}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-cyan-500/20 transition-all"
        >
          {ctaLabel} →
        </Link>
      </div>
    );
  }

  // ====== Layout ======
  return (
    <AnimatedPage>
      <div className={`min-h-screen ${dark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${dark ? '#ffffff' : '#0b1e3f'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? '#ffffff' : '#0b1e3f'} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="flex min-h-screen relative">
          {/* Sidebar desktop */}
          <div className="hidden lg:flex w-64 shrink-0">
            <Sidebar />
          </div>

          {/* Mobile sidebar drawer */}
          {mobileNavOpen && (
            <>
              <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileNavOpen(false)} />
              <div className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden">
                <Sidebar />
              </div>
            </>
          )}

          {/* Main */}
          <main className="flex-1 min-w-0 flex flex-col">
            {/* Topbar */}
            <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${
              dark ? 'bg-black/70 border-slate-800/80' : 'bg-white/70 border-slate-200'
            }`}>
              <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileNavOpen(true)}
                    className={`lg:hidden p-2 rounded-lg ${dark ? 'text-slate-300 hover:bg-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <div className={`font-mono-lab text-[0.65rem] tracking-[0.3em] uppercase ${textDim}`}>
                      // Nexora Lab Dashboard
                    </div>
                    <h1 className={`font-display text-xl md:text-2xl font-semibold tracking-tight truncate ${textMain}`}>
                      {activeTitle?.label}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className={`p-2 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900' : 'text-slate-500 hover:text-cyan-600 hover:bg-slate-100'}`}>
                    <Bell className="w-4 h-4" />
                  </button>
                  <Link to="/" className={`hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-medium transition-all ${
                    dark ? 'text-slate-300 hover:text-white hover:bg-slate-900 ring-1 ring-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 ring-1 ring-slate-200'
                  }`}>
                    <Home className="w-3.5 h-3.5" /> Home
                  </Link>
                  <button
                    onClick={() => setMobileNavOpen(true)}
                    className={`lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-display font-semibold text-sm`}
                  >
                    {user.firstName.charAt(0).toUpperCase()}
                  </button>
                </div>
              </div>

              {/* Mobile tab pills */}
              <div className={`lg:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto`}>
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium whitespace-nowrap transition-all ${
                      activeTab === item.id
                        ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/40'
                        : dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >{item.label}</button>
                ))}
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 px-4 md:px-8 py-8">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && <OverviewTab />}
                  {activeTab === 'trials' && <TrialsTab />}
                  {activeTab === 'subscriptions' && <SubscriptionsTab />}
                  {activeTab === 'settings' && <SettingsTab />}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Dashboard;
