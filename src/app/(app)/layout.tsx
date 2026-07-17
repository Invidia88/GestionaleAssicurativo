import { Badge } from "@/components/ui/badge";
import { MenuMobile, Sidebar } from "@/components/navigazione-principale";
import { richiediProfiloCorrente, trovaProprietarioPiattaforma } from "@/lib/autenticazione";

export default async function LayoutPrivato({
  children,
}: {
  children: React.ReactNode;
}) {
  const profilo = await richiediProfiloCorrente();
  const amministratore = profilo.ruolo === "amministratore";
  const proprietarioPiattaforma = Boolean(await trovaProprietarioPiattaforma());

  return (
    <div className="min-h-screen bg-muted/35 lg:flex">
      <Sidebar
        amministratore={amministratore}
        nomeAgenzia={profilo.agenzia.nome}
        proprietarioPiattaforma={proprietarioPiattaforma}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <MenuMobile
              amministratore={amministratore}
              nomeAgenzia={profilo.agenzia.nome}
              proprietarioPiattaforma={proprietarioPiattaforma}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {profilo.nome} {profilo.cognome}
              </p>
              <p className="truncate text-xs text-muted-foreground lg:hidden">
                {profilo.agenzia.nome}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="hidden capitalize sm:inline-flex">
            {profilo.ruolo}
          </Badge>
        </header>
        <main className="mx-auto w-full max-w-[90rem] p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
