"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";

import { eliminaPolizza } from "@/app/(app)/polizze/azioni";
import { ConfermaEliminazione } from "@/components/conferma-eliminazione";
import { Button } from "@/components/ui/button";
import type { StatoPolizza } from "@/lib/scadenze";

type AzioniPolizzaProps = {
  id: string;
  nome: string;
  stato: StatoPolizza;
};

export function AzioniPolizza({ id, nome, stato }: AzioniPolizzaProps) {
  const router = useRouter();

  async function elimina() {
    const esito = await eliminaPolizza(id);
    if (!esito.successo) {
      throw Object.assign(new Error(esito.messaggio), { code: esito.codice });
    }

    router.push("/polizze");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" asChild>
        <Link href={`/polizze/${id}/modifica`}>
          <Pencil aria-hidden="true" /> Modifica
        </Link>
      </Button>
      {stato === "attiva" ? (
        <Button asChild>
          <Link href={`/polizze/${id}/rinnova`}>
            <RefreshCw aria-hidden="true" /> Rinnova
          </Link>
        </Button>
      ) : null}
      <ConfermaEliminazione
        tipo="polizza"
        nome={nome}
        onConferma={elimina}
        trigger={(
          <Button variant="destructive">
            <Trash2 aria-hidden="true" /> Elimina
          </Button>
        )}
      />
    </div>
  );
}
