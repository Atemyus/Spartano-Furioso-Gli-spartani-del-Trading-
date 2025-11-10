# 📧 Guida Sistema Newsletter - Spartano Furioso

## 🎯 Panoramica

Il sistema newsletter "UNISCITI ALLA FALANGE" permette di raccogliere email degli utenti e inviare messaggi periodici per:
- Promozioni e offerte speciali
- Contenuti educativi sul trading
- Annunci importanti
- Incentivare iscrizioni e acquisti

## 🚀 Funzionalità Implementate

### ✅ Frontend (Utente)

1. **Form Iscrizione nel Footer**
   - Presente in tutte le pagine del sito
   - Validazione email in tempo reale
   - Feedback visivo (successo/errore)
   - State loading durante l'invio

2. **Pagina Disiscrizione** (`/unsubscribe`)
   - Link automatico in tutte le email
   - Conferma prima della disiscrizione
   - Possibilità di tornare alla homepage

### ✅ Backend (API)

**Endpoint disponibili:**

#### Pubblici:
- `POST /api/newsletter/subscribe` - Iscriviti alla newsletter
  ```json
  {
    "email": "utente@example.com",
    "name": "Nome Guerriero",
    "source": "footer"
  }
  ```

- `POST /api/newsletter/unsubscribe` - Disiscrizione
  ```json
  {
    "email": "utente@example.com"
  }
  ```

#### Admin (richiedono autenticazione):
- `GET /api/newsletter/admin/subscribers` - Lista iscritti
- `GET /api/newsletter/admin/stats` - Statistiche newsletter
- `POST /api/newsletter/admin/messages` - Crea messaggio
- `GET /api/newsletter/admin/messages` - Lista messaggi
- `POST /api/newsletter/admin/messages/:id/send` - Invia newsletter
- `PUT /api/newsletter/admin/messages/:id` - Aggiorna messaggio
- `DELETE /api/newsletter/admin/messages/:id` - Elimina messaggio

### ✅ Pannello Admin

**Accesso:** `/admin/dashboard` → sezione "Newsletter"

**3 Tab principali:**

1. **Iscritti** 📊
   - Lista completa degli iscritti
   - Filtri per stato (Attivi/Disiscritti)
   - Ricerca per email o nome
   - Visualizzazione fonte iscrizione

2. **Messaggi** 📨
   - Lista di tutte le newsletter create
   - Stati: Bozza, Programmata, Inviata
   - Statistiche per messaggio (destinatari, aperture, click)
   - Azioni: Modifica, Invia, Elimina

3. **Crea Messaggio** ✍️
   - Oggetto email personalizzabile
   - Editor HTML per contenuto
   - Tipi: Promozionale, Educativo, Annuncio
   - Programmazione invio (opzionale)

### ✅ Database

**Modelli Prisma:**

```prisma
model Newsletter {
  id             String    @id @default(uuid())
  email          String    @unique
  name           String?
  status         String    @default("ACTIVE")
  source         String    @default("footer")
  subscribedAt   DateTime  @default(now())
  unsubscribedAt DateTime?
}

model NewsletterMessage {
  id             String    @id @default(uuid())
  subject        String
  content        String
  type           String    @default("promotional")
  status         String    @default("draft")
  scheduledFor   DateTime?
  sentAt         DateTime?
  recipientCount Int       @default(0)
  openCount      Int       @default(0)
  clickCount     Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

## 📧 Sistema Email

### Email di Benvenuto

Quando un utente si iscrive, riceve automaticamente un'email di benvenuto con:
- Template personalizzato Spartano Furioso
- Lista benefici dell'iscrizione
- Link ai prodotti
- Link per disiscrizione

### Template Email Personalizzato

Tutte le email includono:
- Header con logo Spartano Furioso
- Styling brand (rosso, giallo, nero)
- Link disiscrizione automatico
- Footer con copyright e links

## 🔧 Configurazione Email

**Variabili d'ambiente necessarie** (`.env` nel server):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tua-email@gmail.com
EMAIL_PASSWORD=tua-app-password
FRONTEND_URL=http://localhost:5173
```

### Setup Gmail (Consigliato)

1. Abilita autenticazione a 2 fattori su Gmail
2. Genera una "App Password" da Google Account
3. Usa quella password in `EMAIL_PASSWORD`

### Alternative Email Providers

- **SendGrid**: Professionale, fino a 100 email/giorno gratis
- **Mailgun**: Ottimo per sviluppatori
- **AWS SES**: Scalabile, economico
- **SMTP2GO**: Semplice da configurare

## 📝 Come Usare il Sistema

### 1. Raccogliere Iscritti

Gli utenti possono iscriversi da:
- Footer di ogni pagina (fonte: "footer")
- Popup futuri (fonte: "popup")
- Landing page speciali (fonte: "landing")

### 2. Creare una Newsletter

1. Vai su `/admin/dashboard` → Newsletter
2. Click su "Crea Messaggio"
3. Compila i campi:
   - **Oggetto**: Es: "🔥 Nuova Strategia Spartana - Profitti del 150%!"
   - **Tipo**: Scegli tra Promozionale, Educativo, Annuncio
   - **Contenuto HTML**: Scrivi il messaggio
   - **Programmazione** (opzionale): Imposta data/ora futura

4. Click "Salva Messaggio" (crea bozza)

### 3. Inviare una Newsletter

**Opzione A - Invio Immediato:**
1. Dalla tab "Messaggi"
2. Trova il messaggio in bozza
3. Click icona "Invia" (⬆️)
4. Conferma

**Opzione B - Programmazione:**
- Imposta "Programmazione Invio" durante la creazione
- Il messaggio verrà inviato automaticamente alla data/ora scelta
- (Richiede un cron job o scheduler - da implementare)

### 4. Monitorare Risultati

Statistiche disponibili:
- **Totale iscritti attivi**
- **Nuovi iscritti questo mese**
- **Newsletter inviate**
- **Tasso di apertura medio**

Per ogni messaggio inviato:
- Numero destinatari
- Aperture (da implementare tracking)
- Click (da implementare tracking)

## 🎨 Esempi di Contenuti

### Email Promozionale

```html
<h1>🔥 OFFERTA ESCLUSIVA PER I GUERRIERI! 🔥</h1>
<p>Ciao Guerriero della Falange!</p>

<p>Per i prossimi 3 giorni, ottieni <strong style="color: #FCD34D;">30% di sconto</strong> su tutti i nostri corsi premium!</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="https://tuosito.com/products" style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
    SCOPRI LE OFFERTE ⚔️
  </a>
</div>

<p>Non perdere questa occasione per unirti ai guerrieri più vincenti del trading!</p>

<p style="color: #FCD34D; font-style: italic; text-align: center; margin-top: 30px;">
  "La fortuna aiuta gli audaci" - Motto Spartano
</p>
```

### Email Educativa

```html
<h1>📚 3 Strategie per Massimizzare i Profitti</h1>
<p>Ciao Guerriero!</p>

<p>Oggi voglio condividere con te 3 strategie che i nostri top trader usano quotidianamente:</p>

<h3>1. 🎯 La Regola del Risk/Reward 1:3</h3>
<p>Non entrare mai in un trade dove il potenziale profitto non è almeno 3 volte il rischio...</p>

<h3>2. 📊 Analisi Multi-Timeframe</h3>
<p>Controlla sempre il trend su 3 timeframe diversi prima di entrare...</p>

<h3>3. 💰 Position Sizing Dinamico</h3>
<p>Adatta la size della posizione in base alla volatilità del mercato...</p>

<div style="background: #1F2937; padding: 20px; border-left: 4px solid #FCD34D; margin: 20px 0;">
  <p><strong>💡 BONUS TIP:</strong> Scarica la nostra checklist gratuita per trader!</p>
</div>
```

## 🔒 Privacy e GDPR

✅ **Conformità implementata:**

- Doppio opt-in (email di conferma)
- Link disiscrizione in ogni email
- Pagina dedicata per disiscrizione
- Tracking stato iscrizione nel database
- Data di iscrizione e disiscrizione salvate

⚠️ **Da implementare per GDPR completo:**

- Cookie consent per tracking aperture/click
- Privacy policy aggiornata con menzione newsletter
- Possibilità di esportare/cancellare dati utente
- Consent esplicito per email marketing

## 🚀 Miglioramenti Futuri

### Tracking Avanzato
- [ ] Pixel di tracciamento aperture email
- [ ] Link tracking per click
- [ ] Heatmap interazioni email

### Automazioni
- [ ] Email sequence automatiche (drip campaigns)
- [ ] Trigger basati su comportamento utente
- [ ] A/B testing oggetto email

### Segmentazione
- [ ] Tag personalizzati per iscritti
- [ ] Segmenti dinamici (es: interessati a crypto)
- [ ] Invio selettivo per segmenti

### Analytics
- [ ] Dashboard dettagliata performance
- [ ] Export dati in CSV/Excel
- [ ] Grafici trend iscrizioni

### Integrazioni
- [ ] Mailchimp/SendGrid integration
- [ ] Webhook per eventi newsletter
- [ ] API pubblica per iscrizioni

## 🐛 Troubleshooting

### Email non arrivano

1. Verifica configurazione SMTP in `.env`
2. Controlla spam/posta indesiderata
3. Verifica limiti del provider email
4. Controlla logs server: `console.log` in `newsletter.js`

### Errore "Sei già iscritto"

- Normale se email già presente
- Per reiscriversi, prima fare unsubscribe

### Database non aggiornato

Esegui migrazione:
```bash
cd server
npx prisma migrate dev
```

### Errore CORS

Verifica `FRONTEND_URL` in `.env` corrisponda al dominio frontend

## 📞 Supporto

Per problemi o domande:
- Controlla logs: `server/` directory
- Verifica configurazione email
- Testa con email personale prima di invio massivo

---

**Creato per Spartano Furioso Trading** ⚔️  
Sistema Newsletter v1.0 - Domina la comunicazione come un guerriero!
