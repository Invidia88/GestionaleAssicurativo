# Configurazione Supabase

## Progetti

- Staging: `ooqekupusuchabdyrgev`, West EU (Ireland);
- Production: `iegoycbbdxojvfniuzjw`.

## Collegamento CLI Staging

```bash
npx supabase login
npx supabase link --project-ref ooqekupusuchabdyrgev
npx supabase db push --dry-run
npx supabase db push
```

La password database viene richiesta dalla CLI e non deve essere inserita nei
file versionati. Production non viene collegata durante lo sviluppo ordinario.

La CLI è collegata esclusivamente a Staging. Il dry-run ha mostrato una sola
migration e il push del 17 luglio 2026 l'ha applicata con successo.

## Variabili

`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sono
pubbliche. `SUPABASE_SECRET_KEY` è server-only.

La secret key deve essere recuperata dal progetto Staging tramite `Connect` o
`Project Settings > API Keys` e inserita solo in `.env.local`. È richiesta per
il seed demo e per le future operazioni Auth amministrative.

I segreti Staging sono configurati soltanto in `.env.local`. Il seed è stato
eseguito due volte con successo: la seconda esecuzione ha confermato
l'idempotenza e i conteggi attesi. Nessun valore sensibile è riportato nella
documentazione.

## Porte locali dedicate

Per non interferire con altri progetti Supabase, questo repository usa l'intervallo
`55320–55329`, Studio `55323` e inspector `8183`.
