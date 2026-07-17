"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { creaAgenzia } from "@/app/(piattaforma)/piattaforma/agenzie/azioni";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  schemaNuovaAgenzia,
  type DatiNuovaAgenzia,
} from "@/lib/validazioni";

export function ModuloNuovaAgenzia() {
  const [errore, setErrore] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatiNuovaAgenzia>({
    resolver: zodResolver(schemaNuovaAgenzia),
    defaultValues: {
      nomeAgenzia: "",
      emailAgenzia: "",
      telefonoAgenzia: "",
      nomeAmministratore: "",
      cognomeAmministratore: "",
      emailAmministratore: "",
    },
  });

  async function salva(dati: DatiNuovaAgenzia) {
    setErrore(null);
    const esito = await creaAgenzia(dati);

    if (!esito.successo) {
      Object.entries(esito.errori ?? {}).forEach(([campo, messaggi]) => {
        if (messaggi?.[0]) {
          setError(campo as keyof DatiNuovaAgenzia, {
            message: messaggi[0],
          });
        }
      });
      setErrore(esito.messaggio ?? null);
      return;
    }

    reset();
    toast.success("Agenzia creata e invito inviato");
  }

  return (
    <form onSubmit={handleSubmit(salva)} className="space-y-6" noValidate>
      {errore ? (
        <Alert variant="destructive">
          <AlertDescription>{errore}</AlertDescription>
        </Alert>
      ) : null}

      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-semibold text-foreground">
          Dati dell’agenzia
        </legend>
        <Campo
          id="nomeAgenzia"
          etichetta="Nome agenzia"
          errore={errors.nomeAgenzia?.message}
        >
          <Input
            id="nomeAgenzia"
            placeholder="Agenzia Rossi"
            {...register("nomeAgenzia")}
          />
        </Campo>
        <Campo
          id="emailAgenzia"
          etichetta="Email agenzia"
          errore={errors.emailAgenzia?.message}
        >
          <Input
            id="emailAgenzia"
            type="email"
            placeholder="info@agenzia.it"
            {...register("emailAgenzia")}
          />
        </Campo>
        <Campo
          id="telefonoAgenzia"
          etichetta="Telefono (facoltativo)"
          errore={errors.telefonoAgenzia?.message}
        >
          <Input
            id="telefonoAgenzia"
            type="tel"
            inputMode="tel"
            placeholder="02 12345678"
            {...register("telefonoAgenzia")}
          />
        </Campo>
      </fieldset>

      <fieldset className="space-y-4 border-t pt-5">
        <legend className="mb-3 text-sm font-semibold text-foreground">
          Amministratore dell’agenzia
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            id="nomeAmministratore"
            etichetta="Nome"
            errore={errors.nomeAmministratore?.message}
          >
            <Input id="nomeAmministratore" {...register("nomeAmministratore")} />
          </Campo>
          <Campo
            id="cognomeAmministratore"
            etichetta="Cognome"
            errore={errors.cognomeAmministratore?.message}
          >
            <Input
              id="cognomeAmministratore"
              {...register("cognomeAmministratore")}
            />
          </Campo>
        </div>
        <Campo
          id="emailAmministratore"
          etichetta="Email per l’invito"
          errore={errors.emailAmministratore?.message}
        >
          <Input
            id="emailAmministratore"
            type="email"
            placeholder="amministratore@agenzia.it"
            {...register("emailAmministratore")}
          />
        </Campo>
      </fieldset>

      <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
        <Building2 aria-hidden="true" />
        {isSubmitting ? "Creazione e invio…" : "Crea agenzia e invia invito"}
      </Button>
    </form>
  );
}

function Campo({
  id,
  etichetta,
  errore,
  children,
}: {
  id: string;
  etichetta: string;
  errore?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{etichetta}</Label>
      {children}
      {errore ? <p className="text-sm text-destructive">{errore}</p> : null}
    </div>
  );
}
