import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { creaClientSupabaseServer } from "@/lib/supabase/server";

function emailProprietarioConfigurata() {
  return process.env.PIATTAFORMA_PROPRIETARIO_EMAIL?.trim().toLowerCase() || null;
}

export function emailAutorizzataPiattaforma(email: string | null | undefined) {
  const proprietario = emailProprietarioConfigurata();
  return Boolean(proprietario && email?.trim().toLowerCase() === proprietario);
}

export const trovaProprietarioPiattaforma = cache(async () => {
  const supabase = await creaClientSupabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user || !emailAutorizzataPiattaforma(data.user.email)) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email!,
  };
});

export async function richiediProprietarioPiattaforma() {
  const proprietario = await trovaProprietarioPiattaforma();

  if (!proprietario) {
    redirect("/dashboard");
  }

  return proprietario;
}

export type ProfiloCorrente = {
  id: string;
  agenziaId: string;
  nome: string;
  cognome: string;
  ruolo: "amministratore" | "collaboratore";
  agenzia: {
    id: string;
    nome: string;
    attiva: boolean;
    telefono: string | null;
    messaggioWhatsapp: string | null;
    firmaWhatsapp: string | null;
  };
};

export const trovaProfiloCorrente = cache(async (): Promise<ProfiloCorrente | null> => {
  const supabase = await creaClientSupabaseServer();
  const { data: datiIdentita, error: erroreIdentita } =
    await supabase.auth.getUser();
  const idUtente = datiIdentita.user?.id;

  if (erroreIdentita || typeof idUtente !== "string") {
    return null;
  }

  const { data: utente, error: erroreUtente } = await supabase
    .from("utenti")
    .select("id, agenzia_id, nome, cognome, ruolo, attivo")
    .eq("id", idUtente)
    .eq("attivo", true)
    .maybeSingle();

  if (erroreUtente || !utente) {
    return null;
  }

  const { data: agenzia, error: erroreAgenzia } = await supabase
    .from("agenzie")
    .select("id, nome, attiva, telefono, messaggio_whatsapp, firma_whatsapp")
    .eq("id", utente.agenzia_id)
    .eq("attiva", true)
    .maybeSingle();

  if (erroreAgenzia || !agenzia) {
    return null;
  }

  if (utente.ruolo !== "amministratore" && utente.ruolo !== "collaboratore") {
    return null;
  }

  return {
    id: utente.id,
    agenziaId: utente.agenzia_id,
    nome: utente.nome,
    cognome: utente.cognome,
    ruolo: utente.ruolo,
    agenzia: {
      id: agenzia.id,
      nome: agenzia.nome,
      attiva: agenzia.attiva,
      telefono: agenzia.telefono,
      messaggioWhatsapp: agenzia.messaggio_whatsapp,
      firmaWhatsapp: agenzia.firma_whatsapp,
    },
  };
});

export async function richiediProfiloCorrente() {
  const profilo = await trovaProfiloCorrente();

  if (!profilo) {
    redirect("/login?motivo=accesso-non-autorizzato");
  }

  return profilo;
}

export async function richiediAmministratoreCorrente() {
  const profilo = await richiediProfiloCorrente();

  if (profilo.ruolo !== "amministratore") {
    redirect("/dashboard");
  }

  return profilo;
}
