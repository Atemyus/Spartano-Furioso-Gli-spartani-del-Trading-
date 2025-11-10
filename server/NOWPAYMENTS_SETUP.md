# 🚀 Setup NOWPayments per Pagamenti Crypto

## ✅ **Cosa è NOWPayments?**

NOWPayments è un payment gateway per criptovalute (come Stripe per crypto).
- Supporta **200+ criptovalute** (BTC, ETH, USDT, BNB, TRX, ecc.)
- Commissioni basse (0.4-0.5%)
- Conversione automatica crypto → EUR
- API semplice e veloce

---

## 📋 **STEP 1: Registrazione NOWPayments**

1. Vai su **https://nowpayments.io/**
2. Clicca su "Get Started" o "Sign Up"
3. Compila il form di registrazione
4. Verifica la tua email

---

## 🔑 **STEP 2: Ottieni le API Keys**

1. Fai login su https://account.nowpayments.io/
2. Vai su **Settings** → **API Keys**
3. Clicca su **"Generate API Key"**
4. Copia la tua **API Key**
5. Copia anche l'**IPN Secret** (per i webhook)

---

## ⚙️ **STEP 3: Configurazione nel file .env**

Apri il file `.env` nella cartella `server` e aggiungi:

```env
# NOWPayments API Configuration
NOWPAYMENTS_API_KEY=la_tua_api_key_qui
NOWPAYMENTS_IPN_SECRET=il_tuo_ipn_secret_qui
```

**Esempio:**
```env
NOWPAYMENTS_API_KEY=ABC123XYZ...
NOWPAYMENTS_IPN_SECRET=secret_123abc...
```

---

## 🌐 **STEP 4: Configura IPN (Webhook)**

1. Vai su **Settings** → **IPN Settings** nel dashboard NOWPayments
2. Inserisci l'URL del webhook:
   ```
   https://tuodominio.com/api/payments/crypto/webhook
   ```
   
   **Per test in locale (con ngrok):**
   ```
   https://your-ngrok-url.ngrok.io/api/payments/crypto/webhook
   ```

3. Seleziona "Enable IPN"
4. Salva

---

## 💰 **STEP 5: Configura il Wallet di Ricezione**

1. Vai su **Settings** → **Payout Settings**
2. Scegli come vuoi ricevere i pagamenti:
   - **Opzione A:** Converti automaticamente in EUR/USD
   - **Opzione B:** Ricevi crypto direttamente
3. Aggiungi l'indirizzo del tuo wallet (es. MEXC, Binance, MetaMask)

---

## 🧪 **STEP 6: Test Sandbox (Opzionale)**

Per testare senza soldi reali:

1. Vai su https://sandbox.nowpayments.io/
2. Registrati con un account separato
3. Usa le API Keys del sandbox nel tuo `.env`:
   ```env
   NOWPAYMENTS_API_KEY=sandbox_api_key_qui
   ```

---

## 🔥 **STEP 7: Verifica Funzionamento**

1. Riavvia il server backend
2. Vai sul sito frontend
3. Clicca su un prodotto → "Acquista"
4. Seleziona "Criptovalute"
5. Clicca "Procedi al Pagamento"
6. Dovresti essere reindirizzato a NOWPayments

---

## 💎 **Crypto Supportate (Esempi)**

### **Popolari:**
- Bitcoin (BTC)
- Ethereum (ETH)
- USDT (Tether)
- USDC
- BNB (Binance Coin)
- TRX (Tron)

### **Altre 200+:**
- Litecoin (LTC)
- Dogecoin (DOGE)
- Cardano (ADA)
- Polkadot (DOT)
- Shiba Inu (SHIB)
- E molte altre...

---

## 📊 **Come Ricevere Pagamenti da MEXC**

I tuoi clienti possono pagare con crypto che hanno su MEXC:

1. **Cliente** compra crypto su MEXC (es. USDT)
2. **Cliente** clicca "Paga con Crypto" sul tuo sito
3. **NOWPayments** genera un indirizzo wallet
4. **Cliente** trasferisce USDT da MEXC al wallet NOWPayments
5. **NOWPayments** conferma il pagamento
6. **Tu** ricevi il pagamento (in EUR o crypto)

---

## ⚙️ **Configurazione Avanzata**

### **Commissioni**
- NOWPayments: 0.4-0.5%
- Network fees: Variabili (pagate dal cliente)

### **Tempi di Conferma**
- Bitcoin: ~10-60 minuti
- Ethereum: ~1-5 minuti
- USDT (TRC20): ~1 minuto
- Lightning Network: Istantaneo

### **Limiti**
- Minimo: Di solito €1-5 (dipende dalla crypto)
- Massimo: Nessun limite
- KYC: Non richiesto per la maggior parte degli importi

---

## 🆘 **Troubleshooting**

### **Errore: "NOWPayments non configurato"**
✅ Verifica che `NOWPAYMENTS_API_KEY` sia nel file `.env`
✅ Riavvia il server backend

### **Il pagamento non viene confermato**
✅ Controlla che l'IPN Callback URL sia configurato correttamente
✅ Verifica i log del server per errori webhook

### **Cliente dice "pagamento fallito"**
✅ Verifica che la network fee sia sufficiente
✅ Controlla se il pagamento è "pending" nel dashboard NOWPayments

---

## 📞 **Supporto**

- **Documentazione:** https://documenter.getpostman.com/view/7907941/T1LSCRHC
- **Support NOWPayments:** support@nowpayments.io
- **Telegram:** https://t.me/NOWPayments

---

## ✨ **Vantaggi vs Coinbase Commerce**

| Feature | NOWPayments | Coinbase Commerce |
|---------|-------------|-------------------|
| Crypto supportate | 200+ | 6 |
| Commissioni | 0.4-0.5% | 1% |
| Auto-conversion | ✅ | ❌ |
| API semplice | ✅ | ✅ |
| KYC richiesto | No (per <$10k) | Sì |
| Setup veloce | ✅ 5 min | ✅ 5 min |

---

🎉 **Configurazione completata!** Ora puoi accettare pagamenti in crypto da tutto il mondo!
