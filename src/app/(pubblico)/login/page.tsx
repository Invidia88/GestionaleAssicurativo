import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarClock } from "lucide-react";

import { ModuloAccesso } from "@/components/modulo-accesso";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trovaProfiloCorrente } from "@/lib/autenticazione";

export const metadata: Metadata = { title: "Accedi" };

type LoginProps = {
  searchParams: Promise<{ motivo?: string; esito?: string }>;
};

export default async function Login({ searchParams }: LoginProps) {
  const [parametri, profilo] = await Promise.all([
    searchParams,
    trovaProfiloCorrente(),
  ]);

  if (profilo) {
    redirect("/dashboard");
  }

  const messaggio =
    parametri.esito === "password-aggiornata"
      ? "Password aggiornata. Ora puoi accedere"
      : parametri.motivo === "collegamento-non-valido"
        ? "Il collegamento non è valido o è scaduto. Richiedi una nuova email"
      : parametri.motivo === "accesso-non-autorizzato"
        ? "L’account non è attivo oppure non è associato a un’agenzia"
        : parametri.motivo === "sessione-richiesta"
          ? "Accedi per continuare"
          : null;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center justify-center gap-3 lg:hidden">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <CalendarClock aria-hidden="true" className="size-5" />
        </span>
        <span className="font-semibold">GestionaleAssicurativo</span>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Bentornato</CardTitle>
          <CardDescription>
            Inserisci le credenziali fornite dalla tua agenzia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {messaggio ? (
            <Alert>
              <AlertDescription>{messaggio}</AlertDescription>
            </Alert>
          ) : null}
          <ModuloAccesso />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Non è prevista la registrazione pubblica. Gli account vengono creati
        dall’amministratore dell’agenzia.
      </p>
    </div>
  );
}
