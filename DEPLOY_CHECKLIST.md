# ✅ Checklist Deploy - Spartano Furioso

## 🎯 Risposte Rapide alle Tue Domande

### **Q: Il pannello admin è funzionante?**
✅ **SÌ!** Tutte le funzioni principali sono implementate:
- Gestione Prodotti ✅
- Gestione Utenti ✅
- Gestione Ordini ✅
- Gestione Trial ✅
- Gestione Abbonamenti ✅
- Analytics Dashboard ✅
- Newsletter ✅

⚠️ **Visitatori**: Richiede Google Analytics (facile da aggiungere)

### **Q: Posso modificare prodotti dal pannello admin in produzione?**
✅ **SÌ!** Tutte le modifiche dal pannello admin sono applicate **immediatamente**:
- Aggiungi/modifica prodotti → LIVE subito
- Cambia prezzi → LIVE subito
- Gestisci utenti → LIVE subito
- **Nessun deploy necessario!**

### **Q: Posso modificare testi/struttura del sito?**
✅ **SÌ!** Ma richiede:
1. Modifica locale del codice
2. `git push`
3. Deploy automatico (2-3 minuti)

### **Q: Chi può accedere al pannello admin?**
🔒 **Solo admin autorizzati:**
- Tu (super admin)
- Colleghi che nomini admin
- **Nessun altro può accedere** (protetto da JWT + middleware)

### **Q: Come nomino altri admin?**
✅ **3 metodi:**

```bash
# Metodo 1: Script (FACILE)
cd server
npm run admin:manage
# Inserisci email collega

# Metodo 2: Database
# Cambia role: "user" → "admin" nel database

# Metodo 3: Dal pannello admin
# Gestione Utenti → Promuovi ad Admin
```

---

## 📋 Checklist Pre-Deploy

### **1. Configurazione Backend** ⏱️ 15 min

```bash
# Database
[ ] MongoDB Atlas / PostgreSQL configurato
[ ] Connection string salvato
[ ] Backup automatici attivi

# Variabili Ambiente (.env produzione)
[ ] MONGODB_URI=mongodb+srv://...
[ ] JWT_SECRET=xxx (32+ caratteri random)
[ ] STRIPE_SECRET_KEY=sk_live_...
[ ] STRIPE_WEBHOOK_SECRET=whsec_...
[ ] EMAIL_SERVICE configurato (SendGrid/Mailgun)
[ ] FRONTEND_URL=https://tuosito.com
[ ] NODE_ENV=production

# Sicurezza
[ ] CORS configurato per dominio produzione
[ ] Rate limiting attivo
[ ] Helmet.js configurato
[ ] SSL/HTTPS attivo
```

### **2. Configurazione Frontend** ⏱️ 10 min

```bash
# Variabili Ambiente (.env.production)
[ ] VITE_API_URL=https://tuo-backend.com
[ ] VITE_STRIPE_PUBLIC_KEY=pk_live_...

# SEO & Meta
[ ] Favicon aggiunto
[ ] Meta tags configurati
[ ] Open Graph tags
[ ] Sitemap.xml
[ ] robots.txt

# Analytics (opzionale ma consigliato)
[ ] Google Analytics 4 configurato
[ ] Google Tag Manager (opzionale)
```

### **3. Stripe Configurazione** ⏱️ 20 min

```bash
[ ] Account Stripe attivato
[ ] Modalità LIVE attiva (non test)
[ ] Webhook configurato: https://tuo-backend.com/api/stripe/webhook
[ ] Eventi webhook:
    - checkout.session.completed
    - customer.subscription.created
    - customer.subscription.updated
    - customer.subscription.deleted
    - invoice.payment_succeeded
    - invoice.payment_failed
[ ] Chiavi LIVE copiate (.env)
```

### **4. Email Service** ⏱️ 15 min

```bash
# SendGrid (consigliato)
[ ] Account creato
[ ] API Key generata
[ ] Dominio verificato
[ ] Template email creati:
    - Benvenuto
    - Conferma email
    - Reset password
    - Trial attivato
    - Abbonamento attivato
    - Fattura

# Oppure Mailgun / AWS SES
[ ] Account configurato
[ ] Credenziali in .env
```

### **5. Deploy Backend** ⏱️ 30 min

#### **Opzione A: Railway (CONSIGLIATO - Facile)**

```bash
# 1. Installa CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy
cd server
railway up

# 4. Configura variabili
railway variables set MONGODB_URI=xxx
railway variables set JWT_SECRET=xxx
railway variables set STRIPE_SECRET_KEY=xxx
# ... tutte le altre

# 5. Verifica
railway logs
```

#### **Opzione B: Render**

```bash
# 1. Vai su render.com
# 2. New → Web Service
# 3. Connetti GitHub repo
# 4. Build Command: cd server && npm install
# 5. Start Command: cd server && npm start
# 6. Aggiungi variabili ambiente
# 7. Deploy
```

#### **Opzione C: VPS (Avanzato)**

```bash
# 1. SSH al server
ssh user@tuoserver.com

# 2. Installa Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Installa PM2
sudo npm install -g pm2

# 4. Clona repo
git clone https://github.com/tuo-repo.git
cd tuo-repo/server

# 5. Installa dipendenze
npm install

# 6. Crea .env
nano .env
# Incolla variabili ambiente

# 7. Avvia con PM2
pm2 start index.js --name spartano-api
pm2 save
pm2 startup

# 8. Configura Nginx
sudo nano /etc/nginx/sites-available/spartano-api
# Configura reverse proxy
sudo ln -s /etc/nginx/sites-available/spartano-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 9. SSL con Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.tuosito.com
```

### **6. Deploy Frontend** ⏱️ 20 min

#### **Opzione A: Vercel (CONSIGLIATO - Facile)**

```bash
# 1. Installa CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Configura variabili (dashboard Vercel)
VITE_API_URL=https://tuo-backend.railway.app
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx

# 5. Configura dominio custom
# Dashboard → Settings → Domains
```

#### **Opzione B: Netlify**

```bash
# 1. Installa CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Build
npm run build

# 4. Deploy
netlify deploy --prod

# 5. Configura variabili (dashboard Netlify)
# Site settings → Environment variables
```

### **7. Configurazione Dominio** ⏱️ 10 min

```bash
# DNS Records (es: Cloudflare)
[ ] A Record: @ → IP VPS (se VPS)
[ ] CNAME: www → tuosito.com
[ ] CNAME: api → backend-url (se Railway/Render)

# SSL
[ ] Certificato SSL attivo
[ ] HTTPS forzato
[ ] HTTP → HTTPS redirect
```

### **8. Test Post-Deploy** ⏱️ 30 min

```bash
# Frontend
[ ] Homepage carica correttamente
[ ] Arsenale Spartano mostra prodotti
[ ] Login funziona
[ ] Registrazione funziona
[ ] Dashboard utente accessibile

# Backend
[ ] API risponde: curl https://api.tuosito.com/health
[ ] Database connesso
[ ] Stripe webhook funziona (test con Stripe CLI)

# Pannello Admin
[ ] Accesso a /admin funziona
[ ] Login admin funziona
[ ] Dashboard mostra dati
[ ] Gestione prodotti funziona
[ ] Creazione nuovo prodotto funziona

# Pagamenti
[ ] Checkout Stripe funziona
[ ] Webhook ricevuti correttamente
[ ] Email conferma inviate
[ ] Abbonamento attivato correttamente

# Email
[ ] Email benvenuto inviata
[ ] Email conferma ordine inviata
[ ] Email reset password funziona
```

---

## 🚀 Comandi Deploy Rapidi

### **Deploy Completo (Prima Volta)**

```bash
# Backend (Railway)
cd server
railway login
railway up
railway variables set MONGODB_URI=xxx JWT_SECRET=xxx STRIPE_SECRET_KEY=xxx

# Frontend (Vercel)
cd ..
vercel login
vercel --prod
# Configura variabili nel dashboard

# Verifica
curl https://api.tuosito.com/health
curl https://tuosito.com
```

### **Aggiornamento Codice (Dopo Prima Deploy)**

```bash
# 1. Modifica codice localmente
# 2. Commit
git add .
git commit -m "Descrizione modifiche"
git push origin main

# 3. Deploy automatico (se configurato)
# Vercel/Netlify: deploy automatico da GitHub
# Railway: deploy automatico da GitHub

# Oppure manuale:
vercel --prod  # Frontend
railway up     # Backend
```

---

## 🔐 Primo Accesso Admin

### **Dopo il Deploy**

```bash
# 1. SSH al server backend (o Railway CLI)
railway run node scripts/makeAdmin.js

# 2. Inserisci la tua email
Email: tua@email.com

# 3. Conferma
✅ tua@email.com è ora amministratore!

# 4. Accedi al pannello
https://tuosito.com/admin
Email: tua@email.com
Password: [la tua password]
```

---

## 📊 Monitoraggio Post-Deploy

### **Tools Essenziali**

```bash
# Uptime Monitoring
[ ] UptimeRobot configurato (gratuito)
    - Monitora https://tuosito.com
    - Monitora https://api.tuosito.com
    - Alert via email/SMS

# Error Tracking
[ ] Sentry configurato (gratuito fino 5k errors/mese)
    - Frontend tracking
    - Backend tracking

# Analytics
[ ] Google Analytics 4
    - Tracking code installato
    - Eventi custom configurati

# Logs
[ ] Railway/Render logs accessibili
[ ] PM2 logs (se VPS): pm2 logs spartano-api
```

---

## 🆘 Troubleshooting Comune

### **"Sito non carica dopo deploy"**
```bash
# Verifica build
npm run build
# Controlla errori console

# Verifica variabili ambiente
echo $VITE_API_URL
```

### **"API non risponde"**
```bash
# Verifica backend online
curl https://api.tuosito.com/health

# Controlla logs
railway logs
# oppure
pm2 logs spartano-api
```

### **"Pagamenti non funzionano"**
```bash
# Verifica webhook Stripe
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Controlla logs webhook in Stripe dashboard
# Developers → Webhooks → [tuo webhook] → Events
```

### **"Non riesco ad accedere al pannello admin"**
```bash
# Verifica che sei admin
railway run node scripts/makeAdmin.js
# Inserisci email

# Verifica JWT_SECRET uguale in frontend e backend
```

---

## ✅ Checklist Finale

Prima di dichiarare il sito "LIVE":

- [ ] Tutti i test passano
- [ ] Pagamenti Stripe funzionanti (test con carta test)
- [ ] Email inviate correttamente
- [ ] Pannello admin accessibile
- [ ] Backup database configurato
- [ ] Monitoring attivo
- [ ] SSL attivo
- [ ] Dominio custom configurato
- [ ] Google Analytics attivo
- [ ] Sitemap inviata a Google Search Console
- [ ] robots.txt configurato
- [ ] 404 page custom
- [ ] Privacy Policy e Terms of Service pubblicati

---

## 🎉 Sei Pronto!

**Tempo stimato totale: 2-3 ore**

Una volta completata la checklist, il tuo sito sarà:
- ✅ LIVE e accessibile pubblicamente
- ✅ Sicuro e protetto
- ✅ Pronto ad accettare pagamenti
- ✅ Gestibile completamente dal pannello admin
- ✅ Monitorato e tracciato

**Buon lancio! 🚀**
