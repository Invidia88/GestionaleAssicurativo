# Deploy Vercel

Un singolo progetto Vercel usa variabili differenti:

- Development e Preview: Supabase Staging;
- Production: Supabase Production.

Le variabili sono configurate nel dashboard Vercel e ogni modifica richiede un
nuovo deployment. Prima del deploy Production si applicano le migration in una
fase distinta, dopo backup e verifica Staging.
