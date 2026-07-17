"use server";

import { revalidatePath } from "next/cache";

import { richiediAmministratoreCorrente } from "@/lib/autenticazione";
import { normalizzaTelefono } from "@/lib/scadenze";
import { creaClientSupabaseServer } from "@/lib/supabase/server";
import { schemaImpostazioniAgenzia, type DatiImpostazioniAgenzia } from "@/lib/validazioni";

export async function salvaImpostazioniAgenzia(dati: DatiImpostazioniAgenzia) {
  const profilo = await richiediAmministratoreCorrente();
  const validazione = schemaImpostazioniAgenzia.safeParse(dati);
  if (!validazione.success) return { successo: false, errori: validazione.error.flatten().fieldErrors };
  const telefono = validazione.data.telefono ? normalizzaTelefono(validazione.data.telefono) : null;
  if (telefono && !/^\+?[0-9]{8,15}$/.test(telefono)) return { successo: false, errori: { telefono: ["Inserisci un numero di telefono valido"] } };
  const supabase = await creaClientSupabaseServer();
  const { data, error } = await supabase.from("agenzie").update({ nome: validazione.data.nome, email: validazione.data.email, telefono, firma_whatsapp: validazione.data.firmaWhatsapp || null, messaggio_whatsapp: validazione.data.messaggioWhatsapp, giorni_preavviso: Number(validazione.data.giorniPreavviso) }).eq("id", profilo.agenziaId).select("id").maybeSingle();
  if (error || !data) return { successo: false, messaggio: "Non è stato possibile salvare le impostazioni" };
  revalidatePath("/impostazioni"); revalidatePath("/dashboard", "layout");
  return { successo: true };
}
