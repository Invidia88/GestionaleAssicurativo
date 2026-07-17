# Stato lavori

## Completato

- scaffold Next.js, Tailwind e shadcn/ui;
- configurazione pubblica Supabase Staging;
- documentazione iniziale e specifica database;
- migration multi-tenant completa;
- 39 test RLS, lint SQL, typecheck e build superati;
- script demo Staging e dialog eliminazione.
- migration applicata a Staging con sei tabelle, 19 policy e advisor puliti.
- segreti locali configurati e seed Staging verificato con 2 agenzie, 4 utenti,
  10 compagnie, 30 clienti, 40 polizze e 16 contatti.
- login, logout, recupero password e protezione delle pagine;
- sidebar desktop, menu mobile e autorizzazione delle voci amministrative;
- dashboard collegata ai dati RLS con azione WhatsApp;
- elenco, ricerca, inserimento rapido e dettaglio clienti;
- 6 test unitari, lint, typecheck, test database e build superati.
- gestione compagnie completa e test CRUD Staging superato.
- email reale temporanea associata e recupero password inviato;
- elenco, filtri, inserimento rapido e dettaglio polizze;
- 8 test unitari e test CRUD polizza Staging superati;
- modifica, eliminazione protetta e rinnovo atomico delle polizze;
- test remoto avanzato e verifica browser desktop/mobile superati.
- modifica ed eliminazione clienti, contatti, utenti e impostazioni completati;
- grafica dell'area privata modernizzata e verificata a 390 px;
- 11 test unitari e ciclo frontend Staging con pulizia superati.
- modalità scura persistente aggiunta alle Impostazioni e verificata su desktop
  e smartphone senza errori di rendering.
- progetto rinominato ufficialmente in `GestionaleAssicurativo`;
- repository GitHub ufficiale configurato con branch iniziale `main`.
- codice pubblicato sul branch `main` di
  `Invidia88/GestionaleAssicurativo` dopo controllo dei file versionati.
- branch remoto `staging` creato dallo stesso commit di `main` e configurato
  come branch locale di lavoro.
- Preview Vercel Staging attiva e Secret Key configurata con ambito Preview.
- pannello proprietario e creazione atomica delle agenzie completati;
- vincolo di un solo amministratore applicato a Supabase Staging;
- email proprietario configurata su locale e Vercel Preview del branch
  `staging`;
- 47 test database, 16 test unitari, lint, typecheck e build superati.
- commit `4ba3124` pubblicato su `staging` e Preview Vercel in stato `READY`;
- alias gratuito stabile aggiornato al deployment del pannello proprietario;
- route login verificata con HTTP 200 e pannello anonimo con redirect HTTP 307
  al login.

## In corso

- collaudo autenticato della creazione di una nuova agenzia di prova.

## Da fare

- configurazione delle variabili Production prima del primo rilascio su `main`;
- primo deploy Production, solo dopo promozione esplicita e migration verificata.

## Problemi aperti

- nessun problema bloccante;
- resta un warning non bloccante della cache sperimentale CLI `pg-delta`.
- l'advisor Auth segnala che la protezione dalle password compromesse è
  disattivata.
- i test pgTAP remoti richiederebbero l’estensione di test sul progetto hosted;
  la suite completa è verificata sul database locale ricreato da zero.

## Prossima attività

Accedere allo Staging con l’account proprietario e collaudare la creazione di
una nuova agenzia reale o di prova, senza modificare Production.
