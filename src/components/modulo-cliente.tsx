"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";

import { creaCliente, modificaCliente } from "@/app/(app)/clienti/azioni";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { schemaCliente, type DatiCliente } from "@/lib/validazioni";

type ModuloClienteProps = {
  idCliente?: string;
  modalita?: "crea" | "modifica";
  valoriIniziali?: DatiCliente;
};

export function ModuloCliente({ idCliente, modalita = "crea", valoriIniziali }: ModuloClienteProps) {
  const router = useRouter();
  const [erroreGenerale, setErroreGenerale] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatiCliente>({
    resolver: zodResolver(schemaCliente),
    defaultValues: valoriIniziali ?? {
      nome: "",
      cognome: "",
      telefono: "+39",
      email: "",
      note: "",
    },
  });

  async function salva(dati: DatiCliente) {
    setErroreGenerale(null);
    const esito = modalita === "modifica" && idCliente
      ? await modificaCliente(idCliente, dati)
      : await creaCliente(dati);

    if (!esito.successo) {
      Object.entries(esito.errori ?? {}).forEach(([campo, messaggi]) => {
        const messaggio = messaggi?.[0];
        if (messaggio && campo in dati) {
          setError(campo as keyof DatiCliente, { message: messaggio });
        }
      });
      setErroreGenerale(esito.messaggio ?? null);
      return;
    }

    const destinazione = esito.id ?? idCliente;
    if (!destinazione) {
      setErroreGenerale("Non è stato possibile aprire il cliente salvato");
      return;
    }
    router.push(`/clienti/${destinazione}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(salva)} className="space-y-6" noValidate>
      {erroreGenerale ? (
        <Alert variant="destructive">
          <AlertDescription>{erroreGenerale}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id="nome"
          etichetta="Nome"
          errore={errors.nome?.message}
          input={<Input id="nome" autoComplete="given-name" {...register("nome")} />}
        />
        <Campo
          id="cognome"
          etichetta="Cognome"
          errore={errors.cognome?.message}
          input={<Input id="cognome" autoComplete="family-name" {...register("cognome")} />}
        />
      </div>

      <Campo
        id="telefono"
        etichetta="Telefono"
        errore={errors.telefono?.message}
        input={
          <Input
            id="telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+39 333 1234567"
            {...register("telefono")}
          />
        }
      />

      <Campo
        id="email"
        etichetta="Email (facoltativa)"
        errore={errors.email?.message}
        input={
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="cliente@email.it"
            {...register("email")}
          />
        }
      />

      <div className="space-y-2">
        <Label htmlFor="note">Note (facoltative)</Label>
        <Textarea
          id="note"
          rows={4}
          placeholder="Solo le informazioni utili per il prossimo contatto"
          {...register("note")}
        />
        {errors.note?.message ? (
          <p className="text-sm text-destructive">{errors.note.message}</p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="h-11 w-full sm:w-auto" disabled={isSubmitting}>
        <Save aria-hidden="true" />
        {isSubmitting ? "Salvataggio…" : modalita === "modifica" ? "Salva modifiche" : "Salva cliente"}
      </Button>
    </form>
  );
}

function Campo({
  id,
  etichetta,
  errore,
  input,
}: {
  id: string;
  etichetta: string;
  errore?: string;
  input: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{etichetta}</Label>
      {input}
      {errore ? <p className="text-sm text-destructive">{errore}</p> : null}
    </div>
  );
}
