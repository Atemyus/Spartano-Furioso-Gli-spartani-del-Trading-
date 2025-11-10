# 🔧 FURY OF SPARTA - AGGIORNAMENTO DATABASE MT4

**Data**: 23 Ottobre 2025, 04:50  
**Status**: ✅ SCRIPT CREATO - DA ESEGUIRE

---

## 🎯 PROBLEMA IDENTIFICATO

**Dove**: Dashboard → Trial Attivi → Pulsante "Abbonati" → Modal Prodotto → "Dettagli"  
**Cosa**: Fury of Sparta mostra tutte le piattaforme invece di solo MT4

---

## 📊 MODIFICHE APPLICATE

### **1. File di Configurazione** ✅ FATTO
**File**: `server/data/product-configs.json`

```json
"spartan_fury_bot": {
  "platforms": [
    "MetaTrader 4"  // ← Solo MT4
  ]
}
```

### **2. Database Prisma** ⏳ DA ESEGUIRE
**Script**: `server/scripts/updateFuryPlatforms.js`

---

## 🚀 COME ESEGUIRE L'AGGIORNAMENTO

### **Passo 1: Apri il terminale nella cartella server**
```bash
cd c:\Users\Daniel\Desktop\project-bolt-sb1-r6swdtnj\project\server
```

### **Passo 2: Esegui lo script**
```bash
npm run fury:update-platforms
```

### **Output Atteso**:
```
🔧 Aggiornamento piattaforme Fury of Sparta...

✅ Prodotto trovato: FURY OF SPARTA
📊 Piattaforme attuali: ["MetaTrader 4", "MetaTrader 5"]

✅ Piattaforme aggiornate con successo!
📊 Nuove piattaforme: ["MetaTrader 4"]

🎉 Script completato!
```

---

## 🧪 COME TESTARE

### **Test Completo**:

1. **Esegui lo script** (vedi sopra)

2. **Riavvia il server**:
   ```bash
   npm run dev:js
   ```

3. **Vai sulla Dashboard**:
   - Login al sito
   - Vai su `/dashboard`

4. **Sezione "PROVE GRATUITE ATTIVE"**:
   - Trova "FURY OF SPARTA"
   - Clicca sul pulsante **"Abbonati"** (giallo)

5. **Modal Prodotti**:
   - Si apre il modal con i prodotti
   - Trova "Fury of Sparta"
   - Clicca su **"Dettagli"**

6. **Verifica Piattaforme**:
   - Scrolla in basso
   - Cerca "PIATTAFORME SUPPORTATE"
   - Verifica che appaia **SOLO "MetaTrader 4"**

---

## 📁 FILE COINVOLTI

### **Modificati**:
1. ✅ `server/data/product-configs.json` - Configurazione piattaforme
2. ✅ `server/package.json` - Aggiunto script npm

### **Creati**:
3. ✅ `server/scripts/updateFuryPlatforms.js` - Script aggiornamento database

### **Da Aggiornare** (tramite script):
4. ⏳ Database Prisma - Tabella `Product`

---

## 💻 CODICE SCRIPT

**File**: `server/scripts/updateFuryPlatforms.js`

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateFuryPlatforms() {
  console.log('🔧 Aggiornamento piattaforme Fury of Sparta...\n');
  
  try {
    // Trova il prodotto Fury of Sparta
    const furyProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { id: 'spartan_fury_bot' },
          { name: { contains: 'Fury of Sparta' } },
          { name: { contains: 'FURY OF SPARTA' } }
        ]
      }
    });

    if (!furyProduct) {
      console.log('❌ Prodotto Fury of Sparta non trovato nel database');
      return;
    }

    console.log('✅ Prodotto trovato:', furyProduct.name);
    console.log('📊 Piattaforme attuali:', furyProduct.platforms);

    // Aggiorna le piattaforme a solo MT4
    const updated = await prisma.product.update({
      where: { id: furyProduct.id },
      data: {
        platforms: ['MetaTrader 4']
      }
    });

    console.log('\n✅ Piattaforme aggiornate con successo!');
    console.log('📊 Nuove piattaforme:', updated.platforms);
    
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFuryPlatforms()
  .then(() => {
    console.log('\n🎉 Script completato!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
  });
```

---

## 🔄 FLUSSO DATI

### **Come Funziona**:

```
1. Utente clicca "Abbonati" in Dashboard
   ↓
2. Viene reindirizzato a /products
   ↓
3. Clicca su un prodotto → Si apre ProductModal
   ↓
4. ProductModal carica dati da:
   - Database Prisma (product.platforms)
   - product-configs.json (config.platforms)
   ↓
5. Mostra piattaforme nel modal
```

### **Dove Vengono Usate le Piattaforme**:

**ProductModal.tsx** (Linea 565-577):
```tsx
{(config?.platforms || product.platforms) && (
  <div>
    <h4>PIATTAFORME SUPPORTATE</h4>
    <div className="flex flex-wrap gap-2">
      {(config?.platforms || product.platforms || []).map((platform, idx) => (
        <span key={idx}>{platform}</span>
      ))}
    </div>
  </div>
)}
```

**Priorità**:
1. `config.platforms` (da product-configs.json) ✅ Già aggiornato
2. `product.platforms` (da database Prisma) ⏳ Da aggiornare con script

---

## ⚠️ IMPORTANTE

### **Perché Serve lo Script?**

Il ProductModal usa **ENTRAMBE** le fonti:
- `product-configs.json` ✅ Già modificato
- Database Prisma ⏳ Serve script

Se non esegui lo script, il database potrebbe ancora avere le vecchie piattaforme e mostrarle nel modal.

---

## 🎯 CHECKLIST FINALE

- ✅ File `product-configs.json` aggiornato
- ✅ Script `updateFuryPlatforms.js` creato
- ✅ Script aggiunto a `package.json`
- ⏳ **DA FARE**: Eseguire `npm run fury:update-platforms`
- ⏳ **DA FARE**: Riavviare server
- ⏳ **DA FARE**: Testare nel browser

---

## 📝 COMANDI RAPIDI

```bash
# 1. Vai nella cartella server
cd c:\Users\Daniel\Desktop\project-bolt-sb1-r6swdtnj\project\server

# 2. Esegui lo script di aggiornamento
npm run fury:update-platforms

# 3. Riavvia il server
npm run dev:js

# 4. Testa nel browser
# Dashboard → Trial Attivi → Abbonati → Dettagli Fury → Verifica piattaforme
```

---

## 🔍 TROUBLESHOOTING

### **Problema**: Script non trova il prodotto
**Soluzione**: Verifica che Fury of Sparta esista nel database
```bash
# Apri Prisma Studio
npx prisma studio
# Cerca nella tabella Product
```

### **Problema**: Ancora mostra tutte le piattaforme
**Soluzione**: 
1. Verifica che lo script sia stato eseguito con successo
2. Riavvia il server
3. Pulisci cache del browser (Ctrl+Shift+R)

### **Problema**: Errore "Cannot find module"
**Soluzione**: 
```bash
npm install
npx prisma generate
```

---

**Script pronto per l'esecuzione!** 🚀

Esegui `npm run fury:update-platforms` nella cartella server per aggiornare il database.
