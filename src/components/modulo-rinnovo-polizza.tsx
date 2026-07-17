"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";

import { rinnovaPolizza } from "@/app/(app)/polizze/azioni";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { suggerisciScadenzaRinnovo } from "@/lib/scadenze";
import { schemaRinnovoPolizza, type DatiRinnovoPolizza } from "@/lib/validazioni";

type ModuloRinnovoPolizzaProps = {
  id: string;
  scadenzaAttuale: string;
  numeroPolizza: string | null;
  premio: number | string | null;
  note: string | null;
};

export function ModuloRinnovoPolizza({
  id,
  scadenzaAttuale,
  numeroPolizza,
  premio,
  note,
}: ModuloRinnovoPolizzaProps) {
  const router = useRouter();
  const [errore, setErrore] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<DatiRinnovoPolizza>({
    resolver: zodResolver(schemaRinnovoPolizza),
    defaultValues: {
      dataScadenza: suggerisciScadenzaRinnovo(scadenzaAttuale),
      numeroPolizza: numeroPolizza ?? "",
      premio: premio === null ? "" : String(premio),
      note: note ?? "",
    },
  });

  async function rinnova(dati: DatiRinnovoPolizza) {
    setErrore(null);
    if (dati.dataScadenza <= scadenzaAttuale) {
      setError("dataScadenza", { message: "La nuova scadenza deve essere successiva alla precedente" });
      return;
    }

    const esito = await rinnovaPolizza(id, dati);
    if (!esito.successo) {
      Object.entries(esito.errori ?? {}).forEach(([campo, messaggi]) => {
        if (messaggi?.[0]) setError(campo as keyof DatiRinnovoPolizza, { message: messaggi[0] });
      });
      setErrore(esito.messaggio ?? null);
      return;
    }

    router.push(`/polizze/${esito.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(rinnova)} className="space-y-6" noValidate>
      {errore ? <Alert variant="destructive"><AlertDescription>{errore}</AlertDescription></Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dataScadenzaRinnovo">Nuova scadenza</Label>
          <Input id="dataScadenzaRinnovo" type="date" min={scadenzaAttuale} className="h-11" {...register("dataScadenza")} />
          {errors.dataScadenza?.message ? <p className="text-sm text-destructive">{errors.dataScadenza.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="numeroPolizzaRinnovo">Nuovo numero polizza</Label>
          <Input id="numeroPolizzaRinnovo" {...register("numeroPolizza")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="premioRinnovo">Nuovo premio (€)</Label>
          <Input id="premioRinnovo" type="number" min="0" step="0.01" inputMode="decimal" {...register("premio")} />
          {errors.premio?.message ? <p className="text-sm text-destructive">{errors.premio.message}</p> : null}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="noteRinnovo">Note</Label>
          <Textarea id="noteRinnovo" rows={4} {...register("note")} />
        </div>
      </div>
      <Button type="submit" size="lg" className="h-11 w-full sm:w-auto" disabled={isSubmitting}>
        <RefreshCw aria-hidden="true" /> {isSubmitting ? "Rinnovo…" : "Conferma rinnovo"}
      </Button>
    </form>
  );
}
