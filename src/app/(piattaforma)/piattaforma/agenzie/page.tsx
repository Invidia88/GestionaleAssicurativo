import type { Metadata } from "next";
import { Building2, CheckCircle2, UserRoundCheck } from "lucide-react";

import { AzioneStatoAgenzia } from "@/components/azione-stato-agenzia";
import { ModuloNuovaAgenzia } from "@/components/modulo-nuova-agenzia";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { richiediProprietarioPiattaforma } from "@/lib/autenticazione";
import { creaClientSupabaseAmministratore } from "@/lib/supabase/amministratore";

export const metadata: Metadata = { title: "Gestione agenzie" };

function formattaData(data: string) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(data));
}

export default async function AgenziePiattaforma() {
  await richiediProprietarioPiattaforma();
  const amministratore = creaClientSupabaseAmministratore();
  const [risultatoAgenzie, risultatoProfili, risultatoAuth] = await Promise.all([
    amministratore
      .from("agenzie")
      .select("id,nome,email,telefono,attiva,creato_il")
      .order("creato_il", { ascending: false }),
    amministratore
      .from("utenti")
      .select("id,agenzia_id,nome,cognome")
      .eq("ruolo", "amministratore"),
    amministratore.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const agenzie = risultatoAgenzie.data ?? [];
  const profili = new Map(
    (risultatoProfili.data ?? []).map((profilo) => [profilo.agenzia_id, profilo]),
  );
  const emailAuth = new Map(
    (risultatoAuth.data?.users ?? []).map((utente) => [utente.id, utente.email]),
  );
  const attive = agenzie.filter((agenzia) => agenzia.attiva).length;

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Piattaforma</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Agenzie clienti
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Crea un’agenzia, invita il suo unico amministratore e controlla gli
            accessi senza eliminare i dati.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card className="min-w-32 gap-2 border-border/70 py-4 shadow-sm">
            <CardContent className="flex items-center gap-3 px-4">
              <Building2 aria-hidden="true" className="size-5 text-primary" />
              <div>
                <p className="text-2xl font-semibold leading-none">{agenzie.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Totali</p>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-32 gap-2 border-border/70 py-4 shadow-sm">
            <CardContent className="flex items-center gap-3 px-4">
              <CheckCircle2 aria-hidden="true" className="size-5 text-emerald-600" />
              <div>
                <p className="text-2xl font-semibold leading-none">{attive}</p>
                <p className="mt-1 text-xs text-muted-foreground">Attive</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Organizzazioni attivate</CardTitle>
            <CardDescription>
              Ogni agenzia è isolata dalle altre tramite le policy di sicurezza.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {agenzie.length === 0 ? (
              <div className="rounded-2xl border border-dashed px-5 py-12 text-center">
                <Building2
                  aria-hidden="true"
                  className="mx-auto mb-3 size-8 text-muted-foreground"
                />
                <p className="font-medium">Nessuna agenzia creata</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Compila il modulo per attivare il primo cliente.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agenzia</TableHead>
                        <TableHead>Amministratore</TableHead>
                        <TableHead>Creata</TableHead>
                        <TableHead className="text-right">Stato</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agenzie.map((agenzia) => {
                        const profilo = profili.get(agenzia.id);
                        return (
                          <TableRow key={agenzia.id}>
                            <TableCell>
                              <p className="font-medium">{agenzia.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                {agenzia.email}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p>
                                {profilo
                                  ? `${profilo.nome} ${profilo.cognome}`
                                  : "Non disponibile"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {profilo
                                  ? emailAuth.get(profilo.id) || "Invito in corso"
                                  : "—"}
                              </p>
                            </TableCell>
                            <TableCell>{formattaData(agenzia.creato_il)}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <Badge variant={agenzia.attiva ? "secondary" : "outline"}>
                                  {agenzia.attiva ? "Attiva" : "Disattivata"}
                                </Badge>
                                <AzioneStatoAgenzia
                                  id={agenzia.id}
                                  nome={agenzia.nome}
                                  attiva={agenzia.attiva}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-3 md:hidden">
                  {agenzie.map((agenzia) => {
                    const profilo = profili.get(agenzia.id);
                    return (
                      <article
                        key={agenzia.id}
                        className="space-y-4 rounded-2xl border p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{agenzia.nome}</p>
                            <p className="truncate text-sm text-muted-foreground">
                              {agenzia.email}
                            </p>
                          </div>
                          <Badge variant={agenzia.attiva ? "secondary" : "outline"}>
                            {agenzia.attiva ? "Attiva" : "Disattivata"}
                          </Badge>
                        </div>
                        <div className="flex gap-3 rounded-xl bg-muted/60 p-3">
                          <UserRoundCheck
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-primary"
                          />
                          <div className="min-w-0 text-sm">
                            <p>
                              {profilo
                                ? `${profilo.nome} ${profilo.cognome}`
                                : "Amministratore non disponibile"}
                            </p>
                            <p className="truncate text-muted-foreground">
                              {profilo
                                ? emailAuth.get(profilo.id) || "Invito in corso"
                                : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground">
                            Creata il {formattaData(agenzia.creato_il)}
                          </p>
                          <AzioneStatoAgenzia
                            id={agenzia.id}
                            nome={agenzia.nome}
                            attiva={agenzia.attiva}
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit border-border/70 shadow-sm xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>Nuova agenzia</CardTitle>
            <CardDescription>
              L’amministratore riceverà un’email per scegliere la password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModuloNuovaAgenzia />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
