"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { creaPolizza, modificaPolizza } from "@/app/(app)/polizze/azioni";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { schemaPolizza, tipiPolizza, type DatiPolizza } from "@/lib/validazioni";

type Voce = { id: string; nome: string };

type ModuloPolizzaProps = {
  clienti: Voce[];
  compagnie: Voce[];
  clienteIniziale?: string;
  idPolizza?: string;
  modalita?: "crea" | "modifica";
  valoriIniziali?: DatiPolizza;
};

export function ModuloPolizza({
  clienti,
  compagnie,
  clienteIniziale = "",
  idPolizza,
  modalita = "crea",
  valoriIniziali,
}: ModuloPolizzaProps) {
  const router = useRouter();
  const [errore, setErrore] = useState<string | null>(null);
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<DatiPolizza>({
    resolver: zodResolver(schemaPolizza),
    defaultValues: valoriIniziali ?? { clienteId: clienteIniziale, compagniaId: "", tipo: undefined, dataScadenza: "", numeroPolizza: "", targa: "", premio: "", note: "" },
  });

  async function salva(dati: DatiPolizza) {
    setErrore(null);
    const esito = modalita === "modifica" && idPolizza
      ? await modificaPolizza(idPolizza, dati)
      : await creaPolizza(dati);
    if (!esito.successo) {
      Object.entries(esito.errori ?? {}).forEach(([campo, messaggi]) => { if (messaggi?.[0]) setError(campo as keyof DatiPolizza, { message: messaggi[0] }); });
      setErrore(esito.messaggio ?? null);
      return;
    }
    router.push(`/polizze/${esito.id ?? idPolizza}`);
    router.refresh();
  }

  return <form onSubmit={handleSubmit(salva)} className="space-y-6" noValidate>
    {errore ? <Alert variant="destructive"><AlertDescription>{errore}</AlertDescription></Alert> : null}
    <div className="grid gap-5 sm:grid-cols-2">
      <Scelta control={control} nome="clienteId" etichetta="Cliente" placeholder="Seleziona cliente" voci={clienti} errore={errors.clienteId?.message} />
      <Scelta control={control} nome="compagniaId" etichetta="Compagnia" placeholder="Seleziona compagnia" voci={compagnie} errore={errors.compagniaId?.message} />
      <div className="space-y-2"><Label>Tipo polizza</Label><Controller control={control} name="tipo" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="h-11 w-full"><SelectValue placeholder="Seleziona tipo" /></SelectTrigger><SelectContent>{tipiPolizza.map((tipo) => <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>)}</SelectContent></Select>} />{errors.tipo?.message ? <p className="text-sm text-destructive">{errors.tipo.message}</p> : null}</div>
      <div className="space-y-2"><Label htmlFor="dataScadenza">Data di scadenza</Label><Input id="dataScadenza" type="date" className="h-11" {...register("dataScadenza")} />{errors.dataScadenza?.message ? <p className="text-sm text-destructive">{errors.dataScadenza.message}</p> : null}</div>
    </div>
    <details open={modalita === "modifica"} className="group rounded-xl border p-4"><summary className="flex cursor-pointer list-none items-center justify-between font-medium">Altri dettagli <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" /></summary><div className="mt-5 grid gap-5 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="numeroPolizza">Numero polizza</Label><Input id="numeroPolizza" {...register("numeroPolizza")} /></div>
      <div className="space-y-2"><Label htmlFor="targa">Targa</Label><Input id="targa" className="uppercase" {...register("targa")} /></div>
      <div className="space-y-2"><Label htmlFor="premio">Premio (€)</Label><Input id="premio" type="number" min="0" step="0.01" inputMode="decimal" {...register("premio")} />{errors.premio?.message ? <p className="text-sm text-destructive">{errors.premio.message}</p> : null}</div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="notePolizza">Note</Label><Textarea id="notePolizza" rows={3} {...register("note")} /></div>
    </div></details>
    <Button type="submit" size="lg" className="h-11 w-full sm:w-auto" disabled={isSubmitting}><Save aria-hidden="true" />{isSubmitting ? "Salvataggio…" : modalita === "modifica" ? "Salva modifiche" : "Salva polizza"}</Button>
  </form>;
}

function Scelta({ control, nome, etichetta, placeholder, voci, errore }: { control: ReturnType<typeof useForm<DatiPolizza>>["control"]; nome: "clienteId" | "compagniaId"; etichetta: string; placeholder: string; voci: Voce[]; errore?: string }) {
  return <div className="space-y-2"><Label>{etichetta}</Label><Controller control={control} name={nome} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="h-11 w-full"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{voci.map((voce) => <SelectItem key={voce.id} value={voce.id}>{voce.nome}</SelectItem>)}</SelectContent></Select>} />{errore ? <p className="text-sm text-destructive">{errore}</p> : null}</div>;
}
