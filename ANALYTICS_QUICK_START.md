# ⚡ Analytics Quick Start - 2 Minuti

## 🎯 Problema
Le tue visite vengono conteggiate nelle analytics → dati non realistici.

## ✅ Soluzione Rapida

### **Metodo Automatico (CONSIGLIATO)** ⏱️ 2 minuti

```bash
cd server
node scripts/setupAnalytics.cjs
```

Lo script farà tutto automaticamente:
1. ✅ Scopre il tuo IP
2. ✅ Configura .env
3. ✅ Azzera analytics
4. ✅ Crea backup

**Poi riavvia il server:**
```bash
npm start
```

**FATTO! ✨**

---

## 📋 Metodo Manuale (se preferisci)

### **1. Scopri il tuo IP** (30 sec)
```bash
node scripts/getMyIP.cjs
```

### **2. Configura .env** (30 sec)
```bash
# Apri server/.env
# Aggiungi:
EXCLUDED_IPS=93.45.123.456
```

### **3. Azzera analytics** (30 sec)
```bash
node scripts/resetAnalytics.cjs
# Digita: s
```

### **4. Riavvia server** (30 sec)
```bash
npm start
```

---

## ✅ Verifica Funzionamento

### **Test 1: Tua visita (NON deve contare)**
1. Visita il sito
2. Controlla console server:
   ```
   🚫 Analytics tracking skipped for IP: 93.45.123.456
   ```
3. Pannello admin → Analytics → Contatore: **0** ✅

### **Test 2: Visita esterna (DEVE contare)**
1. Visita da smartphone (4G, non WiFi)
2. Controlla console server:
   ```
   ✅ Analytics tracked for IP: 87.12.34.56
   ```
3. Pannello admin → Analytics → Contatore: **1** ✅

---

## 🚀 Pronto per il Lancio!

Ora:
- ✅ Analytics azzerate (partenza da 0)
- ✅ Tue visite escluse automaticamente
- ✅ Solo visite reali conteggiate
- ✅ Dati accurati e affidabili

**Buon lancio! 🎉**

---

## 📚 Guide Dettagliate

- **`ANALYTICS_RESET_GUIDE.md`** - Guida completa con tutti i dettagli
- **`server/scripts/setupAnalytics.cjs`** - Script automatico
- **`server/scripts/getMyIP.cjs`** - Scopri il tuo IP
- **`server/scripts/resetAnalytics.cjs`** - Reset manuale analytics
