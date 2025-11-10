# 🛡️ Guida Gestione Amministratori

## Come nominare un collega amministratore

Ci sono diversi modi per gestire i privilegi di amministratore nel sistema Spartano Furioso:

### Metodo 1: Usando lo script interattivo (CONSIGLIATO)

Dal terminale, nella cartella `server`, esegui:

```bash
npm run admin:manage
```

Oppure su Windows, doppio click su:
```
manage-admin.bat
```

Questo aprirà un menu interattivo dove potrai:
1. **Nominare un utente amministratore** - Inserisci l'email del collega
2. **Rimuovere privilegi admin** - Toglie i permessi amministrativi
3. **Vedere solo gli admin** - Lista tutti gli amministratori attuali
4. **Esci** - Chiude il programma

### Metodo 2: Modifica diretta del database (AVANZATO)

Se preferisci modificare direttamente il file:

1. Apri il file `server/database/data/users.json`
2. Trova l'utente tramite la sua email
3. Cambia il campo `"role"` da `"user"` a `"admin"`
4. Salva il file

Esempio:
```json
{
  "id": "user_xxxxx",
  "name": "Nome Collega",
  "email": "collega@email.com",
  "role": "admin",  // ← Cambia questo da "user" a "admin"
  ...
}
```

## ⚠️ Note importanti

- **Il collega deve prima registrarsi** sulla piattaforma prima di poter essere nominato admin
- L'email utilizzata per nominarlo deve corrispondere esattamente a quella usata durante la registrazione
- **Non rimuovere l'ultimo amministratore!** Il sistema impedisce di farlo per sicurezza
- Gli amministratori possono accedere al pannello admin su: `http://localhost:5173/admin`

## Cosa può fare un amministratore?

Una volta nominato, il tuo collega potrà:

✅ **Gestione Utenti**
- Visualizzare tutti gli utenti registrati
- Modificare informazioni utenti
- Attivare/disattivare account
- Vedere abbonamenti e trial attivi

✅ **Gestione Prodotti**
- Creare nuovi prodotti
- Modificare prezzi e descrizioni
- Attivare/disattivare prodotti
- Gestire piani di abbonamento

✅ **Gestione Ordini**
- Visualizzare tutti gli ordini
- Modificare stati degli ordini
- Gestire rimborsi

✅ **Dashboard Analytics**
- Vedere statistiche in tempo reale
- Monitorare ricavi
- Analizzare trend di vendita

## Risoluzione problemi

### "Utente non trovato"
- Verifica che l'email sia scritta correttamente
- Assicurati che l'utente si sia già registrato

### "Script non funziona"
- Assicurati di essere nella cartella `server`
- Verifica che Node.js sia installato: `node --version`

### "Permesso negato"
- Su Linux/Mac, potresti dover usare: `chmod +x scripts/makeAdmin.js`

## Sicurezza

🔐 **Best Practices:**
- Nomina admin solo persone fidate
- Usa email aziendali per gli admin
- Monitora regolarmente la lista degli admin
- Rimuovi i privilegi quando non più necessari

## Supporto

Per problemi o domande sulla gestione amministratori:
- Email: support@spartanofurioso.com
- Discord: [Link al server Discord]

---

*Ultima modifica: Gennaio 2025*
