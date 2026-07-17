"use server";

import { revalidatePath } from "next/cache";

import { richiediProfiloCorrente } from "@/lib/autenticazione";
import { creaClientSupabaseServer } from "@/lib/supabase/server";
import { schemaContatto, type DatiContatto } from "@/lib/validazioni";

export async function registraContatto(dati: DatiContatto) {
  const profilo = await richiediProfiloCorrente();
  const validazione = schemaContatto.safeParse(dati);
  if (!validazione.success) return { successo: false, errori: validazione.error.flatten().fieldErrors };

  const supabase = await creaClientSupabaseServer();
  const { error } = await supabase.from("contatti").insert({
    agenzia_id: profilo.agenziaId,
    cliente_id: validazione.data.clienteId,
    polizza_id: validazione.data.polizzaId ?? null,
    utente_id: profilo.id,
    tipo_contatto: validazione.data.tipoContatto,
    esito: validazione.data.esito,
    messaggio: validazione.data.messaggio || null,
    note: validazione.data.note || null,
  });

  if (error) return { successo: false, messaggio: "Non è stato possibile registrare il contatto" };
  revalidatePath("/contatti");
  if (validazione.data.polizzaId) revalidatePath(`/polizze/${validazione.data.polizzaId}`);
  return { successo: true };
}
