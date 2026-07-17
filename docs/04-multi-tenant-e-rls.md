# Multi-tenant e Row Level Security

## Regola fondamentale

Ogni accesso deve soddisfare `agenzia_id = agenzia_utente_corrente()`. Il filtro
nel frontend non è considerato una protezione.

## Funzioni private

Lo schema non esposto `privato` conterrà:

- `agenzia_utente_corrente()`;
- `ruolo_utente_corrente()`.

Le funzioni leggono esclusivamente `auth.uid()`, restituiscono `null` per utenti
inattivi, usano `security definer` con `search_path` vuoto e sono eseguibili solo
dal ruolo `authenticated`.

## Matrice permessi

| Risorsa | Amministratore | Collaboratore |
| --- | --- | --- |
| Agenzia | lettura e modifica | sola lettura |
| Utenti | lettura e gestione | sola lettura per nomi operatore |
| Clienti, compagnie, polizze | CRUD nel tenant | CRUD nel tenant |
| Contatti | lettura e inserimento | lettura e inserimento |

Anonimi, utenti inattivi e utenti di altre agenzie non ricevono dati.

## Rinnovo polizza

La funzione pubblica `rinnova_polizza` usa `security invoker`, `search_path`
vuoto e oggetti qualificati. Il ruolo `anon` non può eseguirla; per gli utenti
autenticati continuano a valere grant, RLS e chiavi composte del chiamante.

## Verifica

Le policy e il rinnovo sono coperti da test pgTAP. I test simulano ruoli JWT reali,
inserimenti cross-tenant, modifica di `agenzia_id`, permessi dei collaboratori,
gestione amministratore ed eliminazioni con vincoli.

La dashboard usa il client Supabase della sessione corrente. Ogni lettura resta
protetta dalle policy RLS e include anche un filtro esplicito con l'`agenzia_id`
del profilo verificato. La suite controlla separatamente che l'amministratore
dell'Agenzia B veda una sola polizza e nessuna polizza dell'Agenzia A.

Su Staging risultano sei tabelle con RLS, 19 policy e nessun grant assegnato al
ruolo `anon`. Gli advisor non segnalano problemi allo schema; resta un avviso
Auth globale perché la protezione dalle password compromesse è disattivata.
