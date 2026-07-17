# Changelog

## 2026-07-17

### Aggiunto

- struttura documentale obbligatoria;
- specifica del database multi-tenant e della matrice RLS.
- migration completa con sei tabelle italiane, trigger, grant e policy;
- 39 test automatici database e RLS;
- script idempotente per i dati demo Staging;
- componente riutilizzabile di conferma eliminazione.
- schema multi-tenant applicato e verificato sul progetto Supabase Staging.
- dati demo creati e verificati su Staging con esecuzione idempotente.
- autenticazione Supabase SSR con login, logout e recupero password;
- layout privato responsive con navigazione basata sul ruolo;
- dashboard scadenze con riepiloghi, card mobile, tabella e WhatsApp;
- elenco, ricerca, inserimento rapido e dettaglio clienti;
- 6 test unitari per le funzioni applicative principali.
- gestione compagnie con inserimento, sito, stato ed eliminazione confermata;
- test unitario della validazione compagnia.
- email amministratore demo configurabile localmente per test Auth;
- elenco e filtri polizze, inserimento rapido, dettaglio e WhatsApp;
- test unitario validazione polizza e test CRUD temporaneo Staging.
- modifica polizza con modulo precompilato ed eliminazione tramite AlertDialog;
- rinnovo atomico con archiviazione della polizza precedente;
- pagina rinnovo con nuova scadenza proposta automaticamente.
- modifica ed eliminazione protetta dei clienti;
- registrazione esplicita e storico filtrabile dei contatti;
- inviti, ruoli e attivazione utenti per gli amministratori;
- impostazioni agenzia e messaggio WhatsApp;
- nuovo tema blu professionale e navigazione modernizzata.
- modalità scura blu-notte selezionabile dalle Impostazioni e persistente sul
  dispositivo.
- denominazione ufficiale `GestionaleAssicurativo` applicata a interfaccia,
  metadata, package e configurazione Supabase locale;
- repository ufficiale GitHub collegato a
  `Invidia88/GestionaleAssicurativo` per il primo versionamento.
- branch permanente `staging` affiancato a `main`, con corrispondenza documentata
  verso i due progetti Supabase.
- progetto Vercel rinominato `gestionale-assicurativo`, configurato come Next.js
  e collegato al repository GitHub ufficiale;
- risoluzione centralizzata dell'URL pubblico per locale, Preview e Production;
- 4 test unitari dedicati agli URL di redirect Vercel.
- pannello proprietario `/piattaforma/agenzie` per creare, elencare, attivare e
  disattivare le agenzie clienti;
- invito email del primo e unico amministratore con compensazione automatica in
  caso di errore database;
- migration con indice univoco parziale e funzione atomica riservata al
  `service_role`;
- 49 test database e 20 test unitari complessivi.

### Modificato

- README esteso con ambienti, avvio, test e deploy.
- porte Supabase locali spostate nell'intervallo `55320–55329`.
- comando `npm test` esteso a test unitari e test database.
- test unitari applicativi estesi a 11 casi.
- gestione del tema resa interna all'app per evitare avvisi di rendering con
  Next.js 16.2; rimossa la dipendenza `next-themes` non più necessaria.
- branch locale iniziale rinominato da `master` a `main`.
- flusso di rilascio definito come promozione tramite pull request da `staging`
  a `main`, senza push diretti ordinari su Production.
- variabili Supabase pubbliche di Staging limitate ai soli deployment Preview
  del branch `staging`.
- gli amministratori delle agenzie invitano esclusivamente collaboratori; ruolo
  dell’amministratore non modificabile dall’interfaccia;
- `PIATTAFORMA_PROPRIETARIO_EMAIL` configurata solo server-side e limitata al
  Preview del branch `staging`.

### Corretto

- copertura degli indici per le chiavi esterne composte segnalate dagli advisor.
- conflitto porte con un altro progetto Supabase locale senza interromperlo.
- verifica del profilo post-login resa univoca tramite UUID Auth.
- lockfile npm corretto eliminando una dipendenza facoltativa priva di versione,
  che impediva l'installazione pulita su Vercel.
- callback degli inviti separato dal recupero PKCE, così il nuovo utente viene
  portato alla scelta della password anche se nel browser esiste già una
  sessione diversa;
- query dashboard filtrate esplicitamente per l'agenzia verificata, in aggiunta
  alle policy RLS del database.

### Documentazione

- descritta prima dell'implementazione la fase database Supabase.
- registrati migration, verifiche locali e stato del collegamento Staging.
- documentati autenticazione, interfaccia, clienti e verifiche browser.
- documentati e verificati modifica, eliminazione e rinnovo delle polizze.
- documentato il completamento frontend e il nuovo sistema visivo.
- documentata e verificata la preferenza locale della modalità scura.

### Problemi aperti

- valutare l'attivazione della protezione Auth dalle password compromesse;
- collaudare un nuovo invito reale dopo il deployment della correzione Staging.

### Distribuzione Staging

- commit del pannello pubblicato sul branch `staging`;
- Preview Vercel completato in stato `READY` e alias stabile aggiornato;
- route pubblica e protezione anonima del pannello verificate via HTTP;
- `main`, Supabase Production e variabili Vercel Production invariati.
- commit `ffdee0f` con correzione inviti e isolamento dashboard pubblicato su
  `staging`;
- Preview Vercel della correzione completato in stato `READY`, alias stabile
  aggiornato e `/auth/invito` verificata con HTTP 200;
- nessuna pull request verso `main` e nessuna modifica a Supabase Production.
