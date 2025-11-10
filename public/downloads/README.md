# 📥 Cartella Download - Spartano Furioso

## 📁 Struttura

Questa cartella contiene i file scaricabili per i prodotti (EA, indicatori, ecc.).

## 📋 File da Aggiungere

### **FURY OF SPARTA v2.0**

Copia il file EA in questa cartella con il nome:
```
fury-of-sparta-v2.0.ex4
```

**Dettagli:**
- Versione: v2.0
- Dimensione: 1.48 MB
- Tipo: Expert Advisor per MT4/MT5

## 🔧 Come Aggiungere un File

### **Metodo 1: Copia Manuale**

```powershell
# Copia il file EA in questa cartella
Copy-Item "C:\percorso\tuo\file.ex4" "public\downloads\fury-of-sparta-v2.0.ex4"
```

### **Metodo 2: Drag & Drop**

1. Apri la cartella `public/downloads`
2. Trascina il file `.ex4` nella cartella
3. Rinomina in `fury-of-sparta-v2.0.ex4`

## 🌐 URL Download

Dopo aver copiato il file, sarà accessibile a:
```
http://localhost:5173/downloads/fury-of-sparta-v2.0.ex4
```

In produzione:
```
https://tuosito.com/downloads/fury-of-sparta-v2.0.ex4
```

## 📊 Configurazione Prodotto

Il file è già configurato nel database:

```json
{
  "id": "spartan_fury_bot",
  "name": "FURY OF SPARTA",
  "version": "v2.0",
  "fileSize": "1.48 MB",
  "downloadUrl": "/downloads/fury-of-sparta-v2.0.ex4"
}
```

## 🔐 Sicurezza

### **Protezione Download (Opzionale)**

Per proteggere i download solo per utenti con trial/abbonamento attivo:

1. Sposta i file in `server/private/downloads/`
2. Crea endpoint protetto in `server/routes/downloads.js`
3. Verifica token JWT prima del download

**Esempio endpoint protetto:**

```javascript
// server/routes/downloads.js
router.get('/download/:productId', authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  
  // Verifica che l'utente abbia accesso
  const hasAccess = await checkUserAccess(userId, productId);
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'Accesso negato' });
  }
  
  // Invia file
  const filePath = path.join(__dirname, '../private/downloads', `${productId}.ex4`);
  res.download(filePath);
});
```

## 📝 Aggiungere Altri Prodotti

Per aggiungere download per altri prodotti:

1. **Copia file** in `public/downloads/`
2. **Aggiorna database** `products.json`:
   ```json
   {
     "id": "nuovo_prodotto",
     "version": "v1.0",
     "fileSize": "2.5 MB",
     "downloadUrl": "/downloads/nuovo-prodotto-v1.0.ex4"
   }
   ```
3. **Riavvia server** (se necessario)

## 🚀 Deploy

### **Sviluppo Locale**

File in `public/downloads/` sono serviti automaticamente da Vite.

### **Produzione**

**Opzione A: Includi nel deploy**
- I file in `public/` vengono copiati automaticamente nel build
- Accessibili direttamente dal dominio

**Opzione B: CDN/Storage Esterno**
- Carica su AWS S3, Cloudflare R2, o simili
- Aggiorna `downloadUrl` con URL completo:
  ```json
  "downloadUrl": "https://cdn.tuosito.com/downloads/fury-v2.0.ex4"
  ```

**Opzione C: Server Separato**
- Usa server dedicato per file grandi
- Migliori performance e scalabilità

## 📊 Monitoraggio Download

Per tracciare i download, aggiungi analytics:

```javascript
const handleDownload = async () => {
  // Track download
  await fetch('/api/analytics/track-download', {
    method: 'POST',
    body: JSON.stringify({
      productId: product.id,
      version: product.version,
      userId: user.id
    })
  });
  
  // Avvia download
  window.open(product.downloadUrl, '_blank');
};
```

## ✅ Checklist

Prima del lancio:

- [ ] File EA copiato in `public/downloads/`
- [ ] Nome file corretto: `fury-of-sparta-v2.0.ex4`
- [ ] Dimensione verificata: 1.48 MB
- [ ] Database aggiornato con versione e fileSize
- [ ] Test download funzionante
- [ ] Protezione download configurata (opzionale)
- [ ] Analytics download attive (opzionale)

## 🆘 Troubleshooting

### **"File non trovato (404)"**

```bash
# Verifica che il file esista
ls public/downloads/

# Verifica nome file
# Deve corrispondere esattamente a downloadUrl nel database
```

### **"Download non parte"**

```bash
# Verifica URL nel database
# Deve iniziare con / per percorsi relativi
# O essere URL completo per CDN esterni
```

### **"File troppo grande"**

```bash
# Per file >50MB, considera:
# 1. Compressione (zip)
# 2. CDN esterno
# 3. Download progressivo
```

---

**Pronto! Copia il file EA e il download funzionerà! 🚀**
