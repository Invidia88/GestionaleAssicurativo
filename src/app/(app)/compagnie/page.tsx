import type { Metadata } from "next";
import { ExternalLink, Building2 } from "lucide-react";

import { AzioniCompagnia } from "@/components/azioni-compagnia";
import { ModuloCompagnia } from "@/components/modulo-compagnia";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Compagnie" };

export default async function Compagnie() {
  const supabase = await creaClientSupabaseServer();
  const { data: compagnie } = await supabase
    .from("compagnie")
    .select("id,nome,sito_web,attiva")
    .order("nome");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Compagnie</h1>
        <p className="mt-1 text-muted-foreground">Gestisci le compagnie utilizzate nelle polizze.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader><CardTitle>Compagnie registrate</CardTitle></CardHeader>
          <CardContent>
            {!compagnie?.length ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                <Building2 className="size-6 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Aggiungi la prima compagnia.</p>
              </div>
            ) : null}
            <div className="hidden md:block">
              <Table><TableHeader><TableRow><TableHead>Compagnia</TableHead><TableHead>Sito web</TableHead><TableHead>Stato</TableHead><TableHead className="text-right">Azioni</TableHead></TableRow></TableHeader>
                <TableBody>{(compagnie ?? []).map((compagnia) => <TableRow key={compagnia.id}>
                  <TableCell className="font-medium">{compagnia.nome}</TableCell>
                  <TableCell>{compagnia.sito_web ? <Button variant="link" className="px-0" asChild><a href={compagnia.sito_web} target="_blank" rel="noreferrer">Apri sito <ExternalLink aria-hidden="true" /></a></Button> : "—"}</TableCell>
                  <TableCell><Badge variant={compagnia.attiva ? "secondary" : "outline"}>{compagnia.attiva ? "Attiva" : "Non attiva"}</Badge></TableCell>
                  <TableCell><AzioniCompagnia {...compagnia} attiva={compagnia.attiva} /></TableCell>
                </TableRow>)}</TableBody></Table>
            </div>
            <div className="space-y-3 md:hidden">{(compagnie ?? []).map((compagnia) => <article key={compagnia.id} className="space-y-3 rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3"><h2 className="font-medium">{compagnia.nome}</h2><Badge variant={compagnia.attiva ? "secondary" : "outline"}>{compagnia.attiva ? "Attiva" : "Non attiva"}</Badge></div>
              <div className="flex items-center justify-between gap-2">{compagnia.sito_web ? <Button variant="outline" size="sm" asChild><a href={compagnia.sito_web} target="_blank" rel="noreferrer">Apri sito <ExternalLink aria-hidden="true" /></a></Button> : <span className="text-sm text-muted-foreground">Nessun sito</span>}<AzioniCompagnia {...compagnia} attiva={compagnia.attiva} /></div>
            </article>)}</div>
          </CardContent>
        </Card>
        <Card className="h-fit"><CardHeader><CardTitle>Nuova compagnia</CardTitle></CardHeader><CardContent><ModuloCompagnia /></CardContent></Card>
      </div>
    </div>
  );
}
