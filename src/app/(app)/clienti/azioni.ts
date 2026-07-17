"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { richiediProfiloCorrente } from "@/lib/autenticazione";
import { normalizzaTelefono } from "@/lib/scadenze";
import { creaClientSupabaseServer } from "@/lib/supabase/server";
import { schemaCliente, type DatiCliente } from "@/lib/validazioni";

export type EsitoCliente = {
  successo: boolean;
  id?: string;
  messaggio?: string;
  codice?: string;
  errori?: Record<string, string[]>;
};

function datiDatabaseCliente(dati: DatiCliente, telefono: string) {
  return {
    nome: dati.nome,
    cognome: dati.cognome,
    telefono,
    email: dati.email || null,
    note: dati.note || null,
  };
}

export async function creaCliente(dati: DatiCliente): Promise<EsitoCliente> {
  const profilo = await richiediProfiloCorrente();
  const validazione = schemaCliente.safeParse(dati);

  if (!validazione.success) {
    return {
      successo: false,
      errori: validazione.error.flatten().fieldErrors,
    };
  }

  const telefono = normalizzaTelefono(validazione.data.telefono);
  if (!/^\+?[0-9]{8,15}$/.test(telefono)) {
    return {
      successo: false,
      errori: { telefono: ["Inserisci un numero di telefono valido"] },
    };
  }

  const supabase = await creaClientSupabaseServer();
  const { data: cliente, error } = await supabase
    .from("clienti")
    .insert({
      agenzia_id: profilo.agenziaId,
      ...datiDatabaseCliente(validazione.data, telefono),
    })
    .select("id")
    .single();

  if (error || !cliente) {
    return {
      successo: false,
      messaggio: "Non è stato possibile salvare il cliente. Riprova tra poco",
    };
  }

  revalidatePath("/clienti");
  revalidatePath("/dashboard");
  return { successo: true, id: cliente.id };
}

export async function modificaCliente(id: string, dati: DatiCliente): Promise<EsitoCliente> {
  await richiediProfiloCorrente();
  if (!z.string().uuid().safeParse(id).success) return { successo: false, messaggio: "Cliente non valido" };

  const validazione = schemaCliente.safeParse(dati);
  if (!validazione.success) return { successo: false, errori: validazione.error.flatten().fieldErrors };

  const telefono = normalizzaTelefono(validazione.data.telefono);
  if (!/^\+?[0-9]{8,15}$/.test(telefono)) {
    return { successo: false, errori: { telefono: ["Inserisci un numero di telefono valido"] } };
  }

  const supabase = await creaClientSupabaseServer();
  const { data, error } = await supabase.from("clienti")
    .update(datiDatabaseCliente(validazione.data, telefono))
    .eq("id", id).select("id").maybeSingle();

  if (error) return { successo: false, codice: error.code, messaggio: "Non è stato possibile modificare il cliente" };
  if (!data) return { successo: false, messaggio: "Cliente non trovato o non accessibile" };

  revalidatePath("/clienti");
  revalidatePath(`/clienti/${id}`);
  revalidatePath("/dashboard");
  return { successo: true, id };
}

export async function eliminaCliente(id: string): Promise<EsitoCliente> {
  await richiediProfiloCorrente();
  if (!z.string().uuid().safeParse(id).success) return { successo: false, messaggio: "Cliente non valido" };

  const supabase = await creaClientSupabaseServer();
  const { data, error } = await supabase.from("clienti").delete().eq("id", id).select("id").maybeSingle();
  if (error) return { successo: false, codice: error.code, messaggio: error.message };
  if (!data) return { successo: false, messaggio: "Cliente non trovato o non accessibile" };

  revalidatePath("/clienti");
  revalidatePath("/dashboard");
  return { successo: true };
}
