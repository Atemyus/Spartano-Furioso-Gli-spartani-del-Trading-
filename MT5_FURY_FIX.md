# Fix MT5 per FURY OF SPARTA - Arsenale Spartano

## 🎯 Problema Risolto

Nel popup "Dettagli" di FURY OF SPARTA nell'Arsenale Spartano appariva solo **MetaTrader 4**.

## 🔍 Causa del Problema

Il file `server/data/product-configs.json` aveva solo MT4 configurato per FURY OF SPARTA:

```json
"spartan_fury_bot": {
  "platforms": [
    "MetaTrader 4"  ← Solo MT4!
  ],
```

Questo file **sovrascrive** i dati del database principale (`products.json`), quindi anche se il database aveva MT5, il frontend mostrava solo MT4.

## ✅ Soluzione Applicata

Ho aggiornato `server/data/product-configs.json` aggiungendo MT5:

```json
"spartan_fury_bot": {
  "platforms": [
    "MetaTrader 4",
    "MetaTrader 5"  ← AGGIUNTO!
  ],
```

## 📊 Verifica

Eseguito script di verifica:

```
📦 products.json:
   Piattaforme: [ 'MetaTrader 4', 'MetaTrader 5', 'TradingView', 'cTrader' ]
   MT5 presente: ✅ SÌ

⚙️  product-configs.json:
   Piattaforme: [ 'MetaTrader 4', 'MetaTrader 5' ]
   MT5 presente: ✅ SÌ
```

## 🚀 Come Applicare le Modifiche

### 1. Riavvia il Server Backend

**IMPORTANTE:** Devi riavviare il server per caricare i nuovi dati!

```powershell
# Nel terminale del server, premi Ctrl+C per fermarlo
# Poi riavvialo:
cd server
npm start
```

### 2. Aggiorna il Browser

Dopo aver riavviato il server:

- **Hard Refresh**: `Ctrl + Shift + R`
- Oppure apri in **modalità incognito**

### 3. Verifica

1. Vai su **Arsenale Spartano**
2. Clicca su **FURY OF SPARTA**
3. Nel popup "Dettagli" scorri fino a **"PIATTAFORME SUPPORTATE"**
4. Dovresti vedere: **MetaTrader 4** e **MetaTrader 5**

## 📁 File Modificati

1. ✅ `server/data/product-configs.json` - Aggiunto MT5
2. ✅ `server/scripts/checkFuryPlatforms.cjs` - Script verifica (nuovo)
3. ✅ `server/scripts/verifyFuryPlatforms.cjs` - Script verifica database (nuovo)

## 🔧 Script di Verifica

Per verificare in futuro che MT5 sia presente:

```powershell
node server\scripts\checkFuryPlatforms.cjs
```

## 💡 Note Tecniche

### Gerarchia Dati Prodotti

1. **Database principale**: `server/database/data/products.json`
   - Contiene tutti i dati base dei prodotti
   
2. **Configurazioni override**: `server/data/product-configs.json`
   - **Sovrascrive** alcuni campi del database principale
   - Usato per configurazioni specifiche come piattaforme e requisiti

3. **Frontend**: `src/components/ProductModal.tsx`
   - Usa `config?.platforms || product.platforms`
   - Priorità: config > product

### Dove Vengono Mostrate le Piattaforme

1. **ProductModal** (Arsenale Spartano - popup dettagli)
   - Linea 388-408: Sezione piattaforme principale
   - Linea 666-682: Sezione piattaforme nella descrizione estesa

2. **TrialManagement** (Pagina gestione trial)
   - Linea 682-710: Sezione piattaforme supportate

## ✅ Risultato Finale

Dopo il riavvio del server, nel popup "Dettagli" di FURY OF SPARTA nell'Arsenale Spartano appariranno:

- ✅ **MetaTrader 4**
- ✅ **MetaTrader 5**

---

**Data fix**: 10 Novembre 2025
**File modificato**: `server/data/product-configs.json`
**Azione richiesta**: Riavvio server backend
