"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Building2, LogIn, ShieldCheck } from "lucide-react";

import {
  accedi,
  type StatoAutenticazione,
} from "@/app/(pubblico)/azioni-autenticazione";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statoIniziale: StatoAutenticazione = {};

export type AreaAccesso = "agenzia" | "piattaforma";

export function ModuloAccesso({
  areaPreselezionata = "agenzia",
}: {
  areaPreselezionata?: AreaAccesso;
}) {
  const [stato, azione, inCorso] = useActionState(accedi, statoIniziale);
  const [areaAccesso, impostaAreaAccesso] = useState<AreaAccesso>(
    areaPreselezionata,
  );

  const accessoPiattaforma = areaAccesso === "piattaforma";

  return (
    <form action={azione} className="space-y-5">
      {stato.messaggio ? (
        <Alert variant="destructive">
          <AlertDescription>{stato.messaggio}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs
        value={areaAccesso}
        onValueChange={(valore) => {
          if (valore === "agenzia" || valore === "piattaforma") {
            impostaAreaAccesso(valore);
          }
        }}
      >
        <TabsList className="grid h-11 w-full grid-cols-2" aria-label="Area di accesso">
          <TabsTrigger value="agenzia" className="gap-2">
            <Building2 aria-hidden="true" />
            Agenzia
          </TabsTrigger>
          <TabsTrigger value="piattaforma" className="gap-2">
            <ShieldCheck aria-hidden="true" />
            Amministratore
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <input name="areaAccesso" type="hidden" value={areaAccesso} />

      <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
        {accessoPiattaforma
          ? "Accesso personale riservato alla gestione delle agenzie clienti."
          : "Accesso riservato agli amministratori e collaboratori delle agenzie."}
      </p>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={accessoPiattaforma ? "nome@tuodominio.it" : "nome@agenzia.it"}
          aria-invalid={Boolean(stato.errori?.email)}
          required
        />
        {stato.errori?.email?.map((errore) => (
          <p key={errore} className="text-sm text-destructive">
            {errore}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/recupera-password"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Password dimenticata?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(stato.errori?.password)}
          required
        />
        {stato.errori?.password?.map((errore) => (
          <p key={errore} className="text-sm text-destructive">
            {errore}
          </p>
        ))}
      </div>

      <Button type="submit" size="lg" className="h-11 w-full" disabled={inCorso}>
        <LogIn aria-hidden="true" />
        {inCorso
          ? "Accesso in corso…"
          : accessoPiattaforma
            ? "Accedi come amministratore"
            : "Accedi all’agenzia"}
      </Button>
    </form>
  );
}
