# Mantenimento dei progetti Supabase Free

Supabase può sospendere un progetto Free con poca attività nell'arco di sette
giorni. Poiché la soglia non è una semplice cadenza fissa, non è affidabile fare
una query ogni cinque giorni: la documentazione indica che alcune richieste al
database ogni giorno sono normalmente sufficienti.

## Implementazione

Il workflow GitHub Actions `.github/workflows/mantieni-supabase-attivo.yml` si
avvia ogni giorno alle 08:17 UTC e chiama entrambe le applicazioni Vercel:

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
4. Dopo i deploy di Staging e Production, in GitHub → **Actions** →
   **Mantieni attivi i progetti Supabase** → **Run workflow**, eseguire una
   prova. Devono risultare entrambe le richieste verdi.

Se Vercel protegge l'alias Preview con SSO, la chiamata Staging può fermarsi
prima di raggiungere l'app. In tal caso si mantiene la protezione e si aggiunge
nel workflow l'header di bypass Vercel usando un secondo secret, senza mai
renderlo pubblico.

## Limiti e controllo

- GitHub può ritardare o saltare un job pianificato durante picchi di carico;
  per questo il job evita l'inizio dell'ora e riprova due volte.
- Per repository pubblici, GitHub disabilita i workflow pianificati dopo 60
  giorni senza attività nel repository: basta riabilitarlo dalla pagina
  Actions. Il pulsante manuale `Run workflow` resta il controllo immediato.
- È una precauzione ragionevole, non una garanzia contrattuale contro la
  sospensione. L'unico modo garantito da Supabase per escludere la pausa per
  inattività è un piano a pagamento.
