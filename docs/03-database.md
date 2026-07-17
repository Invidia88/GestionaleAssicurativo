# Database

## Schema previsto

Il database pubblico contiene soltanto `agenzie`, `utenti`, `clienti`,
`compagnie`, `polizze` e `contatti`. Tabelle e colonne usano nomi italiani.

- chiavi primarie UUID;
- `utenti.id` collegato a `auth.users.id`;
- ogni record operativo contiene `agenzia_id`;
- relazioni composte includono `agenzia_id` per impedire collegamenti tra tenant;
- scadenze in `date`, eventi e timestamp in `timestamptz`;
- valori di ruolo, stato, tipo contatto ed esito protetti da vincoli `check`.

## Eliminazioni

Clienti e compagnie con record collegati non possono essere eliminati. Una
polizza può essere eliminata mantenendo i contatti storici con `polizza_id` nullo.
Agenzie e utenti vengono disattivati.

## Implementazione verificata

- migration `20260717094750_schema_iniziale_multi_tenant.sql`;
- migration `20260717111738_rinnovo_polizze_atomico.sql`;
- trigger per `aggiornato_il` e immutabilità di `agenzia_id`;
- chiavi composte tenant-safe e indici di copertura;
- reset locale da database vuoto completato con successo.

Le migration sono state applicate a Staging il 17 luglio 2026. La seconda
aggiunge `rinnova_polizza`, funzione transazionale `security invoker` che crea
la nuova polizza attiva e archivia la precedente come rinnovata. Restano
esattamente sei tabelle pubbliche.

## Dati demo Staging

Il seed idempotente ha creato due agenzie. Ciascuna contiene 2 utenti, 5
compagnie, 15 clienti, 20 polizze e 8 contatti. La seconda esecuzione ha
confermato che i conteggi restano invariati. Nessun dato demo è stato inserito
in Production.
