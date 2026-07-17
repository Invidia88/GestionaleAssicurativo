import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Clock3,
  Plus,
  ShieldAlert,
  UserPlus,
  MessageCircle,
} from "lucide-react";

import { BadgeScadenza } from "@/components/badge-scadenza";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { richiediProfiloCorrente } from "@/lib/autenticazione";
import {
  calcolaStatoScadenza,
  creaLinkWhatsapp,
  creaMessaggioWhatsapp,
  formattaDataItaliana,
  type StatoPolizza,
} from "@/lib/scadenze";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

type PolizzaDashboard = {
  id: string;
  clienteId: string;
  compagniaId: string;
  tipo: string;
  dataScadenza: string;
  stato: StatoPolizza;
  cliente: { nome: string; cognome: string; telefono: string };
  compagnia: { nome: string };
};

async function caricaPolizze(): Promise<{
  polizze: PolizzaDashboard[];
  errore: string | null;
}> {
  const supabase = await creaClientSupabaseServer();
  const { data: polizze, error } = await supabase
    .from("polizze")
    .select("id, cliente_id, compagnia_id, tipo, data_scadenza, stato")
    .eq("stato", "attiva")
    .order("data_scadenza", { ascending: true })
    .limit(50);

  if (error) {
    return { polizze: [], errore: "Non è stato possibile caricare le scadenze" };
  }

  if (!polizze?.length) {
    return { polizze: [], errore: null };
  }

  const idClienti = [...new Set(polizze.map((polizza) => polizza.cliente_id))];
  const idCompagnie = [...new Set(polizze.map((polizza) => polizza.compagnia_id))];
  const [rispostaClienti, rispostaCompagnie] = await Promise.all([
    supabase
      .from("clienti")
      .select("id, nome, cognome, telefono")
      .in("id", idClienti),
    supabase.from("compagnie").select("id, nome").in("id", idCompagnie),
  ]);

  if (rispostaClienti.error || rispostaCompagnie.error) {
    return { polizze: [], errore: "Non è stato possibile completare i dati delle scadenze" };
  }

  const clienti = new Map((rispostaClienti.data ?? []).map((cliente) => [cliente.id, cliente]));
  const compagnie = new Map(
    (rispostaCompagnie.data ?? []).map((compagnia) => [compagnia.id, compagnia]),
  );

  return {
    errore: null,
    polizze: polizze.flatMap((polizza) => {
      const cliente = clienti.get(polizza.cliente_id);
      const compagnia = compagnie.get(polizza.compagnia_id);
      const stato = polizza.stato as StatoPolizza;

      if (!cliente || !compagnia || stato !== "attiva") return [];

      return [
        {
          id: polizza.id,
          clienteId: polizza.cliente_id,
          compagniaId: polizza.compagnia_id,
          tipo: polizza.tipo,
          dataScadenza: polizza.data_scadenza,
          stato,
          cliente,
          compagnia,
        },
      ];
    }),
  };
}

const riepiloghi = [
  { categoria: "scaduta", titolo: "Scadute", Icona: ShieldAlert },
  { categoria: "oggi", titolo: "Scadono oggi", Icona: CircleAlert },
  { categoria: "sette", titolo: "Entro 7 giorni", Icona: Clock3 },
  { categoria: "trenta", titolo: "Entro 30 giorni", Icona: CalendarDays },
] as const;

export default async function Dashboard() {
  const [profilo, risultato] = await Promise.all([
    richiediProfiloCorrente(),
    caricaPolizze(),
  ]);

  const righe = risultato.polizze.map((polizza) => ({
    ...polizza,
    scadenza: calcolaStatoScadenza(polizza.dataScadenza, polizza.stato),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {profilo.agenzia.nome}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Buongiorno, {profilo.nome}
          </h1>
          <p className="text-muted-foreground">
            Ecco le scadenze da controllare oggi.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button variant="outline" size="lg" asChild>
            <Link href="/clienti/nuovo">
              <UserPlus aria-hidden="true" />
              Nuovo cliente
            </Link>
          </Button>
          <Button size="lg" asChild>
            <Link href="/polizze/nuova">
              <Plus aria-hidden="true" />
              Nuova polizza
            </Link>
          </Button>
        </div>
      </div>

      <section aria-label="Riepilogo scadenze" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {riepiloghi.map(({ categoria, titolo, Icona }) => {
          const totale = righe.filter(
            (polizza) => polizza.scadenza.categoria === categoria,
          ).length;

          return (
            <Card key={categoria} className="border-border/70 shadow-sm transition-transform hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">{titolo}</CardTitle>
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icona aria-hidden="true" className="size-4" /></span>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-3xl font-semibold tabular-nums">{totale}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {risultato.errore ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Caricamento non riuscito</AlertTitle>
          <AlertDescription>{risultato.errore}. Riprova tra poco.</AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Prossime scadenze</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Polizze attive ordinate dalla più urgente.
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/polizze">
              Vedi tutte
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!risultato.errore && righe.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-muted">
                <CalendarDays aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-medium">Nessuna scadenza da mostrare</p>
                <p className="text-sm text-muted-foreground">
                  Registra la prima polizza per iniziare.
                </p>
              </div>
            </div>
          ) : null}

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Polizza</TableHead>
                  <TableHead>Compagnia</TableHead>
                  <TableHead>Scadenza</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {righe.map((polizza) => {
                  const messaggio = creaMessaggioWhatsapp(
                    profilo.agenzia.messaggioWhatsapp,
                    {
                      nomeCliente: polizza.cliente.nome,
                      cognomeCliente: polizza.cliente.cognome,
                      tipoPolizza: polizza.tipo,
                      compagnia: polizza.compagnia.nome,
                      dataScadenza: polizza.dataScadenza,
                      giorniMancanti: polizza.scadenza.giorni,
                      nomeAgenzia: profilo.agenzia.nome,
                      telefonoAgenzia: profilo.agenzia.telefono,
                    },
                  );

                  return (
                    <TableRow key={polizza.id}>
                      <TableCell className="font-medium">
                        {polizza.cliente.nome} {polizza.cliente.cognome}
                      </TableCell>
                      <TableCell>{polizza.tipo}</TableCell>
                      <TableCell>{polizza.compagnia.nome}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {formattaDataItaliana(polizza.dataScadenza)}
                      </TableCell>
                      <TableCell>
                        <BadgeScadenza stato={polizza.scadenza} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={creaLinkWhatsapp(polizza.cliente.telefono, messaggio)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <MessageCircle aria-hidden="true" />
                              WhatsApp
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/polizze/${polizza.id}`}>Dettagli</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {righe.map((polizza) => {
              const messaggio = creaMessaggioWhatsapp(
                profilo.agenzia.messaggioWhatsapp,
                {
                  nomeCliente: polizza.cliente.nome,
                  cognomeCliente: polizza.cliente.cognome,
                  tipoPolizza: polizza.tipo,
                  compagnia: polizza.compagnia.nome,
                  dataScadenza: polizza.dataScadenza,
                  giorniMancanti: polizza.scadenza.giorni,
                  nomeAgenzia: profilo.agenzia.nome,
                  telefonoAgenzia: profilo.agenzia.telefono,
                },
              );

              return (
                <article key={polizza.id} className="space-y-4 rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-medium">
                        {polizza.cliente.nome} {polizza.cliente.cognome}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {polizza.tipo} · {polizza.compagnia.nome}
                      </p>
                    </div>
                    <BadgeScadenza stato={polizza.scadenza} />
                  </div>
                  <p className="font-mono text-sm">
                    Scadenza {formattaDataItaliana(polizza.dataScadenza)}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" asChild>
                      <a
                        href={creaLinkWhatsapp(polizza.cliente.telefono, messaggio)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle aria-hidden="true" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href={`/polizze/${polizza.id}`}>Dettagli</Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
