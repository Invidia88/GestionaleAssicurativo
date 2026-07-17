# Avvio locale

```bash
npm install
npx supabase start
npx supabase db reset
npm run dev
```

Docker Desktop deve essere attivo. Lo sviluppo quotidiano dell'app usa le
credenziali Staging presenti in `.env.local`; Supabase locale è usato per
collaudare migration e policy senza modificare dati remoti.
