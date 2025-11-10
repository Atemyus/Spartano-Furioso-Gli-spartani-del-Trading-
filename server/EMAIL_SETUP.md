# 📧 Configurazione Email Reale per Trading Falange

## OPZIONE 1: Gmail (Consigliata per iniziare)

### 1️⃣ Abilita l'autenticazione a 2 fattori su Gmail
1. Vai su https://myaccount.google.com/
2. Clicca su "Sicurezza" nel menu laterale
3. Abilita "Verifica in due passaggi" se non è già attiva

### 2️⃣ Crea una Password App
1. Sempre nella sezione Sicurezza
2. Cerca "Password per le app" (appare solo con 2FA attivo)
3. Clicca su "Password per le app"
4. Seleziona "Posta" e "Altro (nome personalizzato)"
5. Inserisci "Trading Falange" come nome
6. Clicca "Genera"
7. **COPIA LA PASSWORD DI 16 CARATTERI** (la vedrai solo una volta!)

### 3️⃣ Configura il file .env
Apri il file `server/.env` e modifica:

```env
# Email Configuration - Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tua.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # La password app di 16 caratteri (senza spazi)
EMAIL_SECURE=false
EMAIL_FROM="Trading Falange <tua.email@gmail.com>"

# Development mode - cambia in production quando pronto
NODE_ENV=production
```

---

## OPZIONE 2: Outlook/Hotmail

### Configura il file .env:
```env
# Email Configuration - Outlook
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=tua.email@outlook.com
EMAIL_PASS=tua-password-normale
EMAIL_SECURE=false
EMAIL_FROM="Trading Falange <tua.email@outlook.com>"

NODE_ENV=production
```

---

## OPZIONE 3: SendGrid (Professionale - 100 email/giorno gratis)

### 1️⃣ Registrati su SendGrid
1. Vai su https://signup.sendgrid.com/
2. Crea un account gratuito (100 email/giorno gratis)
3. Verifica la tua email

### 2️⃣ Crea una API Key
1. Vai su Settings → API Keys
2. Clicca "Create API Key"
3. Nome: "Trading Falange"
4. Permessi: "Full Access"
5. Copia la API key

### 3️⃣ Configura il file .env:
```env
# Email Configuration - SendGrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxx  # La tua API key di SendGrid
EMAIL_SECURE=false
EMAIL_FROM="Trading Falange <noreply@tuodominio.com>"

NODE_ENV=production
```

---

## OPZIONE 4: Brevo (ex SendinBlue) - 300 email/giorno gratis

### 1️⃣ Registrati su Brevo
1. Vai su https://www.brevo.com/
2. Crea account gratuito
3. Verifica email e telefono

### 2️⃣ Ottieni le credenziali SMTP
1. Vai su SMTP & API
2. Crea una SMTP Key
3. Copia le credenziali

### 3️⃣ Configura il file .env:
```env
# Email Configuration - Brevo
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=tua.email@esempio.com
EMAIL_PASS=xkeysib-xxxxxxxxxxxxx
EMAIL_SECURE=false
EMAIL_FROM="Trading Falange <noreply@tuodominio.com>"

NODE_ENV=production
```

---

## 🔥 Test Rapido

Dopo aver configurato, riavvia il server:
```bash
cd server
npm run dev
```

Poi registra un nuovo utente e controlla se ricevi l'email!

---

## ⚠️ Troubleshooting

### Se Gmail non funziona:
- Assicurati di usare la Password App, NON la password normale
- Verifica che la 2FA sia attiva
- Controlla che "Accesso app meno sicure" sia disabilitato (non serve con Password App)

### Se Outlook non funziona:
- Prova a abilitare l'autenticazione a 2 fattori
- Crea una password app come per Gmail

### Se le email vanno in SPAM:
- Usa un servizio professionale come SendGrid o Brevo
- Aggiungi record SPF/DKIM al tuo dominio (se hai un dominio)
- Usa un indirizzo email "noreply@tuodominio.com" invece di Gmail

---

## 📊 Confronto Servizi

| Servizio | Email Gratis | Facilità Setup | Affidabilità | Va in SPAM? |
|----------|--------------|----------------|--------------|-------------|
| Gmail | Illimitate* | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Possibile |
| Outlook | Illimitate* | ⭐⭐⭐⭐ | ⭐⭐⭐ | Possibile |
| SendGrid | 100/giorno | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Raramente |
| Brevo | 300/giorno | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Raramente |

*Gmail/Outlook hanno limiti giornalieri (500-1000 email) per evitare spam
