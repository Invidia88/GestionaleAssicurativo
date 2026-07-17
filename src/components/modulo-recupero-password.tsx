"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

import {
  richiediRecuperoPassword,
  type StatoAutenticazione,
} from "@/app/(pubblico)/azioni-autenticazione";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statoIniziale: StatoAutenticazione = {};

export function ModuloRecuperoPassword() {
  const [stato, azione, inCorso] = useActionState(
    richiediRecuperoPassword,
    statoIniziale,
  );

  return (
    <form action={azione} className="space-y-5">
      {stato.messaggio ? (
        <Alert variant={stato.successo ? "default" : "destructive"}>
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

      <Button type="submit" size="lg" className="h-11 w-full" disabled={inCorso}>
        <Mail aria-hidden="true" />
        {inCorso ? "Invio in corso…" : "Invia istruzioni"}
      </Button>

      <Button variant="ghost" className="w-full" asChild>
        <Link href="/login">
          <ArrowLeft aria-hidden="true" />
          Torna all’accesso
        </Link>
      </Button>
    </form>
  );
}
