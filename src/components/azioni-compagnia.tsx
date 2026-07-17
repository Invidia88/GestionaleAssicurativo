"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { eliminaCompagnia, impostaCompagniaAttiva } from "@/app/(app)/compagnie/azioni";
import { ConfermaEliminazione } from "@/components/conferma-eliminazione";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function AzioniCompagnia({ id, nome, attiva }: { id: string; nome: string; attiva: boolean }) {
  async function cambiaStato(valore: boolean) {
    const esito = await impostaCompagniaAttiva(id, valore);
    if (!esito.successo) toast.error("Non è stato possibile modificare lo stato");
  }

  async function elimina() {
    const esito = await eliminaCompagnia(id);
    if (!esito.successo) {
      throw Object.assign(new Error(esito.messaggio), { code: esito.codice });
    }
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <label className="flex items-center gap-2 text-sm">
        <Switch checked={attiva} onCheckedChange={cambiaStato} aria-label={`Compagnia ${nome} attiva`} />
        <span className="hidden sm:inline">{attiva ? "Attiva" : "Non attiva"}</span>
      </label>
      <ConfermaEliminazione
        tipo="compagnia"
        nome={nome}
        onConferma={elimina}
        trigger={<Button variant="ghost" size="icon" aria-label={`Elimina ${nome}`}><Trash2 aria-hidden="true" /></Button>}
      />
    </div>
  );
}
