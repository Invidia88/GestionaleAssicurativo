import { CalendarClock } from "lucide-react";

export default function LayoutPubblico({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-muted/30 lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.75fr)]">
      <section className="hidden border-r bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-lg font-semibold">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/10">
            <CalendarClock aria-hidden="true" className="size-5" />
          </span>
          GestionaleAssicurativo
        </div>
        <div className="max-w-xl space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground/60">
            Ogni scadenza al momento giusto
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight xl:text-5xl">
            Una piattaforma semplice per chi gestisce le assicurazioni.
          </h1>
          <p className="max-w-lg text-lg leading-8 text-primary-foreground/70">
            L’amministratore della piattaforma attiva le agenzie. Ogni agenzia
            accede poi alla propria area riservata per gestire clienti, polizze
            e scadenze.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/50">
          I dati di ogni agenzia sono separati e protetti nel database.
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        {children}
      </section>
    </main>
  );
}
