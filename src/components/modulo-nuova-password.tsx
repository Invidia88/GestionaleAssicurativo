"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";

import {
  aggiornaPassword,
  type StatoAutenticazione,
} from "@/app/(pubblico)/azioni-autenticazione";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statoIniziale: StatoAutenticazione = {};

export function ModuloNuovaPassword() {
  const [stato, azione, inCorso] = useActionState(
    aggiornaPassword,
    statoIniziale,
  );

  return (
    <form action={azione} className="space-y-5">
      {stato.messaggio ? (
        <Alert variant="destructive">
          <AlertDescription>{stato.messaggio}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="password">Nuova password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(stato.errori?.password)}
          required
        />
        <p className="text-sm text-muted-foreground">Almeno 8 caratteri.</p>
        {stato.errori?.password?.map((errore) => (
          <p key={errore} className="text-sm text-destructive">
            {errore}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confermaPassword">Ripeti la nuova password</Label>
        <Input
          id="confermaPassword"
          name="confermaPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(stato.errori?.confermaPassword)}
          required
        />
        {stato.errori?.confermaPassword?.map((errore) => (
          <p key={errore} className="text-sm text-destructive">
            {errore}
          </p>
        ))}
      </div>

      <Button type="submit" size="lg" className="h-11 w-full" disabled={inCorso}>
        <KeyRound aria-hidden="true" />
        {inCorso ? "Aggiornamento…" : "Salva nuova password"}
      </Button>
    </form>
  );
}
