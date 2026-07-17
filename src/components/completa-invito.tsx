"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { leggiCallbackInvito } from "@/lib/invito-auth";
import { creaClientSupabaseBrowser } from "@/lib/supabase/client";

export function CompletaInvito() {
  const router = useRouter();
  const [errore, impostaErrore] = useState<string | null>(null);

  useEffect(() => {
    async function completa() {
      const callback = leggiCallbackInvito(window.location.href);

      if (callback.tipo === "assente" || callback.tipo === "errore") {
        impostaErrore(
          "Il collegamento non è valido o è già stato utilizzato. Richiedi un nuovo invito.",
        );
        return;
      }

      const supabase = creaClientSupabaseBrowser();
      let erroreAutenticazione: { message: string } | null = null;

      if (callback.tipo === "sessione") {
        const { error } = await supabase.auth.setSession({
          access_token: callback.accessToken,
          refresh_token: callback.refreshToken,
        });
        erroreAutenticazione = error;
      } else if (callback.tipo === "token") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: callback.tokenHash,
          type: "invite",
        });
        erroreAutenticazione = error;
      } else {
        const { error } = await supabase.auth.exchangeCodeForSession(
          callback.codice,
        );
        erroreAutenticazione = error;
      }

      if (erroreAutenticazione) {
        impostaErrore(
          "Il collegamento non è più valido. Chiedi all’amministratore di inviarne uno nuovo.",
        );
        return;
      }

      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname,
      );
      router.replace("/aggiorna-password");
      router.refresh();
    }

    void completa();
  }, [router]);

  if (errore) {
    return (
      <div className="space-y-5" aria-live="polite">
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Invito non completato</AlertTitle>
          <AlertDescription>{errore}</AlertDescription>
        </Alert>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">Torna al login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-28 flex-col items-center justify-center gap-4 text-center"
      aria-live="polite"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
      </span>
      <div>
        <p className="font-medium">Prepariamo il tuo accesso</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tra poco potrai scegliere la tua password.
        </p>
      </div>
    </div>
  );
}
