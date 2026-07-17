"use client";

import { toast } from "sonner";

import { impostaUtenteAttivo } from "@/app/(app)/utenti/azioni";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export function AzioniUtente({ id, ruolo, attivo, corrente }: { id: string; ruolo: string; attivo: boolean; corrente: boolean }) {
  async function cambiaStato(valore: boolean) { const esito = await impostaUtenteAttivo(id, valore); if (!esito.successo) toast.error(esito.messaggio); }
  return <div className="flex flex-wrap items-center justify-end gap-3"><Badge variant="outline" className="capitalize">{ruolo}</Badge><label className="flex items-center gap-2 text-sm"><Switch checked={attivo} onCheckedChange={cambiaStato} disabled={corrente || ruolo === "amministratore"} aria-label="Utente attivo" /><span>{attivo ? "Attivo" : "Disattivato"}</span></label></div>;
}
