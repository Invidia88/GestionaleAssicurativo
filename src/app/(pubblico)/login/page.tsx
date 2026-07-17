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
import {
  trovaProfiloCorrente,
  trovaProprietarioPiattaforma,
} from "@/lib/autenticazione";

export const metadata: Metadata = { title: "Accedi" };

type LoginProps = {
  searchParams: Promise<{ motivo?: string; esito?: string; area?: string }>;
};

export default async function Login({ searchParams }: LoginProps) {
  const [parametri, profilo, proprietario] = await Promise.all([
    searchParams,
    trovaProfiloCorrente(),
    trovaProprietarioPiattaforma(),
  ]);

  if (profilo) {
    redirect("/dashboard");
  }

  if (proprietario) {
    redirect("/piattaforma/agenzie");
  }

  const areaPreselezionata =
    parametri.area === "piattaforma" ? "piattaforma" : "agenzia";

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
          <CardTitle className="text-2xl">Accedi al gestionale</CardTitle>
          <CardDescription>
            Seleziona l’area corretta e inserisci le tue credenziali.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {messaggio ? (
            <Alert>
              <AlertDescription>{messaggio}</AlertDescription>
            </Alert>
          ) : null}
          <ModuloAccesso areaPreselezionata={areaPreselezionata} />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Non è prevista la registrazione pubblica. Le agenzie vengono attivate
        dall’amministratore della piattaforma.
      </p>
    </div>
  );
}
