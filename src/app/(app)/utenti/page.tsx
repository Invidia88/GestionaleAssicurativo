import type { Metadata } from "next";
import { UserRoundPlus, UsersRound } from "lucide-react";

import { AzioniUtente } from "@/components/azioni-utente";
import { ModuloInvitoUtente } from "@/components/modulo-invito-utente";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { richiediAmministratoreCorrente } from "@/lib/autenticazione";
import { creaClientSupabaseAmministratore } from "@/lib/supabase/amministratore";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Utenti" };

export default async function Utenti() {
  const profilo = await richiediAmministratoreCorrente();
  const [supabase, amministratore] = [await creaClientSupabaseServer(), creaClientSupabaseAmministratore()];
  const [{ data: utenti }, { data: auth }] = await Promise.all([supabase.from("utenti").select("id,nome,cognome,ruolo,attivo").order("cognome"), amministratore.auth.admin.listUsers({ page: 1, perPage: 1000 })]);
  const email = new Map((auth?.users ?? []).map((x) => [x.id, x.email ?? ""]));
  return <div className="space-y-6"><div><p className="text-sm font-medium text-primary">Amministrazione</p><h1 className="text-3xl font-semibold tracking-tight">Utenti dell’agenzia</h1><p className="mt-1 text-muted-foreground">Invita collaboratori e gestisci accessi e ruoli.</p></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]"><Card className="border-border/70 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><UsersRound className="size-5 text-primary" aria-hidden="true" /> Accessi attivi</CardTitle><CardDescription>Il tuo account non può essere disattivato da questa schermata.</CardDescription></CardHeader><CardContent><div className="hidden md:block"><Table><TableHeader><TableRow><TableHead>Utente</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Gestione</TableHead></TableRow></TableHeader><TableBody>{(utenti ?? []).map((x) => <TableRow key={x.id}><TableCell><p className="font-medium">{x.nome} {x.cognome}</p>{x.id === profilo.id ? <Badge variant="secondary" className="mt-1">Il tuo account</Badge> : null}</TableCell><TableCell>{email.get(x.id) || "—"}</TableCell><TableCell><AzioniUtente id={x.id} ruolo={x.ruolo} attivo={x.attivo} corrente={x.id === profilo.id} /></TableCell></TableRow>)}</TableBody></Table></div><div className="space-y-3 md:hidden">{(utenti ?? []).map((x) => <article key={x.id} className="space-y-3 rounded-2xl border p-4"><div><p className="font-medium">{x.nome} {x.cognome}</p><p className="text-sm text-muted-foreground">{email.get(x.id) || "Email non disponibile"}</p></div><AzioniUtente id={x.id} ruolo={x.ruolo} attivo={x.attivo} corrente={x.id === profilo.id} /></article>)}</div></CardContent></Card><Card className="h-fit border-border/70 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><UserRoundPlus className="size-5 text-primary" aria-hidden="true" /> Invita utente</CardTitle><CardDescription>Riceverà un’email per impostare la password.</CardDescription></CardHeader><CardContent><ModuloInvitoUtente /></CardContent></Card></div></div>;
}
