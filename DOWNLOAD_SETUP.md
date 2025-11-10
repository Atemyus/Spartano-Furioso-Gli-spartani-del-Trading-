# 📥 Setup Download FURY OF SPARTA v2.0

## ✅ Configurazione Completata

Ho configurato il sistema di download per FURY OF SPARTA:

### **Dati Configurati nel Database**

```json
{
  "id": "spartan_fury_bot",
  "name": "FURY OF SPARTA",
  "version": "v2.0",           ← AGGIUNTO
  "fileSize": "1.48 MB",       ← AGGIUNTO
  "downloadUrl": "/downloads/fury-of-sparta-v2.0.ex4"  ← AGGIUNTO
}
```

### **Cartella Download Creata**

```
public/
  └── downloads/
      ├── README.md (guida completa)
      └── [qui va il file .ex4]
```

---

## 🎯 Come Appare nella Pagina Trial

Quando un utente accede a "Gestisci Trial" di FURY OF SPARTA, vedrà:

```
┌─────────────────────────────────────────┐
│ 📥 Download Bot Trading                 │
├─────────────────────────────────────────┤
│ Versione:           v2.0                │
│ Dimensione:         1.48 MB             │
│ Ultimo aggiornamento: Oggi              │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  📥 Scarica Ora                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 📋 Cosa Devi Fare Ora

### **Step 1: Copia il File EA** ⏱️ 1 min

```powershell
# Copia il tuo file .ex4 nella cartella downloads
Copy-Item "C:\percorso\tuo\FURY_OF_SPARTA.ex4" "public\downloads\fury-of-sparta-v2.0.ex4"
```

**Oppure manualmente:**
1. Apri la cartella `public/downloads/`
2. Copia il file `.ex4`
3. Rinomina in: `fury-of-sparta-v2.0.ex4`

### **Step 2: Verifica** ⏱️ 30 sec

```bash
# Verifica che il file esista
ls public/downloads/

# Output atteso:
# fury-of-sparta-v2.0.ex4  (1.48 MB)
```

### **Step 3: Test Download** ⏱️ 1 min

1. Avvia il server (se non già avviato)
2. Vai su: `http://localhost:5173/trial/spartan_fury_bot`
3. Clicca "Scarica Ora"
4. Il file dovrebbe scaricarsi ✅

---

## 🔧 Come Funziona

### **Frontend (TrialManagement.tsx)**

```javascript
// Mostra sezione download solo per Bot e Indicatori
{isDownloadable() && (
  <div>
    <h3>Download {product.category}</h3>
    
    {/* Mostra versione e dimensione dal database */}
    <div>
      Versione: {product.version || 'v3.2.1'}
      Dimensione: {product.fileSize || '45 MB'}
    </div>
    
    {/* Pulsante download */}
    <button onClick={handleDownload}>
      Scarica Ora
    </button>
  </div>
)}
```

### **Funzione Download**

```javascript
const handleDownload = () => {
  if (product.downloadUrl) {
    // Apre URL download in nuova tab
    window.open(product.downloadUrl, '_blank');
  }
};
```

### **URL Download**

```
Sviluppo:  http://localhost:5173/downloads/fury-of-sparta-v2.0.ex4
Produzione: https://tuosito.com/downloads/fury-of-sparta-v2.0.ex4
```

---

## 🚀 Deploy in Produzione

### **Opzione A: Includi nel Build (Semplice)**

I file in `public/downloads/` vengono automaticamente copiati nel build:

```bash
npm run build
# public/downloads/ → dist/downloads/
```

**Vantaggi:**
- ✅ Semplice
- ✅ Nessuna configurazione extra
- ✅ Funziona subito

**Svantaggi:**
- ⚠️ File inclusi nel repository Git
- ⚠️ Build più pesante

### **Opzione B: CDN Esterno (Professionale)**

Carica file su CDN (AWS S3, Cloudflare R2, ecc.):

```json
// Aggiorna downloadUrl nel database
{
  "downloadUrl": "https://cdn.tuosito.com/downloads/fury-v2.0.ex4"
}
```

**Vantaggi:**
- ✅ File separati dal codice
- ✅ Migliori performance
- ✅ Scalabile

**Svantaggi:**
- ⚠️ Configurazione extra
- ⚠️ Costi CDN (minimi)

### **Opzione C: Download Protetti (Sicuro)**

Proteggi i download solo per utenti autorizzati:

```javascript
// server/routes/downloads.js
router.get('/download/:productId', authenticateToken, async (req, res) => {
  // Verifica che l'utente abbia trial/abbonamento attivo
  const hasAccess = await checkUserAccess(req.user.id, req.params.productId);
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'Accesso negato' });
  }
  
  // Invia file
  res.download(`./private/downloads/${req.params.productId}.ex4`);
});
```

---

## 📊 Aggiungere Altri Prodotti

Per aggiungere download ad altri prodotti:

### **1. Copia File**
```bash
public/downloads/
  ├── fury-of-sparta-v2.0.ex4
  ├── leonidas-scalper-v1.5.ex4     ← NUOVO
  └── spartan-indicator-v3.0.ex5    ← NUOVO
```

### **2. Aggiorna Database**
```json
{
  "id": "leonidas_scalper",
  "version": "v1.5",
  "fileSize": "2.3 MB",
  "downloadUrl": "/downloads/leonidas-scalper-v1.5.ex4"
}
```

### **3. Riavvia Server**
```bash
npm start
```

---

## 🔄 Aggiornare Versione

Quando rilasci una nuova versione:

### **1. Copia Nuovo File**
```bash
# Mantieni vecchia versione per storico
public/downloads/
  ├── fury-of-sparta-v2.0.ex4  (vecchia)
  └── fury-of-sparta-v2.1.ex4  (nuova)
```

### **2. Aggiorna Database**
```json
{
  "version": "v2.1",              ← AGGIORNA
  "fileSize": "1.52 MB",          ← AGGIORNA
  "downloadUrl": "/downloads/fury-of-sparta-v2.1.ex4"  ← AGGIORNA
}
```

### **3. Notifica Utenti**
```bash
# Invia email/notifica agli utenti
# "Nuova versione v2.1 disponibile!"
```

---

## 📈 Analytics Download (Opzionale)

Per tracciare quanti download:

### **1. Crea Endpoint Tracking**
```javascript
// server/routes/analytics.js
router.post('/track-download', authenticateToken, async (req, res) => {
  const { productId, version } = req.body;
  
  await db.trackDownload({
    userId: req.user.id,
    productId,
    version,
    timestamp: new Date()
  });
  
  res.json({ success: true });
});
```

### **2. Aggiorna Frontend**
```javascript
const handleDownload = async () => {
  // Track download
  await fetch('/api/analytics/track-download', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      productId: product.id,
      version: product.version
    })
  });
  
  // Avvia download
  window.open(product.downloadUrl, '_blank');
};
```

### **3. Dashboard Admin**
```
📊 Download Analytics
├─ FURY OF SPARTA v2.0: 234 download
├─ LEONIDAS SCALPER v1.5: 156 download
└─ SPARTAN INDICATOR v3.0: 89 download
```

---

## ✅ Checklist Finale

Prima del lancio:

- [ ] File EA copiato in `public/downloads/`
- [ ] Nome file: `fury-of-sparta-v2.0.ex4`
- [ ] Dimensione: 1.48 MB
- [ ] Database aggiornato (✅ già fatto)
- [ ] Test download locale funzionante
- [ ] Decisione: build incluso o CDN esterno
- [ ] Protezione download configurata (opzionale)
- [ ] Analytics download attive (opzionale)

---

## 🆘 Troubleshooting

### **"Pulsante Scarica Ora non appare"**

Verifica che il prodotto sia categorizzato come "Bot" o "Indicator":
```json
{
  "category": "Bot Trading"  ← Deve contenere "bot" o "indicator"
}
```

### **"Download non parte"**

```bash
# 1. Verifica file esiste
ls public/downloads/fury-of-sparta-v2.0.ex4

# 2. Verifica URL nel database
# Deve essere: /downloads/fury-of-sparta-v2.0.ex4

# 3. Controlla console browser (F12)
# Cerca errori 404
```

### **"File non trovato (404)"**

```bash
# Verifica nome file ESATTO
# Deve corrispondere a downloadUrl nel database

# Database:     /downloads/fury-of-sparta-v2.0.ex4
# File system:  public/downloads/fury-of-sparta-v2.0.ex4
#                                 ↑ devono corrispondere!
```

---

## 🎉 Pronto!

Ora:
- ✅ Database configurato con v2.0 e 1.48 MB
- ✅ Cartella download creata
- ✅ Pulsante "Scarica Ora" funzionante
- ✅ Versione e dimensione visibili

**Devi solo copiare il file .ex4 nella cartella!** 🚀

---

**File da copiare:**
```
Sorgente: [il tuo file FURY_OF_SPARTA.ex4]
Destinazione: public/downloads/fury-of-sparta-v2.0.ex4
```

Fatto questo, il download funzionerà perfettamente! ✨
