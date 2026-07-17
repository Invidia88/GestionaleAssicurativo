import type { Metadata } from "next";
import { ContactRound, Filter, RotateCcw } from "lucide-react";
import Link from "next/link";

import { DettaglioContatto } from "@/components/dettaglio-contatto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contatti" };

const etichetteEsito: Record<string, string> = { contattato: "Contattato", nessuna_risposta: "Nessuna risposta", da_ricontattare: "Da ricontattare", numero_non_valido: "Numero non valido", preventivo_inviato: "Preventivo inviato" };
const etichetteTipo: Record<string, string> = { whatsapp: "WhatsApp", telefono: "Telefono", email: "Email", altro: "Altro" };

export default async function Contatti({ searchParams }: { searchParams: Promise<{ cliente?: string; esito?: string; dal?: string; al?: string }> }) {
  const filtri = await searchParams;
  const supabase = await creaClientSupabaseServer();
  let richiesta = supabase.from("contatti").select("id,cliente_id,polizza_id,utente_id,tipo_contatto,esito,messaggio,contattato_il,note").order("contattato_il", { ascending: false }).limit(300);
  if (filtri.cliente && filtri.cliente !== "tutti") richiesta = richiesta.eq("cliente_id", filtri.cliente);
  if (filtri.esito && filtri.esito !== "tutti") richiesta = richiesta.eq("esito", filtri.esito);
  if (filtri.dal) richiesta = richiesta.gte("contattato_il", `${filtri.dal}T00:00:00+02:00`);
  if (filtri.al) richiesta = richiesta.lte("contattato_il", `${filtri.al}T23:59:59+02:00`);

  const [{ data: contatti }, { data: clienti }, { data: polizze }, { data: utenti }] = await Promise.all([
    richiesta,
    supabase.from("clienti").select("id,nome,cognome").order("cognome"),
    supabase.from("polizze").select("id,tipo,numero_polizza"),
    supabase.from("utenti").select("id,nome,cognome"),
  ]);
  const mClienti = new Map((clienti ?? []).map((x) => [x.id, `${x.nome} ${x.cognome}`]));
  const mPolizze = new Map((polizze ?? []).map((x) => [x.id, `${x.tipo}${x.numero_polizza ? ` · ${x.numero_polizza}` : ""}`]));
  const mUtenti = new Map((utenti ?? []).map((x) => [x.id, `${x.nome} ${x.cognome}`]));

  return <div className="space-y-6">
    <div><p className="text-sm font-medium text-primary">Relazioni clienti</p><h1 className="text-3xl font-semibold tracking-tight">Storico contatti</h1><p className="mt-1 text-muted-foreground">Ritrova rapidamente chi è stato contattato e con quale esito.</p></div>
    <Card className="border-border/70 shadow-sm"><CardContent className="pt-6"><form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_auto_auto]">
      <div className="space-y-2"><Label>Cliente</Label><Select name="cliente" defaultValue={filtri.cliente ?? "tutti"}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tutti">Tutti i clienti</SelectItem>{(clienti ?? []).map((x) => <SelectItem key={x.id} value={x.id}>{x.cognome} {x.nome}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label>Esito</Label><Select name="esito" defaultValue={filtri.esito ?? "tutti"}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tutti">Tutti gli esiti</SelectItem>{Object.entries(etichetteEsito).map(([v, e]) => <SelectItem key={v} value={v}>{e}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="dal">Dal</Label><Input id="dal" name="dal" type="date" defaultValue={filtri.dal} /></div>
      <div className="space-y-2"><Label htmlFor="al">Al</Label><Input id="al" name="al" type="date" defaultValue={filtri.al} /></div>
      <Button type="submit" className="self-end"><Filter aria-hidden="true" /> Filtra</Button><Button variant="ghost" className="self-end" asChild><Link href="/contatti"><RotateCcw aria-hidden="true" /> Azzera</Link></Button>
    </form></CardContent></Card>
    <Card className="border-border/70 shadow-sm"><CardContent>
      {!contatti?.length ? <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ContactRound aria-hidden="true" /></span><div><p className="font-medium">Nessun contatto trovato</p><p className="text-sm text-muted-foreground">Registra un contatto dalla pagina di una polizza.</p></div></div> : null}
      <div className="hidden md:block"><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Cliente</TableHead><TableHead>Polizza</TableHead><TableHead>Tipo</TableHead><TableHead>Esito</TableHead><TableHead>Operatore</TableHead><TableHead className="text-right">Azioni</TableHead></TableRow></TableHeader><TableBody>{(contatti ?? []).map((x) => { const cliente = mClienti.get(x.cliente_id) ?? "Cliente"; return <TableRow key={x.id}><TableCell className="font-mono text-xs">{formattaDataOra(x.contattato_il)}</TableCell><TableCell className="font-medium">{cliente}</TableCell><TableCell>{x.polizza_id ? mPolizze.get(x.polizza_id) ?? "Polizza rimossa" : "Polizza rimossa"}</TableCell><TableCell>{etichetteTipo[x.tipo_contatto] ?? x.tipo_contatto}</TableCell><TableCell><Badge variant="secondary">{etichetteEsito[x.esito] ?? x.esito}</Badge></TableCell><TableCell>{mUtenti.get(x.utente_id) ?? "Operatore"}</TableCell><TableCell className="text-right"><DettaglioContatto cliente={cliente} messaggio={x.messaggio} note={x.note} /></TableCell></TableRow>; })}</TableBody></Table></div>
      <div className="space-y-3 md:hidden">{(contatti ?? []).map((x) => { const cliente = mClienti.get(x.cliente_id) ?? "Cliente"; return <article key={x.id} className="rounded-2xl border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{cliente}</p><p className="mt-1 text-sm text-muted-foreground">{formattaDataOra(x.contattato_il)}</p></div><Badge variant="secondary">{etichetteEsito[x.esito] ?? x.esito}</Badge></div><p className="mt-3 text-sm">{x.polizza_id ? mPolizze.get(x.polizza_id) ?? "Polizza rimossa" : "Polizza rimossa"} · {etichetteTipo[x.tipo_contatto] ?? x.tipo_contatto}</p><div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">{mUtenti.get(x.utente_id) ?? "Operatore"}</span><DettaglioContatto cliente={cliente} messaggio={x.messaggio} note={x.note} /></div></article>; })}</div>
    </CardContent></Card>
  </div>;
}

function formattaDataOra(valore: string) { return new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" }).format(new Date(valore)); }
