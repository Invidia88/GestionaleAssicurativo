# Test

## Automatici database

- vincoli dei sei modelli;
- isolamento lettura e scrittura tra due agenzie;
- immutabilità di `agenzia_id`;
- permessi dei due ruoli;
- comportamento degli utenti inattivi e anonimi;
- eliminazioni consentite, bloccate e mantenimento storico contatti.
- un solo amministratore per agenzia e più collaboratori consentiti;
- bootstrap agenzia riservato al `service_role` e vietato ad anon e utenti
  autenticati.

## Verifiche applicazione

Eseguire lint, typecheck, test e build dopo ogni gruppo di modifiche.

## Ultimo risultato

- `supabase db reset --local`: superato;
- 49 test pgTAP locali: superati;
- database lint: nessun errore;
- advisor schema e prestazioni: nessun warning; resta l'avviso Auth sulla
  protezione dalle password compromesse;
- ESLint e TypeScript: superati;
- build Next.js: superata;
- seed Staging eseguito due volte senza duplicati;
- verifica remota seed: 2 agenzie, 4 utenti, 10 compagnie, 30 clienti, 40
  polizze e 16 contatti;
- 23 test unitari superati per callback inviti, recupero annuale, scadenze, URL, telefono,
  WhatsApp e validazioni di
  clienti, compagnie, polizze, contatti, impostazioni e inviti;
- login amministratore Staging e lettura RLS delle 20 polizze Aurora superati;
- pagina login verificata a 390 px senza overflow, overlay o errori browser.
- CRUD compagnia temporanea Staging superato e dati demo ripristinati a 5 righe.
- accesso con email reale e creazione/eliminazione polizza temporanea superati;
  conteggio finale Aurora invariato a 20 polizze.
- modifica e rinnovo atomico temporanei su Staging superati; vecchia polizza
  `rinnovata`, nuova polizza `attiva` e conteggio finale ancora pari a 20;
- pagine dettaglio, modifica, rinnovo e dialog eliminazione verificate nel
  browser; viewport 390 px senza overflow orizzontale o overlay di errore.
- ciclo Staging frontend completato e ripulito: modifica/eliminazione cliente,
  contatto, impostazioni e stato utente; contatti Aurora invariati a 8;
- pagine Contatti, Utenti, Impostazioni e dashboard modernizzata verificate su
  desktop e smartphone senza overflow o overlay.
- modalità scura attivata dalle Impostazioni e verificata dopo ricarica su
  desktop e a 390 px; preferenza locale, `color-scheme` e assenza di errori
  Next.js confermati.
- route `/piattaforma/agenzie` protetta: un visitatore anonimo viene reindirizzato
  al login senza overlay o errori console;
- lint remoto Staging senza errori e migration gestione agenzie presente nella
  cronologia. I test pgTAP hosted non partono perché l’estensione di test non è
  installata sul progetto; la suite identica è stata eseguita sul reset locale.
- pagina `Scaduti` verificata con l'amministratore Aurora: 3 polizze del tenant,
  nessun dato Tirreno, nessun overlay o overflow a 1280 e 390 px.

## Criteri del blocco polizze avanzato

- modifica consentita soltanto per una polizza del tenant autenticato;
- rinnovo atomico: vecchia polizza `rinnovata` e nuova polizza `attiva`;
- rinnovo rifiutato per polizze già chiuse o con scadenza non successiva;
- eliminazione della polizza con conservazione dei contatti storici;
- messaggi applicativi in italiano senza codici o dettagli Supabase.

## Criteri recupero scaduti

- entrano soltanto polizze `attive` con data passata;
- polizze `rinnovate` e `annullate` restano escluse;
- ricorrenza annuale calcolata correttamente, incluso il 29 febbraio;
- finestra `Da contattare` aperta esattamente 14 giorni prima;
- query, clienti e compagnie filtrati per il tenant autenticato;
- layout verificato su desktop e smartphone.

## Checklist manuale

- smartphone: moduli e dialog senza scorrimento orizzontale;
- tablet: griglie e navigazione leggibili;
- desktop: tabelle compatte e azioni accessibili da tastiera.
