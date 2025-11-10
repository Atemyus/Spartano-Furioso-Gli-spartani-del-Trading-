# Guida alla Configurazione dei Metodi di Pagamento

Questa guida ti aiuterà a configurare i 3 metodi di pagamento disponibili nel sistema:
- ✅ **Stripe** (Carte di credito/debito)
- 💳 **PayPal** (Include opzione "Paga in 3 rate")
- ₿ **Criptovalute** (Bitcoin, Ethereum, USDT, ecc.)

---

## 🔵 1. Stripe (Già configurato)

Stripe è già configurato e funzionante. Se hai bisogno di modificare le credenziali:

1. Vai su https://dashboard.stripe.com/
2. Ottieni le tue chiavi API
3. Aggiorna nel file `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## 💙 2. PayPal (Con opzione rate)

### Passo 1: Crea un account PayPal Developer

1. Vai su https://developer.paypal.com/
2. Accedi con il tuo account PayPal (o creane uno)
3. Vai su "Dashboard" → "My Apps & Credentials"

### Passo 2: Crea un'applicazione

1. Clicca su "Create App"
2. Scegli un nome (es. "Trading Falange Store")
3. Seleziona "Merchant" come tipo di account
4. Clicca su "Create App"

### Passo 3: Ottieni le credenziali

1. Nella pagina della tua app, troverai:
   - **Client ID** (sotto "SANDBOX APP CREDENTIALS")
   - **Secret** (clicca su "Show" per visualizzarlo)
   
2. Copia queste credenziali nel file `.env`:
   ```
   PAYPAL_CLIENT_ID=il-tuo-client-id
   PAYPAL_SECRET=il-tuo-secret
   PAYPAL_ENV=sandbox  # usa 'live' per produzione
   ```

### Passo 4: Configurazione "Paga in 3 rate"

L'opzione "Paga in 3 rate" (PayPal Pay Later) è **automaticamente disponibile** per:
- Importi tra €30 e €2000
- Clienti in Italia con account PayPal validi
- Non richiede configurazione extra da parte tua

### Passo 5: Per andare in produzione

1. Nel PayPal Developer Dashboard, verifica il tuo account business
2. Ottieni le credenziali **LIVE** (non sandbox)
3. Cambia nel `.env`:
   ```
   PAYPAL_ENV=live
   ```
4. Configura il webhook URL su PayPal:
   - URL: `https://tuo-dominio.com/api/payments/paypal/webhook`
   - Eventi da ascoltare: `PAYMENT.CAPTURE.COMPLETED`

---

## 🟠 3. Criptovalute (Coinbase Commerce)

### Passo 1: Crea un account Coinbase Commerce

1. Vai su https://commerce.coinbase.com/
2. Clicca su "Get Started"
3. Completa la registrazione

### Passo 2: Ottieni la API Key

1. Dopo il login, vai su "Settings" → "API Keys"
2. Clicca su "Create an API Key"
3. Dai un nome (es. "Trading Falange API")
4. Copia la **API Key** (la vedrai solo una volta!)

### Passo 3: Configura nel file .env

```
COINBASE_COMMERCE_API_KEY=la-tua-api-key
```

### Passo 4: Configura il Webhook

1. Su Coinbase Commerce, vai su "Settings" → "Webhook subscriptions"
2. Clicca su "Add an endpoint"
3. Inserisci l'URL: `https://tuo-dominio.com/api/payments/crypto/webhook`
4. Seleziona gli eventi:
   - `charge:confirmed`
   - `charge:failed`
   - `charge:pending`
5. Salva e copia il **Webhook Secret**
6. Aggiungi nel `.env`:
   ```
   COINBASE_COMMERCE_WEBHOOK_SECRET=il-tuo-webhook-secret
   ```

### Criptovalute accettate

Coinbase Commerce accetta automaticamente:
- ✅ Bitcoin (BTC)
- ✅ Ethereum (ETH)
- ✅ Litecoin (LTC)
- ✅ Bitcoin Cash (BCH)
- ✅ USD Coin (USDC)
- ✅ Dogecoin (DOGE)
- ✅ Dai (DAI)

---

## 🧪 Test dei Pagamenti

### Test Stripe
- Carta di test: `4242 4242 4242 4242`
- Data scadenza: qualsiasi data futura
- CVC: qualsiasi 3 cifre

### Test PayPal
- Usa l'ambiente **sandbox**
- Crea account di test su https://developer.paypal.com/dashboard/accounts
- Usa le credenziali di test per simulare pagamenti

### Test Crypto
- Coinbase Commerce ha un ambiente di test integrato
- Quando crei un charge in modalità test, vedrai link per simulare pagamenti

---

## 🚀 Avvio del Server

Dopo aver configurato i file `.env`, riavvia il server:

```bash
cd project/server
npm run dev:js
```

Verifica nei log che tutto sia caricato correttamente:
- ✅ Stripe configurato
- 💳 PayPal configurato (o "PayPal non configurato" se opzionale)
- ₿ Coinbase configurato (o "Coinbase non configurato" se opzionale)

---

## ⚠️ Note Importanti

1. **Ambiente di test vs produzione**:
   - Usa sempre credenziali di **test/sandbox** durante lo sviluppo
   - Solo quando sei pronto per il lancio, passa alle credenziali **live/production**

2. **Sicurezza**:
   - Non condividere mai le tue chiavi API
   - Il file `.env` è automaticamente escluso da Git
   - Usa HTTPS in produzione per tutti i webhook

3. **Commissioni**:
   - **Stripe**: ~2.9% + €0.25 per transazione
   - **PayPal**: ~3.4% + €0.35 per transazione
   - **Crypto**: ~1% di commissione Coinbase Commerce

4. **Supporto clienti**:
   - Stripe: Eccellente supporto via email/chat
   - PayPal: Supporto via ticket
   - Coinbase Commerce: Documentazione e supporto email

---

## 📧 Configurazione Email

Le email di conferma ordine e accesso al corso vengono inviate automaticamente dopo ogni pagamento.
Assicurati di aver configurato anche le variabili email nel `.env`:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tua-email@gmail.com
EMAIL_PASS=password-app-gmail
VIMEO_COURSE_LINK=https://vimeo.com/showcase/...
VIMEO_COURSE_PASSWORD=password-vimeo
```

---

## 🆘 Troubleshooting

### Errore "PayPal non configurato"
- Verifica di aver aggiunto `PAYPAL_CLIENT_ID` e `PAYPAL_SECRET` nel file `.env`
- Riavvia il server

### Errore "Coinbase non configurato"
- Verifica di aver aggiunto `COINBASE_COMMERCE_API_KEY` nel file `.env`
- Riavvia il server

### Pagamento completato ma email non arrivano
- Controlla le credenziali email nel `.env`
- Verifica i log del server per errori SMTP
- Controlla la cartella SPAM dell'utente

### Webhook non funzionano
- Verifica che l'URL del webhook sia accessibile pubblicamente (usa ngrok per test locali)
- Controlla che i webhook secret siano corretti
- Verifica i log del server per eventuali errori

---

## 📚 Link Utili

- **Stripe**: https://stripe.com/docs
- **PayPal**: https://developer.paypal.com/docs
- **Coinbase Commerce**: https://commerce.coinbase.com/docs

---

Per qualsiasi domanda o problema, consulta la documentazione ufficiale dei provider o contatta il supporto tecnico.
