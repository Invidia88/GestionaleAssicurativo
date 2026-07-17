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

## In corso

- nessuna attività in corso.

## Da fare

- configurazione progetto e variabili su Vercel;
- deploy e collaudo dell'ambiente Staging Vercel.

## Problemi aperti

- nessun problema bloccante;
- resta un warning non bloccante della cache sperimentale CLI `pg-delta`.
- l'advisor Auth segnala che la protezione dalle password compromesse è
  disattivata.

## Prossima attività

Configurare e distribuire l'applicazione Staging su Vercel.
