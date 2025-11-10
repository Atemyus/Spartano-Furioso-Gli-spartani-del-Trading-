# 🔐 Cambiare Email e Password Admin

## ⚡ Procedura Rapida (2 minuti)

### **Comando Unico**

```bash
cd server
npm run admin:update
```

### **Cosa Ti Chiederà**

```
🔐 AGGIORNA CREDENZIALI ADMIN

📋 Admin attuale:
   Nome: Admin
   Email: admin@spartanofurioso.com
   ID: user_xxx

📧 Nuova email (lascia vuoto per mantenere attuale): tua@email.com
🔑 Nuova password (minimo 8 caratteri): TuaPasswordSicura2024!

📝 RIEPILOGO MODIFICHE:
   Email: admin@spartanofurioso.com → tua@email.com
   Password: ******** → **********************

❓ Confermi le modifiche? (s/n): s

✅ CREDENZIALI AGGIORNATE CON SUCCESSO!

📋 NUOVE CREDENZIALI:
   Email: tua@email.com
   Password: TuaPasswordSicura2024!

💡 IMPORTANTE:
   1. Salva queste credenziali in un posto sicuro
   2. Non condividerle con nessuno
   3. Usa un password manager (1Password, Bitwarden)

🎯 Accedi al pannello admin:
   http://localhost:5173/admin
```

---

## 📋 Opzioni Disponibili

### **Opzione 1: Cambiare Solo Password**

```bash
cd server
npm run admin:update

# Quando chiede nuova email, premi INVIO (lascia vuoto)
# Inserisci solo la nuova password
```

### **Opzione 2: Cambiare Solo Email**

```bash
cd server
npm run admin:update

# Inserisci nuova email
# Inserisci la stessa password attuale
```

### **Opzione 3: Cambiare Entrambi**

```bash
cd server
npm run admin:update

# Inserisci nuova email
# Inserisci nuova password
```

---

## 🔑 Password Sicura

### **Requisiti Minimi**

- ✅ Minimo 8 caratteri (consigliato 12+)
- ✅ Maiuscole (A-Z)
- ✅ Minuscole (a-z)
- ✅ Numeri (0-9)
- ✅ Simboli (!@#$%^&*)

### **Esempi Password Valide**

```
✅ Spartano2024!Trading
✅ FuryOfSparta#2024
✅ Admin@Spartano99!
✅ MySecureP@ssw0rd2024
```

### **Esempi Password NON Valide**

```
❌ password (troppo semplice)
❌ 12345678 (solo numeri)
❌ admin123 (troppo comune)
❌ qwerty (troppo semplice)
```

### **Generatore Password Sicure**

```bash
# Online (consigliato):
https://passwordsgenerator.net/

# Oppure usa password manager:
- 1Password (genera automaticamente)
- Bitwarden (genera automaticamente)
- LastPass (genera automaticamente)
```

---

## 📧 Email Consigliata

### **Usa Email Aziendale**

```
✅ admin@tuosito.com
✅ info@tuosito.com
✅ support@tuosito.com
```

### **Evita Email Personali**

```
⚠️ tuonome@gmail.com
⚠️ tuonome@hotmail.com
⚠️ tuonome@yahoo.com
```

**Perché?**
- Email aziendale = più professionale
- Separazione vita privata/lavoro
- Migliore controllo accessi
- Più facile da gestire in team

---

## 🔄 Procedura Completa Passo-Passo

### **Step 1: Apri Terminale**

```bash
# Windows PowerShell
cd c:\Users\Daniel\Desktop\project-bolt-sb1-r6swdtnj\project\server

# Mac/Linux
cd /path/to/project/server
```

### **Step 2: Esegui Script**

```bash
npm run admin:update
```

### **Step 3: Inserisci Nuova Email**

```
📧 Nuova email (lascia vuoto per mantenere attuale): admin@tuosito.com
```

**Opzioni:**
- Inserisci nuova email → Cambia email
- Premi INVIO (vuoto) → Mantiene email attuale

### **Step 4: Inserisci Nuova Password**

```
🔑 Nuova password (minimo 8 caratteri): Spartano2024!Trading
```

**Requisiti:**
- Minimo 8 caratteri
- Usa password sicura (vedi esempi sopra)

### **Step 5: Conferma**

```
📝 RIEPILOGO MODIFICHE:
   Email: admin@spartanofurioso.com → admin@tuosito.com
   Password: ******** → **********************

❓ Confermi le modifiche? (s/n): s
```

Digita `s` e premi INVIO.

### **Step 6: Salva Credenziali**

```
✅ CREDENZIALI AGGIORNATE CON SUCCESSO!

📋 NUOVE CREDENZIALI:
   Email: admin@tuosito.com
   Password: Spartano2024!Trading
```

**IMPORTANTE:** Salva queste credenziali in un password manager!

### **Step 7: Testa Login**

```
1. Vai su: http://localhost:5173/admin
2. Inserisci nuova email
3. Inserisci nuova password
4. Click "Accedi"
5. ✅ Dovresti accedere al pannello admin!
```

---

## 🆘 Risoluzione Problemi

### **"Nessun admin trovato nel database"**

```bash
# Crea prima un admin
cd server
npm run admin:create

# Poi aggiorna credenziali
npm run admin:update
```

### **"Password troppo corta"**

```
❌ Errore: Password troppo corta! Minimo 8 caratteri.

# Soluzione: Usa password più lunga
✅ Minimo 8 caratteri
✅ Consigliato 12+ caratteri
```

### **"Email già in uso"**

```bash
# L'email è già usata da un altro utente
# Scegli un'email diversa
# Oppure elimina l'altro utente prima
```

### **"Credenziali non valide" dopo cambio**

```bash
# 1. Verifica di aver inserito correttamente:
#    - Email (controlla maiuscole/minuscole)
#    - Password (controlla maiuscole/minuscole/simboli)

# 2. Prova a resettare di nuovo:
cd server
npm run admin:update

# 3. Verifica nel database:
# File: server/database/data/users.json
# Cerca il tuo utente e verifica email
```

---

## 🔐 Sicurezza Best Practices

### **Password Manager (CONSIGLIATO)**

Usa un password manager per salvare le credenziali:

**Opzioni gratuite:**
- ✅ **Bitwarden** (open source, gratuito)
- ✅ **1Password** (30 giorni gratis, poi €2.99/mese)
- ✅ **LastPass** (versione gratuita disponibile)

**Vantaggi:**
- Genera password sicure automaticamente
- Salva credenziali in modo sicuro
- Sincronizza tra dispositivi
- Compilazione automatica form

### **2FA (Two-Factor Authentication)**

```
⚠️ Non ancora implementato nel progetto

💡 Implementazione futura consigliata:
   - Google Authenticator
   - Authy
   - SMS code
```

### **Cambio Password Regolare**

```
✅ Cambia password ogni 3 mesi
✅ Cambia immediatamente se sospetti compromissione
✅ Non riutilizzare vecchie password
✅ Non usare stessa password per più servizi
```

---

## 📊 Checklist Sicurezza

### **Dopo Cambio Credenziali**

- [ ] Password salvata in password manager
- [ ] Password minimo 12 caratteri
- [ ] Email aziendale (non personale)
- [ ] Testato login con nuove credenziali
- [ ] Vecchie credenziali eliminate/dimenticate
- [ ] Nessuno altro conosce le nuove credenziali

### **Manutenzione Regolare**

- [ ] Cambiare password ogni 3 mesi
- [ ] Verificare log accessi mensile
- [ ] Rimuovere admin non più necessari
- [ ] Backup database settimanale

---

## 🎯 Comandi Rapidi

### **Aggiorna Credenziali**
```bash
cd server
npm run admin:update
```

### **Gestisci Admin (nomina/rimuovi)**
```bash
cd server
npm run admin:manage
```

### **Crea Nuovo Admin**
```bash
cd server
npm run admin:create
```

### **Vedi Lista Admin**
```bash
cd server
npm run admin:manage
# Seleziona opzione 3
```

---

## ✅ Riepilogo

### **Cambiare Credenziali Admin**

```bash
# 1 comando
cd server && npm run admin:update

# Inserisci nuova email e password
# Conferma
# ✅ Fatto!
```

### **Tempo Richiesto**
⏱️ **2 minuti**

### **Sicurezza**
🔒 **Password hashata con bcrypt**
🔒 **Salvata in modo sicuro nel database**

---

**Pronto per cambiare le credenziali! 🚀**
