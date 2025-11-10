# Fix Recupero Password - Errore Email

## 🔴 Problema

Quando clicchi "Invia istruzioni" nella pagina di recupero password, esce il popup:
```
❌ Errore durante il recupero password
```

## 🔍 Causa

Il sistema email **NON è configurato**. Senza credenziali email nel file `.env`, il backend:
1. ✅ Genera correttamente il token di reset
2. ✅ Salva il token nel database
3. ❌ Tenta di inviare l'email con Ethereal (servizio di test)
4. ❌ L'email NON arriva mai all'utente

## ✅ Soluzione Rapida (5 minuti)

### Step 1: Configura Gmail

1. **Vai su Gmail** → Impostazioni Account → Sicurezza
2. **Attiva 2FA** (Verifica in due passaggi)
3. **Genera Password App**:
   - https://myaccount.google.com/apppasswords
   - Seleziona "Posta" + "Computer Windows"
   - Copia la password (16 caratteri, tipo: `abcd efgh ijkl mnop`)

### Step 2: Modifica il file `.env`

Apri il file `.env` nella root del progetto e aggiungi:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tua-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=tua-email@gmail.com
```

⚠️ **Sostituisci**:
- `tua-email@gmail.com` con la tua email Gmail
- `abcd efgh ijkl mnop` con la Password App generata

### Step 3: Riavvia il Server

```bash
# Ferma il server (Ctrl+C nel terminale)
# Riavvia
npm run dev
```

Dovresti vedere:
```
📧 Usando servizio email configurato: smtp.gmail.com
✅ Connessione email verificata con successo!
```

### Step 4: Testa

1. Vai su http://localhost:5173/forgot-password
2. Inserisci la tua email
3. Clicca "Invia istruzioni"
4. ✅ Dovresti vedere "EMAIL INVIATA!"
5. Controlla la tua casella Gmail (anche SPAM)

## 🔧 Alternativa: Usa il Link dalla Console (Senza Email)

Se non vuoi configurare le email subito, puoi usare il link di reset che appare nella console del server:

1. Vai su `/forgot-password`
2. Inserisci l'email
3. Clicca "Invia istruzioni"
4. Guarda la console del server, vedrai:
```
🔗 LINK DI RESET PASSWORD PER TEST:
http://localhost:5173/reset-password?token=abc123xyz...
```
5. Copia quel link e aprilo nel browser
6. Inserisci la nuova password

⚠️ **Nota**: Questo funziona solo in modalità development (`NODE_ENV=development`)

## 📊 Come Funziona il Sistema

### 1. Frontend (`/forgot-password`)
```typescript
// Chiama l'API
fetch('http://localhost:3001/api/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify({ email })
})
```

### 2. Backend (`/api/auth/forgot-password`)
```javascript
// 1. Trova l'utente
const user = await prisma.user.findUnique({ where: { email } });

// 2. Genera token
const resetToken = crypto.randomBytes(32).toString('hex');

// 3. Salva token nel DB
await prisma.user.update({
  where: { id: user.id },
  data: {
    resetPasswordToken: resetToken,
    resetPasswordExpiry: new Date(Date.now() + 3600000) // 1 ora
  }
});

// 4. Invia email
const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
await sendEmail(email, 'passwordReset', { userName: user.name, resetLink });
```

### 3. Email Service (`emailService.js`)
```javascript
// Se EMAIL_HOST è configurato → Invia email reale
// Altrimenti → Usa Ethereal (solo test, NON invia email reali)
```

### 4. Utente Clicca sul Link
```
http://localhost:5173/reset-password?token=abc123...
```

### 5. Frontend (`/reset-password`)
```typescript
// Chiama l'API per cambiare password
fetch('http://localhost:3001/api/auth/reset-password', {
  method: 'POST',
  body: JSON.stringify({ token, password })
})
```

### 6. Backend (`/api/auth/reset-password`)
```javascript
// 1. Verifica token
const user = await prisma.user.findFirst({
  where: {
    resetPasswordToken: token,
    resetPasswordExpiry: { gt: new Date() } // Non scaduto
  }
});

// 2. Aggiorna password
const hashedPassword = await bcrypt.hash(password, 10);
await prisma.user.update({
  where: { id: user.id },
  data: {
    password: hashedPassword,
    resetPasswordToken: null, // Invalida token
    resetPasswordExpiry: null
  }
});

// 3. Invia email di conferma
await sendEmail(user.email, 'passwordChanged', { userName: user.name });
```

## 🎯 Checklist Completa

- [ ] Configurare Gmail con 2FA
- [ ] Generare Password App
- [ ] Aggiungere credenziali al `.env`
- [ ] Riavviare il server
- [ ] Verificare log: "✅ Connessione email verificata"
- [ ] Testare recupero password
- [ ] Controllare email ricevuta
- [ ] Testare reset password completo
- [ ] Verificare email di conferma cambio password

## 📝 Note Importanti

1. **Token Scadenza**: Il token di reset scade dopo **1 ora**
2. **Token Usa e Getta**: Ogni token può essere usato **una sola volta**
3. **Sicurezza**: Il token viene invalidato dopo l'uso
4. **Email di Conferma**: Dopo il cambio password, l'utente riceve un'email di conferma
5. **Development Mode**: In development, il link appare sempre nella console anche se l'email fallisce

## 🚀 Per Produzione

Per la produzione, usa un servizio professionale:
- **SendGrid** (100 email/giorno gratis)
- **Mailgun** (100 email/giorno gratis)
- **Amazon SES** (molto economico)

Vedi `EMAIL_SETUP_GUIDE.md` per la configurazione completa.

## ❓ Troubleshooting

### Errore: "Invalid login: 535"
- ✅ Usa Password App, non la password normale
- ✅ Verifica che 2FA sia attiva

### Errore: "Connection timeout"
- ✅ Verifica connessione internet
- ✅ Controlla firewall/antivirus

### Email non arriva
- ✅ Controlla SPAM
- ✅ Verifica che EMAIL_FROM sia uguale a EMAIL_USER (per Gmail)
- ✅ Controlla i log del server

### "Errore durante il recupero password"
- ✅ Verifica che le variabili EMAIL_* siano nel `.env`
- ✅ Riavvia il server dopo aver modificato `.env`
- ✅ Controlla i log del server per errori specifici
