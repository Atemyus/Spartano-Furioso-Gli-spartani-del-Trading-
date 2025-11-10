# Setup Logo Spartano Furioso

## Istruzioni per salvare il logo

Il logo è stato integrato nel codice del sito. Ora devi salvare manualmente l'immagine JPG che mi hai inviato.

### Passaggi:

1. **Salva l'immagine del logo** con il nome esatto: `logo.png` (o `logo.jpg` se preferisci JPG)

2. **Posiziona il file** nella cartella:
   ```
   C:\Users\Daniel\Desktop\project-bolt-sb1-r6swdtnj\project\public\logo.png
   ```

3. **Verifica** che il nome del file sia esattamente `logo.png` (minuscolo, senza spazi)

**Nota:** Il codice è configurato per usare PNG. Se vuoi usare JPG, cambia i riferimenti da `/logo.png` a `/logo.jpg` nei file Header.tsx, Footer.tsx e Unsubscribe.tsx

### Dove è stato integrato il logo:

Il logo è stato aggiunto in tutte le seguenti sezioni del sito:

- ✅ **Header** (componente principale in alto)
- ✅ **Footer** (sezione brand nel footer)
- ✅ **Pagina Unsubscribe** (logo nell'intestazione)

### Caratteristiche del logo nel sito:

- Dimensione: 48x48px (header) e 56x56px (footer)
- Effetto glow rosso animato
- Hover effect con scala 110%
- Accompagna sempre il testo "SPARTANO FURIOSO"

### Dopo aver salvato il logo:

1. Riavvia il server di sviluppo se è in esecuzione
2. Apri il browser e verifica che il logo appaia correttamente
3. Se non vedi il logo, controlla:
   - Il nome del file è esattamente `logo.jpg`
   - Il file è nella cartella `public`
   - Hai fatto un refresh completo del browser (Ctrl+F5)

### Note:

- Il logo ha sfondo trasparente/nero che si integra perfettamente con il tema del sito
- L'effetto glow rosso è stato scelto per abbinarsi ai colori spartani del brand
- Il logo è responsive e si adatta a tutte le dimensioni dello schermo
