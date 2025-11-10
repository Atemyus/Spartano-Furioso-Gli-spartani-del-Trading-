# 🛡️ Newsletter Solo per Utenti Registrati

## ✅ **IMPLEMENTATO!**

La newsletter ora è **riservata SOLO agli utenti registrati** al sito.

---

## 🎯 **Come Funziona**

### **1. Backend - Verifica Registrazione**

Quando qualcuno prova ad iscriversi alla newsletter:
1. ✅ Controlla se l'email esiste nella tabella `User`
2. ❌ Se NON esiste → **Errore: "Devi essere registrato!"**
3. ✅ Se esiste → Procede con l'iscrizione

**File modificato:** `server/routes/newsletter.js`

---

### **2. Frontend - Auto-Rilevamento Utente**

Il form newsletter:
1. ✅ Controlla se l'utente è **loggato** (verifica `localStorage`)
2. ✅ Se loggato → **Pre-compila l'email automaticamente**
3. ❌ Se NON loggato → **Mostra messaggio per login/registrazione**

**File modificato:** `src/components/NewsletterForm.tsx`

---

## 📋 **Cosa Vede l'Utente**

### **Scenario 1: Utente NON Loggato**

#### **Footer (Form Normale):**
```
┌────────────────────────────────────────┐
│  👤 Riservato ai Guerrieri Registrati  │
│                                        │
│  La newsletter è riservata             │
│  esclusivamente ai membri della        │
│  Falange!                              │
│                                        │
│  [🔐 Accedi]  [📝 Registrati]         │
└────────────────────────────────────────┘
```

#### **Header Menu Mobile (Form Compatto):**
```
┌────────────────────────────────────────┐
│  🔐 Devi essere registrato per         │
│     iscriverti alla newsletter!        │
│                                        │
│       [Accedi Ora]                     │
└────────────────────────────────────────┘
```

---

### **Scenario 2: Utente Loggato**

#### **Footer:**
```
┌────────────────────────────────────────┐
│  UNISCITI ALLA FALANGE                 │
│                                        │
│  [mario@example.com] [ARRUOLATI] ←     │
│  ↑ Email pre-compilata (read-only)     │
└────────────────────────────────────────┘
```

#### **Header Menu Mobile:**
```
┌────────────────────────────────────────┐
│  [mario@example.com] [→]               │
│  ↑ Email pre-compilata                 │
└────────────────────────────────────────┘
```

---

## 🧪 **Come Testare**

### **Test 1: Utente NON Loggato**

1. **Logout** se sei loggato (click logout)
2. Vai sulla **homepage**: `http://localhost:5173`
3. Scorri fino al **Footer**
4. Dovresti vedere il messaggio: **"Riservato ai Guerrieri Registrati"**
5. Click **"Accedi"** o **"Registrati"**

**Risultato Atteso:** ✅ Viene mostrato il messaggio, NON il form

---

### **Test 2: Utente Loggato**

1. **Login** al sito (usa credenziali esistenti)
2. Vai sulla **homepage**
3. Scorri fino al **Footer**
4. Dovresti vedere il **form con la tua email già inserita**
5. Click **"ARRUOLATI"**

**Risultato Atteso:** ✅ Iscrizione avviene con successo

---

### **Test 3: Email Non Registrata (API diretta)**

Puoi testare direttamente l'API:

```bash
# Prova con email NON registrata
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "nonregistrato@test.com", "source": "test"}'
```

**Risposta attesa:**
```json
{
  "error": "Devi essere registrato al sito per iscriverti alla newsletter!",
  "requiresRegistration": true
}
```

---

## 🔄 **Flusso Completo**

```
┌─────────────────────────────────────────────────────┐
│                  UTENTE VISITA SITO                 │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  È loggato?         │
              └─────────────────────┘
                 │              │
            ❌ NO            ✅ SÌ
                 │              │
                 ▼              ▼
        ┌────────────────┐  ┌──────────────────────┐
        │ MOSTRA:        │  │ MOSTRA:              │
        │ - Messaggio    │  │ - Form newsletter    │
        │ - Btn Accedi   │  │ - Email pre-compilata│
        │ - Btn Registra │  │ - Campo read-only    │
        └────────────────┘  └──────────────────────┘
                 │              │
                 │              ▼
                 │         [Click ARRUOLATI]
                 │              │
                 │              ▼
                 │      ┌──────────────────┐
                 │      │ API: Verifica    │
                 │      │ email in DB User │
                 │      └──────────────────┘
                 │              │
                 │         ┌────┴────┐
                 │    ❌ NO      ✅ SÌ
                 │         │          │
                 │         ▼          ▼
                 │    [ERRORE]  [ISCRIVE]
                 │         │          │
                 ▼         ▼          ▼
           [Accedi/    [Registrati] [✓ OK]
            Registra]     prima!
```

---

## 🔒 **Sicurezza Implementata**

### **Backend:**
✅ Verifica che l'email esista nella tabella `User`
✅ Previene iscrizioni da email non registrate
✅ Messaggio di errore chiaro

### **Frontend:**
✅ Controlla autenticazione da `localStorage`
✅ Disabilita form se non loggato
✅ Email auto-compilata e read-only per utenti loggati
✅ Mostra bottoni login/registrazione per non autenticati

---

## 📝 **Modifiche Tecniche**

### **Backend - `server/routes/newsletter.js`**

```javascript
// NUOVO: Verifica utente registrato
const user = await prisma.user.findUnique({
  where: { email: email.toLowerCase() }
});

if (!user) {
  return res.status(403).json({ 
    error: 'Devi essere registrato al sito per iscriverti alla newsletter!',
    requiresRegistration: true
  });
}
```

### **Frontend - `src/components/NewsletterForm.tsx`**

```tsx
// NUOVO: Verifica autenticazione
useEffect(() => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    setIsAuthenticated(true);
    const parsedUser = JSON.parse(user);
    setUserData(parsedUser);
    setEmail(parsedUser.email); // Pre-compila email
  }
}, []);

// NUOVO: Mostra messaggio se non loggato
if (!isAuthenticated) {
  return <MostraMessaggioLogin />;
}
```

---

## 🎨 **Personalizzazioni Possibili**

### **Cambiare il Messaggio**

Modifica `src/components/NewsletterForm.tsx`:

```tsx
<p className="text-gray-300 mb-4">
  Il tuo messaggio personalizzato qui!
</p>
```

### **Aggiungere Link Alternativi**

```tsx
<Link to="/info" className="...">
  Scopri di Più
</Link>
```

### **Modificare lo Stile**

Cambia le classi Tailwind CSS per personalizzare colori, spaziature, ecc.

---

## ⚡ **Funzionalità Extra**

### **Email Read-Only**

L'email è **bloccata** (read-only) quando l'utente è loggato:
- ✅ Previene errori di digitazione
- ✅ Garantisce uso dell'email registrata
- ✅ UX migliore (utente non deve digitare)

### **Auto-Redirect**

Quando l'utente clicca "Accedi", viene portato a `/login`
Dopo il login, può tornare e iscriversi alla newsletter

---

## 🆘 **Troubleshooting**

### **Problema: Form sempre disabilitato anche se loggato**

**Soluzione:** 
1. Apri Console (F12)
2. Vai su "Application" → "Local Storage"
3. Verifica che esistano `token` e `user`
4. Se mancano, fai logout e login di nuovo

---

### **Problema: "Devi essere registrato" anche con email corretta**

**Causa:** L'email nel database User è diversa da quella inserita

**Verifica:**
```bash
# Controlla email nel database
cd server
npx prisma studio
```

Vai su tabella `User` e verifica l'email esatta

---

### **Problema: Email non pre-compilata**

**Causa:** Dati utente non salvati correttamente in localStorage

**Soluzione:**
1. Logout completo
2. Login di nuovo
3. Verifica che `localStorage.user` contenga l'email

---

## 🎯 **Riassunto**

✅ **Newsletter riservata a utenti registrati**
✅ **Email auto-compilata per utenti loggati**
✅ **Messaggio chiaro per utenti non loggati**
✅ **Link rapidi per login/registrazione**
✅ **Verifica backend + frontend**
✅ **UX migliorata e sicura**

---

**Testa ora il sistema e fammi sapere se funziona tutto!** 🛡️⚔️
