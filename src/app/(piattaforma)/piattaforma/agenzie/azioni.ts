"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { richiediProprietarioPiattaforma } from "@/lib/autenticazione";
import { normalizzaTelefono } from "@/lib/scadenze";
import { creaClientSupabaseAmministratore } from "@/lib/supabase/amministratore";
import { ottieniUrlSito } from "@/lib/url-sito";
import {
  schemaNuovaAgenzia,
  type DatiNuovaAgenzia,
} from "@/lib/validazioni";

export async function creaAgenzia(dati: DatiNuovaAgenzia) {
  await richiediProprietarioPiattaforma();

  const validazione = schemaNuovaAgenzia.safeParse(dati);
  if (!validazione.success) {
    return {
      successo: false,
      errori: validazione.error.flatten().fieldErrors,
    };
  }

  const amministratore = creaClientSupabaseAmministratore();
  const valori = validazione.data;
  const emailAmministratore = valori.emailAmministratore.toLowerCase();
  const { data: invito, error: erroreInvito } =
    await amministratore.auth.admin.inviteUserByEmail(emailAmministratore, {
      redirectTo: `${ottieniUrlSito()}/auth/invito`,
      data: {
        nome: valori.nomeAmministratore,
        cognome: valori.cognomeAmministratore,
      },
    });

  if (erroreInvito || !invito.user) {
    return {
      successo: false,
      messaggio: erroreInvito?.message.toLowerCase().includes("already")
        ? "Esiste già un account con l’email dell’amministratore"
        : "Non è stato possibile inviare l’invito. Riprova tra poco",
    };
  }

  const telefono = valori.telefonoAgenzia
    ? normalizzaTelefono(valori.telefonoAgenzia)
    : "";
  const { error: erroreCreazione } = await amministratore.rpc(
    "crea_agenzia_con_amministratore",
    {
      p_utente_id: invito.user.id,
      p_nome_agenzia: valori.nomeAgenzia,
      p_email_agenzia: valori.emailAgenzia,
      p_telefono_agenzia: telefono,
      p_nome_amministratore: valori.nomeAmministratore,
      p_cognome_amministratore: valori.cognomeAmministratore,
    },
  );

  if (erroreCreazione) {
    await amministratore.auth.admin.deleteUser(invito.user.id);
    return {
      successo: false,
      messaggio:
        "L’agenzia non è stata creata e l’invito è stato annullato. Riprova",
    };
  }

  revalidatePath("/piattaforma/agenzie");
  return { successo: true };
}

export async function impostaAgenziaAttiva(id: string, attiva: boolean) {
  await richiediProprietarioPiattaforma();

  if (
    !z.string().uuid().safeParse(id).success ||
    !z.boolean().safeParse(attiva).success
  ) {
    return { successo: false, messaggio: "Agenzia non valida" };
  }

  const amministratore = creaClientSupabaseAmministratore();
  const { data, error } = await amministratore
    .from("agenzie")
    .update({ attiva })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      successo: false,
      messaggio: "Non è stato possibile aggiornare l’agenzia",
    };
  }

  revalidatePath("/piattaforma/agenzie");
  return { successo: true };
}
