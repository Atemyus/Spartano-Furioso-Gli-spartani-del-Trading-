# 🔐 Setup Primo Admin - Guida Rapida

## ⚠️ IMPORTANTE: Prima del Lancio

Devi creare il tuo account admin personale!

---

## 🚀 Procedura Rapida (2 minuti)

### **Opzione A: Script Automatico (CONSIGLIATO)**

```bash
cd server
npm run admin:manage
```

**Menu interattivo:**
```
🛡️  GESTIONE AMMINISTRATORI

1. Nominare un utente amministratore
2. Rimuovere privilegi admin
3. Vedere lista amministratori
4. Esci

Scelta: 1
Email utente: tua@email.com
✅ tua@email.com è ora amministratore!
```

### **Opzione B: Registrati Prima, Poi Nomina Admin**

```bash
# 1. Registrati sul sito come utente normale
http://localhost:5173/register
Email: tua@email.com
Password: [password sicura]

# 2. Nominati admin
cd server
node scripts/makeAdmin.js
Email: tua@email.com
✅ Sei ora amministratore!

# 3. Accedi al pannello admin
http://localhost:5173/admin
```

---

## 🔑 Password Sicura

### **Requisiti Minimi**
- ✅ Minimo 12 caratteri
- ✅ Maiuscole (A-Z)
- ✅ Minuscole (a-z)
- ✅ Numeri (0-9)
- ✅ Simboli (!@#$%^&*)

### **Esempi Password Valide**
```
✅ Spartano2024!Trading
✅ FuryOfSparta#2024
✅ Admin@Spartano99!
```

### **Esempi Password NON Valide**
```
❌ password123
❌ admin
❌ 12345678
❌ spartano (troppo semplice)
```

---

## 📋 Checklist Setup Admin

### **Prima del Lancio**

- [ ] Registrato account con email personale
- [ ] Nominato come admin (script makeAdmin)
- [ ] Testato login su `/admin`
- [ ] Verificato accesso pannello admin
- [ ] Password sicura (12+ caratteri)
- [ ] Email aziendale (non personale)
- [ ] Salvato credenziali in password manager

### **Dopo il Lancio**

- [ ] Cambiare password ogni 3 mesi
- [ ] Non condividere credenziali
- [ ] Usare 2FA se disponibile
- [ ] Monitorare log accessi
- [ ] Nominare altri admin solo se necessario

---

## 🛡️ Sicurezza

### **Cosa NON Fare**
- ❌ Usare password semplici
- ❌ Condividere credenziali admin
- ❌ Usare email personale (gmail, hotmail)
- ❌ Salvare password in file di testo
- ❌ Nominare troppi admin

### **Cosa Fare**
- ✅ Password complessa e unica
- ✅ Email aziendale dedicata
- ✅ Password manager (1Password, Bitwarden)
- ✅ Cambiare password regolarmente
- ✅ Monitorare accessi sospetti

---

## 🔄 Gestione Admin

### **Nominare Altri Admin**

```bash
cd server
npm run admin:manage

# Seleziona opzione 1
# Inserisci email collega
# ✅ Collega è ora admin!
```

### **Rimuovere Admin**

```bash
cd server
npm run admin:manage

# Seleziona opzione 2
# Inserisci email da rimuovere
# ✅ Privilegi rimossi!
```

### **Vedere Lista Admin**

```bash
cd server
npm run admin:manage

# Seleziona opzione 3
# Vedi tutti gli admin attuali
```

---

## 🎯 Accesso Pannello Admin

### **URL**

```
Sviluppo:  http://localhost:5173/admin
Produzione: https://tuosito.com/admin
```

### **Login**

```
1. Vai su /admin
2. Inserisci email admin
3. Inserisci password
4. Click "Accedi"
5. ✅ Accesso al pannello!
```

### **Logout**

```
1. Click icona profilo (in alto a destra)
2. Click "Logout"
3. ✅ Disconnesso!
```

---

## 🆘 Problemi Comuni

### **"Credenziali non valide"**

```bash
# Verifica che sei admin
cd server
node scripts/makeAdmin.js
Email: tua@email.com
✅ Verificato!
```

### **"Accesso negato"**

```bash
# Controlla role nel database
# File: server/database/data/users.json
# Cerca il tuo utente
# Verifica: "role": "admin"
```

### **"Token scaduto"**

```
1. Logout
2. Login di nuovo
3. ✅ Nuovo token generato!
```

---

## ✅ Riepilogo

### **Setup Completo**

```
1. Registrati sul sito
2. Nominati admin (script)
3. Login su /admin
4. ✅ Pronto!
```

### **Tempo Richiesto**
⏱️ **2 minuti**

### **Sicurezza**
🔒 **Password sicura + Email aziendale**

---

**Pronto per gestire il sito! 🚀**
