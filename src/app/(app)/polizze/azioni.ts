"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { richiediProfiloCorrente } from "@/lib/autenticazione";
import { creaClientSupabaseServer } from "@/lib/supabase/server";
import {
  schemaPolizza,
  schemaRinnovoPolizza,
  type DatiPolizza,
  type DatiRinnovoPolizza,
} from "@/lib/validazioni";

export type EsitoPolizza = {
  successo: boolean;
  id?: string;
  messaggio?: string;
  codice?: string;
  errori?: Record<string, string[]>;
};

function datiDatabasePolizza(dati: DatiPolizza) {
  return {
    cliente_id: dati.clienteId,
    compagnia_id: dati.compagniaId,
    tipo: dati.tipo,
    data_scadenza: dati.dataScadenza,
    numero_polizza: dati.numeroPolizza || null,
    targa: dati.targa?.toUpperCase() || null,
    premio: dati.premio ? Number(dati.premio) : null,
    note: dati.note || null,
  };
}

function aggiornaPaginePolizze(id?: string) {
  revalidatePath("/polizze");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/polizze/${id}`);
}

export async function creaPolizza(dati: DatiPolizza): Promise<EsitoPolizza> {
  const profilo = await richiediProfiloCorrente();
  const validazione = schemaPolizza.safeParse(dati);
  if (!validazione.success) return { successo: false, errori: validazione.error.flatten().fieldErrors };

  const supabase = await creaClientSupabaseServer();
  const { data, error } = await supabase.from("polizze").insert({
    agenzia_id: profilo.agenziaId,
    ...datiDatabasePolizza(validazione.data),
  }).select("id").single();

  if (error || !data) return { successo: false, messaggio: "Non è stato possibile salvare la polizza" };
  aggiornaPaginePolizze(data.id);
  return { successo: true, id: data.id };
}

export async function modificaPolizza(id: string, dati: DatiPolizza): Promise<EsitoPolizza> {
  await richiediProfiloCorrente();
  if (!z.string().uuid().safeParse(id).success) {
    return { successo: false, messaggio: "La polizza indicata non è valida" };
  }

  const validazione = schemaPolizza.safeParse(dati);
  if (!validazione.success) {
    return { successo: false, errori: validazione.error.flatten().fieldErrors };
  }

  const supabase = await creaClientSupabaseServer();
  const { data, error } = await supabase
    .from("polizze")
    .update(datiDatabasePolizza(validazione.data))
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { successo: false, codice: error.code, messaggio: "Non è stato possibile modificare la polizza" };
  if (!data) return { successo: false, messaggio: "Polizza non trovata o non accessibile" };

  aggiornaPaginePolizze(id);
  return { successo: true, id };
}

export async function rinnovaPolizza(id: string, dati: DatiRinnovoPolizza): Promise<EsitoPolizza> {
  await richiediProfiloCorrente();
  if (!z.string().uuid().safeParse(id).success) {
    return { successo: false, messaggio: "La polizza indicata non è valida" };
  }

  const validazione = schemaRinnovoPolizza.safeParse(dati);
  if (!validazione.success) {
    return { successo: false, errori: validazione.error.flatten().fieldErrors };
  }

  const supabase = await creaClientSupabaseServer();
  const { data: polizza } = await supabase
    .from("polizze")
    .select("data_scadenza,stato")
    .eq("id", id)
    .maybeSingle();

  if (!polizza) return { successo: false, messaggio: "Polizza non trovata o non accessibile" };
  if (polizza.stato !== "attiva") return { successo: false, messaggio: "Puoi rinnovare soltanto una polizza attiva" };
  if (validazione.data.dataScadenza <= polizza.data_scadenza) {
    return { successo: false, errori: { dataScadenza: ["La nuova scadenza deve essere successiva alla precedente"] } };
  }

  const { data: nuovaPolizzaId, error } = await supabase.rpc("rinnova_polizza", {
    p_polizza_id: id,
    p_data_scadenza: validazione.data.dataScadenza,
    p_numero_polizza: validazione.data.numeroPolizza || null,
    p_premio: validazione.data.premio ? Number(validazione.data.premio) : null,
    p_note: validazione.data.note || null,
  });

  if (error || typeof nuovaPolizzaId !== "string") {
    const messaggio = error?.code === "23514"
      ? "La polizza non può essere rinnovata con questi dati"
      : "Non è stato possibile rinnovare la polizza";
    return { successo: false, codice: error?.code, messaggio };
  }

  aggiornaPaginePolizze(id);
  aggiornaPaginePolizze(nuovaPolizzaId);
  return { successo: true, id: nuovaPolizzaId };
}

export async function eliminaPolizza(id: string): Promise<EsitoPolizza> {
  await richiediProfiloCorrente();
  if (!z.string().uuid().safeParse(id).success) {
    return { successo: false, messaggio: "La polizza indicata non è valida" };
  }

  const supabase = await creaClientSupabaseServer();
  const { data, error } = await supabase
    .from("polizze")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { successo: false, codice: error.code, messaggio: error.message };
  if (!data) return { successo: false, messaggio: "Polizza non trovata o non accessibile" };

  aggiornaPaginePolizze(id);
  return { successo: true };
}
