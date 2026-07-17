"use client";

import { toast } from "sonner";

import { impostaUtenteAttivo, modificaRuoloUtente } from "@/app/(app)/utenti/azioni";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function AzioniUtente({ id, ruolo, attivo, corrente }: { id: string; ruolo: string; attivo: boolean; corrente: boolean }) {
  async function cambiaStato(valore: boolean) { const esito = await impostaUtenteAttivo(id, valore); if (!esito.successo) toast.error(esito.messaggio); }
  async function cambiaRuolo(valore: string) { const esito = await modificaRuoloUtente(id, valore); if (!esito.successo) toast.error(esito.messaggio); else toast.success("Ruolo aggiornato"); }
  return <div className="flex flex-wrap items-center justify-end gap-3"><Select value={ruolo} onValueChange={cambiaRuolo} disabled={corrente}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="collaboratore">Collaboratore</SelectItem><SelectItem value="amministratore">Amministratore</SelectItem></SelectContent></Select><label className="flex items-center gap-2 text-sm"><Switch checked={attivo} onCheckedChange={cambiaStato} disabled={corrente} aria-label="Utente attivo" /><span>{attivo ? "Attivo" : "Disattivato"}</span></label></div>;
}
