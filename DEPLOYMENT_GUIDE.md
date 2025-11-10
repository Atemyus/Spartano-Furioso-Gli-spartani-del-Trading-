# 📚 GUIDA DEPLOYMENT E GESTIONE ORDINI

## 🚀 PREPARAZIONE AL DEPLOYMENT

### 1. Configurazione Stripe (PRODUZIONE)

Prima di andare online, devi configurare Stripe in modalità produzione:

1. **Accedi a Stripe Dashboard**: https://dashboard.stripe.com
2. **Attiva la modalità Live** (toggle in alto a destra)
3. **Recupera le chiavi di produzione**:
   - API Keys → Publishable key (inizia con `pk_live_`)
   - API Keys → Secret key (inizia con `sk_live_`)

### 2. Configurazione Webhook Stripe

Il webhook è FONDAMENTALE per ricevere notifiche automatiche degli ordini:

1. **Nel Dashboard Stripe vai a**: Developers → Webhooks
2. **Clicca su "Add endpoint"**
3. **Inserisci l'URL del webhook**:
   ```
   https://tuodominio.com/webhook/stripe/webhook
   ```
4. **Seleziona gli eventi da ricevere**:
   - ✅ `checkout.session.completed` (ordini completati)
   - ✅ `customer.subscription.created` (nuovi abbonamenti)
   - ✅ `customer.subscription.updated` (modifiche abbonamenti)
   - ✅ `customer.subscription.deleted` (cancellazioni)
   - ✅ `payment_intent.succeeded` (pagamenti riusciti)
   - ✅ `payment_intent.payment_failed` (pagamenti falliti)
   - ✅ `invoice.payment_succeeded` (fatture pagate)

5. **Copia il Webhook Secret** (inizia con `whsec_`)

### 3. Variabili d'Ambiente (.env)

Crea un file `.env` nel backend con queste variabili:

```env
# Server
PORT=3001
FRONTEND_URL=https://tuodominio.com
CORS_ORIGIN=https://tuodominio.com

# Stripe PRODUZIONE
STRIPE_SECRET_KEY=sk_live_TUA_CHIAVE_SEGRETA
STRIPE_PUBLISHABLE_KEY=pk_live_TUA_CHIAVE_PUBBLICA
STRIPE_WEBHOOK_SECRET=whsec_TUO_WEBHOOK_SECRET

# Email (IMPORTANTE per notifiche ordini)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tua-email@gmail.com
SMTP_PASS=password-app-specifica
MAIL_FROM="Fury Of Sparta <noreply@furyofsparta.com>"
ADMIN_EMAIL=admin@furyofsparta.com

# JWT Secret
JWT_SECRET=genera-una-stringa-random-sicura-qui
```

### 4. Configurazione Email

Per Gmail:
1. Vai su https://myaccount.google.com/security
2. Attiva la verifica in 2 passaggi
3. Genera una "Password per app"
4. Usa questa password nel file .env

## 📦 COME FUNZIONANO GLI ORDINI

### Flusso Automatico

1. **Cliente effettua acquisto** → Stripe Checkout
2. **Pagamento completato** → Stripe invia webhook
3. **Il tuo server riceve il webhook** e automaticamente:
   - ✅ Salva l'ordine nel database
   - 📧 Invia email di conferma al cliente
   - 📧 Invia notifica email all'admin
   - 💾 Aggiorna stato abbonamento utente
   - 📊 Aggiorna statistiche

### Gestione Ordini nel Pannello Admin

Accedi a `/admin` per:

- **Visualizzare tutti gli ordini** con dettagli completi
- **Vedere statistiche** (ricavi totali, abbonamenti attivi, etc.)
- **Esportare ordini in CSV** per contabilità
- **Link diretti a Stripe Dashboard** per ogni ordine

## 🔧 DEPLOYMENT SU VPS/SERVER

### 1. Preparazione Server

```bash
# Installa Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installa PM2 per gestire il processo
npm install -g pm2

# Installa Nginx per reverse proxy
sudo apt-get install nginx
```

### 2. Upload del Progetto

```bash
# Clona o carica il progetto
git clone [tuo-repository]
cd project

# Installa dipendenze backend
cd server
npm install

# Build frontend
cd ../
npm install
npm run build
```

### 3. Configurazione PM2

Crea un file `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'fury-backend',
    script: './server/index.js',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

Avvia con PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Configurazione Nginx

Crea `/etc/nginx/sites-available/furyofsparta`:

```nginx
server {
    listen 80;
    server_name tuodominio.com www.tuodominio.com;

    # Frontend
    location / {
        root /path/to/project/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Webhook Stripe (IMPORTANTE: raw body)
    location /webhook/stripe {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # IMPORTANTE per Stripe webhooks
        proxy_set_header Stripe-Signature $http_stripe_signature;
        proxy_pass_request_headers on;
    }
}
```

Attiva il sito:
```bash
sudo ln -s /etc/nginx/sites-available/furyofsparta /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tuodominio.com -d www.tuodominio.com
```

## 📊 MONITORAGGIO ORDINI

### Dashboard Admin

Accedi a `https://tuodominio.com/admin` per vedere:

- **Ordini in tempo reale**
- **Statistiche vendite**
- **Ricavi per prodotto**
- **Abbonamenti attivi**
- **Pagamenti falliti**

### Notifiche Email

Riceverai automaticamente email per:
- ✅ Nuovi ordini
- 🔄 Modifiche abbonamenti
- ❌ Pagamenti falliti
- 🎉 Nuove registrazioni

### File di Log

Gli ordini sono salvati anche in:
- `server/data/orders.json` - Backup locale di tutti gli ordini
- `server/logs/` - Log del server con PM2

## 🛠️ TROUBLESHOOTING

### Webhook non funziona?

1. **Verifica l'URL**: deve essere HTTPS in produzione
2. **Controlla il secret**: `STRIPE_WEBHOOK_SECRET` deve corrispondere
3. **Testa con Stripe CLI**:
   ```bash
   stripe listen --forward-to localhost:3001/webhook/stripe/webhook
   ```

### Email non inviate?

1. **Verifica credenziali SMTP** nel .env
2. **Controlla firewall** per porta SMTP (587/465)
3. **Guarda i log**: `pm2 logs fury-backend`

### Ordini non salvati?

1. **Verifica permessi** sulla cartella `server/data/`
2. **Controlla spazio disco** sul server
3. **Verifica webhook signature** nei log

## 📱 GESTIONE ABBONAMENTI

### Cancellazione Abbonamento

I clienti possono cancellare tramite:
1. **Customer Portal Stripe** (link nel loro account)
2. **Contattandoti** (puoi cancellare da Stripe Dashboard)

### Modifica Piano

1. Cliente va su Customer Portal
2. Seleziona nuovo piano
3. Il webhook aggiorna automaticamente il database

### Rimborsi

1. Vai su Stripe Dashboard
2. Trova il pagamento
3. Clicca "Refund"
4. Il webhook aggiornerà lo stato automaticamente

## 🔐 SICUREZZA

### Checklist Pre-Launch

- [ ] Chiavi Stripe di produzione configurate
- [ ] Webhook secret configurato
- [ ] SSL/HTTPS attivo
- [ ] Firewall configurato
- [ ] Backup automatici attivi
- [ ] Email di notifica configurate
- [ ] JWT secret sicuro generato
- [ ] File .env NON nel repository Git
- [ ] Rate limiting configurato
- [ ] CORS configurato correttamente

### Backup

Configura backup automatici:

```bash
# Crea script backup
cat > /home/backup_fury.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/fury_$DATE.tar.gz /path/to/project/server/data/
# Mantieni solo ultimi 30 giorni
find /backups -name "fury_*.tar.gz" -mtime +30 -delete
EOF

chmod +x /home/backup_fury.sh

# Aggiungi a crontab (backup giornaliero alle 3 AM)
crontab -e
# Aggiungi: 0 3 * * * /home/backup_fury.sh
```

## 📈 ANALYTICS E REPORTISTICA

### Report Mensili

Il sistema genera automaticamente:
- Totale ordini
- Ricavi per prodotto
- Tasso conversione trial
- Churn rate abbonamenti

### Export Dati

Dal pannello admin puoi:
1. **Esportare CSV** degli ordini
2. **Scaricare report** mensili
3. **Sincronizzare** con software contabilità

## 🆘 SUPPORTO

### Contatti Utili

- **Stripe Support**: https://support.stripe.com
- **Documentazione API**: https://stripe.com/docs/api
- **Status Page**: https://status.stripe.com

### Log Monitoring

```bash
# Vedi log in tempo reale
pm2 logs fury-backend

# Vedi ultimi errori
pm2 logs fury-backend --err

# Monitora risorse
pm2 monit
```

## ✅ POST-DEPLOYMENT CHECKLIST

Dopo il deployment, verifica:

1. [ ] **Test acquisto** con carta test Stripe
2. [ ] **Webhook ricevuto** correttamente
3. [ ] **Email inviate** (conferma ordine)
4. [ ] **Ordine visibile** nel pannello admin
5. [ ] **SSL funzionante** (lucchetto verde)
6. [ ] **Backup configurato** e testato
7. [ ] **Monitoring attivo** (uptime, errori)
8. [ ] **Customer Portal** Stripe configurato
9. [ ] **Termini e Privacy** linkati nel checkout
10. [ ] **Test su mobile** (responsive checkout)

---

## 📞 BISOGNO DI AIUTO?

Se hai problemi con il deployment o la gestione ordini:

1. Controlla i log: `pm2 logs`
2. Verifica webhook: Stripe Dashboard → Webhooks → Logs
3. Testa in locale prima del deployment
4. Usa Stripe Test Mode per verifiche

Buona vendita! 🚀
