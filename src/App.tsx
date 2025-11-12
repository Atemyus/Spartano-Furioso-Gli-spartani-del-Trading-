simport { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './utils/fixProducts'; // Import fix utilities
import { usePageTracking } from './hooks/usePageTracking';
import { ThemeProvider } from './contexts/ThemeContext';
import LoadingScreen from './components/LoadingScreen';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
// Nuove pagine
import LaFalange from './components/LaFalange';
import LAddestramento from './components/LAddestramento';
import Community from './components/Community';
import Strategia from './pages/Strategia';
import TradingRoom from './pages/TradingRoom';
import Formazione from './pages/Formazione';
import Segnali from './pages/Segnali';
import Analisi from './pages/Analisi';
import Blog from './pages/Blog';
import VideoTutorial from './pages/VideoTutorial';
import Podcast from './pages/Podcast';
import Glossario from './pages/Glossario';
import Calcolatori from './pages/Calcolatori';
import CentroAiuto from './pages/CentroAiuto';
import FAQ from './pages/FAQ';
import Contatto from './pages/Contatto';
import Partnership from './pages/Partnership';
import Affiliazione from './pages/Affiliazione';
import Privacy from './pages/Privacy';
import Termini from './pages/Termini';
import RiskDisclaimer from './pages/RiskDisclaimer';
import CookiePolicy from './pages/CookiePolicy';
import Products from './pages/Products';
import Trials from './pages/Trials';
import TrialActivation from './pages/TrialActivation';
import TrialManagement from './pages/TrialManagement';
import TutorialInstallation from './pages/TutorialInstallation';
import TutorialParameters from './pages/TutorialParameters';
import VerifyEmail from './pages/VerifyEmail';
import Success from './pages/Success';
import AuthDebug from './pages/AuthDebug';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import CourseTrialActivation from './pages/CourseTrialActivation';
import CourseTrialManagement from './pages/CourseTrialManagement';
import CourseViewer from './pages/CourseViewer';
import VimeoTest from './pages/VimeoTest';
import PaymentSuccess from './pages/PaymentSuccess';
import Unsubscribe from './pages/Unsubscribe';
// Admin components
import AdminLogin from './components/admin/Login';
import AdminDashboard from './components/admin/Dashboard';

function AppContent() {
  const location = useLocation();
  
  // Track pageviews automaticamente
  usePageTracking();
  
  const hideHeaderFooter = [
    '/login', 
    '/register', 
    '/dashboard',
    '/admin/login',
    '/admin/dashboard',
    '/forgot-password',
    '/reset-password',
    '/unsubscribe'
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-black text-white">
      {!hideHeaderFooter && <Header />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/products" element={<Products />} />
        <Route path="/trials" element={
          <ProtectedRoute>
            <Trials />
          </ProtectedRoute>
        } />
        <Route path="/trial-activation/:productId" element={
          <ProtectedRoute>
            <TrialActivation />
          </ProtectedRoute>
        } />
        <Route path="/trial/:productId/manage" element={
          <ProtectedRoute>
            <TrialManagement />
          </ProtectedRoute>
        } />
        <Route path="/tutorial/installation/:productId" element={
          <ProtectedRoute>
            <TutorialInstallation />
          </ProtectedRoute>
        } />
        <Route path="/tutorial/parameters/:productId" element={
          <ProtectedRoute>
            <TutorialParameters />
          </ProtectedRoute>
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/success" element={<Success />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/auth-debug" element={<AuthDebug />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/course/:courseId" element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        } />
        <Route path="/course/:courseId/trial" element={
          <ProtectedRoute>
            <CourseTrialActivation />
          </ProtectedRoute>
        } />
        <Route path="/course/:courseId/manage-trial" element={
          <ProtectedRoute>
            <CourseTrialManagement />
          </ProtectedRoute>
        } />
        <Route path="/course/:courseId/viewer" element={
          <ProtectedRoute>
            <CourseViewer />
          </ProtectedRoute>
        } />
        <Route path="/course/:courseId/lesson/:lessonId" element={
          <ProtectedRoute>
            <CoursePlayer />
          </ProtectedRoute>
        } />
        {/* Macro-sezioni */}
        <Route path="/la-falange" element={<LaFalange />} />
        <Route path="/l-addestramento" element={<LAddestramento />} />
        <Route path="/community" element={<Community />} />
        {/* Battaglia */}
        <Route path="/strategia" element={<Strategia />} />
        <Route path="/trading-room" element={<TradingRoom />} />
        <Route path="/formazione" element={<Formazione />} />
        <Route path="/segnali" element={<Segnali />} />
        <Route path="/analisi" element={<Analisi />} />
        {/* Risorse */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/video" element={<VideoTutorial />} />
        <Route path="/video-tutorial" element={<VideoTutorial />} />
        <Route path="/podcast" element={<Podcast />} />
        <Route path="/glossario" element={<Glossario />} />
        <Route path="/calcolatori" element={<Calcolatori />} />
        {/* Supporto */}
        <Route path="/supporto/centro-aiuto" element={<CentroAiuto />} />
        <Route path="/centro-aiuto" element={<CentroAiuto />} />
        <Route path="/supporto/faq" element={<FAQ />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/supporto/contatto" element={<Contatto />} />
        <Route path="/contatto" element={<Contatto />} />
        <Route path="/supporto/partnership" element={<Partnership />} />
        <Route path="/partnership" element={<Partnership />} />
        <Route path="/supporto/affiliazione" element={<Affiliazione />} />
        <Route path="/affiliazione" element={<Affiliazione />} />
        {/* Legali */}
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/termini" element={<Termini />} />
        <Route path="/legal/risk-disclaimer" element={<RiskDisclaimer />} />
        <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
        {/* Newsletter */}
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/vimeo-test" element={<VimeoTest />} />
        </Routes>
      </AnimatePresence>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
