# 🔧 FIX: Problema Login Admin

## 🎯 Problema Risolto

Il problema era che il sistema di login admin controllava solo le variabili d'ambiente (`ADMIN_EMAIL` e `ADMIN_PASSWORD`), mentre lo script `npm run admin:create` creava gli utenti nel database. I due sistemi non comunicavano tra loro!

## ✅ Soluzione Implementata

Ho aggiornato il sistema in modo che:

1. **Il login admin ora controlla ENTRAMBI i sistemi:**
   - Prima controlla le variabili d'ambiente (metodo legacy)
   - Poi controlla il database Prisma per utenti con ruolo `ADMIN`

2. **Lo script `createAdmin.js` ora crea utenti nel database Prisma** invece che nel file JSON

3. **Nuovo script per verificare gli admin esistenti**

## 🚀 Come Risolvere il Tuo Problema

### Opzione 1: Verifica Admin Esistenti

```bash
cd server
npm run admin:check
```

Questo mostrerà tutti gli admin nel database e il loro stato.

### Opzione 2: Crea un Nuovo Admin

```bash
cd server
npm run admin:create
```

Segui le istruzioni per creare un nuovo admin. Lo script ora:
- Crea l'utente direttamente nel database Prisma
- Imposta automaticamente `role: ADMIN`
- Verifica automaticamente l'email
- Attiva l'account

### Opzione 3: Aggiorna un Utente Esistente a Admin

Se hai già creato un utente con `npm run admin:create` in precedenza, puoi:

```bash
cd server
npm run admin:create
```

Inserisci la stessa email dell'utente esistente. Lo script ti chiederà se vuoi aggiornare il ruolo a ADMIN.

## 🔐 Come Fare Login

### 1. Endpoint di Login Admin

```
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "tua-email@esempio.com",
  "password": "tua-password"
}
```

### 2. Risposta di Successo

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "user-id",
    "email": "tua-email@esempio.com",
    "name": "Nome Admin"
  }
}
```

### 3. Usa il Token per Accedere alle Route Admin

```
GET /api/admin/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔍 Debug

Se ancora non riesci ad accedere, controlla i log del server. Il sistema ora mostra:

```
🔐 Admin login attempt for: email@esempio.com
👤 User found in database: true
👤 User role: ADMIN
🔑 Password valid: true
✅ Admin logged in via database
```

## 📋 Checklist

- [ ] Hai eseguito `npm run admin:check` per verificare gli admin?
- [ ] L'utente ha `role: ADMIN` nel database?
- [ ] L'utente ha `emailVerified: true`?
- [ ] L'utente ha `status: active`?
- [ ] La password è corretta?
- [ ] Il server è in esecuzione?
- [ ] Stai usando l'endpoint corretto (`/api/auth/admin/login`)?

## 🆘 Se Ancora Non Funziona

1. **Elimina l'utente admin esistente** (se necessario):
   - Accedi al database e elimina l'utente
   - Oppure usa Prisma Studio: `npx prisma studio`

2. **Crea un nuovo admin da zero**:
   ```bash
   cd server
   npm run admin:create
   ```

3. **Verifica che sia stato creato**:
   ```bash
   npm run admin:check
   ```

4. **Prova il login** con le credenziali appena create

## 📝 Note Importanti

- Il token admin è valido per **24 ore**
- Il token admin usa `JWT_ADMIN_SECRET` (diverso dal token utente normale)
- Tutti gli endpoint `/api/admin/*` richiedono il token admin
- La password viene hashata con bcrypt (10 rounds)

## 🔄 Prossimi Passi

Dopo aver fatto login con successo:

1. Salva il token nel localStorage del browser
2. Usa il token per tutte le richieste admin
3. Il frontend dovrebbe reindirizzare automaticamente al pannello admin
4. Cambia la password al primo accesso (buona pratica di sicurezza)
