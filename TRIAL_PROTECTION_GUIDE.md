# 🛡️ SISTEMA DI PROTEZIONE ANTI-ABUSO TRIAL

## 📌 PANORAMICA

Ho implementato un sistema avanzato di protezione per prevenire l'abuso dei trial gratuiti. Il sistema impedisce che gli utenti creino account multipli per usufruire illimitatamente dei servizi gratuiti.

## 🎯 CARATTERISTICHE PRINCIPALI

### 1. **Device Fingerprinting** 🖥️
- Raccoglie un'impronta digitale unica del dispositivo
- Traccia oltre 15 parametri hardware/software:
  - Canvas fingerprint (unico per ogni dispositivo)
  - WebGL renderer e vendor
  - Font installati
  - Risoluzione schermo e DPI
  - Timezone e lingua
  - Audio fingerprint
  - Touch support
  - Browser plugins

### 2. **Tracciamento IP** 🌐
- Monitora gli IP di registrazione e attivazione trial
- Rileva IP range (stesso ISP/area geografica)
- Identifica VPN e proxy conosciuti
- Supporta IPv4 e IPv6

### 3. **Pattern Detection** 🔍
- Rileva email temporanee/disposable
- Identifica pattern sospetti (es. user+1@gmail.com)
- Rileva browser automatizzati (Selenium, Puppeteer)
- Identifica risoluzione schermo anomale

### 4. **Limiti Automatici** 🚫
- **Max 3 account per IP**
- **Max 2 account per dispositivo**
- **Max 2 trial per IP**
- **Max 2 trial per dispositivo**

## 📊 COME FUNZIONA

### Flusso di Registrazione

```
1. Utente compila form registrazione
   ↓
2. Frontend genera device fingerprint
   ↓
3. Backend riceve dati + fingerprint
   ↓
4. Sistema controlla:
   - IP già usato?
   - Device già registrato?
   - Email sospetta?
   - VPN/Proxy attivo?
   ↓
5. Se OK → Registrazione procede
   Se sospetto → Blocco o verifica extra
```

### Flusso Attivazione Trial

```
1. Utente richiede trial
   ↓
2. Sistema verifica:
   - Trial già attivato per questo prodotto?
   - Quanti trial da questo IP?
   - Quanti trial da questo device?
   ↓
3. Se OK → Trial attivato
   Se limite superato → Blocco con messaggio
```

## 🔒 LIVELLI DI PROTEZIONE

### Livello 1: Monitoraggio Soft
- Traccia IP e device
- Log attività sospette
- Alert per pattern anomali

### Livello 2: Limitazione
- Blocco dopo 3+ account stesso IP
- Blocco dopo 2+ account stesso device
- Richiesta verifica extra per email sospette

### Livello 3: Blocco Totale
- IP/Device nella blacklist
- Account sospesi permanentemente
- Impossibile creare nuovi account

## 📁 FILE GENERATI

Il sistema genera automaticamente questi file di tracking:

### `server/data/trial-abuse-log.json`
```json
{
  "ipAddresses": {
    "192.168.1.1": {
      "firstSeen": "2024-01-01T10:00:00Z",
      "accounts": ["user1@email.com", "user2@email.com"],
      "trialCount": 2,
      "lastTrialActivation": "2024-01-02T15:00:00Z"
    }
  },
  "deviceFingerprints": {
    "hash123abc": {
      "accounts": ["user1@email.com"],
      "trialCount": 1
    }
  },
  "suspiciousPatterns": [],
  "blockedEntities": []
}
```

### `server/data/device-fingerprints.json`
Contiene i fingerprint completi di ogni dispositivo registrato.

## 🎛️ CONFIGURAZIONE

### Modifica Limiti
In `server/middleware/trialProtection.js`:

```javascript
const MAX_ACCOUNTS_PER_IP = 3;     // Cambia limite account per IP
const MAX_ACCOUNTS_PER_DEVICE = 2; // Cambia limite account per device
const MAX_TRIALS_PER_IP = 2;       // Cambia limite trial per IP
```

### Aggiungi VPN/Proxy da Bloccare
```javascript
const vpnRanges = [
  '104.28.', '172.67.',  // Cloudflare
  '198.41.', '199.27.',  // VPN comuni
  // Aggiungi altri range qui
];
```

### Aggiungi Domini Email Temporanee
```javascript
const emailPatterns = [
  /@(guerrillamail|mailinator|10minutemail)/i,
  // Aggiungi altri domini qui
];
```

## 📈 MONITORAGGIO ADMIN

### Visualizza Report Abusi
Accedi a: `http://localhost:3001/api/admin/abuse-report`

Mostra:
- IP con account multipli
- Device con account multipli
- Pattern sospetti rilevati
- Entità bloccate

### Esempio Report
```json
{
  "stats": {
    "totalIPs": 45,
    "totalDevices": 38,
    "suspiciousPatterns": 12,
    "blockedEntities": 3,
    "multiAccountIPs": [
      {
        "ip": "192.168.1.1",
        "accounts": ["user1@email.com", "user2@email.com"],
        "trialCount": 2
      }
    ]
  }
}
```

## 🚨 MESSAGGI DI ERRORE

### Per l'Utente

**Troppi account da stesso IP:**
> "Hai superato il numero massimo di account consentiti per questo indirizzo IP."

**Troppi account da stesso dispositivo:**
> "Hai superato il numero massimo di account consentiti per questo dispositivo."

**Account bloccato:**
> "Il tuo account è stato sospeso per violazione dei termini di servizio. Contatta il supporto."

## 🔧 TROUBLESHOOTING

### Falsi Positivi

**Problema:** Utenti legittimi bloccati (es. famiglia stesso WiFi)
**Soluzione:** 
1. Aumenta i limiti in `trialProtection.js`
2. Rimuovi manualmente dal file `trial-abuse-log.json`
3. Implementa whitelist per IP specifici

### VPN Legittime

**Problema:** Utenti con VPN per privacy bloccati
**Soluzione:**
1. Rimuovi check VPN o rendilo warning invece che blocco
2. Richiedi verifica email/telefono extra

### Device Fingerprint Non Generato

**Problema:** Browser con privacy estrema non forniscono fingerprint
**Soluzione:**
1. Usa fallback su solo IP tracking
2. Richiedi verifica manuale

## 📱 LIMITAZIONI CONOSCIUTE

1. **Browser Incognito:** Il fingerprint rimane simile ma localStorage è vuoto
2. **iOS Safari:** Limitazioni su fingerprinting audio/canvas
3. **Tor Browser:** Fingerprint identici per design
4. **Reset Router:** Cambio IP dinamico aggira limite IP

## 🎯 BEST PRACTICES

### Per Massima Protezione

1. **Combina con verifica telefono** per trial di alto valore
2. **Richiedi carta di credito** (anche senza addebito)
3. **Limita funzionalità trial** per ridurre incentivo abuso
4. **Monitora manualmente** pattern sospetti regolarmente

### Per Bilanciare UX

1. **Non bloccare al primo sospetto** - usa warning
2. **Offri modo per appeal** se bloccati erroneamente
3. **Spiega perché** quando blocchi (trasparenza)
4. **Considera famiglia/uffici** che condividono IP

## 🔐 SICUREZZA

### Dati Sensibili
- I fingerprint sono hashati, non salvati in chiaro
- IP salvati solo per tracking, non esposti pubblicamente
- Nessun dato di pagamento nel sistema anti-abuso

### GDPR Compliance
- Informa utenti del tracking nei ToS
- Permetti cancellazione dati su richiesta
- Non tracciare più del necessario

## 📞 SUPPORTO UTENTI

### FAQ per Utenti Bloccati

**Q: Perché non posso creare un account?**
A: Il sistema ha rilevato attività sospetta dal tuo IP o dispositivo.

**Q: Come posso sbloccarmi?**
A: Contatta support@tuodominio.com con:
- Email utilizzata
- Descrizione problema
- Prova d'identità

**Q: Posso usare VPN?**
A: Sì, ma alcuni servizi VPN potrebbero essere bloccati per sicurezza.

## 🚀 PROSSIMI MIGLIORAMENTI

### Pianificati
- [ ] Machine Learning per pattern detection
- [ ] Integrazione con servizi anti-frode (MaxMind, etc.)
- [ ] Verifica SMS opzionale
- [ ] Reputation scoring progressivo
- [ ] Dashboard admin con grafici

### Idee Future
- Blockchain per tracking decentralizzato
- AI per rilevamento comportamenti anomali
- Integrazione social login per verifica identità
- Sistema di "trust score" per utenti

---

## ✅ CHECKLIST DEPLOYMENT

Prima di andare in produzione:

- [ ] Configura limiti appropriati per tuo business
- [ ] Testa con VPN comuni per evitare falsi positivi
- [ ] Prepara processo di appeal per utenti bloccati
- [ ] Documenta policy nei Terms of Service
- [ ] Configura alert email per pattern sospetti
- [ ] Backup regolare dei file di tracking
- [ ] Monitora prime settimane per calibrare

---

**Sistema sviluppato e configurato con successo!** 🎉

Il sistema è ora attivo e protegge automaticamente contro:
- ✅ Creazione account multipli
- ✅ Abuso trial con email diverse
- ✅ Uso di VPN/Proxy per aggirare limiti
- ✅ Bot e automazione
- ✅ Email temporanee

Per qualsiasi domanda o personalizzazione, il codice è ben commentato in:
- `server/middleware/trialProtection.js`
- `src/utils/deviceFingerprint.ts`
