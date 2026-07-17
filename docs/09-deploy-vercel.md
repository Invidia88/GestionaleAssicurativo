# Deploy Vercel

## Corrispondenza branch e ambienti

| Branch GitHub | Ambiente applicativo | Progetto Supabase |
| --- | --- | --- |
| `staging` | sviluppo integrato e collaudo | `gestionale-assicurativo-staging` (`ooqekupusuchabdyrgev`) |
| `main` | Production | `gestionale-assicurativo-production` (`iegoycbbdxojvfniuzjw`) |

Il branch non seleziona direttamente il database. La separazione viene resa
effettiva dalle variabili Vercel: i deployment del branch `staging` devono usare
URL, Publishable Key e Secret Key di Supabase Staging; Production deve usare
esclusivamente le credenziali del progetto Supabase Production.

## Progetto Vercel

- scope: `invidiaa88`;
- progetto: `gestionale-assicurativo`;
- framework: Next.js con comandi di build, installazione e output rilevati
  automaticamente;
- repository collegato: `Invidia88/GestionaleAssicurativo`;
- branch Production: `main`, ereditato dal branch predefinito GitHub;
- branch di collaudo: `staging`, distribuito come Preview.

Le variabili `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` di Staging sono limitate a
`Preview (staging)`. Anche `SUPABASE_SECRET_KEY` deve avere esattamente questo
ambito, deve essere marcata sensibile e deve essere inserita manualmente nella
dashboard Vercel: non va copiata in Production e non deve mai avere il prefisso
`NEXT_PUBLIC_`.

`NEXT_PUBLIC_SITE_URL` è facoltativa nei Preview. Se assente, l'app usa prima
`VERCEL_BRANCH_URL`, quindi `VERCEL_URL`; in Production verrà valorizzata con il
dominio ufficiale esatto. Gli URL corrispondenti devono essere presenti nella
allow-list Auth del relativo progetto Supabase.

## Flusso di promozione

1. partire da `staging` aggiornato;
2. sviluppare e pubblicare le modifiche su `staging`;
3. completare test automatici, verifica browser e collaudo con Supabase Staging;
4. aprire una pull request da `staging` verso `main`;
5. applicare separatamente a Supabase Production le migration già verificate,
   soltanto dopo backup e autorizzazione;
6. unire la pull request per avviare il deployment Production;
7. riallineare `staging` a `main` dopo il rilascio se il merge ha introdotto
   commit aggiuntivi.

Non si eseguono push diretti su `main` per fix o feature ordinarie. In futuro si
potranno aggiungere branch brevi `feature/*` o `fix/*` basati su `staging`, ma il
punto di integrazione resta sempre `staging`.
