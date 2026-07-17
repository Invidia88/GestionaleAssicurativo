# Autenticazione

Supabase Auth gestisce email, password, recupero password e sessioni. Non esiste
registrazione pubblica.

## Primo amministratore

1. creare o invitare l'utente da Supabase Dashboard;
2. copiare il suo UUID senza condividere password;
3. eseguire la transazione documentata per creare agenzia e profilo
   `amministratore`;
4. verificare l'accesso e le policy.

Gli utenti successivi saranno invitati da una Server Action riservata agli
amministratori. La secret key resterà esclusivamente lato server.

## Utenti demo Staging

- `admin.aurora@demo.example`;
- `collaboratore.aurora@demo.example`;
- `admin.tirreno@demo.example`;
- `collaboratore.tirreno@demo.example`.

La password comune è letta da `DEMO_PASSWORD` in `.env.local` e non è
documentata né versionata.

## Accesso applicativo implementato

L'autenticazione usa sessioni Supabase SSR memorizzate in cookie e comprende:

- `/login` con email e password, senza collegamento di registrazione;
- `/recupera-password` e `/aggiorna-password` per il recupero guidato;
- `/auth/conferma` per completare il flusso PKCE inviato via email;
- refresh della sessione tramite `src/proxy.ts`;
- controllo autorevole con `getClaims()` e verifica del profilo attivo nel
  layout privato;
- logout tramite Server Action e redirect al login.

I file principali sono `src/lib/supabase/client.ts`, `server.ts` e `proxy.ts`,
`src/lib/autenticazione.ts`, le pagine pubbliche di autenticazione, il route
handler di conferma e il layout privato. Il proxy costituisce un controllo
rapido, mentre ogni pagina privata verifica nuovamente utente e profilo.

Durante la verifica Staging la query successiva al login è stata vincolata
esplicitamente all'UUID restituito da Auth. Questo evita ambiguità quando un
amministratore, correttamente, può leggere più profili della propria agenzia.

Il 17 luglio 2026 sono stati verificati: redirect di una pagina privata al
login, errore italiano per credenziali non valide, accesso reale dell'account
demo amministratore e lettura RLS delle sole 20 polizze dell'Agenzia Aurora.
Il recupero password è implementato; per l'invio effettivo occorre autorizzare
gli URL dell'app nella configurazione Auth Staging.

Per il collaudo email, l'amministratore Aurora può usare temporaneamente
`DEMO_ADMIN_EMAIL` definita soltanto in `.env.local`. Il valore personale non è
riportato nella documentazione né nei dati demo versionati.

Il 17 luglio 2026 l'email temporanea è stata associata all'amministratore Aurora
e Supabase ha accettato l'invio del recupero verso il redirect locale.

## Inviti dall'applicazione

La pagina `/utenti` è disponibile soltanto agli amministratori. L'invito crea
l'identità Auth e il profilo `utenti` nella stessa agenzia; se la creazione del
profilo fallisce, l'identità appena invitata viene rimossa.

`SUPABASE_SECRET_KEY` è letta esclusivamente da un modulo `server-only` e non
viene mai restituita al browser. L'URL dell'invito usa
`NEXT_PUBLIC_SITE_URL`: in locale vale `http://localhost:3000`, mentre su Vercel
dovrà contenere il dominio dello Staging.
