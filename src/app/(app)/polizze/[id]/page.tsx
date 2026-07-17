import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { z } from "zod";

import { BadgeScadenza } from "@/components/badge-scadenza";
import { AzioniPolizza } from "@/components/azioni-polizza";
import { RegistraContatto } from "@/components/registra-contatto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { richiediProfiloCorrente } from "@/lib/autenticazione";
import { calcolaStatoScadenza, creaLinkWhatsapp, creaMessaggioWhatsapp, formattaDataItaliana, type StatoPolizza } from "@/lib/scadenze";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dettaglio polizza" };
export default async function DettaglioPolizza({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; if (!z.string().uuid().safeParse(id).success) notFound();
  const [profilo, supabase] = await Promise.all([richiediProfiloCorrente(), creaClientSupabaseServer()]);
  const { data: p } = await supabase.from("polizze").select("*").eq("id", id).maybeSingle(); if (!p) notFound();
  const [c, a] = await Promise.all([supabase.from("clienti").select("nome,cognome,telefono,email").eq("id", p.cliente_id).single(), supabase.from("compagnie").select("nome,sito_web").eq("id", p.compagnia_id).single()]); if (!c.data || !a.data) notFound();
  const stato = calcolaStatoScadenza(p.data_scadenza, p.stato as StatoPolizza);
  const messaggio = creaMessaggioWhatsapp(profilo.agenzia.messaggioWhatsapp, { nomeCliente: c.data.nome, cognomeCliente: c.data.cognome, tipoPolizza: p.tipo, compagnia: a.data.nome, dataScadenza: p.data_scadenza, giorniMancanti: stato.giorni, nomeAgenzia: profilo.agenzia.nome, telefonoAgenzia: profilo.agenzia.telefono });
  return <div className="space-y-6"><Button variant="ghost" asChild className="-ml-2"><Link href="/polizze"><ArrowLeft aria-hidden="true" />Torna alle polizze</Link></Button><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-medium text-primary">{c.data.nome} {c.data.cognome}</p><h1 className="text-3xl font-semibold tracking-tight">Polizza {p.tipo}</h1></div><div className="flex flex-col items-start gap-3 lg:items-end"><BadgeScadenza stato={stato} /><AzioniPolizza id={id} nome={`${p.tipo} di ${c.data.nome} ${c.data.cognome}`} stato={p.stato as StatoPolizza} /></div></div><div className="grid gap-6 lg:grid-cols-2"><Card className="border-border/70 shadow-sm"><CardHeader><CardTitle>Dati principali</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Dato nome="Compagnia" valore={a.data.nome} /><Dato nome="Scadenza" valore={formattaDataItaliana(p.data_scadenza)} /><Dato nome="Numero polizza" valore={p.numero_polizza} /><Dato nome="Targa" valore={p.targa} /><Dato nome="Premio" valore={p.premio !== null ? `€ ${Number(p.premio).toFixed(2)}` : null} /><Dato nome="Stato archivio" valore={p.stato} /></CardContent></Card><Card className="border-border/70 shadow-sm"><CardHeader><CardTitle>Contatta il cliente</CardTitle></CardHeader><CardContent className="space-y-4"><p className="font-mono text-sm">{c.data.telefono}</p><Button className="h-11 w-full" asChild><a href={creaLinkWhatsapp(c.data.telefono, messaggio)} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />Apri WhatsApp</a></Button><RegistraContatto clienteId={p.cliente_id} polizzaId={id} messaggio={messaggio} />{p.note ? <p className="whitespace-pre-wrap text-sm text-muted-foreground">{p.note}</p> : null}</CardContent></Card></div></div>;
}
function Dato({ nome, valore }: { nome: string; valore: string | null }) { return <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{nome}</p><p className="mt-1">{valore || "—"}</p></div>; }
