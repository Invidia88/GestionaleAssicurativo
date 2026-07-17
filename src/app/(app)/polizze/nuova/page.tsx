import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ModuloPolizza } from "@/components/modulo-polizza";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nuova polizza" };
export default async function NuovaPolizza({ searchParams }: { searchParams: Promise<{ cliente?: string }> }) {
  const { cliente = "" } = await searchParams;
  const supabase = await creaClientSupabaseServer();
  const [c, a] = await Promise.all([
    supabase.from("clienti").select("id,nome,cognome").order("cognome"),
    supabase.from("compagnie").select("id,nome").eq("attiva", true).order("nome"),
  ]);
  return <div className="mx-auto max-w-3xl space-y-6"><Button variant="ghost" asChild className="-ml-2"><Link href="/polizze"><ArrowLeft aria-hidden="true" />Torna alle polizze</Link></Button><Card><CardHeader><CardTitle className="text-2xl">Nuova polizza</CardTitle><CardDescription>Inserisci prima i quattro dati essenziali.</CardDescription></CardHeader><CardContent><ModuloPolizza clienteIniziale={cliente} clienti={(c.data ?? []).map((x) => ({ id: x.id, nome: `${x.cognome} ${x.nome}` }))} compagnie={a.data ?? []} /></CardContent></Card></div>;
}
