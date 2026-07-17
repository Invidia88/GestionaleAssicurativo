"use client";

import { useState, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  messaggioErroreEliminazione,
  type RisorsaEliminabile,
} from "@/lib/errori-database";

type ConfermaEliminazioneProps = {
  tipo: RisorsaEliminabile;
  nome: string;
  trigger: ReactNode;
  onConferma: () => Promise<void>;
};

const genereRisorsa: Record<RisorsaEliminabile, "il" | "la"> = {
  cliente: "il",
  compagnia: "la",
  polizza: "la",
};

const conseguenzaRisorsa: Record<RisorsaEliminabile, string> = {
  cliente: "L’operazione non può essere annullata e verrà bloccata se esistono polizze o contatti collegati.",
  compagnia: "L’operazione non può essere annullata e verrà bloccata se esistono polizze collegate.",
  polizza: "L’operazione non può essere annullata. Gli eventuali contatti resteranno nello storico senza il collegamento alla polizza.",
};

export function ConfermaEliminazione({
  tipo,
  nome,
  trigger,
  onConferma,
}: ConfermaEliminazioneProps) {
  const [aperto, setAperto] = useState(false);
  const [eliminazioneInCorso, setEliminazioneInCorso] = useState(false);

  async function elimina() {
    setEliminazioneInCorso(true);

    try {
      await onConferma();
      setAperto(false);
      toast.success("Eliminazione completata");
    } catch (errore) {
      toast.error(messaggioErroreEliminazione(errore, tipo));
    } finally {
      setEliminazioneInCorso(false);
    }
  }

  return (
    <AlertDialog open={aperto} onOpenChange={setAperto}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlert aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Eliminare {genereRisorsa[tipo]} {tipo}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Stai per eliminare <strong className="text-foreground">{nome}</strong>.
            {" "}{conseguenzaRisorsa[tipo]}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={eliminazioneInCorso}>
            Annulla
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={eliminazioneInCorso}
            onClick={elimina}
          >
            {eliminazioneInCorso ? "Eliminazione…" : "Elimina"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
