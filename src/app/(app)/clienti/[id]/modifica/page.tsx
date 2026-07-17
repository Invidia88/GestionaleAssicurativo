import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

import { ModuloCliente } from "@/components/modulo-cliente";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Modifica cliente" };

export default async function ModificaCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const supabase = await creaClientSupabaseServer();
  const { data: cliente } = await supabase.from("clienti").select("nome,cognome,telefono,email,note").eq("id", id).maybeSingle();
  if (!cliente) notFound();

  return <div className="mx-auto max-w-3xl space-y-6">
    <Button variant="ghost" asChild className="-ml-2"><Link href={`/clienti/${id}`}><ArrowLeft aria-hidden="true" /> Torna al cliente</Link></Button>
    <Card className="border-border/70 shadow-sm"><CardHeader><CardTitle className="text-2xl">Modifica cliente</CardTitle><CardDescription>Aggiorna soltanto le informazioni necessarie.</CardDescription></CardHeader><CardContent><ModuloCliente idCliente={id} modalita="modifica" valoriIniziali={{ nome: cliente.nome, cognome: cliente.cognome, telefono: cliente.telefono, email: cliente.email ?? "", note: cliente.note ?? "" }} /></CardContent></Card>
  </div>;
}
