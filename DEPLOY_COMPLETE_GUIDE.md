# 🚀 Guida Completa Deploy - Spartano Furioso

## 📋 Checklist Pre-Deploy (30 minuti)

### **✅ Step 1: Preparazione Credenziali Admin** (5 min)

```bash
cd server
npm run admin:update

# Inserisci:
📧 Email: admin@tuosito.com
🔑 Password: Sp@rt4n0_Fur10s0#2024!Tr4d1ng

# Salva credenziali in password manager!
```

### **✅ Step 2: Reset Analytics** (2 min)

```bash
cd server
node scripts/setupAnalytics.cjs

# Rispondi:
- Configurare IP? → s
- Azzerare analytics? → s

# ✅ Analytics azzerate e IP escluso
```

### **✅ Step 3: Verifica File Download** (1 min)

```bash
# Verifica che il file EA sia presente
ls public/downloads/

# Dovresti vedere:
fury-of-sparta-v2.0.zip (1.48 MB)
```

### **✅ Step 4: Verifica Variabili Ambiente** (5 min)

Apri `server/.env` e verifica:

```bash
# Database
MONGODB_URI=mongodb+srv://... (o PostgreSQL)

# JWT
JWT_SECRET=your_super_secret_key_32_chars_min

# Stripe (CHIAVI LIVE!)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@tuosito.com

# URLs
FRONTEND_URL=https://tuosito.com
BACKEND_URL=https://api.tuosito.com

# Ambiente
NODE_ENV=production
```

### **✅ Step 5: Test Locale Finale** (5 min)

```bash
# Backend
cd server
npm start

# Frontend (altro terminale)
cd ..
npm run dev

# Testa:
1. Homepage carica ✅
2. Registrazione funziona ✅
3. Login funziona ✅
4. Pannello admin accessibile ✅
5. Download file funziona ✅
```

---

## 🗄️ PARTE 1: Setup Database (15 minuti)

### **Opzione A: MongoDB Atlas (CONSIGLIATO)**

#### **1. Crea Account MongoDB Atlas**

```
1. Vai su: https://www.mongodb.com/cloud/atlas/register
2. Registrati (gratuito)
3. Crea cluster:
   - Provider: AWS
   - Region: Europe (Frankfurt o Ireland)
   - Tier: M0 (Free)
   - Nome: spartano-furioso
```

#### **2. Configura Accesso**

```
1. Database Access:
   - Add New Database User
   - Username: spartano_admin
   - Password: [genera password sicura]
   - Role: Atlas admin

2. Network Access:
   - Add IP Address
   - Allow Access from Anywhere: 0.0.0.0/0
   - (In produzione, usa IP specifici)
```

#### **3. Ottieni Connection String**

```
1. Click "Connect"
2. Seleziona "Connect your application"
3. Driver: Node.js
4. Copia connection string:

mongodb+srv://spartano_admin:<password>@spartano-furioso.xxxxx.mongodb.net/?retryWrites=true&w=majority

5. Sostituisci <password> con la password dell'utente
```

#### **4. Configura .env**

```bash
# server/.env
MONGODB_URI=mongodb+srv://spartano_admin:PASSWORD@spartano-furioso.xxxxx.mongodb.net/spartano-db?retryWrites=true&w=majority
DATABASE_URL=mongodb+srv://spartano_admin:PASSWORD@spartano-furioso.xxxxx.mongodb.net/spartano-db?retryWrites=true&w=majority
```

---

## 💳 PARTE 2: Setup Stripe (20 minuti)

### **1. Attiva Modalità LIVE**

```
1. Vai su: https://dashboard.stripe.com/
2. Toggle in alto a destra: Test → LIVE
3. Completa attivazione account:
   - Dati aziendali
   - Dati bancari
   - Documenti identità
```

### **2. Ottieni Chiavi LIVE**

```
1. Developers → API keys
2. Copia:
   - Publishable key: pk_live_...
   - Secret key: sk_live_...
```

### **3. Configura Webhook**

```
1. Developers → Webhooks
2. Add endpoint
3. Endpoint URL: https://api.tuosito.com/api/stripe/webhook
4. Eventi da ascoltare:
   ☑ checkout.session.completed
   ☑ customer.subscription.created
   ☑ customer.subscription.updated
   ☑ customer.subscription.deleted
   ☑ invoice.payment_succeeded
   ☑ invoice.payment_failed
5. Salva
6. Copia Signing secret: whsec_...
```

### **4. Configura .env**

```bash
# server/.env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **5. Aggiorna Frontend**

```bash
# .env.production (root del progetto)
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_API_URL=https://api.tuosito.com
```

---

## 📧 PARTE 3: Setup Email Service (15 minuti)

### **Opzione A: SendGrid (CONSIGLIATO)**

#### **1. Crea Account**

```
1. Vai su: https://signup.sendgrid.com/
2. Registrati (gratuito fino 100 email/giorno)
3. Verifica email
```

#### **2. Crea API Key**

```
1. Settings → API Keys
2. Create API Key
3. Nome: Spartano Furioso Production
4. Permessi: Full Access
5. Copia API Key: SG.xxxxx
```

#### **3. Verifica Dominio**

```
1. Settings → Sender Authentication
2. Authenticate Your Domain
3. Dominio: tuosito.com
4. Aggiungi record DNS (dal tuo provider dominio):
   - CNAME: em1234.tuosito.com → sendgrid.net
   - CNAME: s1._domainkey.tuosito.com → s1.domainkey...
   - CNAME: s2._domainkey.tuosito.com → s2.domainkey...
5. Verifica (può richiedere 24-48h)
```

#### **4. Configura .env**

```bash
# server/.env
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@tuosito.com
EMAIL_FROM_NAME=Spartano Furioso
```

---

## 🚀 PARTE 4: Deploy Backend (30 minuti)

### **Opzione A: Railway (CONSIGLIATO - Facile)**

#### **1. Crea Account**

```
1. Vai su: https://railway.app/
2. Sign up with GitHub
3. Autorizza Railway
```

#### **2. Crea Nuovo Progetto**

```
1. New Project
2. Deploy from GitHub repo
3. Seleziona: project-bolt-sb1-r6swdtnj
4. Root Directory: /server
5. Deploy
```

#### **3. Configura Variabili Ambiente**

```
1. Project → Variables
2. Aggiungi tutte le variabili da .env:

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

#### **4. Configura Dominio Custom**

```
1. Settings → Domains
2. Custom Domain
3. Dominio: api.tuosito.com
4. Aggiungi record DNS:
   - Type: CNAME
   - Name: api
   - Value: [railway-url].railway.app
5. Salva
```

#### **5. Deploy**

```
1. Deployments → Deploy
2. Attendi build (3-5 min)
3. ✅ Backend LIVE!
```

#### **6. Verifica**

```bash
# Testa API
curl https://api.tuosito.com/health

# Risposta attesa:
{"status":"ok","timestamp":"..."}
```

---

## 🌐 PARTE 5: Deploy Frontend (20 minuti)

### **Opzione A: Vercel (CONSIGLIATO - Facile)**

#### **1. Crea Account**

```
1. Vai su: https://vercel.com/signup
2. Sign up with GitHub
3. Autorizza Vercel
```

#### **2. Importa Progetto**

```
1. Add New → Project
2. Import Git Repository
3. Seleziona: project-bolt-sb1-r6swdtnj
4. Framework Preset: Vite
5. Root Directory: / (root)
6. Build Command: npm run build
7. Output Directory: dist
```

#### **3. Configura Variabili Ambiente**

```
1. Settings → Environment Variables
2. Aggiungi:

VITE_API_URL=https://api.tuosito.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

#### **4. Deploy**

```
1. Deploy
2. Attendi build (2-3 min)
3. ✅ Frontend LIVE!
```

#### **5. Configura Dominio Custom**

```
1. Settings → Domains
2. Add Domain
3. Dominio: tuosito.com
4. Aggiungi record DNS:
   - Type: A
   - Name: @
   - Value: 76.76.21.21
   
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com
5. Salva
6. Attendi propagazione (5-10 min)
```

#### **6. Verifica**

```
1. Vai su: https://tuosito.com
2. Homepage carica ✅
3. Arsenale Spartano funziona ✅
4. Login funziona ✅
```

---

## 🔧 PARTE 6: Configurazioni Finali (15 minuti)

### **1. Aggiorna Webhook Stripe**

```
1. Stripe Dashboard → Webhooks
2. Modifica endpoint
3. URL: https://api.tuosito.com/api/stripe/webhook
4. Salva
5. Testa webhook (Send test webhook)
```

### **2. Configura CORS Backend**

```javascript
// Verifica server/index.js
const allowedOrigins = [
  'https://tuosito.com',
  'https://www.tuosito.com'
];
```

### **3. SSL/HTTPS**

```
✅ Vercel: SSL automatico
✅ Railway: SSL automatico
✅ Forza HTTPS: Configurato automaticamente
```

### **4. Backup Database**

```
1. MongoDB Atlas → Clusters
2. ... → Backup
3. Enable Cloud Backup
4. Snapshot Schedule: Daily
```

---

## ✅ PARTE 7: Test Post-Deploy (20 minuti)

### **Test Completo**

```
1. Homepage
   ✅ Carica correttamente
   ✅ Immagini visibili
   ✅ Link funzionanti

2. Registrazione
   ✅ Form funziona
   ✅ Email verifica inviata
   ✅ Account creato

3. Login
   ✅ Credenziali corrette → accesso
   ✅ Credenziali errate → errore
   ✅ Token JWT funzionante

4. Dashboard Utente
   ✅ Dati utente visibili
   ✅ Trial visibili
   ✅ Abbonamenti visibili

5. Arsenale Spartano
   ✅ Prodotti visibili
   ✅ Prezzi corretti
   ✅ Modal dettagli funziona

6. Checkout Stripe
   ✅ Redirect a Stripe
   ✅ Pagamento test funziona
   ✅ Webhook ricevuto
   ✅ Abbonamento attivato

7. Download File
   ✅ Pulsante "Scarica Ora"
   ✅ File scaricato correttamente
   ✅ Dimensione corretta (1.48 MB)

8. Pannello Admin
   ✅ Login admin funziona
   ✅ Dashboard visibile
   ✅ Gestione prodotti funziona
   ✅ Analytics visibili

9. Email
   ✅ Email benvenuto ricevuta
   ✅ Email conferma ordine ricevuta
   ✅ Email trial attivato ricevuta

10. Analytics
    ✅ Visite tracciate
    ✅ Tuo IP escluso
    ✅ Dashboard aggiornata
```

---

## 🎯 Comandi Rapidi Deploy

### **Setup Iniziale**

```bash
# 1. Prepara credenziali admin
cd server
npm run admin:update

# 2. Reset analytics
node scripts/setupAnalytics.cjs

# 3. Verifica file download
ls public/downloads/fury-of-sparta-v2.0.zip
```

### **Deploy Backend (Railway)**

```bash
# 1. Installa Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy
cd server
railway up

# 4. Configura variabili (nel dashboard)
# 5. Configura dominio custom
```

### **Deploy Frontend (Vercel)**

```bash
# 1. Installa Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Configura variabili (nel dashboard)
# 5. Configura dominio custom
```

---

## 📊 Monitoring Post-Deploy

### **1. Uptime Monitoring**

```
UptimeRobot (gratuito):
1. https://uptimerobot.com/
2. Add Monitor
3. URL: https://tuosito.com
4. URL: https://api.tuosito.com
5. Alert via email
```

### **2. Error Tracking**

```
Sentry (gratuito 5k errors/mese):
1. https://sentry.io/
2. Create Project
3. Integra frontend e backend
4. Alert via email
```

### **3. Analytics**

```
✅ Analytics interne già attive
⏰ Google Analytics (opzionale, dopo)
```

---

## 🆘 Troubleshooting

### **"Backend non risponde"**

```bash
# Verifica logs
railway logs

# Verifica variabili ambiente
railway variables

# Verifica database connesso
# MongoDB Atlas → Network Access → IP whitelist
```

### **"Frontend non carica"**

```bash
# Verifica build
vercel logs

# Verifica variabili ambiente
# Vercel Dashboard → Settings → Environment Variables

# Verifica API_URL corretta
```

### **"Pagamenti non funzionano"**

```bash
# Verifica webhook Stripe
# Stripe Dashboard → Webhooks → Test

# Verifica chiavi LIVE (non test)
# Verifica STRIPE_WEBHOOK_SECRET
```

### **"Email non arrivano"**

```bash
# Verifica SendGrid API Key
# Verifica dominio verificato
# Controlla spam folder
# Verifica logs SendGrid
```

---

## ✅ Checklist Finale

Prima di dichiarare "LIVE":

- [ ] Database in produzione funzionante
- [ ] Backend deployato e accessibile
- [ ] Frontend deployato e accessibile
- [ ] Stripe configurato (modalità LIVE)
- [ ] Webhook Stripe funzionante
- [ ] Email service configurato
- [ ] Dominio custom configurato
- [ ] SSL/HTTPS attivo
- [ ] Credenziali admin cambiate
- [ ] Analytics azzerate
- [ ] File download presente
- [ ] Test completo passato
- [ ] Monitoring attivo
- [ ] Backup database configurato

---

## 🎉 Sei LIVE!

Una volta completati tutti gli step:

```
✅ Sito pubblico: https://tuosito.com
✅ API funzionante: https://api.tuosito.com
✅ Pannello admin: https://tuosito.com/admin
✅ Pagamenti attivi
✅ Email funzionanti
✅ Analytics attive
✅ Backup configurati

🚀 PRONTO PER IL LANCIO!
```

---

**Tempo totale stimato: 2-3 ore**
**Difficoltà: Media**
**Costo: €0 (tier gratuiti) o ~€20/mese (tier base)**

**Buon lancio! 🎉**
