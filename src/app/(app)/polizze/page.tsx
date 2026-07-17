import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { BadgeScadenza } from "@/components/badge-scadenza";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calcolaStatoScadenza, formattaDataItaliana, type StatoPolizza } from "@/lib/scadenze";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Polizze" };
export default async function Polizze({ searchParams }: { searchParams: Promise<{ cerca?: string; scadenza?: string }> }) {
  const filtri = await searchParams;
  const supabase = await creaClientSupabaseServer();
  const [p, c, a] = await Promise.all([
    supabase.from("polizze").select("id,cliente_id,compagnia_id,tipo,data_scadenza,stato").order("data_scadenza"),
    supabase.from("clienti").select("id,nome,cognome"),
    supabase.from("compagnie").select("id,nome"),
  ]);
  const clienti = new Map((c.data ?? []).map((x) => [x.id, `${x.nome} ${x.cognome}`]));
  const compagnie = new Map((a.data ?? []).map((x) => [x.id, x.nome]));
  const cerca = filtri.cerca?.trim().toLocaleLowerCase("it") ?? "";
  const righe = (p.data ?? []).map((x) => ({ ...x, cliente: clienti.get(x.cliente_id) ?? "Cliente", compagnia: compagnie.get(x.compagnia_id) ?? "Compagnia", scadenza: calcolaStatoScadenza(x.data_scadenza, x.stato as StatoPolizza) })).filter((x) => (!cerca || `${x.cliente} ${x.tipo} ${x.compagnia}`.toLocaleLowerCase("it").includes(cerca)) && (!filtri.scadenza || filtri.scadenza === "tutte" || x.scadenza.categoria === filtri.scadenza));

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Polizze</h1><p className="mt-1 text-muted-foreground">Controlla le scadenze e registra una nuova polizza.</p></div><Button size="lg" className="h-11" asChild><Link href="/polizze/nuova"><Plus aria-hidden="true" />Nuova polizza</Link></Button></div>
    <form className="grid gap-2 sm:grid-cols-[minmax(0,28rem)_12rem_auto]"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input name="cerca" defaultValue={filtri.cerca} className="h-11 pl-9" placeholder="Cliente, tipo o compagnia" /></div><select name="scadenza" defaultValue={filtri.scadenza ?? "tutte"} className="h-11 rounded-lg border bg-background px-3 text-sm"><option value="tutte">Tutte</option><option value="scaduta">Scadute</option><option value="oggi">Oggi</option><option value="sette">Entro 7 giorni</option><option value="trenta">Entro 30 giorni</option></select><Button type="submit" variant="secondary" className="h-11">Filtra</Button></form>
    <Card><CardContent><div className="hidden md:block"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Tipo</TableHead><TableHead>Compagnia</TableHead><TableHead>Scadenza</TableHead><TableHead>Stato</TableHead><TableHead className="text-right">Azioni</TableHead></TableRow></TableHeader><TableBody>{righe.map((x) => <TableRow key={x.id}><TableCell className="font-medium">{x.cliente}</TableCell><TableCell>{x.tipo}</TableCell><TableCell>{x.compagnia}</TableCell><TableCell className="font-mono text-sm">{formattaDataItaliana(x.data_scadenza)}</TableCell><TableCell><BadgeScadenza stato={x.scadenza} /></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" asChild><Link href={`/polizze/${x.id}`}>Dettagli</Link></Button></TableCell></TableRow>)}</TableBody></Table></div><div className="space-y-3 md:hidden">{righe.map((x) => <article key={x.id} className="space-y-3 rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-medium">{x.cliente}</h2><p className="text-sm text-muted-foreground">{x.tipo} · {x.compagnia}</p></div><BadgeScadenza stato={x.scadenza} /></div><p className="font-mono text-sm">{formattaDataItaliana(x.data_scadenza)}</p><Button variant="secondary" className="w-full" asChild><Link href={`/polizze/${x.id}`}>Dettagli</Link></Button></article>)}</div>{!righe.length ? <p className="py-16 text-center text-sm text-muted-foreground">Nessuna polizza trovata.</p> : null}</CardContent></Card>
  </div>;
}
