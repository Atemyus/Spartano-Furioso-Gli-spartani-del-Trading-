# 📧 GUIDA CONFIGURAZIONE EMAIL PER RESET PASSWORD

## ⚡ SETUP RAPIDO

### 1. CONFIGURARE GMAIL PER L'INVIO EMAIL

#### Passo 1: Abilita la verifica in 2 passaggi
1. Vai su https://myaccount.google.com/security
2. Clicca su "Verifica in due passaggi"
3. Segui le istruzioni per attivarla

#### Passo 2: Genera una Password App
1. Sempre in https://myaccount.google.com/security
2. Cerca "Password per le app"
3. Seleziona "Mail" come app
4. Seleziona "Altro" come dispositivo e scrivi "Trading Falange"
5. Clicca "Genera"
6. **COPIA LA PASSWORD DI 16 CARATTERI** (tipo: `abcd efgh ijkl mnop`)

### 2. CONFIGURA IL FILE .env

Apri il file `server/.env` e modifica queste righe:

```env
# Sostituisci con i tuoi dati reali
EMAIL_USER=TUA_EMAIL@gmail.com
EMAIL_PASS=INCOLLA_QUI_PASSWORD_16_CARATTERI_SENZA_SPAZI
EMAIL_FROM="Trading Falange <TUA_EMAIL@gmail.com>"

# IMPORTANTE: Assicurati che sia impostato su production
NODE_ENV=production
```

**Esempio completo:**
```env
EMAIL_USER=daniel.lillo@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM="Trading Falange <daniel.lillo@gmail.com>"
NODE_ENV=production
```

### 3. RIAVVIA IL SERVER

```bash
# Fermalo con CTRL+C se è già attivo, poi:
cd server
npm run dev:json
```

## 🧪 TEST DEL SISTEMA

### Test 1: Richiesta Reset Password

1. Vai su http://localhost:5173/login
2. Clicca "Password dimenticata?"
3. Inserisci la tua email (daniel-lillo@outlook.com)
4. Clicca "INVIA ISTRUZIONI"
5. **Controlla la tua email** (anche SPAM!)
6. Dovresti ricevere un'email con il link di reset

### Test 2: Reset Password

1. Clicca sul link nell'email (o copialo nel browser)
2. Inserisci una nuova password (es: NuovaPass123!)
3. Conferma la password
4. Clicca "REIMPOSTA PASSWORD"
5. Riceverai un'email di conferma

### Test 3: Login con Nuova Password

1. Vai su http://localhost:5173/login
2. Usa la tua email e la NUOVA password
3. Dovresti riuscire ad accedere!

## 🔍 VERIFICA PERSISTENZA

I dati sono salvati in `server/database/data/users.json`

Per verificare che la password sia stata cambiata:

1. Apri il file `server/database/data/users.json`
2. Trova il tuo utente
3. Il campo `password` dovrebbe avere un nuovo hash
4. Il campo `updatedAt` dovrebbe avere la data/ora del cambio

## ⚠️ TROUBLESHOOTING

### Email non arriva?

1. **Controlla SPAM/Promozioni**
2. **Verifica credenziali nel .env**
3. **Controlla i log del server** - dovrebbe dire:
   ```
   ✅ Connessione email verificata con successo!
   ✅ EMAIL INVIATA CON SUCCESSO!
   ```

### Errore "Invalid credentials"?

1. Assicurati di usare una Password App, NON la password Gmail normale
2. Rimuovi gli spazi dalla password app quando la incolli
3. Verifica che la 2FA sia attiva su Gmail

### Il link di reset non funziona?

1. Il link scade dopo 1 ora
2. Puoi richiederne uno nuovo dalla pagina "Password dimenticata"
3. Assicurati che il server sia attivo

### La password non si salva?

1. Verifica che il server usi `npm run dev:json` (NON `npm run dev`)
2. Controlla che il file `users.json` esista e sia scrivibile
3. Riavvia il server dopo modifiche al .env

## 📋 CHECKLIST FINALE

- [ ] Gmail con 2FA attiva
- [ ] Password App generata
- [ ] File .env configurato con email reale
- [ ] NODE_ENV=production nel .env
- [ ] Server riavviato con `npm run dev:json`
- [ ] Email di test ricevuta
- [ ] Password cambiata con successo
- [ ] Login funziona con nuova password
- [ ] Dati persistenti in users.json

## 🚀 FATTO!

Una volta completato, il sistema di reset password è:
- ✅ Completamente funzionante
- ✅ Con email reali
- ✅ Persistente (salva su file)
- ✅ Sicuro (token con scadenza)
- ✅ Professionale (email HTML belle)

---

**Nota**: Per production vera, considera di usare servizi email professionali come SendGrid, Mailgun, o AWS SES per migliori performance e deliverability.
