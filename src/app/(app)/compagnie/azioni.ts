"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { richiediProfiloCorrente } from "@/lib/autenticazione";
import { creaClientSupabaseServer } from "@/lib/supabase/server";
import { schemaCompagnia, type DatiCompagnia } from "@/lib/validazioni";

export type EsitoCompagnia = {
  successo: boolean;
  messaggio?: string;
  codice?: string;
  errori?: Record<string, string[]>;
};

export async function creaCompagnia(dati: DatiCompagnia): Promise<EsitoCompagnia> {
  const profilo = await richiediProfiloCorrente();
  const validazione = schemaCompagnia.safeParse(dati);
  if (!validazione.success) {
    return { successo: false, errori: validazione.error.flatten().fieldErrors };
  }

  const supabase = await creaClientSupabaseServer();
  const { error } = await supabase.from("compagnie").insert({
    agenzia_id: profilo.agenziaId,
    nome: validazione.data.nome,
    sito_web: validazione.data.sitoWeb || null,
    attiva: true,
  });

  if (error) {
    return {
      successo: false,
      codice: error.code,
      messaggio:
        error.code === "23505"
          ? "Esiste già una compagnia con questo nome"
          : "Non è stato possibile salvare la compagnia",
    };
  }

  revalidatePath("/compagnie");
  return { successo: true };
}

export async function impostaCompagniaAttiva(id: string, attiva: boolean) {
  await richiediProfiloCorrente();
  if (!z.string().uuid().safeParse(id).success) return { successo: false };
  const supabase = await creaClientSupabaseServer();
  const { error } = await supabase.from("compagnie").update({ attiva }).eq("id", id);
  revalidatePath("/compagnie");
  return { successo: !error };
}

export async function eliminaCompagnia(id: string): Promise<EsitoCompagnia> {
  await richiediProfiloCorrente();
  if (!z.string().uuid().safeParse(id).success) return { successo: false };
  const supabase = await creaClientSupabaseServer();
  const { error } = await supabase.from("compagnie").delete().eq("id", id);
  if (error) return { successo: false, codice: error.code, messaggio: error.message };
  revalidatePath("/compagnie");
  return { successo: true };
}
