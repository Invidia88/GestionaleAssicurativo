import Link from "next/link";
import { ArrowLeft, CalendarClock, LogOut, ShieldCheck } from "lucide-react";

import { esci } from "@/app/(app)/azioni-sessione";
import { Button } from "@/components/ui/button";
import {
  richiediProprietarioPiattaforma,
  trovaProfiloCorrente,
} from "@/lib/autenticazione";

export default async function LayoutPiattaforma({
  children,
}: {
  children: React.ReactNode;
}) {
  const proprietario = await richiediProprietarioPiattaforma();
  const profilo = await trovaProfiloCorrente();

  return (
    <div className="min-h-screen bg-muted/35">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Link
            href="/piattaforma/agenzie"
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <CalendarClock aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold tracking-tight">
                GestionaleAssicurativo
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Area amministratore
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {profilo ? (
              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link href="/dashboard">
                  <ArrowLeft aria-hidden="true" />
                  Torna al gestionale
                </Link>
              </Button>
            ) : null}
            <form action={esci}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut aria-hidden="true" />
                <span className="hidden sm:inline">Esci</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[90rem] items-center gap-2 px-4 pt-5 text-xs text-muted-foreground sm:px-6 lg:px-10">
        <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
        Accesso amministratore riservato a {proprietario.email}
      </div>
      <main className="mx-auto w-full max-w-[90rem] p-4 sm:p-6 lg:p-10 lg:pt-6">
        {children}
      </main>
    </div>
  );
}
