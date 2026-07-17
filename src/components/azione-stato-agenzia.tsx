"use client";

import { useState } from "react";
import { CirclePause, CirclePlay } from "lucide-react";
import { toast } from "sonner";

import { impostaAgenziaAttiva } from "@/app/(piattaforma)/piattaforma/agenzie/azioni";
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

export function AzioneStatoAgenzia({
  id,
  nome,
  attiva,
}: {
  id: string;
  nome: string;
  attiva: boolean;
}) {
  const [aperto, setAperto] = useState(false);
  const [inCorso, setInCorso] = useState(false);
  const nuovoStato = !attiva;

  async function conferma() {
    setInCorso(true);
    const esito = await impostaAgenziaAttiva(id, nuovoStato);
    setInCorso(false);

    if (!esito.successo) {
      toast.error(esito.messaggio);
      return;
    }

    setAperto(false);
    toast.success(nuovoStato ? "Agenzia riattivata" : "Agenzia disattivata");
  }

  return (
    <AlertDialog open={aperto} onOpenChange={setAperto}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {attiva ? (
            <CirclePause aria-hidden="true" />
          ) : (
            <CirclePlay aria-hidden="true" />
          )}
          {attiva ? "Disattiva" : "Riattiva"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-primary/10 text-primary">
            {attiva ? (
              <CirclePause aria-hidden="true" />
            ) : (
              <CirclePlay aria-hidden="true" />
            )}
          </AlertDialogMedia>
          <AlertDialogTitle>
            {attiva ? "Disattivare" : "Riattivare"} l’agenzia?
          </AlertDialogTitle>
          <AlertDialogDescription>
            <strong className="text-foreground">{nome}</strong>{" "}
            {attiva
              ? "non potrà accedere al gestionale finché non verrà riattivata. I dati resteranno conservati."
              : "e i suoi utenti potranno accedere nuovamente al gestionale."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={inCorso}>Annulla</AlertDialogCancel>
          <Button
            type="button"
            variant={attiva ? "destructive" : "default"}
            disabled={inCorso}
            onClick={conferma}
          >
            {inCorso
              ? "Aggiornamento…"
              : attiva
                ? "Disattiva agenzia"
                : "Riattiva agenzia"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
