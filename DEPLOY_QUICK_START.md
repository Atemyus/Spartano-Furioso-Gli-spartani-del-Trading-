# ⚡ Deploy Rapido - 30 Minuti

## 🎯 Prerequisiti (5 min)

```bash
# 1. Cambia credenziali admin
cd server
npm run admin:update
Email: admin@tuosito.com
Password: Sp@rt4n0_Fur10s0#2024!Tr4d1ng

# 2. Reset analytics
node scripts/setupAnalytics.cjs
```

---

## 🗄️ Database (5 min)

### **MongoDB Atlas**

```
1. https://www.mongodb.com/cloud/atlas/register
2. Crea cluster M0 (gratuito)
3. Copia connection string
4. Aggiungi a server/.env:
   MONGODB_URI=mongodb+srv://...
```

---

## 💳 Stripe (10 min)

```
1. https://dashboard.stripe.com/
2. Toggle: Test → LIVE
3. Copia chiavi:
   - pk_live_...
   - sk_live_...

4. Webhook:
   URL: https://api.tuosito.com/api/stripe/webhook
   Eventi: checkout.*, customer.subscription.*, invoice.*
   Copia: whsec_...

5. Aggiungi a server/.env:
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...

6. Aggiungi a .env.production:
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## 📧 Email (5 min)

### **SendGrid**

```
1. https://signup.sendgrid.com/
2. Crea API Key
3. Aggiungi a server/.env:
   SENDGRID_API_KEY=SG...
   EMAIL_FROM=noreply@tuosito.com
```

---

## 🚀 Deploy Backend (10 min)

### **Railway**

```bash
# 1. Installa CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy
cd server
railway up

# 4. Dashboard → Variables → Copia tutte da .env

# 5. Settings → Domains → api.tuosito.com
```

---

## 🌐 Deploy Frontend (10 min)

### **Vercel**

```bash
# 1. Installa CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
cd ..
vercel --prod

# 4. Dashboard → Variables:
VITE_API_URL=https://api.tuosito.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# 5. Settings → Domains → tuosito.com
```

---

## ✅ Test (5 min)

```
1. https://tuosito.com → Homepage ✅
2. Registrazione → Email ricevuta ✅
3. Login → Dashboard ✅
4. /admin → Pannello admin ✅
5. Checkout → Pagamento test ✅
```

---

## 🎉 LIVE!

```
✅ Sito: https://tuosito.com
✅ API: https://api.tuosito.com
✅ Admin: https://tuosito.com/admin
```

**Tempo totale: 30-45 minuti**

---

## 📋 Variabili Ambiente Complete

### **server/.env**

```bash
NODE_ENV=production
PORT=3001

# Database
MONGODB_URI=mongodb+srv://...
DATABASE_URL=mongodb+srv://...

# JWT
JWT_SECRET=your_super_secret_key_32_chars_min

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@tuosito.com

# URLs
FRONTEND_URL=https://tuosito.com
BACKEND_URL=https://api.tuosito.com

# CORS
ALLOWED_ORIGINS=https://tuosito.com
```

### **.env.production** (root)

```bash
VITE_API_URL=https://api.tuosito.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

---

**Pronto per il lancio! 🚀**
