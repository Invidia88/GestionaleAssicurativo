import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Pencil, Plus, Search, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { creaLinkWhatsapp } from "@/lib/scadenze";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Clienti" };

type ClientiProps = { searchParams: Promise<{ cerca?: string }> };

export default async function Clienti({ searchParams }: ClientiProps) {
  const { cerca = "" } = await searchParams;
  const supabase = await creaClientSupabaseServer();
  const [{ data: clienti }, { data: polizze }] = await Promise.all([
    supabase
      .from("clienti")
      .select("id, nome, cognome, telefono, email")
      .order("cognome")
      .order("nome")
      .limit(500),
    supabase.from("polizze").select("cliente_id"),
  ]);

  const ricerca = cerca.trim().toLocaleLowerCase("it");
  const elenco = (clienti ?? []).filter((cliente) => {
    if (!ricerca) return true;
    return `${cliente.nome} ${cliente.cognome} ${cliente.telefono}`
      .toLocaleLowerCase("it")
      .includes(ricerca);
  });
  const conteggi = new Map<string, number>();
  (polizze ?? []).forEach(({ cliente_id }) => {
    conteggi.set(cliente_id, (conteggi.get(cliente_id) ?? 0) + 1);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Clienti</h1>
          <p className="mt-1 text-muted-foreground">
            Trova rapidamente una persona o registra un nuovo cliente.
          </p>
        </div>
        <Button size="lg" className="h-11" asChild>
          <Link href="/clienti/nuovo">
            <Plus aria-hidden="true" />
            Nuovo cliente
          </Link>
        </Button>
      </div>

      <form className="flex max-w-xl gap-2" role="search">
        <div className="relative flex-1">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="cerca"
            defaultValue={cerca}
            placeholder="Cerca nome, cognome o telefono"
            className="h-11 pl-9"
          />
        </div>
        <Button type="submit" variant="secondary" className="h-11">Cerca</Button>
      </form>

      <Card>
        <CardContent>
          {elenco.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-muted">
                <UserRound aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-medium">Nessun cliente trovato</p>
                <p className="text-sm text-muted-foreground">Prova un’altra ricerca oppure aggiungi un cliente.</p>
              </div>
            </div>
          ) : null}

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Polizze</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {elenco.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome} {cliente.cognome}</TableCell>
                    <TableCell className="font-mono text-sm">{cliente.telefono}</TableCell>
                    <TableCell>{cliente.email ?? "—"}</TableCell>
                    <TableCell>{conteggi.get(cliente.id) ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={creaLinkWhatsapp(cliente.telefono, "Buongiorno")} target="_blank" rel="noreferrer">
                            <MessageCircle aria-hidden="true" /> WhatsApp
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/clienti/${cliente.id}`}>Dettagli</Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild><Link href={`/clienti/${cliente.id}/modifica`} aria-label={`Modifica ${cliente.nome} ${cliente.cognome}`}><Pencil aria-hidden="true" /></Link></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {elenco.map((cliente) => (
              <article key={cliente.id} className="space-y-4 rounded-xl border p-4">
                <div>
                  <h2 className="font-medium">{cliente.nome} {cliente.cognome}</h2>
                  <p className="font-mono text-sm text-muted-foreground">{cliente.telefono}</p>
                  {cliente.email ? <p className="truncate text-sm text-muted-foreground">{cliente.email}</p> : null}
                </div>
                <p className="text-sm">{conteggi.get(cliente.id) ?? 0} polizze registrate</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" asChild>
                    <a href={creaLinkWhatsapp(cliente.telefono, "Buongiorno")} target="_blank" rel="noreferrer">
                      <MessageCircle aria-hidden="true" /> WhatsApp
                    </a>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href={`/clienti/${cliente.id}`}>Dettagli</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
