# GestionaleAssicurativo

Gestionale web multi-tenant, semplice e mobile-first, per aiutare le agenzie
assicurative a registrare clienti e polizze, controllare le scadenze e annotare i
contatti effettuati.

Repository ufficiale: [Invidia88/GestionaleAssicurativo](https://github.com/Invidia88/GestionaleAssicurativo).

## Stack

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth,
PostgreSQL, Row Level Security, React Hook Form, Zod e date-fns.

## Struttura essenziale

- `src/`: applicazione Next.js;
- `supabase/`: configurazione, migration e test database;
- `scripts/`: operazioni server-side riservate, come i dati demo;
- `docs/`: requisiti, architettura, sicurezza, test e diario attività.

## Requisiti

- Node.js 22+ e npm;
- Docker Desktop per Supabase locale;
- account Supabase e Vercel.

## Configurazione ambiente

1. Copiare `.env.example` in `.env.local`.
2. Usare esclusivamente URL e publishable key di Staging in locale.
3. Non inserire mai secret key in variabili `NEXT_PUBLIC_*`.
4. Impostare `PIATTAFORMA_PROPRIETARIO_EMAIL` con l’unica email autorizzata a
   creare e disattivare le agenzie clienti.

## Installazione e avvio

```bash
npm install
npm run dev
```

Applicazione: <http://localhost:3000>.

## Supabase, migration e seed

```bash
npx supabase start
npx supabase db reset
npx supabase test db
```

I dati dimostrativi remoti sono ammessi soltanto su Staging e vengono creati da
uno script server-side. Le password non sono salvate nel repository.

| Ambiente | Project reference | Utilizzo |
| --- | --- | --- |
| Staging | `ooqekupusuchabdyrgev` | sviluppo e Vercel Preview |
| Production | `iegoycbbdxojvfniuzjw` | Vercel Production |

## Verifiche

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deploy

Le migration vengono applicate e collaudate prima su Staging. Production resta
vuota e viene aggiornata solo con un'operazione distinta e autorizzata. Vedi
[`docs/09-deploy-vercel.md`](docs/09-deploy-vercel.md).

Non è necessario acquistare un dominio: Staging usa l’alias gratuito stabile
`gestionale-assicurativo-git-staging-invidiaa88.vercel.app`. L’URL esatto va
configurato come Site URL e con `/**` tra i Redirect URLs di Supabase Auth
Staging.

## Branch e ambienti

- `staging`: sviluppo integrato, collaudo Vercel e Supabase Staging;
- `main`: codice approvato destinato a Vercel e Supabase Production.

Le modifiche vengono provate su `staging` e promosse con una pull request verso
`main`. Le migration Production non partono automaticamente dal branch: vengono
applicate in una fase separata, dopo verifica su Staging e autorizzazione.

## Credenziali demo

Gli utenti disponibili su Staging sono:

- `admin.aurora@demo.example`;
- `collaboratore.aurora@demo.example`;
- `admin.tirreno@demo.example`;
- `collaboratore.tirreno@demo.example`.

Usano tutti la password configurata localmente in `DEMO_PASSWORD`, che non viene
mai salvata nel repository.

## Limitazioni iniziali

Niente documenti, pagamenti, messaggi automatici, report avanzati o importazioni.
Excel e CSV sono nella roadmap.

## Documentazione

- [Panoramica](docs/00-panoramica-progetto.md)
- [Database](docs/03-database.md)
- [Multi-tenant e RLS](docs/04-multi-tenant-e-rls.md)
- [Configurazione Supabase](docs/07-configurazione-supabase.md)
- [Test](docs/10-test.md)
- [Stato lavori](docs/14-stato-lavori.md)
