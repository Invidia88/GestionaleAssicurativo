import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

import { ModuloRinnovoPolizza } from "@/components/modulo-rinnovo-polizza";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formattaDataItaliana } from "@/lib/scadenze";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Rinnova polizza" };

export default async function RinnovaPolizza({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const supabase = await creaClientSupabaseServer();
  const { data: polizza } = await supabase
    .from("polizze")
    .select("cliente_id,compagnia_id,tipo,data_scadenza,numero_polizza,premio,note,stato")
    .eq("id", id)
    .maybeSingle();
  if (!polizza) notFound();
  if (polizza.stato !== "attiva") redirect(`/polizze/${id}`);

  const [{ data: cliente }, { data: compagnia }] = await Promise.all([
    supabase.from("clienti").select("nome,cognome").eq("id", polizza.cliente_id).single(),
    supabase.from("compagnie").select("nome").eq("id", polizza.compagnia_id).single(),
  ]);
  if (!cliente || !compagnia) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href={`/polizze/${id}`}><ArrowLeft aria-hidden="true" /> Torna alla polizza</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Rinnova polizza {polizza.tipo}</CardTitle>
          <CardDescription>
            {cliente.nome} {cliente.cognome} · {compagnia.nome} · scadenza attuale {formattaDataItaliana(polizza.data_scadenza)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModuloRinnovoPolizza
            id={id}
            scadenzaAttuale={polizza.data_scadenza}
            numeroPolizza={polizza.numero_polizza}
            premio={polizza.premio}
            note={polizza.note}
          />
        </CardContent>
      </Card>
    </div>
  );
}
