import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone, Plus } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { AzioniCliente } from "@/components/azioni-cliente";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { creaLinkWhatsapp, formattaDataItaliana } from "@/lib/scadenze";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dettaglio cliente" };

type DettaglioProps = { params: Promise<{ id: string }> };

export default async function DettaglioCliente({ params }: DettaglioProps) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const supabase = await creaClientSupabaseServer();
  const [{ data: cliente }, { data: polizze }] = await Promise.all([
    supabase.from("clienti").select("nome,cognome,telefono,email,note").eq("id", id).maybeSingle(),
    supabase.from("polizze").select("id,tipo,data_scadenza,stato").eq("cliente_id", id).order("data_scadenza", { ascending: true }),
  ]);
  if (!cliente) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href="/clienti"><ArrowLeft aria-hidden="true" /> Torna ai clienti</Link>
      </Button>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Cliente</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{cliente.nome} {cliente.cognome}</h1>
        </div>
        <div className="flex flex-wrap gap-2"><AzioniCliente id={id} nome={`${cliente.nome} ${cliente.cognome}`} /><Button size="lg" className="h-10" asChild><Link href={`/polizze/nuova?cliente=${id}`}><Plus aria-hidden="true" /> Aggiungi polizza</Link></Button></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)]">
        <Card>
          <CardHeader><CardTitle>Contatti</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3"><Phone className="size-4 text-muted-foreground" aria-hidden="true" /><a href={`tel:${cliente.telefono}`} className="font-mono hover:underline">{cliente.telefono}</a></div>
            {cliente.email ? <div className="flex items-center gap-3"><Mail className="size-4 text-muted-foreground" aria-hidden="true" /><a href={`mailto:${cliente.email}`} className="hover:underline">{cliente.email}</a></div> : null}
            <Button variant="outline" asChild><a href={creaLinkWhatsapp(cliente.telefono, "Buongiorno")} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> Apri WhatsApp</a></Button>
            {cliente.note ? <><Separator /><div><p className="mb-1 text-sm font-medium">Note</p><p className="whitespace-pre-wrap text-sm text-muted-foreground">{cliente.note}</p></div></> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Polizze ({polizze?.length ?? 0})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(polizze ?? []).map((polizza) => (
              <Link key={polizza.id} href={`/polizze/${polizza.id}`} className="block rounded-lg border p-3 transition-colors hover:bg-muted">
                <div className="flex items-center justify-between gap-3"><span className="font-medium">{polizza.tipo}</span><span className="text-xs capitalize text-muted-foreground">{polizza.stato}</span></div>
                <p className="mt-1 font-mono text-sm text-muted-foreground">{formattaDataItaliana(polizza.data_scadenza)}</p>
              </Link>
            ))}
            {!polizze?.length ? <p className="text-sm text-muted-foreground">Nessuna polizza registrata.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
