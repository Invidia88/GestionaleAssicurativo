"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { creaClientSupabaseServer } from "@/lib/supabase/server";

export type StatoAutenticazione = {
  messaggio?: string;
  successo?: boolean;
  errori?: {
    email?: string[];
    password?: string[];
    confermaPassword?: string[];
  };
};

const schemaAccesso = z.object({
  email: z.string().trim().email("Inserisci un indirizzo email valido"),
  password: z.string().min(1, "Inserisci la password"),
});

const schemaRecupero = z.object({
  email: z.string().trim().email("Inserisci un indirizzo email valido"),
});

const schemaNuovaPassword = z
  .object({
    password: z
      .string()
      .min(8, "La password deve contenere almeno 8 caratteri"),
    confermaPassword: z.string(),
  })
  .refine((valori) => valori.password === valori.confermaPassword, {
    path: ["confermaPassword"],
    message: "Le password non coincidono",
  });

function erroriCampi(errore: z.ZodError): StatoAutenticazione["errori"] {
  return errore.flatten().fieldErrors;
}

function urlPubblico() {
  const configurato = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configurato) {
    return configurato.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}

export async function accedi(
  _stato: StatoAutenticazione,
  modulo: FormData,
): Promise<StatoAutenticazione> {
  const validazione = schemaAccesso.safeParse({
    email: modulo.get("email"),
    password: modulo.get("password"),
  });

  if (!validazione.success) {
    return { errori: erroriCampi(validazione.error) };
  }

  const supabase = await creaClientSupabaseServer();
  const { data: datiAccesso, error: erroreAccesso } =
    await supabase.auth.signInWithPassword(validazione.data);

  if (erroreAccesso) {
    const messaggio =
      erroreAccesso.code === "email_not_confirmed"
        ? "Conferma prima il tuo indirizzo email"
        : "Email o password non corrette";
    return { messaggio };
  }

  const { data: profilo } = await supabase
    .from("utenti")
    .select("id")
    .eq("id", datiAccesso.user.id)
    .eq("attivo", true)
    .maybeSingle();

  if (!profilo) {
    await supabase.auth.signOut();
    return {
      messaggio: "L’account non è attivo oppure non è associato a un’agenzia",
    };
  }

  redirect("/dashboard");
}

export async function richiediRecuperoPassword(
  _stato: StatoAutenticazione,
  modulo: FormData,
): Promise<StatoAutenticazione> {
  const validazione = schemaRecupero.safeParse({ email: modulo.get("email") });

  if (!validazione.success) {
    return { errori: erroriCampi(validazione.error) };
  }

  const supabase = await creaClientSupabaseServer();
  const destinazione = `${urlPubblico()}/auth/conferma?successivo=/aggiorna-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(
    validazione.data.email,
    { redirectTo: destinazione },
  );

  if (error?.code === "over_email_send_rate_limit") {
    return {
      messaggio: "Sono state effettuate troppe richieste. Riprova tra qualche minuto",
    };
  }

  return {
    successo: true,
    messaggio:
      "Se l’indirizzo è registrato, riceverai un’email con le istruzioni",
  };
}

export async function aggiornaPassword(
  _stato: StatoAutenticazione,
  modulo: FormData,
): Promise<StatoAutenticazione> {
  const validazione = schemaNuovaPassword.safeParse({
    password: modulo.get("password"),
    confermaPassword: modulo.get("confermaPassword"),
  });

  if (!validazione.success) {
    return { errori: erroriCampi(validazione.error) };
  }

  const supabase = await creaClientSupabaseServer();
  const { error } = await supabase.auth.updateUser({
    password: validazione.data.password,
  });

  if (error) {
    return {
      messaggio:
        error.code === "same_password"
          ? "Scegli una password diversa da quella attuale"
          : "Il collegamento non è più valido. Richiedi una nuova email",
    };
  }

  await supabase.auth.signOut();
  redirect("/login?esito=password-aggiornata");
}
