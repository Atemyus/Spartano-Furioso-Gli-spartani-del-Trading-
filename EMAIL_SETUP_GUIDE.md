# Guida Configurazione Sistema Email

## Problema Attuale

Quando provi a recuperare la password, ricevi l'errore **"Errore durante il recupero password"** perché il sistema email **NON è configurato** con credenziali reali.

Attualmente il sistema usa **Ethereal Email** (servizio di test) che:
- ❌ NON invia email reali
- ✅ Mostra solo un'anteprima nella console del server
- ✅ Utile solo per sviluppo/test

## Come Funziona il Sistema

### 1. Backend (`server/routes/auth.js`)
L'endpoint `/api/auth/forgot-password`:
- ✅ Riceve l'email
- ✅ Genera un token di reset
- ✅ Salva il token nel database
- ✅ Chiama `sendEmail()` per inviare l'email
- ⚠️ Se `sendEmail()` fallisce, restituisce errore 500

### 2. Email Service (`server/services/emailService.js`)
La funzione `sendEmail()`:
- Controlla se ci sono credenziali email nel `.env`
- **SE NON CI SONO**: Usa Ethereal Email (test)
- **SE CI SONO**: Usa il servizio email configurato (Gmail, SendGrid, etc.)

## Soluzione: Configurare Email Reali

### Opzione 1: Gmail (Consigliata per Test)

1. **Abilita 2FA su Gmail**:
   - Vai su https://myaccount.google.com/security
   - Attiva "Verifica in due passaggi"

2. **Genera Password App**:
   - Vai su https://myaccount.google.com/apppasswords
   - Seleziona "Posta" e "Computer Windows"
   - Copia la password generata (16 caratteri)

3. **Aggiungi al file `.env`**:
```env
# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tua-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # Password App (16 caratteri)
EMAIL_FROM=tua-email@gmail.com
```

### Opzione 2: SendGrid (Consigliata per Produzione)

1. **Crea account su SendGrid**:
   - Vai su https://sendgrid.com
   - Registrati (piano gratuito: 100 email/giorno)

2. **Genera API Key**:
   - Dashboard → Settings → API Keys
   - Crea nuova API Key con permessi "Mail Send"

3. **Aggiungi al file `.env`**:
```env
# Email Configuration (SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxx  # La tua API Key
EMAIL_FROM=noreply@tuodominio.com
```

### Opzione 3: Mailgun

```env
# Email Configuration (Mailgun)
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@tuodominio.mailgun.org
EMAIL_PASS=la-tua-password-mailgun
EMAIL_FROM=noreply@tuodominio.com
```

### Opzione 4: Outlook/Hotmail

```env
# Email Configuration (Outlook)
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tua-email@outlook.com
EMAIL_PASS=la-tua-password
EMAIL_FROM=tua-email@outlook.com
```

## Verifica Configurazione

### 1. Aggiungi le variabili al `.env`

Apri il file `.env` nella root del progetto e aggiungi le configurazioni email scelte.

### 2. Riavvia il server

```bash
# Ferma il server (Ctrl+C)
# Riavvia
npm run dev
```

### 3. Controlla i log

Quando il server si avvia, dovresti vedere:
```
📧 Usando servizio email configurato: smtp.gmail.com
✅ Connessione email verificata con successo!
```

Se vedi errori:
```
❌ Errore verifica connessione email: ...
```
Controlla le credenziali nel `.env`.

### 4. Testa il recupero password

1. Vai su `/forgot-password`
2. Inserisci la tua email
3. Clicca "Invia istruzioni"
4. Controlla:
   - ✅ La console del server (dovrebbe mostrare "✅ EMAIL INVIATA CON SUCCESSO!")
   - ✅ La tua casella email (anche SPAM)

## Debug: Modalità Development

In modalità development, il server mostra il link di reset nella console anche se l'email fallisce:

```
🔗 LINK DI RESET PASSWORD PER TEST:
http://localhost:5173/reset-password?token=abc123...
```

Puoi copiare questo link e usarlo direttamente nel browser per testare il reset password anche senza email configurate.

## Cosa Succede Dopo

### 1. Utente Riceve Email
L'email contiene:
- Link di reset: `http://localhost:5173/reset-password?token=TOKEN`
- Il token scade dopo **1 ora**

### 2. Utente Clicca sul Link
Viene reindirizzato a `/reset-password?token=TOKEN`

### 3. Utente Inserisce Nuova Password
Il frontend chiama `/api/auth/reset-password` con:
- `token`: Il token dall'URL
- `password`: La nuova password

### 4. Backend Verifica e Aggiorna
- ✅ Verifica che il token esista
- ✅ Verifica che non sia scaduto
- ✅ Aggiorna la password
- ✅ Invalida il token
- ✅ Invia email di conferma cambio password

## File da Modificare

### 1. `.env` (root del progetto)
Aggiungi le variabili email come mostrato sopra.

### 2. `.env.example` (opzionale)
Aggiungi le variabili come esempio per altri sviluppatori:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

## Checklist Completa

- [ ] Scegli un servizio email (Gmail, SendGrid, etc.)
- [ ] Ottieni le credenziali (password app, API key, etc.)
- [ ] Aggiungi le variabili al file `.env`
- [ ] Riavvia il server
- [ ] Verifica i log del server (✅ Connessione email verificata)
- [ ] Testa il recupero password
- [ ] Controlla la casella email (anche SPAM)
- [ ] Testa il reset password completo

## Errori Comuni

### "Errore durante il recupero password"
**Causa**: Credenziali email non configurate o errate
**Soluzione**: Verifica le variabili nel `.env` e riavvia il server

### "Invalid login: 535 Authentication failed"
**Causa**: Password errata o 2FA non configurata (Gmail)
**Soluzione**: Usa una Password App invece della password normale

### "Connection timeout"
**Causa**: Firewall o porta bloccata
**Soluzione**: Verifica che la porta 587 sia aperta

### Email finisce nello SPAM
**Causa**: Dominio non verificato o reputazione bassa
**Soluzione**: 
- Usa un servizio professionale (SendGrid)
- Verifica il dominio SPF/DKIM
- Chiedi agli utenti di aggiungere l'email ai contatti

## Produzione

Per la produzione, usa:
- ✅ SendGrid (100 email/giorno gratis)
- ✅ Mailgun (100 email/giorno gratis)
- ✅ Amazon SES (molto economico)
- ❌ NON usare Gmail (limite 500 email/giorno)

## Supporto

Se hai problemi:
1. Controlla i log del server
2. Verifica le credenziali nel `.env`
3. Testa con Ethereal Email (rimuovi le variabili EMAIL_* dal `.env`)
4. Controlla la documentazione del servizio email scelto
