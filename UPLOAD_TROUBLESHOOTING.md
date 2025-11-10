# 🔧 RISOLUZIONE PROBLEMA UPLOAD FILE

## ❌ Problema
Quando carichi un file dal pannello admin appare: **"Errore durante l'upload del file"**

## ✅ Correzioni Applicate

### 1. **Migliorata Gestione Errori nell'Endpoint Upload**
**File**: `server/index.js`

**Modifiche**:
- ✅ Aggiunto logging dettagliato per debug
- ✅ Gestione corretta degli errori di Multer
- ✅ Messaggi di errore più specifici
- ✅ Controllo dimensione file (max 50MB)

### 2. **Rimosso Header Authorization**
**File**: `src/components/admin/CourseManagement.tsx`

**Problema**: L'endpoint `/api/upload` non richiede autenticazione, ma il frontend inviava l'header `Authorization` che poteva causare conflitti.

**Soluzione**: Rimosso l'header dalla richiesta fetch.

### 3. **Aggiunto Logging nel Frontend**
Ora vedrai nella console del browser:
- 📤 Quando inizia l'upload
- ✅ Quando l'upload ha successo
- ❌ Errori dettagliati se fallisce

---

## 🔍 Come Verificare il Problema

### **Passo 1: Apri la Console del Browser**
1. Premi `F12` nel browser
2. Vai sulla tab **"Console"**
3. Prova a caricare un file
4. Guarda i messaggi che appaiono

### **Passo 2: Controlla i Log del Server**
Nel terminale dove gira il server vedrai:
```
📤 Upload request received
Headers: { ... }
✅ File uploaded successfully: /uploads/1234567890-file.zip
```

Oppure in caso di errore:
```
❌ Multer error: File too large
```

---

## 🛠️ Possibili Cause e Soluzioni

### **Causa 1: Cartella uploads non esiste**
**Sintomo**: Errore "ENOENT: no such file or directory"

**Soluzione**:
```bash
cd server
mkdir uploads
```

### **Causa 2: Permessi insufficienti**
**Sintomo**: Errore "EACCES: permission denied"

**Soluzione Windows**:
```powershell
cd server
icacls uploads /grant Everyone:(OI)(CI)F
```

### **Causa 3: File troppo grande**
**Sintomo**: "File troppo grande. Dimensione massima: 50MB"

**Soluzione**: Riduci la dimensione del file o aumenta il limite in `server/index.js`:
```javascript
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB invece di 50MB
  },
  // ...
});
```

### **Causa 4: Formato file non supportato**
**Sintomo**: "Tipo di file non supportato"

**Soluzione**: Verifica che il file sia uno di questi formati:
- `.pdf`, `.doc`, `.docx`
- `.xls`, `.xlsx`
- `.zip`, `.rar`, `.7z`

Se serve un altro formato, modificalo in `server/index.js`:
```javascript
fileFilter: (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/zip',
    // Aggiungi altri MIME types qui
  ];
  // ...
}
```

### **Causa 5: Server non in esecuzione**
**Sintomo**: "Failed to fetch" o "Network error"

**Soluzione**:
```bash
cd server
npm run dev:js
```

Verifica che il server sia su `http://localhost:3001`

### **Causa 6: CORS o problema di rete**
**Sintomo**: Errore CORS nella console

**Soluzione**: Verifica che il CORS sia configurato correttamente in `server/index.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

## 📋 Checklist Debug

Segui questi passi in ordine:

- [ ] **1. Server in esecuzione?**
  ```bash
  cd server
  npm run dev:js
  ```

- [ ] **2. Cartella uploads esiste?**
  ```bash
  cd server
  dir uploads
  ```

- [ ] **3. Console browser aperta?**
  - Premi F12
  - Tab "Console"
  - Tab "Network"

- [ ] **4. Prova upload**
  - Seleziona un file piccolo (< 1MB)
  - Formato supportato (.pdf o .zip)
  - Guarda console e network tab

- [ ] **5. Controlla log server**
  - Cerca messaggi con 📤 o ❌
  - Copia l'errore esatto

---

## 🧪 Test Manuale

### **Test 1: Endpoint Upload Funziona?**

Usa questo comando PowerShell per testare direttamente l'endpoint:

```powershell
$file = "C:\path\to\test.pdf"
$uri = "http://localhost:3001/api/upload"

$form = @{
    file = Get-Item -Path $file
}

Invoke-RestMethod -Uri $uri -Method Post -Form $form
```

**Risposta attesa**:
```json
{
  "success": true,
  "fileUrl": "/uploads/1234567890-test.pdf",
  "filename": "test.pdf",
  "size": 12345
}
```

### **Test 2: Cartella Uploads Accessibile?**

```bash
cd server
echo "test" > uploads/test.txt
curl http://localhost:3001/uploads/test.txt
```

Dovresti vedere: `test`

---

## 🔄 Dopo le Correzioni

### **Cosa Fare Ora**:

1. **Riavvia il server**:
   ```bash
   cd server
   # Ferma il server (Ctrl+C)
   npm run dev:js
   ```

2. **Ricarica il browser**:
   - Premi `Ctrl+Shift+R` (hard reload)
   - Oppure chiudi e riapri il browser

3. **Prova di nuovo l'upload**:
   - Vai su `/admin` → Gestione Corsi
   - Modifica la lezione 4 del modulo 1
   - Carica un file nella sezione gialla
   - **Guarda la console** per i log

4. **Verifica il risultato**:
   - Dovresti vedere: "✅ File caricato con successo!"
   - Il file dovrebbe essere in `server/uploads/`
   - Il pulsante dovrebbe apparire nella lezione

---

## 📞 Se il Problema Persiste

### **Informazioni da Raccogliere**:

1. **Console Browser** (F12 → Console):
   - Copia tutti i messaggi rossi
   - Screenshot della tab Network

2. **Log Server**:
   - Copia l'output del terminale
   - Cerca messaggi con ❌

3. **Dettagli File**:
   - Nome del file
   - Dimensione
   - Formato/estensione

4. **Sistema**:
   - Windows/Mac/Linux
   - Versione Node.js: `node --version`
   - Porta server: 3001 o altra?

### **Comandi Diagnostici**:

```bash
# Verifica Node.js
node --version

# Verifica cartella uploads
cd server
dir uploads

# Verifica permessi (Windows)
icacls uploads

# Test endpoint
curl http://localhost:3001/health
```

---

## ✅ Checklist Finale

Dopo aver applicato le correzioni:

- ✅ Server riavviato
- ✅ Browser ricaricato (hard reload)
- ✅ Console aperta per vedere i log
- ✅ File di test pronto (< 5MB, .pdf o .zip)
- ✅ Cartella `server/uploads/` esiste
- ✅ Endpoint `/api/upload` risponde

**Ora prova l'upload e guarda i log dettagliati!**

---

## 🎯 Messaggio di Successo Atteso

**Console Browser**:
```
📤 Uploading file: test.pdf
Response status: 200
Response data: { success: true, fileUrl: "/uploads/...", ... }
💾 Saving lesson with download button...
```

**Alert**:
```
✅ File "test.pdf" caricato con successo!

Il pulsante "SCARICA QUI" è ora attivo nella lezione.
```

**Server Log**:
```
📤 Upload request received
Headers: { content-type: 'multipart/form-data; ...' }
✅ File uploaded successfully: /uploads/1737123456789-test.pdf
```

---

**Le correzioni sono state applicate! Riavvia il server e riprova l'upload.** 🚀
