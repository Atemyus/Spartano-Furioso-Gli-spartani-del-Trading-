# 🚀 Configurazione Stripe per Spartano Furioso

## 📋 Prerequisiti
- Account Stripe (gratuito): https://dashboard.stripe.com/register
- Server backend in esecuzione sulla porta 3001

## 🔑 Step 1: Ottenere le Chiavi API

1. Accedi a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Assicurati di essere in **Test Mode** (switch in alto a destra)
3. Vai su **Developers** → **API keys**
4. Copia:
   - **Publishable key** (inizia con `pk_test_`)
   - **Secret key** (inizia con `sk_test_`)

## 📝 Step 2: Configurare le Chiavi nel Backend

1. Apri il file `server/.env`
2. Sostituisci le chiavi fittizie con le tue:

```env
# Stripe configuration
STRIPE_SECRET_KEY=sk_test_TUA_CHIAVE_SEGRETA
STRIPE_PUBLISHABLE_KEY=pk_test_TUA_CHIAVE_PUBBLICA
```

## 🔗 Step 3: Configurare il Webhook (Opzionale ma Consigliato)

1. In Stripe Dashboard, vai su **Developers** → **Webhooks**
2. Clicca **Add endpoint**
3. Inserisci:
   - **Endpoint URL**: `http://localhost:3001/webhook/stripe`
   - **Events to listen**: Seleziona almeno:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

4. Dopo la creazione, copia il **Signing secret** (inizia con `whsec_`)
5. Aggiungilo nel file `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_TUO_WEBHOOK_SECRET
```

## 🧪 Step 4: Testare i Pagamenti

### Carte di Test Stripe
Usa queste carte per testare diversi scenari:

| Carta | Numero | CVV | Data | Risultato |
|-------|--------|-----|------|-----------|
| ✅ Successo | 4242 4242 4242 4242 | Qualsiasi | Futura | Pagamento riuscito |
| ❌ Rifiutata | 4000 0000 0000 0002 | Qualsiasi | Futura | Carta rifiutata |
| 🔐 3D Secure | 4000 0025 0000 3155 | Qualsiasi | Futura | Richiede autenticazione |

### Test del Flusso di Pagamento

1. **Avvia il backend**:
   ```bash
   cd server
   npm run dev:js
   ```

2. **Avvia il frontend**:
   ```bash
   cd ..
   npm run dev
   ```

3. **Test di un acquisto**:
   - Vai alla homepage
   - Clicca su un prodotto
   - Seleziona un piano di abbonamento
   - Verrai reindirizzato a Stripe Checkout
   - Usa una carta di test
   - Completa il pagamento

## 📊 Step 5: Verificare i Pagamenti

1. Torna alla [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vai su **Payments** per vedere i pagamenti di test
3. Vai su **Customers** per vedere i clienti creati
4. Vai su **Subscriptions** per gli abbonamenti attivi

## 🔄 Step 6: Gestione Abbonamenti

Il sistema supporta:
- **Mensile**: Fatturazione ricorrente ogni mese
- **Annuale**: Fatturazione ricorrente ogni anno
- **Lifetime**: Pagamento unico (non è un abbonamento)

### Cancellazione Abbonamenti
Gli utenti possono gestire i loro abbonamenti dalla Dashboard utente.

## ⚠️ Note Importanti

### Per l'Ambiente di Test
- Tutti i pagamenti sono simulati
- Nessun denaro reale viene trasferito
- Puoi testare illimitatamente

### Prima di Andare Live
1. Ottieni le chiavi API di produzione
2. Configura un webhook pubblico (non localhost)
3. Implementa HTTPS sul tuo dominio
4. Aggiorna tutti gli URL nei file di configurazione
5. Testa accuratamente tutto il flusso

## 🛠️ Troubleshooting

### "Invalid API Key"
- Verifica che le chiavi nel `.env` siano corrette
- Assicurati di usare chiavi test per development

### "Webhook Error"
- Il webhook è opzionale per test locali
- Per produzione, assicurati che l'URL sia pubblicamente accessibile

### "Payment Failed"
- Controlla la console del browser per errori
- Verifica i log del server
- Assicurati di usare carte di test valide

## 📚 Risorse Utili

- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Webhook Guide](https://stripe.com/docs/webhooks)
- [API Reference](https://stripe.com/docs/api)

---

💡 **Tip**: Salva questa guida per riferimento futuro quando configurerai Stripe in produzione!
