# Architettura

L'applicazione usa Next.js App Router senza backend separato. I Server Component
leggono i dati e le Server Action eseguono le modifiche con la sessione Supabase
dell'utente. Le policy RLS rimangono il confine di sicurezza principale.

Il client pubblico usa URL e publishable key. Una seconda istanza Supabase con
secret key sarà creata solo nel server per inviti utenti e seed controllati.

## Gestione piattaforma

La gestione delle agenzie clienti vive nello stesso database multi-tenant e non
crea nuove organizzazioni o nuovi progetti Supabase. Una route separata
`/piattaforma/agenzie` costituisce il pannello del proprietario del software:
l'identità autorizzata è configurata tramite una variabile esclusivamente
server-side e viene verificata nuovamente in ogni pagina e Server Action.

Il pannello usa la Secret Key soltanto sul server per invitare il primo
amministratore e per creare il relativo tenant. Il browser non riceve mai la
chiave, gli UUID tecnici o un campo `agenzia_id`.

Gli ambienti sono separati: sviluppo e Preview usano Staging; Production usa un
progetto Supabase distinto.
