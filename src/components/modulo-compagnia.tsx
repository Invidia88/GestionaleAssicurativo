"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { creaCompagnia } from "@/app/(app)/compagnie/azioni";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { schemaCompagnia, type DatiCompagnia } from "@/lib/validazioni";

export function ModuloCompagnia() {
  const [errore, setErrore] = useState<string | null>(null);
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
    useForm<DatiCompagnia>({
      resolver: zodResolver(schemaCompagnia),
      defaultValues: { nome: "", sitoWeb: "" },
    });

  async function salva(dati: DatiCompagnia) {
    setErrore(null);
    const esito = await creaCompagnia(dati);
    if (!esito.successo) {
      Object.entries(esito.errori ?? {}).forEach(([campo, messaggi]) => {
        if (messaggi?.[0]) setError(campo as keyof DatiCompagnia, { message: messaggi[0] });
      });
      setErrore(esito.messaggio ?? null);
      return;
    }
    reset();
    toast.success("Compagnia aggiunta");
  }

  return (
    <form onSubmit={handleSubmit(salva)} className="space-y-4" noValidate>
      {errore ? <Alert variant="destructive"><AlertDescription>{errore}</AlertDescription></Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" placeholder="Nome compagnia" {...register("nome")} />
        {errors.nome?.message ? <p className="text-sm text-destructive">{errors.nome.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sitoWeb">Sito web (facoltativo)</Label>
        <Input id="sitoWeb" type="url" inputMode="url" placeholder="https://compagnia.it" {...register("sitoWeb")} />
        {errors.sitoWeb?.message ? <p className="text-sm text-destructive">{errors.sitoWeb.message}</p> : null}
      </div>
      <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
        <Plus aria-hidden="true" /> {isSubmitting ? "Salvataggio…" : "Aggiungi compagnia"}
      </Button>
    </form>
  );
}
