"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { richiediAmministratoreCorrente } from "@/lib/autenticazione";
import { creaClientSupabaseAmministratore } from "@/lib/supabase/amministratore";
import { creaClientSupabaseServer } from "@/lib/supabase/server";
import { ottieniUrlSito } from "@/lib/url-sito";
import { schemaInvitoUtente, type DatiInvitoUtente } from "@/lib/validazioni";

export async function invitaUtente(dati: DatiInvitoUtente) {
  const profilo = await richiediAmministratoreCorrente();
  const validazione = schemaInvitoUtente.safeParse(dati);
  if (!validazione.success) return { successo: false, errori: validazione.error.flatten().fieldErrors };

  const amministratore = creaClientSupabaseAmministratore();
  const { data: invito, error: erroreInvito } = await amministratore.auth.admin.inviteUserByEmail(validazione.data.email, {
    redirectTo: `${ottieniUrlSito()}/auth/invito`,
    data: { nome: validazione.data.nome, cognome: validazione.data.cognome },
  });

  if (erroreInvito || !invito.user) {
    return { successo: false, messaggio: erroreInvito?.message?.toLowerCase().includes("already") ? "Esiste già un utente con questa email" : "Non è stato possibile inviare l’invito" };
  }

  const { error: erroreProfilo } = await amministratore.from("utenti").insert({
    id: invito.user.id,
    agenzia_id: profilo.agenziaId,
    nome: validazione.data.nome,
    cognome: validazione.data.cognome,
    ruolo: "collaboratore",
    attivo: true,
  });

  if (erroreProfilo) {
    await amministratore.auth.admin.deleteUser(invito.user.id);
    return { successo: false, messaggio: "L’invito non è stato completato. Riprova" };
  }

  revalidatePath("/utenti");
  return { successo: true };
}

export async function impostaUtenteAttivo(id: string, attivo: boolean) {
  const profilo = await richiediAmministratoreCorrente();
  if (!z.string().uuid().safeParse(id).success || id === profilo.id) return { successo: false, messaggio: "Non puoi disattivare il tuo accesso" };
  const supabase = await creaClientSupabaseServer();
  const { data, error } = await supabase.from("utenti").update({ attivo }).eq("id", id).eq("agenzia_id", profilo.agenziaId).select("id").maybeSingle();
  revalidatePath("/utenti");
  return { successo: !error && Boolean(data), messaggio: error || !data ? "Non è stato possibile modificare l’utente" : undefined };
}
