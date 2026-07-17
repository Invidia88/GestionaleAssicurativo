"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { registraContatto } from "@/app/(app)/contatti/azioni";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { schemaContatto, type DatiContatto } from "@/lib/validazioni";

const esiti = [
  ["contattato", "Contattato"], ["nessuna_risposta", "Nessuna risposta"],
  ["da_ricontattare", "Da ricontattare"], ["numero_non_valido", "Numero non valido"],
  ["preventivo_inviato", "Preventivo inviato"],
] as const;

export function RegistraContatto({ clienteId, polizzaId, messaggio }: { clienteId: string; polizzaId: string; messaggio: string }) {
  const [aperto, setAperto] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DatiContatto>({
    resolver: zodResolver(schemaContatto),
    defaultValues: { clienteId, polizzaId, tipoContatto: "whatsapp", esito: "contattato", messaggio, note: "" },
  });

  async function salva(dati: DatiContatto) {
    setErrore(null);
    const esito = await registraContatto(dati);
    if (!esito.successo) { setErrore(esito.messaggio ?? "Controlla i dati inseriti"); return; }
    toast.success("Contatto registrato");
    reset();
    setAperto(false);
  }

  return <Dialog open={aperto} onOpenChange={setAperto}>
    <DialogTrigger asChild><Button variant="outline" className="h-11 w-full"><CheckCircle2 aria-hidden="true" /> Segna come contattato</Button></DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Registra il contatto</DialogTitle><DialogDescription>Salva l’esito dopo aver contattato il cliente.</DialogDescription></DialogHeader>
      <form onSubmit={handleSubmit(salva)} className="space-y-4">
        {errore ? <p className="text-sm text-destructive">{errore}</p> : null}
        <div className="space-y-2"><Label>Esito</Label><Controller name="esito" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{esiti.map(([valore, etichetta]) => <SelectItem key={valore} value={valore}>{etichetta}</SelectItem>)}</SelectContent></Select>} />{errors.esito?.message ? <p className="text-sm text-destructive">{errors.esito.message}</p> : null}</div>
        <div className="space-y-2"><Label htmlFor="noteContatto">Note facoltative</Label><Textarea id="noteContatto" rows={3} placeholder="Esempio: richiamare venerdì" {...register("note")} /></div>
        <DialogFooter className="mx-0 mb-0 px-0 pb-0"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvataggio…" : "Salva contatto"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
