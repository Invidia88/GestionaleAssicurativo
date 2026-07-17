import type { Metadata } from "next";
import { Building2, MessageCircleMore, Palette } from "lucide-react";
import { notFound } from "next/navigation";

import { ModuloImpostazioni } from "@/components/modulo-impostazioni";
import { SelettoreTema } from "@/components/selettore-tema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { richiediAmministratoreCorrente } from "@/lib/autenticazione";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Impostazioni" };

export default async function Impostazioni() {
  const profilo = await richiediAmministratoreCorrente();
  const supabase = await creaClientSupabaseServer();
  const { data: agenzia } = await supabase.from("agenzie").select("nome,email,telefono,firma_whatsapp,messaggio_whatsapp,giorni_preavviso").eq("id", profilo.agenziaId).maybeSingle();
  if (!agenzia) notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Configurazione</p>
        <h1 className="text-3xl font-semibold tracking-tight">Impostazioni agenzia</h1>
        <p className="mt-1 text-muted-foreground">
          Mantieni aggiornati i dati essenziali e personalizza l’aspetto dell’app.
        </p>
      </div>
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-5 text-primary" aria-hidden="true" /> Aspetto
          </CardTitle>
          <CardDescription>
            La scelta viene ricordata soltanto su questo dispositivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SelettoreTema />
        </CardContent>
      </Card>
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" aria-hidden="true" /> Dati e messaggi
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <MessageCircleMore className="size-4" aria-hidden="true" /> Le modifiche al messaggio
            saranno usate nelle nuove aperture WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModuloImpostazioni
            valori={{
              nome: agenzia.nome,
              email: agenzia.email,
              telefono: agenzia.telefono ?? "",
              firmaWhatsapp: agenzia.firma_whatsapp ?? "",
              messaggioWhatsapp:
                agenzia.messaggio_whatsapp ??
                "Buongiorno {{nome_cliente}}, ti ricordiamo che la tua polizza {{tipo_polizza}} scadrà il {{data_scadenza}}. Contattaci per ricevere il nuovo preventivo. {{nome_agenzia}}",
              giorniPreavviso: String(agenzia.giorni_preavviso),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
