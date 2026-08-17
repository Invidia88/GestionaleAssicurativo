# Mantenimento dei progetti Supabase Free

Supabase può sospendere un progetto Free con poca attività nell'arco di sette
giorni. Poiché la soglia non è una semplice cadenza fissa, non è affidabile fare
una query ogni cinque giorni: la documentazione indica che alcune richieste al
database ogni giorno sono normalmente sufficienti.

## Implementazione

Il workflow GitHub Actions `.github/workflows/mantieni-supabase-attivo.yml`
esegue tre chiamate al giorno, alle 07:17, 13:17 e 19:17 UTC, verso entrambe le
applicazioni Vercel. La distribuzione nella giornata rispecchia meglio il
criterio di Supabase di alcune richieste giornaliere:

- Staging: `gestionale-assicurativo-git-staging-invidiaa88.vercel.app`;
- Production: `gestionaleassicurativo.vercel.app`.

La route privata `GET /api/sistema/attivita` verifica un bearer token e poi
esegue, solo lato server, `select id from agenzie limit 1`. Non restituisce
righe, non modifica dati e non espone la Secret Key di Supabase.

La pianificazione è esterna al database: un cron interno non sarebbe utile se
il progetto fosse già sospeso.

## Configurazione una tantum

1. Generare un token casuale lungo, per esempio con `openssl rand -base64 32`.
   Non condividerlo via email o chat.
2. In Vercel, progetto `gestionale-assicurativo` → **Settings** →
   **Environment Variables**, creare `SUPABASE_KEEPALIVE_SECRET` come variabile
   sensibile con lo stesso valore in:
   - Production;
   - Preview, limitata al branch `staging`.
3. In GitHub → repository `Invidia88/GestionaleAssicurativo` → **Settings** →
   **Secrets and variables** → **Actions**, creare il repository secret
   `SUPABASE_KEEPALIVE_SECRET` con esattamente lo stesso valore.
4. In Vercel, progetto `gestionale-assicurativo` → **Settings** →
   **Deployment Protection** → **Protection Bypass for Automation**, creare un
   secret dedicato al workflow. In GitHub creare anche il repository secret
   `VERCEL_AUTOMATION_BYPASS_SECRET` con quel valore. Questo consente al job di
   raggiungere Staging senza togliere il login Vercel dalla Preview.
5. Dopo i deploy di Staging e Production, in GitHub → **Actions** →
   **Mantieni attivi i progetti Supabase** → **Run workflow**, eseguire una
   prova. Devono risultare entrambe le richieste verdi.

## Limiti e controllo

- GitHub può ritardare o saltare un job pianificato durante picchi di carico;
  per questo ogni job evita l'inizio dell'ora e riprova due volte.
- Per repository pubblici, GitHub disabilita i workflow pianificati dopo 60
  giorni senza attività nel repository: basta riabilitarlo dalla pagina
  Actions. Il pulsante manuale `Run workflow` resta il controllo immediato.
- È una precauzione ragionevole, non una garanzia contrattuale contro la
  sospensione. L'unico modo garantito da Supabase per escludere la pausa per
  inattività è un piano a pagamento.
