# Operazioni eseguite

## 2026-07-17 11:46 CEST

### Obiettivo

Preparare la documentazione obbligatoria prima della migration Supabase.

### Operazioni eseguite

- analizzato il brief e lo stato del repository;
- verificata la configurazione Staging senza mostrare valori sensibili;
- definito schema, permessi, eliminazioni e percorso di deploy;
- creata la documentazione iniziale.

### File creati

- `docs/00-panoramica-progetto.md` fino a `docs/15-operazioni-eseguite.md`.

### File modificati

- `README.md`.

### Database

- migration prevista, non ancora creata;
- nessuna tabella remota modificata;
- policy documentate, non ancora applicate.

### Comandi eseguiti

```bash
docker info
npx supabase --version
```

### Verifiche

- configurazione ambiente Staging presente;
- Docker 29.2.1 disponibile;
- Production non modificata.

### Risultato

Documentazione preliminare pronta per l'implementazione database.

### Problemi aperti

- autenticazione Supabase CLI da completare prima del deploy Staging.

## 2026-07-17 12:05 CEST

### Obiettivo

Implementare e verificare localmente database, RLS, test e supporto eliminazioni.

### Operazioni eseguite

- generata la migration iniziale tramite Supabase CLI;
- create sei tabelle italiane con vincoli e relazioni tenant-safe;
- aggiunte funzioni private, trigger, grant e policy RLS;
- configurate porte locali dedicate senza fermare altri progetti;
- aggiunti 32 test pgTAP e ottimizzati gli indici indicati dagli advisor;
- aggiunti script demo Staging e dialog di conferma eliminazione;
- avviata l'autorizzazione CLI per Staging.

### File creati

- `supabase/migrations/20260717094750_schema_iniziale_multi_tenant.sql`;
- `supabase/tests/database/schema_e_rls.test.sql`;
- `supabase/seed.sql`;
- `scripts/crea-dati-demo-staging.mjs`;
- `src/components/conferma-eliminazione.tsx`;
- `src/lib/errori-database.ts`.

### File modificati

- `.env.example`, `.env.local`, `package.json`, `src/app/layout.tsx`;
- `supabase/config.toml`;
- documentazione database, RLS, UI, Supabase e test.

### Database

- migration creata e applicata da zero in locale;
- sei tabelle pubbliche create;
- RLS attiva su tutte le tabelle;
- nessuna modifica remota ancora eseguita.

### Comandi eseguiti

```bash
npx supabase migration new schema_iniziale_multi_tenant
npx supabase start
npx supabase db reset --local
npx supabase test db
npx supabase db lint --local
npx supabase db advisors --local
npm run lint
npm run typecheck
npm run build
```

### Verifiche

- 32 test database e RLS superati;
- lint e advisor database senza problemi;
- ESLint, TypeScript e build Next.js superati.

### Risultato

Implementazione locale completa e pronta per il deploy Staging.

### Problemi aperti

- CLI in attesa del codice monouso Supabase;
- secret key e password demo ancora da configurare prima del seed remoto.

## 2026-07-17 12:19 CEST

### Obiettivo

Applicare e verificare la migration esclusivamente su Supabase Staging.

### Operazioni eseguite

- autenticata Supabase CLI tramite flusso browser e portachiavi macOS;
- verificato il progetto collegato `ooqekupusuchabdyrgev`;
- eseguito il dry-run della sola migration prevista;
- applicata la migration a Staging senza seed;
- interrogati metadati, RLS, policy, grant e cronologia migration;
- eseguiti gli advisor remoti.

### File creati

- nessun nuovo file.

### File modificati

- documentazione database, RLS, Supabase, changelog e stato lavori.

### Database

- migration `20260717094750` registrata su Staging;
- sei tabelle pubbliche con RLS;
- 19 policy attive;
- zero grant applicativi per `anon`;
- Production non modificata.

### Comandi eseguiti

```bash
npx supabase login
npx supabase link --project-ref ooqekupusuchabdyrgev
npx supabase db push --linked --dry-run
npx supabase db push --linked --yes
npx supabase db query --linked
npx supabase db advisors --linked
```

### Verifiche

- migration remota registrata: sì;
- tabelle pubbliche attese: 6 su 6;
- tabelle con RLS: 6 su 6;
- advisor remoti: nessun problema.

### Risultato

Schema Staging applicato e verificato. Production è rimasta intatta.

### Problemi aperti

- dati demo non ancora creati perché `SUPABASE_SECRET_KEY` e `DEMO_PASSWORD`
  non sono configurate localmente;
- warning non bloccante della cache CLI `pg-delta` su certificato temporaneo.

## 2026-07-17 12:25 CEST

### Obiettivo

Creare e verificare i dati dimostrativi esclusivamente su Supabase Staging.

### Operazioni eseguite

- verificata la presenza dei segreti locali senza stamparne i valori;
- eseguito lo script server-side idempotente su Staging;
- ripetuto il seed per escludere duplicazioni;
- verificati i conteggi remoti per entrambe le agenzie;
- rieseguiti lint, typecheck, test database e build.

### File modificati

- README e documentazione database, autenticazione, Supabase, test, changelog e
  stato lavori.

### Database

- 2 agenzie demo;
- 4 utenti Auth e relativi profili;
- 10 compagnie, 30 clienti, 40 polizze e 16 contatti;
- Production non modificata.

### Comandi eseguiti

```bash
npm run seed:staging
npm run lint
npm run typecheck
npm test
npm run build
```

### Verifiche

- entrambe le esecuzioni del seed concluse con gli stessi conteggi;
- 32 test database e RLS superati;
- ESLint, TypeScript e build Next.js superati;
- `.env.local` escluso dal controllo versione.

### Risultato

Database Staging completo, popolato e verificato. Nessun segreto è stato
versionato e Production è rimasta intatta.

### Problemi aperti

- nessun problema bloccante;
- warning non bloccante della cache CLI `pg-delta` su certificato temporaneo.

## 2026-07-17 12:29 CEST

### Obiettivo

Avviare autenticazione applicativa, layout privato responsive e dashboard.

### Operazioni eseguite

- riletti il brief completo e lo stato del progetto;
- verificate le guide correnti Supabase SSR, password e redirect;
- verificate le convenzioni Next.js 16 per cookie, Proxy e autorizzazione;
- definito il perimetro dei file e dei controlli di sicurezza prima del codice.

### File creati

- previsti client Supabase SSR, pagine Auth, route di conferma, layout privato e
  dashboard.

### File modificati

- `docs/05-autenticazione.md`;
- `docs/06-interfaccia-utente.md`;
- `docs/14-stato-lavori.md`;
- `docs/15-operazioni-eseguite.md`.

### Database

- nessuna migration prevista;
- accesso ai dati tramite le policy RLS già presenti.

### Comandi eseguiti

```bash
rg --files
```

### Verifiche

- dipendenze SSR e versioni Next.js/React già compatibili;
- segreti disponibili soltanto lato server;
- Production non coinvolta.

### Risultato

Fase documentata e pronta per l'implementazione.

### Problemi aperti

- recupero password richiede URL consentiti nella configurazione Auth Staging;
- codice applicativo ancora da implementare e verificare.

## 2026-07-17 12:52 CEST

### Obiettivo

Implementare e verificare autenticazione, layout, dashboard e prima gestione
clienti.

### Operazioni eseguite

- creati client Supabase SSR, Proxy e controllo server-side del profilo attivo;
- implementati login, logout, richiesta e aggiornamento password con PKCE;
- creati sidebar desktop, menu mobile e voci condizionate dal ruolo;
- creata dashboard RLS con riepiloghi, stati calcolati e WhatsApp;
- implementati elenco, ricerca, inserimento rapido e dettaglio clienti;
- aggiunte funzioni pure per scadenze, telefoni, messaggi e link WhatsApp;
- corretto il controllo post-login vincolandolo all'UUID Auth;
- applicata la checklist React e tradotta l'etichetta accessibile del menu.

### File creati

- `src/lib/supabase/client.ts`, `server.ts`, `proxy.ts`;
- `src/lib/autenticazione.ts`, `scadenze.ts`, `validazioni.ts`;
- pagine e azioni in `src/app/(pubblico)` e `src/app/(app)`;
- componenti di autenticazione, navigazione, dashboard e clienti;
- `src/lib/scadenze.test.ts`.

### File modificati

- `package.json`, `tsconfig.json`, `src/app/page.tsx`;
- documentazione autenticazione, interfaccia, test, roadmap, changelog e stato.

### Database

- nessuna migration;
- accesso e creazione clienti affidati alle policy RLS esistenti;
- login demo Aurora verificato con 20 polizze visibili nel tenant corretto.

### Comandi eseguiti

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

### Verifiche

- errore login non valido tradotto in italiano;
- accesso Auth Staging e lettura RLS riusciti;
- pagina login a 390 px senza overflow, overlay o errori browser;
- 5 test unitari e 32 test database/RLS superati;
- ESLint, TypeScript e build Next.js superati.

### Risultato

Fasi autenticazione e layout completate; dashboard e gestione clienti iniziale
operative e collegate a Staging.

### Problemi aperti

- autorizzare gli URL dell'app nelle impostazioni Auth per collaudare l'email di
  recupero password end-to-end;
- gestione compagnie e polizze ancora da implementare.

## 2026-07-17 12:59 CEST

### Obiettivo

Implementare e verificare la gestione delle compagnie assicurative.

### Operazioni eseguite

- aggiunti schema Zod e Server Action per creare compagnie;
- implementati elenco responsive, apertura sito e stato attivo;
- collegato il dialog di conferma all'eliminazione protetta da RLS;
- aggiunto il test unitario della validazione compagnia;
- eseguito un ciclo CRUD temporaneo su Staging.

### File creati

- `src/app/(app)/compagnie/azioni.ts`;
- `src/components/modulo-compagnia.tsx`;
- `src/components/azioni-compagnia.tsx`.

### File modificati

- `src/app/(app)/compagnie/page.tsx`;
- `src/lib/validazioni.ts`, `src/lib/scadenze.test.ts`;
- documentazione interfaccia, test, changelog e stato lavori.

### Database

- nessuna migration;
- test RLS: compagnia temporanea creata, disattivata ed eliminata;
- cinque compagnie demo Aurora presenti al termine del test.

### Comandi eseguiti

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Verifiche

- test CRUD Staging superato;
- test unitari, database, lint, typecheck e build superati.

### Risultato

Gestione compagnie pronta per essere usata dal prossimo modulo polizze.

### Problemi aperti

- gestione polizze ancora da implementare;
- recupero email end-to-end richiede un account con indirizzo reale.

## 2026-07-17 13:07 CEST

### Obiettivo

Abilitare il collaudo email Auth e implementare il nucleo gestione polizze.

### Operazioni eseguite

- resa configurabile localmente l'email dell'amministratore demo Aurora;
- aggiornata l'identità Auth e richiesta l'email di recupero password;
- implementati elenco, ricerca, filtri, creazione rapida e dettaglio polizza;
- aggiunti campi facoltativi richiudibili e messaggio WhatsApp;
- aggiunto test unitario della validazione polizza;
- eseguito test CRUD temporaneo su Staging.

### File creati

- `src/app/(app)/polizze/azioni.ts`;
- `src/components/modulo-polizza.tsx`.

### File modificati

- `.env.example`, `.env.local`, script seed;
- pagine lista, nuova e dettaglio polizze;
- validazioni, test e documentazione.

### Database

- nessuna migration;
- identità Auth Aurora aggiornata senza creare profili aggiuntivi;
- polizza temporanea creata ed eliminata tramite RLS;
- conteggio finale Aurora: 20 polizze.

### Comandi eseguiti

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Verifiche

- accesso riuscito con la nuova email;
- richiesta recupero password accettata da Supabase;
- CRUD polizza Staging e validazioni superati;
- lint, typecheck, test e build superati.

### Risultato

Recupero email pronto al click dell'utente e nucleo polizze operativo.

### Problemi aperti

- modifica, eliminazione e rinnovo polizze da completare;
- confermare la ricezione e il click dell'email di recupero.

## 2026-07-17 13:32 CEST

### Obiettivo

Completare modifica, eliminazione protetta e rinnovo delle polizze.

### Operazioni eseguite

- documentato il comportamento prima dell'implementazione;
- aggiunta una funzione SQL atomica `security invoker` per il rinnovo;
- implementati modulo precompilato, pagina rinnovo e AlertDialog eliminazione;
- estesi test unitari e pgTAP;
- applicata esclusivamente a Staging la migration prevista;
- eseguiti ciclo remoto temporaneo e verifica browser desktop/mobile.

### File creati

- `supabase/migrations/20260717111738_rinnovo_polizze_atomico.sql`;
- `src/components/azioni-polizza.tsx`;
- `src/components/modulo-rinnovo-polizza.tsx`;
- pagine `/polizze/[id]/modifica` e `/polizze/[id]/rinnova`.

### Database

- migration applicata a Staging, Production non modificata;
- reset locale e 39 test pgTAP superati;
- modifica e rinnovo temporanei su Staging ripuliti correttamente;
- conteggio Aurora prima e dopo la prova: 20 polizze.

### Verifiche

- lint SQL senza errori;
- 8 test unitari e 39 test database superati;
- lint, typecheck e build Next.js superati;
- dettaglio, modifica, rinnovo e dialog verificati nel browser;
- viewport smartphone 390 px senza overflow o overlay di errore.

### Problemi aperti

- warning non bloccante della cache sperimentale `pg-delta`;
- protezione Supabase Auth dalle password compromesse disattivata.

## 2026-07-17 13:58 CEST

### Obiettivo

Completare il frontend e modernizzare la grafica dell'area privata.

### Operazioni eseguite

- aggiunte modifica ed eliminazione cliente con conferma;
- implementati registrazione e storico filtrabile dei contatti;
- implementati inviti, ruoli e attivazione utenti amministrativi;
- implementate le impostazioni essenziali dell'agenzia;
- aggiornati tema, sidebar, header, dashboard e superfici responsive;
- aggiunte validazioni e test applicativi dedicati.

### Sicurezza

- Secret Key usata soltanto in moduli `server-only` per Auth amministrativa;
- Server Action autenticate e autorizzate nuovamente ad ogni chiamata;
- nessun dato di agenzia o utente accettato dal browser come fonte affidabile;
- contatti append-only invariati.

### Verifiche

- ciclo temporaneo Staging su clienti, contatti, impostazioni e utenti superato;
- record temporanei rimossi e contatti Aurora invariati da 8 a 8;
- nessuna email d'invito inviata durante il collaudo;
- dashboard e nuove pagine verificate nel browser desktop e a 390 px;
- nessun overflow orizzontale o overlay di errore.

### Risultato

Frontend previsto dal brief completato. Il prossimo blocco è il deploy Staging
su Vercel.

## 2026-07-17 14:15 CEST

### Obiettivo

Aggiungere la modalità scura nelle Impostazioni prima del deploy Vercel.

### Operazioni eseguite

- documentato il comportamento e il perimetro locale della preferenza;
- aggiunta la sezione `Aspetto` con interruttore accessibile;
- introdotti provider tema, persistenza in `localStorage` e inizializzazione
  `beforeInteractive` per evitare il lampeggio del tema chiaro;
- definita una palette blu-notte coerente con il tema chiaro;
- collegato anche il sistema di notifiche al tema corrente;
- rimossa la dipendenza `next-themes` dopo aver rilevato due avvisi di rendering
  nel collaudo Next.js 16.2.

### Verifiche

- lint, typecheck e 11 test unitari superati;
- build di produzione Next.js superata;
- attivazione e persistenza dopo ricarica confermate nel browser;
- `color-scheme: dark`, assenza di overlay e assenza di overflow confermati;
- resa desktop e smartphone a 390 × 844 px verificata visivamente;
- secondo collaudo pulito senza il badge dei due avvisi iniziali.

### Database e ambienti

- nessuna modifica a Supabase;
- nessun deploy eseguito;
- Production invariata.

### Risultato

Modalità scura pronta. Il prossimo blocco resta la pubblicazione e il collaudo
Staging su Vercel.

## 2026-07-17 14:24 CEST

### Obiettivo

Correggere il nome ufficiale del prodotto e predisporre il primo versionamento
su GitHub.

### Operazioni eseguite

- sostituito il marchio precedente con `GestionaleAssicurativo` in interfaccia,
  metadata, README e documentazione;
- aggiornati package npm, ID del progetto Supabase locale, commento della
  migration e chiavi locali del tema;
- verificato tramite Supabase CLI che i progetti remoti sono già denominati
  `gestionale-assicurativo-staging` e `gestionale-assicurativo-production`;
- verificato che entrambi i progetti remoti siano attivi e che Staging resti
  l'unico progetto collegato al repository;
- collegato `origin` a `Invidia88/GestionaleAssicurativo` e rinominato il branch
  locale iniziale in `main`;
- escluso dal versionamento il README duplicato generato dallo scaffold,
  conservandolo soltanto in locale.

### Sicurezza e verifiche

- `.env.local`, `.next`, `node_modules` e file temporanei confermati ignorati;
- nessun PAT, secret key, token GitHub o email reale trovato nei file candidati
  al commit;
- lint, typecheck, 11 test unitari e build Next.js superati;
- nessuna migration o modifica ai dati remoti Supabase.

### Risultato

Commit iniziale creato e codice pubblicato sul branch `main` del repository
GitHub ufficiale. Non è stata aperta una pull request perché il repository era
vuoto e non esisteva ancora un branch base con una storia precedente.

## 2026-07-17 14:31 CEST

### Obiettivo

Creare un flusso GitHub a due branch coerente con gli ambienti Supabase.

### Operazioni eseguite

- definito `main` come branch Production permanente;
- creato `staging` come branch di sviluppo integrato e collaudo;
- documentata la corrispondenza con i ref Supabase Staging e Production;
- definita la promozione ordinaria tramite pull request `staging → main`;
- mantenuta separata e manuale l'applicazione delle migration Production;
- lasciato `staging` come branch locale attivo per le prossime modifiche.

### Verifiche

- entrambi i branch GitHub puntano allo stesso commit di configurazione iniziale;
- `main` resta il branch predefinito del repository;
- `staging` traccia `origin/staging`;
- nessuna modifica a database, Auth o dati Supabase.

### Risultato

Flusso di sviluppo pronto: le prossime fix e feature partono da `staging` e
raggiungono `main` soltanto dopo collaudo e pull request.

## 2026-07-17 15:00 CEST

### Obiettivo

Configurare Vercel per il branch `staging` e ottenere il primo Preview Next.js.

### Operazioni eseguite

- autenticata la CLI Vercel con l'account `invidia88`;
- rinominato il progetto esistente da `gestionale-assicurazioni` a
  `gestionale-assicurativo`, preservandone la cronologia;
- sostituito il preset Vite con Next.js e ripristinato il rilevamento automatico;
- sostituito il vecchio collegamento Git con
  `Invidia88/GestionaleAssicurativo`;
- caricate URL e Publishable Key Supabase soltanto in `Preview (staging)`;
- eseguito un primo deploy, individuato l'errore `npm Invalid Version` e
  ricondotto a una voce facoltativa incompleta nel lockfile;
- riparato e ricostruito canonicamente `package-lock.json`;
- completato con successo un deployment Preview Vercel;
- unificata la scelta dell'URL pubblico per recupero password e inviti.

### Sicurezza

- nessun valore segreto mostrato nei log o versionato;
- trasferimento automatico della Secret Key bloccato e sostituito con inserimento
  manuale nella dashboard Vercel;
- nessuna variabile Production configurata e nessun deploy di `main` eseguito;
- Supabase Production non modificato.

### Verifiche

- zero voci del lockfile prive di versione;
- simulazione `npm ci --ignore-scripts --dry-run` superata;
- deployment Preview in stato `READY`;
- 15 test unitari, lint, typecheck e build Next.js superati.

### Problemi aperti

- completare il deployment automatico generato dal push GitHub su `staging`;
- aggiungere l'alias Preview alla allow-list Auth Supabase Staging;
- inserire manualmente la Secret Key Staging in Vercel per abilitare gli inviti.
