# 🚀 Guida Deploy Completa - Passo dopo Passo

## 📖 Indice

1. [Preparazione Iniziale](#parte-1-preparazione-iniziale)
2. [Setup Database MongoDB](#parte-2-setup-database-mongodb)
3. [Configurazione Stripe](#parte-3-configurazione-stripe)
4. [Setup Email SendGrid](#parte-4-setup-email-sendgrid)
5. [Deploy Backend Railway](#parte-5-deploy-backend-railway)
6. [Deploy Frontend Vercel](#parte-6-deploy-frontend-vercel)
7. [Test Finale](#parte-7-test-finale)
8. [Troubleshooting](#parte-8-troubleshooting)

**Tempo totale stimato: 2-3 ore**

---

# PARTE 1: Preparazione Iniziale

## Step 1.1: Cambiare Credenziali Admin (5 minuti)

### **Cosa faremo:**
Cambieremo email e password dell'amministratore per sicurezza.

### **Procedura:**

1. **Apri terminale PowerShell**
   - Premi `Windows + X`
   - Seleziona "Windows PowerShell" o "Terminale"

2. **Naviga nella cartella server**
   ```powershell
   cd c:\Users\Daniel\Desktop\project-bolt-sb1-r6swdtnj\project\server
   ```

3. **Esegui script cambio credenziali**
   ```powershell
   npm run admin:update
   ```

4. **Vedrai questo output:**
   ```
   🔐 AGGIORNA CREDENZIALI ADMIN - Spartano Furioso

   📋 Admin attuale:
      Nome: Admin
      Email: admin@spartanofurioso.com
      ID: user_xxx
   ```

5. **Inserisci nuova email**
   ```
   📧 Nuova email (lascia vuoto per mantenere attuale): 
   ```
   
   **Digita:** `admin@tuosito.com` (sostituisci con la tua email)
   
   **Premi:** INVIO

6. **Inserisci nuova password**
   ```
   🔑 Nuova password (minimo 8 caratteri): 
   ```
   
   **Digita:** `Sp@rt4n0_Fur10s0#2024!Tr4d1ng`
   
   **Premi:** INVIO

7. **Conferma modifiche**
   ```
   📝 RIEPILOGO MODIFICHE:
      Email: admin@spartanofurioso.com → admin@tuosito.com
      Password: ******** → **********************

   ❓ Confermi le modifiche? (s/n): 
   ```
   
   **Digita:** `s`
   
   **Premi:** INVIO

8. **Successo!**
   ```
   ✅ CREDENZIALI AGGIORNATE CON SUCCESSO!

   📋 NUOVE CREDENZIALI:
      Email: admin@tuosito.com
      Password: Sp@rt4n0_Fur10s0#2024!Tr4d1ng
   ```

9. **IMPORTANTE: Salva queste credenziali!**
   - Apri un file di testo temporaneo
   - Copia email e password
   - Salvale in un password manager (Bitwarden, 1Password)
   - **NON perdere queste credenziali!**

### **✅ Checkpoint:**
- [ ] Email admin cambiata
- [ ] Password admin cambiata
- [ ] Credenziali salvate in posto sicuro

---

## Step 1.2: Reset Analytics (3 minuti)

### **Cosa faremo:**
Azzereremo le analytics di test e configureremo l'esclusione del tuo IP.

### **Procedura:**

1. **Nello stesso terminale, esegui:**
   ```powershell
   node scripts/setupAnalytics.cjs
   ```

2. **Vedrai:**
   ```
   🎯 SETUP ANALYTICS - Spartano Furioso

   📍 STEP 1: Scoperta IP...

   ✅ Il tuo IP pubblico è: 93.45.123.456
   ```

3. **Configurare IP nel .env?**
   ```
   📝 Vuoi configurare questo IP nel file .env? (s/n): 
   ```
   
   **Digita:** `s`
   
   **Premi:** INVIO

4. **Azzerare analytics?**
   ```
   📊 Analytics attuali: 8,234 visite

   🔄 Vuoi azzerare le analytics attuali? (s/n): 
   ```
   
   **Digita:** `s`
   
   **Premi:** INVIO

5. **Successo!**
   ```
   ✅ SETUP COMPLETATO!

   📋 RIEPILOGO:
      • Il tuo IP: 93.45.123.456
      • IP configurato in .env ✅
      • Analytics azzerate ✅
      • Backup creato ✅
   ```

### **✅ Checkpoint:**
- [ ] IP scoperto e configurato
- [ ] Analytics azzerate
- [ ] Backup creato

---

## Step 1.3: Verifica File Download (2 minuti)

### **Cosa faremo:**
Verificheremo che il file EA sia presente per il download.

### **Procedura:**

1. **Verifica file presente:**
   ```powershell
   cd ..
   ls public\downloads\
   ```

2. **Dovresti vedere:**
   ```
   Mode    LastWriteTime         Length Name
   ----    -------------         ------ ----
   -a----  10/11/2025   03:44    1556537 fury-of-sparta-v2.0.zip
   ```

3. **Se il file NON c'è:**
   - Copia il file dalla tua cartella Desktop
   - Rinominalo in: `fury-of-sparta-v2.0.zip`
   - Mettilo in: `public\downloads\`

### **✅ Checkpoint:**
- [ ] File `fury-of-sparta-v2.0.zip` presente
- [ ] Dimensione corretta (circa 1.5 MB)

---

# PARTE 2: Setup Database MongoDB

## Step 2.1: Creare Account MongoDB Atlas (10 minuti)

### **Cosa faremo:**
Creeremo un database cloud gratuito per salvare tutti i dati.

### **Procedura:**

1. **Apri browser**
   - Vai su: https://www.mongodb.com/cloud/atlas/register

2. **Registrati**
   ```
   ┌─────────────────────────────────┐
   │ Sign up for MongoDB Atlas      │
   ├─────────────────────────────────┤
   │ Email: tua@email.com           │
   │ Password: [password sicura]     │
   │ First Name: [tuo nome]          │
   │ Last Name: [tuo cognome]        │
   │                                 │
   │ [✓] I agree to terms            │
   │                                 │
   │ [Sign Up]                       │
   └─────────────────────────────────┘
   ```
   
   - Compila il form
   - Click **"Sign Up"**
   - Verifica email (controlla inbox)
   - Click sul link di verifica

3. **Completa profilo**
   ```
   Tell us about yourself:
   - Goal: Learn MongoDB ✓
   - Experience: Beginner ✓
   - Use case: Build a new app ✓
   ```
   
   - Seleziona le opzioni
   - Click **"Finish"**

4. **Crea Organization**
   ```
   Organization Name: Spartano Furioso
   ```
   
   - Inserisci nome
   - Click **"Next"**

5. **Crea Project**
   ```
   Project Name: spartano-production
   ```
   
   - Inserisci nome
   - Click **"Next"**

### **✅ Checkpoint:**
- [ ] Account MongoDB creato
- [ ] Email verificata
- [ ] Organization creata
- [ ] Project creato

---

## Step 2.2: Creare Cluster Database (5 minuti)

### **Procedura:**

1. **Deploy a cluster**
   ```
   ┌─────────────────────────────────┐
   │ Deploy a cloud database         │
   ├─────────────────────────────────┤
   │ [M0 FREE] Shared                │
   │ [M10] Dedicated                 │
   │ [M30] Dedicated                 │
   └─────────────────────────────────┘
   ```
   
   - Click **"M0 FREE"** (gratuito)
   - Click **"Create"**

2. **Configura cluster:**
   ```
   Provider: AWS ✓
   Region: Europe (Frankfurt) eu-central-1 ✓
   Cluster Name: spartano-furioso
   ```
   
   - Provider: Seleziona **AWS**
   - Region: Seleziona **Europe (Frankfurt)** o **Ireland**
   - Name: Digita `spartano-furioso`
   - Click **"Create Cluster"**

3. **Attendi creazione (2-3 minuti)**
   ```
   Creating your cluster...
   [████████████░░░░░░░░] 60%
   ```
   
   - Aspetta che finisca
   - Vedrai: ✅ "Cluster created successfully"

### **✅ Checkpoint:**
- [ ] Cluster M0 (gratuito) creato
- [ ] Region: Europe
- [ ] Nome: spartano-furioso

---

## Step 2.3: Configurare Accesso Database (5 minuti)

### **Procedura:**

1. **Security Quickstart apparirà automaticamente**

2. **Create Database User:**
   ```
   ┌─────────────────────────────────┐
   │ How would you like to           │
   │ authenticate your connection?   │
   ├─────────────────────────────────┤
   │ Username: spartano_admin        │
   │ Password: [Auto-generate]       │
   │                                 │
   │ [Create User]                   │
   └─────────────────────────────────┘
   ```
   
   - Username: Digita `spartano_admin`
   - Password: Click **"Autogenerate Secure Password"**
   - **COPIA LA PASSWORD!** (la vedrai solo ora)
   - Click **"Create User"**

3. **Salva credenziali database:**
   ```
   Username: spartano_admin
   Password: [la password generata]
   ```
   
   - Apri file di testo
   - Copia username e password
   - Salva in posto sicuro

4. **Add IP Address:**
   ```
   ┌─────────────────────────────────┐
   │ Where would you like to         │
   │ connect from?                   │
   ├─────────────────────────────────┤
   │ ○ My Local Environment          │
   │ ● Cloud Environment             │
   │                                 │
   │ IP Address: 0.0.0.0/0          │
   │ Description: Allow all          │
   │                                 │
   │ [Add Entry]                     │
   └─────────────────────────────────┘
   ```
   
   - Seleziona **"Cloud Environment"**
   - IP: Digita `0.0.0.0/0` (permette tutti gli IP)
   - Description: `Allow all`
   - Click **"Add Entry"**
   - Click **"Finish and Close"**

### **✅ Checkpoint:**
- [ ] Utente database creato
- [ ] Password salvata
- [ ] IP whitelist configurato (0.0.0.0/0)

---

## Step 2.4: Ottenere Connection String (3 minuti)

### **Procedura:**

1. **Nella dashboard, click "Connect"**
   ```
   [Connect] button sul cluster spartano-furioso
   ```

2. **Seleziona metodo:**
   ```
   ┌─────────────────────────────────┐
   │ Connect to spartano-furioso     │
   ├─────────────────────────────────┤
   │ ○ Shell                         │
   │ ● Drivers                       │
   │ ○ Compass                       │
   └─────────────────────────────────┘
   ```
   
   - Click **"Drivers"**

3. **Seleziona driver:**
   ```
   Driver: Node.js
   Version: 5.5 or later
   ```
   
   - Driver: Seleziona **Node.js**
   - Version: Seleziona **5.5 or later**

4. **Copia connection string:**
   ```
   mongodb+srv://spartano_admin:<password>@spartano-furioso.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   
   - Click **"Copy"** accanto alla stringa
   - Incolla in file di testo temporaneo

5. **Sostituisci `<password>`:**
   ```
   Prima:
   mongodb+srv://spartano_admin:<password>@spartano-furioso...

   Dopo:
   mongodb+srv://spartano_admin:TuaPasswordGenerata@spartano-furioso...
   ```
   
   - Sostituisci `<password>` con la password salvata prima
   - **NON** includere `<` e `>`
   - Salva la stringa completa

### **✅ Checkpoint:**
- [ ] Connection string copiata
- [ ] Password sostituita
- [ ] Stringa completa salvata

---

## Step 2.5: Configurare .env con MongoDB (2 minuti)

### **Procedura:**

1. **Apri file .env del server**
   - Percorso: `c:\Users\Daniel\Desktop\project-bolt-sb1-r6swdtnj\project\server\.env`
   - Apri con editor di testo o VS Code

2. **Trova o aggiungi queste righe:**
   ```bash
   # Database
   MONGODB_URI=
   DATABASE_URL=
   ```

3. **Incolla la connection string:**
   ```bash
   # Database
   MONGODB_URI=mongodb+srv://spartano_admin:TuaPassword@spartano-furioso.xxxxx.mongodb.net/spartano-db?retryWrites=true&w=majority
   DATABASE_URL=mongodb+srv://spartano_admin:TuaPassword@spartano-furioso.xxxxx.mongodb.net/spartano-db?retryWrites=true&w=majority
   ```
   
   - Sostituisci con la TUA connection string completa
   - Aggiungi `/spartano-db` prima del `?`
   - Salva il file

4. **Verifica:**
   - La stringa deve essere su UNA riga
   - Password corretta (senza `<` `>`)
   - `/spartano-db` presente

### **✅ Checkpoint:**
- [ ] File .env aperto
- [ ] MONGODB_URI configurato
- [ ] DATABASE_URL configurato
- [ ] File salvato

---

# PARTE 3: Configurazione Stripe

## Step 3.1: Creare Account Stripe (5 minuti)

### **Cosa faremo:**
Configureremo Stripe per accettare pagamenti reali.

### **Procedura:**

1. **Vai su Stripe**
   - URL: https://dashboard.stripe.com/register

2. **Registrati:**
   ```
   ┌─────────────────────────────────┐
   │ Create your Stripe account      │
   ├─────────────────────────────────┤
   │ Email: tua@email.com           │
   │ Full name: [tuo nome]           │
   │ Country: Italy                  │
   │ Password: [password sicura]     │
   │                                 │
   │ [Create account]                │
   └─────────────────────────────────┘
   ```
   
   - Compila il form
   - Country: Seleziona **Italy**
   - Click **"Create account"**

3. **Verifica email**
   - Controlla inbox
   - Click sul link di verifica

4. **Completa profilo business:**
   ```
   Business type: Individual / Company
   Business name: Spartano Furioso
   Industry: Software / SaaS
   Website: tuosito.com
   ```
   
   - Compila tutti i campi richiesti
   - Click **"Continue"**

5. **Aggiungi dati bancari:**
   - IBAN del tuo conto
   - Nome intestatario
   - Click **"Save"**

### **✅ Checkpoint:**
- [ ] Account Stripe creato
- [ ] Email verificata
- [ ] Profilo business completato
- [ ] Dati bancari aggiunti

---

## Step 3.2: Attivare Modalità LIVE (3 minuti)

### **Procedura:**

1. **Nella dashboard Stripe, guarda in alto a destra:**
   ```
   ┌─────────────────────┐
   │ [Test mode ▼]       │
   └─────────────────────┘
   ```

2. **Click sul toggle "Test mode"**
   ```
   ┌─────────────────────────────────┐
   │ Switch to live mode?            │
   ├─────────────────────────────────┤
   │ You'll need to complete your    │
   │ account setup first.            │
   │                                 │
   │ [Complete setup] [Cancel]       │
   └─────────────────────────────────┘
   ```

3. **Se appare "Complete setup":**
   - Click **"Complete setup"**
   - Completa eventuali informazioni mancanti:
     - Documento identità
     - Indirizzo
     - Codice fiscale/P.IVA
   - Click **"Submit"**

4. **Attendi verifica (può richiedere 1-2 giorni)**
   - Stripe verificherà i documenti
   - Riceverai email di conferma
   - **Nel frattempo, puoi continuare con modalità Test**

5. **Quando verificato, attiva LIVE mode:**
   ```
   ┌─────────────────────┐
   │ [Live mode ▼]  ✅   │
   └─────────────────────┘
   ```

### **✅ Checkpoint:**
- [ ] Modalità LIVE richiesta
- [ ] Documenti caricati
- [ ] (Opzionale) Verifica completata

---

## Step 3.3: Ottenere Chiavi API (2 minuti)

### **Procedura:**

1. **Nel menu laterale, click:**
   ```
   Developers → API keys
   ```

2. **Vedrai due sezioni:**
   ```
   ┌─────────────────────────────────┐
   │ Standard keys                   │
   ├─────────────────────────────────┤
   │ Publishable key                 │
   │ pk_live_xxxxxxxxxxxxx           │
   │ [Reveal live key] [Copy]        │
   │                                 │
   │ Secret key                      │
   │ sk_live_xxxxxxxxxxxxx           │
   │ [Reveal live key] [Copy]        │
   └─────────────────────────────────┘
   ```

3. **Copia Publishable key:**
   - Click **"Reveal live key"**
   - Click **"Copy"**
   - Incolla in file di testo temporaneo
   - Etichetta: `STRIPE_PUBLISHABLE_KEY`

4. **Copia Secret key:**
   - Click **"Reveal live key"**
   - Click **"Copy"**
   - Incolla in file di testo temporaneo
   - Etichetta: `STRIPE_SECRET_KEY`
   - **IMPORTANTE: Non condividere mai questa chiave!**

5. **Salva le chiavi:**
   ```
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   ```

### **✅ Checkpoint:**
- [ ] Publishable key copiata
- [ ] Secret key copiata
- [ ] Chiavi salvate in posto sicuro

---

## Step 3.4: Configurare Webhook (5 minuti)

### **Cosa faremo:**
Configureremo un webhook per ricevere notifiche da Stripe (pagamenti, abbonamenti, ecc.).

### **Procedura:**

1. **Nel menu, click:**
   ```
   Developers → Webhooks
   ```

2. **Click "Add endpoint"**
   ```
   ┌─────────────────────────────────┐
   │ Add endpoint                    │
   ├─────────────────────────────────┤
   │ Endpoint URL:                   │
   │ [_________________________]     │
   │                                 │
   │ Description (optional):         │
   │ [_________________________]     │
   └─────────────────────────────────┘
   ```

3. **Inserisci URL:**
   ```
   Endpoint URL: https://api.tuosito.com/api/stripe/webhook
   Description: Production webhook
   ```
   
   - **NOTA:** Usa `api.tuosito.com` (il dominio che configurerai dopo)
   - Se non hai ancora il dominio, usa temporaneamente l'URL Railway che otterrai dopo
   - Click **"Select events"**

4. **Seleziona eventi:**
   ```
   ┌─────────────────────────────────┐
   │ Select events to listen to      │
   ├─────────────────────────────────┤
   │ Search events...                │
   │                                 │
   │ ☑ checkout.session.completed    │
   │ ☑ customer.subscription.created │
   │ ☑ customer.subscription.updated │
   │ ☑ customer.subscription.deleted │
   │ ☑ invoice.payment_succeeded     │
   │ ☑ invoice.payment_failed        │
   └─────────────────────────────────┘
   ```
   
   - Cerca e seleziona questi 6 eventi:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click **"Add events"**

5. **Click "Add endpoint"**

6. **Copia Signing secret:**
   ```
   ┌─────────────────────────────────┐
   │ Signing secret                  │
   │ whsec_xxxxxxxxxxxxx             │
   │ [Reveal] [Copy]                 │
   └─────────────────────────────────┘
   ```
   
   - Click **"Reveal"**
   - Click **"Copy"**
   - Incolla in file di testo temporaneo
   - Etichetta: `STRIPE_WEBHOOK_SECRET`

7. **Salva:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### **✅ Checkpoint:**
- [ ] Webhook endpoint creato
- [ ] 6 eventi selezionati
- [ ] Signing secret copiato
- [ ] Secret salvato

---

## Step 3.5: Configurare .env con Stripe (2 minuti)

### **Procedura:**

1. **Apri file .env del server**

2. **Trova o aggiungi queste righe:**
   ```bash
   # Stripe
   STRIPE_SECRET_KEY=
   STRIPE_PUBLISHABLE_KEY=
   STRIPE_WEBHOOK_SECRET=
   ```

3. **Incolla le chiavi:**
   ```bash
   # Stripe
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
   
   - Sostituisci con le TUE chiavi
   - Salva il file

4. **Apri .env.production nella root del progetto**
   - Percorso: `c:\Users\Daniel\Desktop\project-bolt-sb1-r6swdtnj\project\.env.production`
   - Se non esiste, crealo

5. **Aggiungi:**
   ```bash
   VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
   ```
   
   - Usa la Publishable key
   - Salva il file

### **✅ Checkpoint:**
- [ ] server/.env aggiornato con chiavi Stripe
- [ ] .env.production creato con public key
- [ ] File salvati

---

# PARTE 4: Setup Email SendGrid

## Step 4.1: Creare Account SendGrid (5 minuti)

### **Cosa faremo:**
Configureremo SendGrid per inviare email automatiche.

### **Procedura:**

1. **Vai su SendGrid:**
   - URL: https://signup.sendgrid.com/

2. **Registrati:**
   ```
   ┌─────────────────────────────────┐
   │ Get started with SendGrid       │
   ├─────────────────────────────────┤
   │ Email: tua@email.com           │
   │ Password: [password sicura]     │
   │ First Name: [nome]              │
   │ Last Name: [cognome]            │
   │ Company: Spartano Furioso       │
   │ Website: tuosito.com            │
   │                                 │
   │ [Create Account]                │
   └─────────────────────────────────┘
   ```
   
   - Compila il form
   - Click **"Create Account"**

3. **Verifica email:**
   - Controlla inbox
   - Click sul link "Verify Single Sender"

4. **Completa questionario:**
   ```
   How many emails do you plan to send per month?
   ○ Less than 40,000
   
   What type of emails will you send?
   ☑ Transactional (receipts, confirmations)
   ```
   
   - Rispondi alle domande
   - Click **"Get Started"**

### **✅ Checkpoint:**
- [ ] Account SendGrid creato
- [ ] Email verificata
- [ ] Questionario completato

---

## Step 4.2: Creare API Key (3 minuti)

### **Procedura:**

1. **Nel menu laterale:**
   ```
   Settings → API Keys
   ```

2. **Click "Create API Key"**
   ```
   ┌─────────────────────────────────┐
   │ Create API Key                  │
   ├─────────────────────────────────┤
   │ API Key Name:                   │
   │ [Spartano Production]           │
   │                                 │
   │ API Key Permissions:            │
   │ ● Full Access                   │
   │ ○ Restricted Access             │
   │                                 │
   │ [Create & View]                 │
   └─────────────────────────────────┘
   ```
   
   - Name: `Spartano Production`
   - Permissions: Seleziona **"Full Access"**
   - Click **"Create & View"**

3. **Copia API Key:**
   ```
   ┌─────────────────────────────────┐
   │ Your API Key                    │
   ├─────────────────────────────────┤
   │ SG.xxxxxxxxxxxxxxxxxxxxxxxx     │
   │                                 │
   │ [Copy]                          │
   │                                 │
   │ ⚠️ This is the only time you    │
   │ can view this key!              │
   └─────────────────────────────────┘
   ```
   
   - Click **"Copy"**
   - Incolla in file di testo temporaneo
   - **IMPORTANTE: La vedrai solo ora!**
   - Etichetta: `SENDGRID_API_KEY`

4. **Click "Done"**

5. **Salva:**
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
   ```

### **✅ Checkpoint:**
- [ ] API Key creata
- [ ] API Key copiata
- [ ] API Key salvata

---

## Step 4.3: Verificare Sender Identity (5 minuti)

### **Procedura:**

1. **Nel menu:**
   ```
   Settings → Sender Authentication
   ```

2. **Sezione "Single Sender Verification":**
   ```
   [Create New Sender]
   ```
   
   - Click **"Create New Sender"**

3. **Compila form:**
   ```
   ┌─────────────────────────────────┐
   │ Create a Sender                 │
   ├─────────────────────────────────┤
   │ From Name: Spartano Furioso     │
   │ From Email: noreply@tuosito.com │
   │ Reply To: support@tuosito.com   │
   │ Company Address: [indirizzo]    │
   │ City: [città]                   │
   │ Country: Italy                  │
   │                                 │
   │ [Create]                        │
   └─────────────────────────────────┘
   ```
   
   - From Name: `Spartano Furioso`
   - From Email: `noreply@tuosito.com` (o la tua email)
   - Reply To: `support@tuosito.com`
   - Compila indirizzo completo
   - Click **"Create"**

4. **Verifica email:**
   - SendGrid invierà email a `noreply@tuosito.com`
   - Controlla inbox
   - Click sul link di verifica
   - **NOTA:** Se usi email personale (gmail), usa quella temporaneamente

5. **Conferma:**
   ```
   ✅ Sender verified successfully
   ```

### **✅ Checkpoint:**
- [ ] Sender creato
- [ ] Email sender verificata
- [ ] Status: Verified

---

## Step 4.4: Configurare .env con SendGrid (2 minuti)

### **Procedura:**

1. **Apri server/.env**

2. **Trova o aggiungi:**
   ```bash
   # Email Service
   SENDGRID_API_KEY=
   EMAIL_FROM=
   EMAIL_FROM_NAME=
   ```

3. **Incolla configurazione:**
   ```bash
   # Email Service
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@tuosito.com
   EMAIL_FROM_NAME=Spartano Furioso
   ```
   
   - Sostituisci con i TUOI valori
   - Salva il file

### **✅ Checkpoint:**
- [ ] SENDGRID_API_KEY configurato
- [ ] EMAIL_FROM configurato
- [ ] File salvato

---

# PARTE 5: Deploy Backend Railway

## Step 5.1: Installare Railway CLI (3 minuti)

### **Cosa faremo:**
Installeremo lo strumento per deployare il backend.

### **Procedura:**

1. **Apri PowerShell come Amministratore**
   - Premi `Windows + X`
   - Seleziona "Windows PowerShell (Admin)"

2. **Installa Railway CLI:**
   ```powershell
   npm install -g @railway/cli
   ```

3. **Attendi installazione (1-2 minuti):**
   ```
   added 1 package in 45s
   ```

4. **Verifica installazione:**
   ```powershell
   railway --version
   ```
   
   - Dovresti vedere: `railway version x.x.x`

### **✅ Checkpoint:**
- [ ] Railway CLI installato
- [ ] Versione verificata

---

## Step 5.2: Creare Account Railway (5 minuti)

### **Procedura:**

1. **Vai su Railway:**
   - URL: https://railway.app/

2. **Click "Login"**

3. **Login with GitHub:**
   ```
   ┌─────────────────────────────────┐
   │ Sign in to Railway              │
   ├─────────────────────────────────┤
   │ [Login with GitHub]             │
   │ [Login with Email]              │
   └─────────────────────────────────┘
   ```
   
   - Click **"Login with GitHub"**
   - Autorizza Railway
   - Completa registrazione

4. **Verifica email** (se richiesto)

### **✅ Checkpoint:**
- [ ] Account Railway creato
- [ ] GitHub connesso

---

## Step 5.3: Login Railway CLI (2 minuti)

### **Procedura:**

1. **Nel terminale PowerShell:**
   ```powershell
   railway login
   ```

2. **Si aprirà browser:**
   ```
   Opening browser for authentication...
   ```

3. **Autorizza nel browser:**
   ```
   ┌─────────────────────────────────┐
   │ Authorize Railway CLI           │
   ├─────────────────────────────────┤
   │ This will allow Railway CLI to  │
   │ access your account.            │
   │                                 │
   │ [Authorize]                     │
   └─────────────────────────────────┘
   ```
   
   - Click **"Authorize"**

4. **Nel terminale vedrai:**
   ```
   ✅ Logged in as tuonome
   ```

### **✅ Checkpoint:**
- [ ] Railway CLI autenticato
- [ ] Login confermato

---

## Step 5.4: Deploy Backend (10 minuti)

### **Procedura:**

1. **Naviga nella cartella server:**
   ```powershell
   cd c:\Users\Daniel\Desktop\project-bolt-sb1-r6swdtnj\project\server
   ```

2. **Inizializza progetto Railway:**
   ```powershell
   railway init
   ```

3. **Crea nuovo progetto:**
   ```
   ┌─────────────────────────────────┐
   │ Create a new project            │
   ├─────────────────────────────────┤
   │ Project name: spartano-backend  │
   │                                 │
   │ [Create]                        │
   └─────────────────────────────────┘
   ```
   
   - Nome: `spartano-backend`
   - Premi INVIO

4. **Deploy:**
   ```powershell
   railway up
   ```

5. **Attendi deploy (3-5 minuti):**
   ```
   Building...
   [████████████████████] 100%
   
   Deploying...
   [████████████████████] 100%
   
   ✅ Deployment successful!
   ```

6. **Ottieni URL:**
   ```powershell
   railway domain
   ```
   
   - Vedrai: `spartano-backend-production.up.railway.app`
   - **Salva questo URL!**

### **✅ Checkpoint:**
- [ ] Backend deployato
- [ ] URL ottenuto
- [ ] Deploy successful

---

## Step 5.5: Configurare Variabili Ambiente Railway (10 minuti)

### **Procedura:**

1. **Apri dashboard Railway:**
   - URL: https://railway.app/dashboard

2. **Seleziona progetto "spartano-backend"**

3. **Click "Variables"**

4. **Aggiungi TUTTE le variabili da server/.env:**
   
   ```
   Click [+ New Variable]
   ```
   
   **Aggiungi una per una:**
   
   ```bash
   NODE_ENV=production
   PORT=3001
   
   # Database
   MONGODB_URI=mongodb+srv://spartano_admin:password@...
   DATABASE_URL=mongodb+srv://spartano_admin:password@...
   
   # JWT
   JWT_SECRET=your_super_secret_key_32_chars_min
   
   # Stripe
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   
   # Email
   SENDGRID_API_KEY=SG.xxxxx
   EMAIL_FROM=noreply@tuosito.com
   EMAIL_FROM_NAME=Spartano Furioso
   
   # URLs (aggiorna dopo)
   FRONTEND_URL=https://tuosito.com
   BACKEND_URL=https://api.tuosito.com
   
   # CORS
   ALLOWED_ORIGINS=https://tuosito.com
   ```

5. **Per ogni variabile:**
   - Name: [nome variabile]
   - Value: [valore]
   - Click **"Add"**

6. **Click "Deploy" per applicare**

### **✅ Checkpoint:**
- [ ] Tutte le variabili aggiunte
- [ ] Deploy riavviato
- [ ] Variabili applicate

---

## Step 5.6: Configurare Dominio Custom (5 minuti)

### **Procedura:**

1. **Nel progetto Railway, click "Settings"**

2. **Sezione "Domains":**
   ```
   [+ Generate Domain]
   ```
   
   - Click **"Generate Domain"**
   - Ottieni: `spartano-backend.up.railway.app`

3. **Aggiungi dominio custom:**
   ```
   [+ Custom Domain]
   ```
   
   - Inserisci: `api.tuosito.com`
   - Click **"Add"**

4. **Vedrai istruzioni DNS:**
   ```
   ┌─────────────────────────────────┐
   │ Add CNAME record:               │
   ├─────────────────────────────────┤
   │ Type: CNAME                     │
   │ Name: api                       │
   │ Value: spartano-backend.up...   │
   └─────────────────────────────────┘
   ```

5. **Vai al tuo provider dominio** (es: GoDaddy, Namecheap, Cloudflare)

6. **Aggiungi record DNS:**
   - Type: `CNAME`
   - Name: `api`
   - Value: `spartano-backend.up.railway.app`
   - TTL: `Auto` o `3600`
   - Salva

7. **Attendi propagazione (5-30 minuti)**

8. **Verifica:**
   ```powershell
   curl https://api.tuosito.com/health
   ```
   
   - Risposta attesa: `{"status":"ok"}`

### **✅ Checkpoint:**
- [ ] Dominio custom aggiunto
- [ ] DNS configurato
- [ ] Dominio funzionante

---

# PARTE 6: Deploy Frontend Vercel

## Step 6.1: Installare Vercel CLI (3 minuti)

### **Procedura:**

1. **Nel PowerShell:**
   ```powershell
   npm install -g vercel
   ```

2. **Attendi installazione:**
   ```
   added 1 package in 30s
   ```

3. **Verifica:**
   ```powershell
   vercel --version
   ```

### **✅ Checkpoint:**
- [ ] Vercel CLI installato
- [ ] Versione verificata

---

## Step 6.2: Login Vercel (2 minuti)

### **Procedura:**

1. **Login:**
   ```powershell
   vercel login
   ```

2. **Scegli metodo:**
   ```
   ? Log in to Vercel
   ❯ GitHub
     GitLab
     Bitbucket
     Email
   ```
   
   - Seleziona **GitHub**
   - Premi INVIO

3. **Autorizza nel browser**

4. **Conferma:**
   ```
   ✅ Logged in as tuonome
   ```

### **✅ Checkpoint:**
- [ ] Vercel CLI autenticato

---

## Step 6.3: Deploy Frontend (10 minuti)

### **Procedura:**

1. **Naviga nella root del progetto:**
   ```powershell
   cd c:\Users\Daniel\Desktop\project-bolt-sb1-r6swdtnj\project
   ```

2. **Deploy:**
   ```powershell
   vercel --prod
   ```

3. **Rispondi alle domande:**
   ```
   ? Set up and deploy? [Y/n] y
   ? Which scope? [tuo account]
   ? Link to existing project? [y/N] n
   ? What's your project's name? spartano-furioso
   ? In which directory is your code located? ./
   ? Want to override settings? [y/N] n
   ```

4. **Attendi deploy (2-3 minuti):**
   ```
   Building...
   [████████████████████] 100%
   
   Deploying...
   [████████████████████] 100%
   
   ✅ Production: https://spartano-furioso.vercel.app
   ```

5. **Salva URL:**
   - URL temporaneo: `https://spartano-furioso.vercel.app`

### **✅ Checkpoint:**
- [ ] Frontend deployato
- [ ] URL ottenuto
- [ ] Sito accessibile

---

## Step 6.4: Configurare Variabili Ambiente Vercel (5 minuti)

### **Procedura:**

1. **Apri dashboard Vercel:**
   - URL: https://vercel.com/dashboard

2. **Seleziona progetto "spartano-furioso"**

3. **Click "Settings" → "Environment Variables"**

4. **Aggiungi variabili:**
   
   ```
   Name: VITE_API_URL
   Value: https://api.tuosito.com
   Environment: Production
   [Add]
   
   Name: VITE_STRIPE_PUBLIC_KEY
   Value: pk_live_xxxxx
   Environment: Production
   [Add]
   ```

5. **Click "Redeploy" per applicare**

### **✅ Checkpoint:**
- [ ] Variabili aggiunte
- [ ] Redeploy completato

---

## Step 6.5: Configurare Dominio Custom (5 minuti)

### **Procedura:**

1. **Nel progetto Vercel, click "Settings" → "Domains"**

2. **Aggiungi dominio:**
   ```
   [Add Domain]
   
   Domain: tuosito.com
   [Add]
   ```

3. **Vedrai istruzioni DNS:**
   ```
   ┌─────────────────────────────────┐
   │ Add A record:                   │
   ├─────────────────────────────────┤
   │ Type: A                         │
   │ Name: @                         │
   │ Value: 76.76.21.21              │
   └─────────────────────────────────┘
   ```

4. **Vai al provider dominio**

5. **Aggiungi record DNS:**
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
   - TTL: `Auto`
   - Salva

6. **Aggiungi www (opzionale):**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - Salva

7. **Attendi propagazione (5-30 minuti)**

8. **Verifica:**
   - Vai su: `https://tuosito.com`
   - Dovresti vedere il sito ✅

### **✅ Checkpoint:**
- [ ] Dominio custom aggiunto
- [ ] DNS configurato
- [ ] Sito accessibile su dominio

---

# PARTE 7: Test Finale

## Step 7.1: Test Homepage (2 minuti)

### **Procedura:**

1. **Vai su:** `https://tuosito.com`

2. **Verifica:**
   - [ ] Pagina carica correttamente
   - [ ] Immagini visibili
   - [ ] Menu funzionante
   - [ ] Link funzionanti

---

## Step 7.2: Test Registrazione (5 minuti)

### **Procedura:**

1. **Click "Registrati"**

2. **Compila form:**
   - Nome: Test User
   - Email: test@email.com
   - Password: Test123!@#

3. **Click "Registrati"**

4. **Verifica:**
   - [ ] Registrazione completata
   - [ ] Email ricevuta (controlla inbox)
   - [ ] Redirect a dashboard

---

## Step 7.3: Test Login Admin (3 minuti)

### **Procedura:**

1. **Vai su:** `https://tuosito.com/admin`

2. **Login con credenziali admin:**
   - Email: admin@tuosito.com
   - Password: Sp@rt4n0_Fur10s0#2024!Tr4d1ng

3. **Verifica:**
   - [ ] Login successful
   - [ ] Dashboard admin visibile
   - [ ] Dati caricati

---

## Step 7.4: Test Download File (2 minuti)

### **Procedura:**

1. **Vai su:** `https://tuosito.com/trial/spartan_fury_bot`

2. **Scroll fino a "Download Bot Trading"**

3. **Click "Scarica Ora"**

4. **Verifica:**
   - [ ] File scaricato
   - [ ] Nome: fury-of-sparta-v2.0.zip
   - [ ] Dimensione: 1.48 MB

---

## Step 7.5: Test Pagamento Stripe (5 minuti)

### **Procedura:**

1. **Vai su:** `https://tuosito.com/products`

2. **Seleziona FURY OF SPARTA**

3. **Click "Acquista Ora"**

4. **Seleziona piano (es: Monthly)**

5. **Redirect a Stripe Checkout**

6. **Usa carta test:**
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ```

7. **Completa pagamento**

8. **Verifica:**
   - [ ] Pagamento completato
   - [ ] Redirect a success page
   - [ ] Email ricevuta
   - [ ] Abbonamento attivo in dashboard

---

## Step 7.6: Test Analytics (2 minuti)

### **Procedura:**

1. **Login come admin**

2. **Vai su Analytics**

3. **Verifica:**
   - [ ] Visite tracciate
   - [ ] Tuo IP escluso
   - [ ] Grafici visibili
   - [ ] Dati corretti

---

# PARTE 8: Troubleshooting

## Problema: "Backend non risponde"

### **Soluzione:**

1. **Verifica logs Railway:**
   ```powershell
   railway logs
   ```

2. **Controlla variabili ambiente:**
   - Railway Dashboard → Variables
   - Verifica tutte presenti

3. **Verifica database connesso:**
   - MongoDB Atlas → Network Access
   - IP 0.0.0.0/0 presente

---

## Problema: "Frontend non carica"

### **Soluzione:**

1. **Verifica build Vercel:**
   - Dashboard → Deployments
   - Controlla errori build

2. **Verifica variabili:**
   - Settings → Environment Variables
   - VITE_API_URL corretto

3. **Pulisci cache:**
   - Ctrl + Shift + R nel browser

---

## Problema: "Pagamenti non funzionano"

### **Soluzione:**

1. **Verifica modalità LIVE Stripe:**
   - Dashboard Stripe → Toggle LIVE

2. **Verifica webhook:**
   - Developers → Webhooks
   - URL corretto
   - Eventi selezionati

3. **Test webhook:**
   - Send test webhook
   - Controlla logs Railway

---

## Problema: "Email non arrivano"

### **Soluzione:**

1. **Verifica SendGrid API Key:**
   - Settings → API Keys
   - Key attiva

2. **Verifica sender verificato:**
   - Settings → Sender Authentication
   - Status: Verified

3. **Controlla spam:**
   - Email potrebbero essere in spam

---

# ✅ DEPLOY COMPLETATO!

## Riepilogo Finale

Hai deployato con successo:

- ✅ **Database**: MongoDB Atlas
- ✅ **Backend**: Railway (api.tuosito.com)
- ✅ **Frontend**: Vercel (tuosito.com)
- ✅ **Pagamenti**: Stripe LIVE
- ✅ **Email**: SendGrid
- ✅ **SSL**: Attivo
- ✅ **Analytics**: Funzionanti

## URLs Finali

```
🌐 Sito: https://tuosito.com
🔧 API: https://api.tuosito.com
👨‍💼 Admin: https://tuosito.com/admin
💳 Stripe: https://dashboard.stripe.com
📧 SendGrid: https://app.sendgrid.com
🗄️ Database: https://cloud.mongodb.com
```

## Credenziali Salvate

- [ ] Admin email e password
- [ ] MongoDB connection string
- [ ] Stripe API keys
- [ ] SendGrid API key
- [ ] Tutte salvate in password manager

---

**🎉 CONGRATULAZIONI! Il tuo sito è LIVE! 🚀**

**Prossimi passi:**
1. Testa tutto accuratamente
2. Monitora logs per errori
3. Configura backup automatici
4. Aggiungi monitoring (UptimeRobot)
5. Inizia il marketing!

**Buon lancio! 💪**
