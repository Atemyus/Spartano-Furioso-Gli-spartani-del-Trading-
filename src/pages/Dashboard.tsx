import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Package, Clock, CreditCard, Settings, LogOut, CheckCircle,
  AlertCircle, Rocket, User, BookOpen, Bell, Calendar, Home, Lock, Mail,
  Eye, EyeOff, Save, Trash2, Menu, ChevronRight, Activity, Sparkles,
  Camera, Inbox, BarChart3, Info, Loader2, X,
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS, API_URL } from '../config/api';

type Tab = 'overview' | 'trials' | 'subscriptions' | 'activity' | 'notifications' | 'settings';

const NAV: { id: Tab; label: string; icon: React.ElementType; tag: string }[] = [
  { id: 'overview',      label: 'Panoramica',   icon: Home,        tag: '01' },
  { id: 'trials',        label: 'Prove',        icon: Clock,       tag: '02' },
  { id: 'subscriptions', label: 'Abbonamenti',  icon: CreditCard,  tag: '03' },
  { id: 'activity',      label: 'Attività',     icon: BarChart3,   tag: '04' },
  { id: 'notifications', label: 'Notifiche',    icon: Bell,        tag: '05' },
  { id: 'settings',      label: 'Profilo',      icon: Settings,    tag: '06' },
];

type NotificationItem = {
  id: string;
  type: 'trial' | 'subscription' | 'welcome' | 'info';
  title: string;
  message: string;
  time: string; // ISO
  link?: string;
};

type ActivityEvent = {
  id: string;
  type: 'trial-start' | 'subscription-start' | 'course-progress' | 'account-created';
  title: string;
  meta?: string;
  time: string;
  icon: React.ElementType;
  iconColor: string;
};

const READ_KEY = 'nexora.notif.read';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [trials, setTrials] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [trialsProgress, setTrialsProgress] = useState<{ [k: string]: number }>({});
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState<any>(() => {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  });
  const [settingsData, setSettingsData] = useState({
    firstName: '', lastName: '', email: '',
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifications
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const [readMap, setReadMap] = useState<{ [id: string]: true }>(() => {
    try {
      const s = localStorage.getItem(READ_KEY);
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });

  const userInfo = useMemo(() => {
    if (!userData) {
      return {
        firstName: 'Trader', lastName: '',
        email: 'utente@esempio.com',
        joinDate: new Date().toLocaleDateString('it-IT'),
        createdAt: new Date().toISOString(),
        avatar: null as string | null,
      };
    }
    const np = (userData.name || '').split(' ');
    return {
      firstName: np[0] || 'Trader',
      lastName: np.slice(1).join(' ') || '',
      email: userData.email,
      joinDate: new Date(userData.createdAt || Date.now()).toLocaleDateString('it-IT', {
        day: 'numeric', month: 'long', year: 'numeric',
      }),
      createdAt: userData.createdAt || new Date().toISOString(),
      avatar: userData.avatar || null,
    };
  }, [userData]);

  useEffect(() => {
    setSettingsData((p) => ({
      ...p,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
    }));
  }, [userInfo.firstName, userInfo.lastName, userInfo.email]);

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
      if (!token || !userData?.id) return;
      const courseT = trials.filter((t) => t.productCategory === 'Formazione' && t.status === 'active');
      const map: { [k: string]: number } = {};
      for (const tr of courseT) {
        try {
          const r = await fetch(`${API_URL}/api/courses/${tr.productId}/progress/${userData.id}`, {
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
  }, [trials, userData?.id]);

  // ====== Notifications derived from real data ======
  const notifications = useMemo<NotificationItem[]>(() => {
    const out: NotificationItem[] = [];
    const now = new Date();

    // Trial in scadenza ≤ 7 giorni
    trials.filter((t) => t.status === 'active' && t.daysRemaining <= 7).forEach((t) => {
      out.push({
        id: `trial-exp-${t.id}`,
        type: 'trial',
        title: 'Prova in scadenza',
        message: `${t.productName}: restano ${t.daysRemaining} giorni`,
        time: new Date(now.getTime() - (60 - t.daysRemaining) * 86400000).toISOString(),
        link: 'trials',
      });
    });

    // Abbonamenti in rinnovo ≤ 7 giorni
    subscriptions.forEach((s) => {
      if (s.nextBilling) {
        const next = new Date(s.nextBilling);
        const days = Math.ceil((next.getTime() - now.getTime()) / 86400000);
        if (days >= 0 && days <= 7) {
          out.push({
            id: `sub-renew-${s.id}`,
            type: 'subscription',
            title: 'Rinnovo abbonamento',
            message: `${s.productName} si rinnova fra ${days} giorni`,
            time: now.toISOString(),
            link: 'subscriptions',
          });
        }
      }
    });

    // Welcome (account creato negli ultimi 7 giorni)
    if (userInfo.createdAt) {
      const created = new Date(userInfo.createdAt);
      const ageDays = (now.getTime() - created.getTime()) / 86400000;
      if (ageDays < 7) {
        out.push({
          id: 'welcome',
          type: 'welcome',
          title: 'Benvenuto in Nexora Lab',
          message: 'Esplora il catalogo e attiva una prova gratuita per iniziare.',
          time: created.toISOString(),
          link: 'overview',
        });
      }
    }

    // Tip permanente
    out.push({
      id: 'tip-explore',
      type: 'info',
      title: 'Suggerimento',
      message: 'Tutti i nostri prodotti hanno 60 giorni di prova gratuita.',
      time: new Date(now.getTime() - 3 * 86400000).toISOString(),
    });

    return out.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [trials, subscriptions, userInfo.createdAt]);

  const unreadCount = useMemo(() => notifications.filter((n) => !readMap[n.id]).length, [notifications, readMap]);

  const markRead = (id: string) => {
    if (readMap[id]) return;
    const next = { ...readMap, [id]: true as true };
    setReadMap(next);
    try { localStorage.setItem(READ_KEY, JSON.stringify(next)); } catch {}
  };
  const markAllRead = () => {
    const next = { ...readMap };
    notifications.forEach((n) => { next[n.id] = true; });
    setReadMap(next);
    try { localStorage.setItem(READ_KEY, JSON.stringify(next)); } catch {}
  };

  // ====== Activity timeline derived ======
  const activity = useMemo<ActivityEvent[]>(() => {
    const out: ActivityEvent[] = [];
    if (userInfo.createdAt) {
      out.push({
        id: 'created',
        type: 'account-created',
        title: 'Account creato',
        time: userInfo.createdAt,
        icon: User,
        iconColor: 'text-cyan-500',
      });
    }
    trials.forEach((t) => {
      out.push({
        id: `t-${t.id}`,
        type: 'trial-start',
        title: `Prova avviata: ${t.productName}`,
        meta: t.status === 'active' ? `Attiva · ${t.daysRemaining} giorni` : t.status === 'completed' ? 'Completata' : 'Scaduta',
        time: t.startDate,
        icon: Clock,
        iconColor: 'text-blue-500',
      });
    });
    subscriptions.forEach((s) => {
      out.push({
        id: `s-${s.id}`,
        type: 'subscription-start',
        title: `Abbonamento attivato: ${s.productName}`,
        meta: s.plan || 'Mensile',
        time: s.startDate || s.createdAt,
        icon: CreditCard,
        iconColor: 'text-emerald-500',
      });
    });
    Object.entries(trialsProgress).forEach(([pid, prog]) => {
      const trial = trials.find((t) => t.productId === pid);
      if (trial && prog > 0) {
        out.push({
          id: `prog-${pid}`,
          type: 'course-progress',
          title: `Progresso corso: ${trial.productName}`,
          meta: `${prog}% completato`,
          time: trial.startDate,
          icon: BookOpen,
          iconColor: 'text-violet-500',
        });
      }
    });
    return out
      .filter((e) => e.time)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [trials, subscriptions, trialsProgress, userInfo.createdAt]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsData({ ...settingsData, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSettingsError(''); setSettingsSaved(false);
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
          name: `${settingsData.firstName} ${settingsData.lastName}`.trim(),
          email: settingsData.email,
          currentPassword: settingsData.currentPassword,
          newPassword: settingsData.newPassword,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        const merged = { ...userData, ...d.user };
        localStorage.setItem('user', JSON.stringify(merged));
        setUserData(merged);
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

  const handleAvatarPick = () => {
    if (avatarUploading) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');

    if (!file.type.startsWith('image/')) {
      setAvatarError('Seleziona un file immagine'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('L\'immagine deve essere sotto i 5MB'); return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    setAvatarUploading(true);
    try {
      // Upload file
      const fd = new FormData();
      fd.append('file', file);
      const upRes = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: fd });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.fileUrl) throw new Error(upData.error || 'Upload fallito');
      const avatarUrl = upData.fileUrl.startsWith('http') ? upData.fileUrl : `${API_URL}${upData.fileUrl}`;

      // Save URL to profile
      const profRes = await fetch(API_ENDPOINTS.updateProfile, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar: avatarUrl }),
      });
      const profData = await profRes.json();
      if (!profRes.ok) throw new Error(profData.message || 'Salvataggio avatar fallito');

      const merged = { ...userData, avatar: avatarUrl };
      localStorage.setItem('user', JSON.stringify(merged));
      setUserData(merged);
    } catch (err: any) {
      setAvatarError(err.message || 'Errore durante l\'upload');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setAvatarUploading(true); setAvatarError('');
    try {
      const res = await fetch(API_ENDPOINTS.updateProfile, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar: '' }),
      });
      if (res.ok) {
        const merged = { ...userData, avatar: null };
        localStorage.setItem('user', JSON.stringify(merged));
        setUserData(merged);
      }
    } catch {
      setAvatarError('Errore durante la rimozione');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Close bell dropdown on click outside
  useEffect(() => {
    if (!bellOpen) return;
    const onClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [bellOpen]);

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
  const Avatar = ({ size = 36 }: { size?: number }) => {
    const initials = (userInfo.firstName.charAt(0) + (userInfo.lastName?.charAt(0) || '')).toUpperCase();
    if (userInfo.avatar) {
      return (
        <img
          src={userInfo.avatar}
          alt={userInfo.firstName}
          className="rounded-lg object-cover"
          style={{ width: size, height: size }}
        />
      );
    }
    return (
      <div
        className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-display font-semibold"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        {initials}
      </div>
    );
  };

  const Sidebar = () => (
    <aside className={`flex flex-col justify-between border-r ${dark ? 'bg-black/80 border-slate-800/80' : 'bg-white border-slate-200'} backdrop-blur-md`}>
      <div>
        {/* Logo grande */}
        <div className={`px-6 pt-7 pb-5 border-b ${dark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <Link to="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="Nexora Lab"
              className={`h-14 w-auto object-contain transition-transform group-hover:scale-[1.02] ${
                dark ? '' : 'bg-slate-900 rounded-xl px-3 py-1.5'
              }`}
            />
          </Link>
          <p className={`mt-4 font-mono-lab text-[0.65rem] tracking-[0.3em] uppercase ${textDim}`}>
            // Dashboard
          </p>
        </div>

        <nav className="px-3 py-5 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            const isNotif = item.id === 'notifications';
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
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {isNotif && unreadCount > 0 && (
                  <span className="px-1.5 min-w-[1.25rem] h-5 inline-flex items-center justify-center rounded-full bg-cyan-500 text-white text-[0.65rem] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {active && !isNotif && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`px-3 py-4 border-t ${dark ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <div className={`px-3 py-3 mb-3 rounded-lg ${dark ? 'bg-slate-900/60' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <Avatar size={40} />
            <div className="min-w-0 flex-1">
              <div className={`text-sm font-display font-semibold truncate ${textMain}`}>
                {userInfo.firstName} {userInfo.lastName}
              </div>
              <div className={`text-xs truncate ${textDim}`}>{userInfo.email}</div>
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

  function EmptyState({ icon: Icon, title, desc, ctaLabel, ctaTo }: { icon: React.ElementType; title: string; desc: string; ctaLabel?: string; ctaTo?: string }) {
    return (
      <div className={`rounded-xl border p-10 text-center ${surface}`}>
        <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${dark ? 'bg-slate-900' : 'bg-slate-100'}`}>
          <Icon className={`w-5 h-5 ${textDim}`} />
        </div>
        <h3 className={`font-display text-lg font-semibold mb-1 ${textMain}`}>{title}</h3>
        <p className={`text-sm max-w-md mx-auto mb-5 ${textMuted}`}>{desc}</p>
        {ctaLabel && ctaTo && (
          <Link to={ctaTo} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-cyan-500/20 transition-all">
            {ctaLabel} →
          </Link>
        )}
      </div>
    );
  }

  const formatRelativeTime = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'adesso';
    if (diff < 3600) return `${Math.floor(diff / 60)}m fa`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h fa`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}g fa`;
    return new Date(iso).toLocaleDateString('it-IT');
  };

  const NotificationIcon: React.FC<{ type: NotificationItem['type']; }> = ({ type }) => {
    const map = {
      trial: { Icon: Clock, color: 'text-amber-500', bg: dark ? 'bg-amber-500/10' : 'bg-amber-50' },
      subscription: { Icon: CreditCard, color: 'text-emerald-500', bg: dark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
      welcome: { Icon: Sparkles, color: 'text-cyan-500', bg: dark ? 'bg-cyan-500/10' : 'bg-cyan-50' },
      info: { Icon: Info, color: 'text-blue-500', bg: dark ? 'bg-blue-500/10' : 'bg-blue-50' },
    }[type];
    const { Icon, color, bg } = map;
    return (
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    );
  };

  // ====== Tab: Overview ======
  const OverviewTab = () => {
    const activeTrials = trials.filter((t) => t.status === 'active');
    return (
      <div className="space-y-10">
        <section className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 ${surface}`}>
          <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500 mb-3">// Benvenuto</p>
              <h1 className={`font-display text-3xl md:text-4xl font-semibold tracking-tight ${textMain}`}>
                Ciao, <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{userInfo.firstName}</span>
              </h1>
              <p className={`mt-2 text-sm ${textMuted}`}>
                Membro dal {userInfo.joinDate}. Hai <span className="text-cyan-500 font-semibold">{activeTrials.length}</span> prove
                e <span className="text-cyan-500 font-semibold">{subscriptions.length}</span> abbonamenti attivi.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-display text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/30 transition-all">
                <Package className="w-4 h-4" /> Esplora catalogo
              </Link>
              <Link to="/trials" className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-display text-sm font-semibold transition-all ${dark ? 'bg-slate-900 text-slate-200 ring-1 ring-slate-800 hover:ring-cyan-500/40' : 'bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-cyan-500/50'}`}>
                <Sparkles className="w-4 h-4 text-cyan-500" /> Prove gratuite
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-3.5 h-3.5 text-cyan-500" />
            <h2 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Metriche</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Package} label="Catalogo" value={totalProducts} tag="01" />
            <StatCard icon={Clock} label="Prove attive" value={activeTrials.length} tag="02" />
            <StatCard icon={CreditCard} label="Abbonamenti" value={subscriptions.length} tag="03" />
            <StatCard icon={Bell} label="Notifiche" value={unreadCount} tag="04" />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <h2 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Prove in corso</h2>
            </div>
            {activeTrials.length > 0 && (
              <button onClick={() => setActiveTab('trials')} className="text-xs text-cyan-500 hover:text-cyan-400 font-display">Vedi tutte →</button>
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
                      <button onClick={() => navigate(isCourse ? `/course/${trial.productId}/manage-trial` : `/trial-activation/${trial.productId}`)} className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-cyan-500/20 transition-all">Gestisci</button>
                      <Link to={`/products?product=${trial.productId}`} className={`px-3 py-2 rounded-lg text-sm font-display font-semibold transition-all ${dark ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50'}`}>Abbonati</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Clock} title="Nessuna prova attiva" desc="Attiva una prova gratuita per esplorare tool e corsi senza impegno." ctaLabel="Scopri le prove" ctaTo="/trials" />
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-3.5 h-3.5 text-cyan-500" />
            <h2 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Azioni rapide</h2>
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
                                <span className={`font-mono-lab text-[0.55rem] tracking-widest uppercase px-1.5 py-0.5 rounded ${dark ? 'bg-cyan-500/10 text-cyan-300' : 'bg-cyan-50 text-cyan-700'}`}>Corso</span>
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
                        <button onClick={() => navigate(isCourse ? `/course/${trial.productId}/manage-trial` : `/trial-activation/${trial.productId}`)} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-cyan-500/20 transition-all">Gestisci</button>
                        <Link to={`/products?product=${trial.productId}`} className={`flex-1 text-center px-4 py-2 rounded-lg text-sm font-display font-semibold transition-all ${dark ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50'}`}>Abbonati</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Clock} title="Nessuna prova attiva" desc="Attiva una prova gratuita di 60 giorni — nessuna carta richiesta." ctaLabel="Scopri le prove" ctaTo="/trials" />
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
                <div key={trial.id} className={`rounded-lg border p-4 flex items-center justify-between gap-3 ${dark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="min-w-0">
                    <div className={`font-display font-medium text-sm truncate ${textMain}`}>{trial.productName}</div>
                    <div className={`text-xs ${textDim}`}>
                      {trial.status === 'expired' ? 'Scaduta' : 'Completata'} il{' '}
                      {new Date(trial.endDate || trial.startDate).toLocaleDateString('it-IT')}
                    </div>
                  </div>
                  <Link to={`/products?product=${trial.productId}`} className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold text-cyan-500 hover:text-cyan-400">Abbonati →</Link>
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
                    <Link to={`/products?product=${sub.productId}`} className="flex-1 text-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-cyan-500/20 transition-all">Gestisci</Link>
                    <button className={`flex-1 px-4 py-2 rounded-lg text-sm font-display font-semibold transition-all ${dark ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50'}`}>Modifica piano</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={CreditCard} title="Nessun abbonamento attivo" desc="Avvia un piano per accedere a tool e corsi senza limiti di tempo." ctaLabel="Vedi catalogo" ctaTo="/products" />
        )}
      </section>
    </div>
  );

  // ====== Tab: Activity ======
  const ActivityTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Activity} label="Eventi totali" value={activity.length} tag="01" />
        <StatCard icon={Clock} label="Prove avviate" value={trials.length} tag="02" />
        <StatCard icon={CreditCard} label="Abbonamenti" value={subscriptions.length} tag="03" />
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-500" />
          <h2 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Timeline attività</h2>
        </div>
        {activity.length > 0 ? (
          <div className={`rounded-xl border ${surface}`}>
            <div className="relative pl-6 pr-5 py-2">
              <div className={`absolute left-[1.6rem] top-4 bottom-4 w-px ${dark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              {activity.map((ev, idx) => {
                const Icon = ev.icon;
                return (
                  <div key={ev.id} className={`relative py-4 ${idx < activity.length - 1 ? `border-b ${dark ? 'border-slate-800/60' : 'border-slate-100'}` : ''}`}>
                    <div className={`absolute -left-[0.05rem] top-4 w-8 h-8 rounded-lg flex items-center justify-center ring-4 ${dark ? 'bg-slate-900 ring-black' : 'bg-white ring-slate-50'}`}>
                      <Icon className={`w-4 h-4 ${ev.iconColor}`} />
                    </div>
                    <div className="ml-12">
                      <div className={`font-display font-semibold text-sm ${textMain}`}>{ev.title}</div>
                      <div className={`text-xs mt-0.5 ${textDim}`}>
                        {ev.meta && <>{ev.meta} · </>}
                        {formatRelativeTime(ev.time)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState icon={Activity} title="Nessuna attività" desc="Le tue azioni recenti appariranno qui." />
        )}
      </section>
    </div>
  );

  // ====== Tab: Notifications ======
  const NotificationsTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
          <StatCard icon={Bell} label="Totali" value={notifications.length} tag="01" />
          <StatCard icon={Inbox} label="Da leggere" value={unreadCount} tag="02" />
          <div className="hidden md:block" />
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="ml-4 hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-semibold text-cyan-500 hover:text-cyan-400 self-start">
            <CheckCircle className="w-3.5 h-3.5" /> Segna tutte come lette
          </button>
        )}
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-3.5 h-3.5 text-cyan-500" />
          <h2 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Centro notifiche</h2>
        </div>
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n) => {
              const isRead = !!readMap[n.id];
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    markRead(n.id);
                    if (n.link) setActiveTab(n.link as Tab);
                  }}
                  className={`w-full text-left rounded-xl border p-4 transition-all flex items-start gap-3 ${surface} ${surfaceHover} ${
                    !isRead ? (dark ? 'ring-1 ring-cyan-500/20' : 'ring-1 ring-cyan-500/30') : ''
                  }`}
                >
                  <NotificationIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`font-display font-semibold text-sm ${textMain}`}>{n.title}</div>
                      {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
                    </div>
                    <div className={`text-sm mt-0.5 ${textMuted}`}>{n.message}</div>
                    <div className={`text-xs mt-1.5 ${textDim}`}>{formatRelativeTime(n.time)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Bell} title="Nessuna notifica" desc="Ti avviseremo qui quando ci saranno aggiornamenti." />
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

      {/* Avatar */}
      <section className={`rounded-xl border p-6 ${surface}`}>
        <div className="flex items-center gap-2 mb-1">
          <Camera className="w-3.5 h-3.5 text-cyan-500" />
          <h3 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Avatar</h3>
        </div>
        <p className={`text-sm mb-5 ${textMuted}`}>Carica una foto del profilo (max 5MB, formato immagine).</p>

        <div className="flex items-center gap-5 flex-wrap">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl overflow-hidden ring-2 ring-cyan-500/30">
              <Avatar size={80} />
            </div>
            {avatarUploading && (
              <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAvatarPick}
              disabled={avatarUploading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-cyan-500/20 transition-all disabled:opacity-60"
            >
              <Camera className="w-4 h-4" /> {userInfo.avatar ? 'Cambia foto' : 'Carica foto'}
            </button>
            {userInfo.avatar && (
              <button
                type="button"
                onClick={handleAvatarRemove}
                disabled={avatarUploading}
                className={`px-4 py-2.5 rounded-lg text-sm font-display font-semibold transition-all disabled:opacity-60 ${dark ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-rose-500/40 hover:text-rose-400' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-rose-500/40 hover:text-rose-500'}`}
              >
                Rimuovi
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </div>
        {avatarError && <p className="mt-3 text-sm text-rose-500">{avatarError}</p>}
      </section>

      <section className={`rounded-xl border p-6 ${surface}`}>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-3.5 h-3.5 text-cyan-500" />
          <h3 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Profilo</h3>
        </div>
        <p className={`text-sm mb-6 ${textMuted}`}>Le informazioni del tuo account.</p>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={`block text-xs font-display font-medium mb-1.5 ${textMain}`}>Nome</label>
            <input type="text" name="firstName" value={settingsData.firstName} onChange={handleSettingsChange} className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${inputBase}`} />
          </div>
          <div>
            <label className={`block text-xs font-display font-medium mb-1.5 ${textMain}`}>Cognome</label>
            <input type="text" name="lastName" value={settingsData.lastName} onChange={handleSettingsChange} className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${inputBase}`} />
          </div>
          <div className="md:col-span-2">
            <label className={`block text-xs font-display font-medium mb-1.5 ${textMain}`}>Email</label>
            <div className="relative">
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${textDim}`} />
              <input type="email" name="email" value={settingsData.email} onChange={handleSettingsChange} className={`w-full pl-10 pr-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${inputBase}`} />
            </div>
          </div>
        </div>
      </section>

      <section className={`rounded-xl border p-6 ${surface}`}>
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-3.5 h-3.5 text-cyan-500" />
          <h3 className="font-mono-lab text-[0.7rem] tracking-[0.3em] uppercase text-cyan-500">// Sicurezza</h3>
        </div>
        <p className={`text-sm mb-6 ${textMuted}`}>Cambia la password del tuo account.</p>

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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${textDim} hover:text-cyan-500`}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <button onClick={handleSaveSettings} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-display font-semibold hover:shadow-md hover:shadow-cyan-500/20 transition-all">
          <Save className="w-4 h-4" /> Salva modifiche
        </button>
        <button onClick={() => setActiveTab('overview')} className={`px-5 py-2.5 rounded-lg text-sm font-display font-semibold transition-all ${dark ? 'bg-slate-900 text-slate-300 ring-1 ring-slate-800 hover:ring-cyan-500/40' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-cyan-500/50'}`}>Annulla</button>
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

  const tabContent: { [k in Tab]: React.ReactNode } = {
    overview: <OverviewTab />,
    trials: <TrialsTab />,
    subscriptions: <SubscriptionsTab />,
    activity: <ActivityTab />,
    notifications: <NotificationsTab />,
    settings: <SettingsTab />,
  };

  // ====== Layout ======
  return (
    <AnimatedPage>
      <div className={`min-h-screen ${dark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${dark ? '#ffffff' : '#0b1e3f'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? '#ffffff' : '#0b1e3f'} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="flex min-h-screen relative">
          <div className="hidden lg:flex w-64 shrink-0">
            <Sidebar />
          </div>

          <AnimatePresence>
            {mobileNavOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                  onClick={() => setMobileNavOpen(false)}
                />
                <motion.div
                  initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                  className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
                >
                  <Sidebar />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <main className="flex-1 min-w-0 flex flex-col">
            <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${dark ? 'bg-black/70 border-slate-800/80' : 'bg-white/70 border-slate-200'}`}>
              <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => setMobileNavOpen(true)} className={`lg:hidden p-2 rounded-lg ${dark ? 'text-slate-300 hover:bg-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}>
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <div className={`font-mono-lab text-[0.65rem] tracking-[0.3em] uppercase ${textDim}`}>// Nexora Lab Dashboard</div>
                    <h1 className={`font-display text-xl md:text-2xl font-semibold tracking-tight truncate ${textMain}`}>
                      {activeTitle?.label}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Notification bell */}
                  <div ref={bellRef} className="relative">
                    <button
                      onClick={() => setBellOpen((v) => !v)}
                      className={`relative p-2 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900' : 'text-slate-500 hover:text-cyan-600 hover:bg-slate-100'} ${bellOpen ? (dark ? 'text-cyan-400 bg-slate-900' : 'text-cyan-600 bg-slate-100') : ''}`}
                      aria-label="Notifiche"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 inline-flex items-center justify-center rounded-full bg-cyan-500 text-white text-[0.6rem] font-bold ring-2 ring-black">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    <AnimatePresence>
                      {bellOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute right-0 mt-2 w-80 rounded-xl border shadow-2xl overflow-hidden z-50 ${dark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                        >
                          <div className={`px-4 py-3 flex items-center justify-between border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-2">
                              <Bell className="w-3.5 h-3.5 text-cyan-500" />
                              <span className="font-mono-lab text-[0.65rem] tracking-[0.25em] uppercase text-cyan-500">// Notifiche</span>
                            </div>
                            {unreadCount > 0 && (
                              <button onClick={markAllRead} className="text-xs text-cyan-500 hover:text-cyan-400 font-display">
                                Tutte lette
                              </button>
                            )}
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.slice(0, 6).map((n) => {
                                const isRead = !!readMap[n.id];
                                return (
                                  <button
                                    key={n.id}
                                    onClick={() => {
                                      markRead(n.id);
                                      if (n.link) setActiveTab(n.link as Tab);
                                      setBellOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b transition-colors ${
                                      dark ? 'border-slate-800/80 hover:bg-slate-900' : 'border-slate-100 hover:bg-slate-50'
                                    }`}
                                  >
                                    <NotificationIcon type={n.type} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <div className={`font-display font-semibold text-sm truncate ${textMain}`}>{n.title}</div>
                                        {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />}
                                      </div>
                                      <div className={`text-xs mt-0.5 line-clamp-2 ${textMuted}`}>{n.message}</div>
                                      <div className={`text-[0.65rem] mt-1 ${textDim}`}>{formatRelativeTime(n.time)}</div>
                                    </div>
                                  </button>
                                );
                              })
                            ) : (
                              <div className={`px-4 py-8 text-center text-sm ${textMuted}`}>
                                Nessuna notifica
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => { setActiveTab('notifications'); setBellOpen(false); }}
                            className={`w-full px-4 py-3 text-xs font-display font-semibold text-cyan-500 hover:text-cyan-400 ${dark ? 'hover:bg-slate-900' : 'hover:bg-slate-50'}`}
                          >
                            Vedi tutte le notifiche →
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link to="/" className={`hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-medium transition-all ${dark ? 'text-slate-300 hover:text-white hover:bg-slate-900 ring-1 ring-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 ring-1 ring-slate-200'}`}>
                    <Home className="w-3.5 h-3.5" /> Home
                  </Link>
                  <button onClick={() => setMobileNavOpen(true)} className="lg:hidden">
                    <Avatar size={36} />
                  </button>
                  <div className="hidden lg:block">
                    <button onClick={() => setActiveTab('settings')} className="rounded-lg overflow-hidden hover:ring-2 hover:ring-cyan-500/50 transition-all">
                      <Avatar size={36} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium whitespace-nowrap transition-all relative ${
                      activeTab === item.id
                        ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/40'
                        : dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                    {item.id === 'notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-1 inline-flex items-center justify-center rounded-full bg-cyan-500 text-white text-[0.55rem] font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </header>

            <div className="flex-1 px-4 md:px-8 py-8">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    {tabContent[activeTab]}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </main>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Dashboard;
