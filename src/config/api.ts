/**
 * API Configuration
 * Centralizza la configurazione dell'URL API
 */

// TEMPORANEO: Forza l'uso del backend in produzione
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.spartanofurioso.com';

export const API_ENDPOINTS = {
  // Auth
  login: `${API_URL}/api/auth/login`,
  register: `${API_URL}/api/auth/register`,
  verifyEmail: `${API_URL}/api/auth/verify-email`,
  resendVerification: `${API_URL}/api/auth/resend-verification`,
  forgotPassword: `${API_URL}/api/auth/forgot-password`,
  resetPassword: `${API_URL}/api/auth/reset-password`,
  updateProfile: `${API_URL}/api/auth/update-profile`,
  
  // Products
  products: `${API_URL}/api/products`,
  startTrial: `${API_URL}/api/products/start-trial`,
  
  // Trials
  trials: `${API_URL}/api/trials`,
  userTrials: `${API_URL}/api/trials/user`,
  checkTrial: (productId: string) => `${API_URL}/api/trials/check/${productId}`,
  startTrialNew: `${API_URL}/api/trials/start`,
  subscriptions: `${API_URL}/api/trials/subscriptions`,
  
  // Courses
  courseContent: (courseId: string) => `${API_URL}/api/courses/${courseId}/content`,
  
  // Newsletter
  subscribe: `${API_URL}/api/newsletter/subscribe`,
  unsubscribe: `${API_URL}/api/newsletter/unsubscribe`,
  
  // Stripe
  createCheckoutSession: `${API_URL}/api/stripe/create-checkout-session`,
  verifySession: (sessionId: string) => `${API_URL}/api/stripe/verify-session/${sessionId}`,
  
  // Admin
  adminProductsFix: `${API_URL}/api/admin/products/fix-active`,
  adminProductsRestore: `${API_URL}/api/admin/products/restore-data`,
  
  // Analytics
  analytics: `${API_URL}/api/analytics`,
};

export default API_URL;
