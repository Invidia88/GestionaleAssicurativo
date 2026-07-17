# Interfaccia utente

L'interfaccia usa etichette italiane, card su smartphone e tabelle compatte su
desktop. UUID e `agenzia_id` non compaiono mai nei moduli.

## Pannello proprietario

La pagina `/piattaforma/agenzie` è separata dal gestionale della singola
agenzia. Mostra l'elenco dei tenant con stato e amministratore, un modulo breve
per creare agenzia e invito iniziale e una conferma esplicita per attivare o
disattivare un'agenzia. Le agenzie non vengono eliminate dall'interfaccia.

Il pannello è visibile nella navigazione soltanto all'email del proprietario e
resta protetto server-side anche conoscendone l'indirizzo.

Ogni eliminazione di cliente, compagnia o polizza usa un `AlertDialog` con nome
del record, conseguenze e pulsanti `Annulla` e `Elimina`. Un vincolo di relazione
viene tradotto in un messaggio comprensibile che indica cosa gestire prima.

Il componente riutilizzabile `ConfermaEliminazione` implementa questo contratto,
mantiene aperto il dialog durante l'operazione e mostra l'esito tramite toast.

## Struttura privata implementata

Il layout applicativo sarà mobile-first e conterrà una sidebar desktop, un menu
a scomparsa su smartphone, intestazione con nome agenzia e utente e logout. Le
voci `Utenti` e `Impostazioni` saranno mostrate soltanto agli amministratori.

La dashboard usa quattro riepiloghi essenziali e una lista ordinata per
scadenza. Su desktop verrà mostrata una tabella compatta; su smartphone gli
stessi dati diventeranno card senza scorrimento orizzontale. In questa fase le
azioni non ancora implementate porteranno alle rispettive pagine successive,
senza simulare salvataggi. La pagina di accesso è stata verificata a 390 px
senza overflow orizzontale.

## Gestione clienti implementata

La sezione clienti offre una ricerca unica per nome, cognome o telefono, una
tabella compatta su desktop e card su smartphone. Il modulo rapido mostrerà
soltanto nome, cognome, telefono, email e note; `agenzia_id` sarà ricavato dal
profilo server-side e non verrà mai inviato dal browser. Dopo il salvataggio il
dettaglio offrirà `Aggiungi polizza` e `Torna ai clienti`.

I file principali sono lo schema Zod condiviso, una Server Action autorizzata, il
modulo React Hook Form e le pagine `/clienti`, `/clienti/nuovo` e
`/clienti/[id]`.

La creazione normalizza il telefono, valida nuovamente tutti i dati sul server e
ricava l'agenzia dal profilo autenticato. Il dettaglio mostra contatti, note e
polizze senza esporre UUID tecnici nei moduli.

## Gestione compagnie implementata

La pagina compagnie mostra nome, sito e stato, con card su smartphone. Un
modulo breve consente di aggiungere nome e sito facoltativo; attivazione ed
eliminazione sono Server Action protette da RLS. L'eliminazione usa il
dialog di conferma esistente e resterà bloccata quando la compagnia è collegata
a polizze.

Il test CRUD Staging ha verificato creazione, disattivazione ed eliminazione di
una compagnia temporanea, lasciando invariati i cinque record demo del tenant.

## Gestione polizze

Le pagine provvisorie sono state sostituite con elenco filtrabile,
inserimento rapido e dettaglio. Il modulo mostra subito cliente, compagnia, tipo
e scadenza; numero polizza, targa, premio e note restano nella sezione
richiudibile `Altri dettagli`. `agenzia_id` viene sempre ricavato dal profilo
server-side e i collegamenti cross-tenant restano bloccati dalle chiavi composte.

Il dettaglio mostra dati essenziali, stato calcolato e messaggio WhatsApp. Le
azioni avanzate seguono queste regole:

- `Modifica` riapre lo stesso modulo con i valori correnti e salva soltanto la
  polizza visibile tramite RLS;
- `Rinnova` richiede nuova scadenza, numero, premio e note. Il database marca la
  polizza precedente come `rinnovata` e crea la nuova polizza `attiva` nella
  stessa transazione;
- `Elimina` usa `AlertDialog`. Gli eventuali contatti restano nello storico con
  il collegamento alla polizza rimosso.

Il rinnovo è disponibile soltanto per una polizza `attiva` e la nuova scadenza
deve essere successiva a quella precedente. Il test Staging iniziale ha creato
e rimosso una polizza temporanea, lasciando le 20 polizze demo originali.

## Recupero clienti scaduti

La pagina `/scaduti` raccoglie le polizze con stato `attiva` e data già
trascorsa. Una polizza rinnovata tramite il flusso applicativo viene marcata
`rinnovata` e scompare automaticamente dalla lista, senza aggiungere campi o
tabelle al database.

Per ogni polizza viene calcolata la prima ricorrenza annuale futura della vecchia
scadenza. Nei 14 giorni precedenti la ricorrenza il cliente viene evidenziato
come `Da contattare`; gli altri restano visibili e ordinati per priorità. La
pagina offre ricerca, filtro, collegamenti a cliente e polizza e un messaggio
WhatsApp dedicato alla proposta di un nuovo preventivo.

La query usa la sessione dell'utente, le policy RLS e un filtro esplicito per
l'agenzia verificata. Su smartphone la tabella diventa una serie di card.

## Completamento frontend

Il blocco finale completa le schermate previste dal brief:

- modifica ed eliminazione protetta dei clienti;
- registrazione del contatto dalla polizza e storico filtrabile;
- invito di collaboratori e attivazione degli utenti per gli amministratori;
- impostazioni essenziali dell'agenzia e del messaggio WhatsApp.

Gli inviti utenti usano la Secret Key soltanto server-side. Tutte le altre
mutazioni continuano a usare la sessione dell'utente e le policy RLS.

## Direzione grafica

L'area privata adotta una grafica più moderna e professionale: accento blu
profondo, sfondo neutro, sidebar più leggibile, card con bordi leggeri, titoli
con gerarchia chiara e azioni primarie immediatamente visibili. Non vengono
usati gradienti invadenti, ombre pesanti o colori accesi.

Su smartphone le tabelle diventano card, i pulsanti principali restano grandi
e la navigazione usa un menu a scomparsa. Nessuna schermata applicativa deve
richiedere scorrimento orizzontale.

## Modalità scura

La pagina Impostazioni include una sezione `Aspetto` con un interruttore per la
modalità scura. La preferenza è personale e locale al browser: viene applicata
subito a tutta l'applicazione e ricordata sul dispositivo senza aggiungere campi
al database o modificare le impostazioni condivise dell'agenzia.

Il tema iniziale resta chiaro. Il tema scuro usa le stesse gerarchie e lo stesso
accento blu dell'interfaccia chiara, con superfici blu-notte, contrasto leggibile
e componenti basati esclusivamente sui token del design system.
