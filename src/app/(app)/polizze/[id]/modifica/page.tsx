import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

import { ModuloPolizza } from "@/components/modulo-polizza";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { creaClientSupabaseServer } from "@/lib/supabase/server";
import { tipiPolizza } from "@/lib/validazioni";

export const metadata: Metadata = { title: "Modifica polizza" };

export default async function ModificaPolizza({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const supabase = await creaClientSupabaseServer();
  const [{ data: polizza }, { data: clienti }, { data: compagnie }] = await Promise.all([
    supabase.from("polizze").select("cliente_id,compagnia_id,tipo,data_scadenza,numero_polizza,targa,premio,note").eq("id", id).maybeSingle(),
    supabase.from("clienti").select("id,nome,cognome").order("cognome"),
    supabase.from("compagnie").select("id,nome,attiva").order("nome"),
  ]);

  if (!polizza || !tipiPolizza.includes(polizza.tipo as typeof tipiPolizza[number])) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href={`/polizze/${id}`}><ArrowLeft aria-hidden="true" /> Torna alla polizza</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Modifica polizza</CardTitle>
          <CardDescription>Aggiorna i dati e salva le modifiche.</CardDescription>
        </CardHeader>
        <CardContent>
          <ModuloPolizza
            modalita="modifica"
            idPolizza={id}
            clienti={(clienti ?? []).map((cliente) => ({ id: cliente.id, nome: `${cliente.cognome} ${cliente.nome}` }))}
            compagnie={(compagnie ?? []).map((compagnia) => ({ id: compagnia.id, nome: `${compagnia.nome}${compagnia.attiva ? "" : " (non attiva)"}` }))}
            valoriIniziali={{
              clienteId: polizza.cliente_id,
              compagniaId: polizza.compagnia_id,
              tipo: polizza.tipo as typeof tipiPolizza[number],
              dataScadenza: polizza.data_scadenza,
              numeroPolizza: polizza.numero_polizza ?? "",
              targa: polizza.targa ?? "",
              premio: polizza.premio === null ? "" : String(polizza.premio),
              note: polizza.note ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
