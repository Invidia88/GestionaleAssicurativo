import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CircleAlert,
  MessageCircle,
  RotateCcw,
  Search,
  UsersRound,
} from "lucide-react";

import { BadgeRecupero } from "@/components/badge-recupero";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  calcolaRecuperoAnnuale,
  creaLinkWhatsapp,
  creaMessaggioRecuperoWhatsapp,
  formattaDataItaliana,
  ottieniDataOggiRoma,
} from "@/lib/scadenze";
import { creaClientSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Scaduti" };

type ParametriScaduti = {
  cerca?: string;
  priorita?: "tutte" | "da-contattare";
};

export default async function Scaduti({
  searchParams,
}: {
  searchParams: Promise<ParametriScaduti>;
}) {
  const [parametri, profilo] = await Promise.all([
    searchParams,
    richiediProfiloCorrente(),
  ]);
  const supabase = await creaClientSupabaseServer();
  const oggi = ottieniDataOggiRoma();
  const agenziaId = profilo.agenziaId;

  const [rispostaPolizze, rispostaClienti, rispostaCompagnie] = await Promise.all([
    supabase
      .from("polizze")
      .select("id, cliente_id, compagnia_id, tipo, numero_polizza, data_scadenza")
      .eq("agenzia_id", agenziaId)
      .eq("stato", "attiva")
      .lt("data_scadenza", oggi),
    supabase
      .from("clienti")
      .select("id, nome, cognome, telefono")
      .eq("agenzia_id", agenziaId),
    supabase
      .from("compagnie")
      .select("id, nome")
      .eq("agenzia_id", agenziaId),
  ]);

  const errore =
    rispostaPolizze.error || rispostaClienti.error || rispostaCompagnie.error;
  const clienti = new Map(
    (rispostaClienti.data ?? []).map((cliente) => [cliente.id, cliente]),
  );
  const compagnie = new Map(
    (rispostaCompagnie.data ?? []).map((compagnia) => [compagnia.id, compagnia]),
  );

  const tutteLeRighe = (rispostaPolizze.data ?? [])
    .flatMap((polizza) => {
      const cliente = clienti.get(polizza.cliente_id);
      const compagnia = compagnie.get(polizza.compagnia_id);
      if (!cliente || !compagnia) return [];

      const recupero = calcolaRecuperoAnnuale(polizza.data_scadenza);
      const messaggio = creaMessaggioRecuperoWhatsapp({
        nomeCliente: cliente.nome,
        tipoPolizza: polizza.tipo,
        dataRicorrenza: recupero.dataRicorrenza,
        nomeAgenzia: profilo.agenzia.nome,
        telefonoAgenzia: profilo.agenzia.telefono,
      });

      return [{
        ...polizza,
        cliente,
        compagnia,
        recupero,
        linkWhatsapp: creaLinkWhatsapp(cliente.telefono, messaggio),
      }];
    })
    .sort((a, b) =>
      a.recupero.giorniAllaRicorrenza - b.recupero.giorniAllaRicorrenza ||
      a.cliente.cognome.localeCompare(b.cliente.cognome, "it"),
    );

  const cerca = parametri.cerca?.trim().toLocaleLowerCase("it") ?? "";
  const righe = tutteLeRighe.filter((riga) => {
    const corrisponde = `${riga.cliente.nome} ${riga.cliente.cognome} ${riga.tipo} ${riga.compagnia.nome}`
      .toLocaleLowerCase("it")
      .includes(cerca);
    const prioritaria =
      parametri.priorita !== "da-contattare" || riga.recupero.daContattare;
    return corrisponde && prioritaria;
  });

  const daContattare = tutteLeRighe.filter(
    (riga) => riga.recupero.daContattare,
  ).length;
  const entroTrenta = tutteLeRighe.filter(
    (riga) => riga.recupero.giorniAllaRicorrenza <= 30,
  ).length;
  const clientiUnici = new Set(
    tutteLeRighe.map((riga) => riga.cliente_id),
  ).size;

  const riepiloghi = [
    { titolo: "Da contattare", valore: daContattare, Icona: MessageCircle },
    { titolo: "Entro 30 giorni", valore: entroTrenta, Icona: CalendarDays },
    { titolo: "Clienti da recuperare", valore: clientiUnici, Icona: UsersRound },
    { titolo: "Polizze scadute", valore: tutteLeRighe.length, Icona: RotateCcw },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Scaduti
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Recupera i clienti prima della prossima ricorrenza annuale proponendo
          un nuovo preventivo.
        </p>
      </div>

      <section
        aria-label="Riepilogo recupero clienti"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {riepiloghi.map(({ titolo, valore, Icona }) => (
          <Card key={titolo} className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">{titolo}</CardTitle>
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icona aria-hidden="true" className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold tabular-nums">
                {valore}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {errore ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Caricamento non riuscito</AlertTitle>
          <AlertDescription>
            Non è stato possibile caricare i clienti da recuperare. Riprova tra poco.
          </AlertDescription>
        </Alert>
      ) : null}

      <form className="grid gap-2 sm:grid-cols-[minmax(0,28rem)_13rem_auto]">
        <div className="relative">
          <label htmlFor="cerca-scaduti" className="sr-only">
            Cerca tra i clienti scaduti
          </label>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="cerca-scaduti"
            name="cerca"
            defaultValue={parametri.cerca}
            className="h-11 pl-9"
            placeholder="Cliente, polizza o compagnia"
          />
        </div>
        <label htmlFor="priorita-scaduti" className="sr-only">
          Filtra per priorità
        </label>
        <select
          id="priorita-scaduti"
          name="priorita"
          defaultValue={parametri.priorita ?? "tutte"}
          className="h-11 rounded-lg border bg-background px-3 text-sm"
        >
          <option value="tutte">Tutti gli scaduti</option>
          <option value="da-contattare">Da contattare ora</option>
        </select>
        <Button type="submit" variant="secondary" className="h-11">
          Filtra
        </Button>
      </form>

      <Card className="border-border/70 shadow-sm">
        <CardContent>
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vecchia polizza</TableHead>
                  <TableHead>Scaduta il</TableHead>
                  <TableHead>Prossima ricorrenza</TableHead>
                  <TableHead>Priorità</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {righe.map((riga) => (
                  <TableRow key={riga.id}>
                    <TableCell>
                      <Link
                        href={`/clienti/${riga.cliente_id}`}
                        className="font-medium hover:underline"
                      >
                        {riga.cliente.nome} {riga.cliente.cognome}
                      </Link>
                      <p className="font-mono text-xs text-muted-foreground">
                        {riga.cliente.telefono}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/polizze/${riga.id}`}
                        className="hover:underline"
                      >
                        {riga.tipo}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {riga.compagnia.nome}
                        {riga.numero_polizza ? ` · ${riga.numero_polizza}` : ""}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formattaDataItaliana(riga.data_scadenza)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formattaDataItaliana(riga.recupero.dataRicorrenza)}
                    </TableCell>
                    <TableCell>
                      <BadgeRecupero giorni={riga.recupero.giorniAllaRicorrenza} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button size="sm" asChild>
                          <a href={riga.linkWhatsapp} target="_blank" rel="noreferrer">
                            <MessageCircle aria-hidden="true" />
                            Preventivo
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 lg:hidden">
            {righe.map((riga) => (
              <article key={riga.id} className="space-y-4 rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium">
                      {riga.cliente.nome} {riga.cliente.cognome}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {riga.tipo} · {riga.compagnia.nome}
                    </p>
                  </div>
                  <BadgeRecupero giorni={riga.recupero.giorniAllaRicorrenza} />
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Scaduta il</dt>
                    <dd className="mt-1 font-mono">
                      {formattaDataItaliana(riga.data_scadenza)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Ricorrenza</dt>
                    <dd className="mt-1 font-mono">
                      {formattaDataItaliana(riga.recupero.dataRicorrenza)}
                    </dd>
                  </div>
                </dl>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/clienti/${riga.cliente_id}`}>Cliente</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/polizze/${riga.id}`}>Polizza</Link>
                  </Button>
                  <Button className="col-span-2" asChild>
                    <a href={riga.linkWhatsapp} target="_blank" rel="noreferrer">
                      <MessageCircle aria-hidden="true" />
                      Preventivo
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {!errore && righe.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-muted">
                <RotateCcw aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-medium">Nessun cliente da mostrare</p>
                <p className="text-sm text-muted-foreground">
                  Le polizze rinnovate vengono escluse automaticamente.
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
