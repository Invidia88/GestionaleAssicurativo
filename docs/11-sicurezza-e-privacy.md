# Sicurezza e privacy

- RLS abilitata su ogni tabella pubblica;
- nessun affidamento a `user_metadata` per autorizzazione;
- secret key vietata nel browser e nelle variabili `NEXT_PUBLIC_*`;
- funzioni `security definer` soltanto nello schema `privato`;
- grant Data API espliciti e minimi;
- messaggi tecnici e dettagli Supabase non mostrati all'utente;
- dati demo esclusivamente fittizi e vietati in Production.

Prima dell'uso reale vanno definite conservazione dati, backup, informativa
privacy e responsabilità GDPR dell'agenzia.
