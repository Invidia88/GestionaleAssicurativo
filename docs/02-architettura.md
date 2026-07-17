# Architettura

L'applicazione usa Next.js App Router senza backend separato. I Server Component
leggono i dati e le Server Action eseguono le modifiche con la sessione Supabase
dell'utente. Le policy RLS rimangono il confine di sicurezza principale.

Il client pubblico usa URL e publishable key. Una seconda istanza Supabase con
secret key sarà creata solo nel server per inviti utenti e seed controllati.

Gli ambienti sono separati: sviluppo e Preview usano Staging; Production usa un
progetto Supabase distinto.
