"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";

import {
  accedi,
  type StatoAutenticazione,
} from "@/app/(pubblico)/azioni-autenticazione";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statoIniziale: StatoAutenticazione = {};

export function ModuloAccesso() {
  const [stato, azione, inCorso] = useActionState(accedi, statoIniziale);

  return (
    <form action={azione} className="space-y-5">
      {stato.messaggio ? (
        <Alert variant="destructive">
          <AlertDescription>{stato.messaggio}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nome@agenzia.it"
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
        {inCorso ? "Accesso in corso…" : "Accedi"}
      </Button>
    </form>
  );
}
