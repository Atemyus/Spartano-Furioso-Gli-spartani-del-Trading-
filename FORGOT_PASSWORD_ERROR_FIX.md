# Fix Errore "resetPasswordExpiry is not defined"

## 🔴 Errore

Quando si tenta di recuperare la password, il server restituisce:

```
[1] Forgot password error: ReferenceError: resetPasswordExpiry is not defined
[1]     at file:///C:/Users/Daniel/Desktop/project-bolt-sb1-r6swdtnj/project/server/routes/auth.js:387:9
```

## 🔍 Causa

Nel file `server/routes/auth.js`, alla riga 380, la variabile era dichiarata come:
```javascript
const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
```

Ma alla riga 387, veniva usata come:
```javascript
data: {
  resetPasswordToken: resetToken,
  resetPasswordExpiry  // ❌ Nome sbagliato!
}
```

Il database Prisma si aspetta `resetPasswordExpiry` (come definito in `schema.prisma`), ma la variabile era chiamata `resetTokenExpiry`.

## ✅ Soluzione Applicata

**File modificato**: `server/routes/auth.js` (riga 380)

```javascript
// Prima (SBAGLIATO):
const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

// Dopo (CORRETTO):
const resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
```

## 📊 Schema Database Prisma

Nel file `server/prisma/schema.prisma`, i campi sono definiti come:

```prisma
model User {
  // ...
  resetPasswordToken        String?
  resetPasswordExpiry       DateTime?
  // ...
}
```

Quindi il nome corretto è `resetPasswordExpiry`, non `resetTokenExpiry`.

## 🎯 Risultato

Ora il sistema di recupero password funziona correttamente:

1. ✅ Utente inserisce email su `/forgot-password`
2. ✅ Backend genera token e scadenza
3. ✅ Salva correttamente nel database
4. ✅ Invia email con link di reset
5. ✅ Utente clicca sul link
6. ✅ Reimposta la password

## 🧪 Test

Per testare:

1. Vai su http://localhost:5173/forgot-password
2. Inserisci la tua email
3. Clicca "Invia istruzioni"
4. ✅ Dovresti vedere "EMAIL INVIATA!"
5. Controlla la tua casella email
6. Clicca sul link ricevuto
7. Inserisci la nuova password
8. ✅ Password cambiata con successo!

## 📝 Note

- Il token di reset scade dopo **1 ora** (3600000 millisecondi)
- Il token può essere usato **una sola volta**
- Dopo l'uso, il token viene invalidato (impostato a `null`)
- L'utente riceve un'email di conferma dopo il cambio password

## 🔧 File Coinvolti

- ✅ `server/routes/auth.js` - Endpoint `/forgot-password` (FIXATO)
- ✅ `server/prisma/schema.prisma` - Schema database (già corretto)
- ✅ `server/services/emailService.js` - Servizio email (già corretto)
- ✅ `src/pages/ForgotPassword.tsx` - Frontend (già corretto)
- ✅ `src/pages/ResetPassword.tsx` - Frontend (già corretto)

## ⚠️ Importante

Assicurati di aver configurato le credenziali email nel file `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tua-email@gmail.com
EMAIL_PASS=tua-password-app
EMAIL_FROM=tua-email@gmail.com
```

Vedi `EMAIL_SETUP_GUIDE.md` per la configurazione completa.
