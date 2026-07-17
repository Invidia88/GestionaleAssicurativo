"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { eliminaCliente } from "@/app/(app)/clienti/azioni";
import { ConfermaEliminazione } from "@/components/conferma-eliminazione";
import { Button } from "@/components/ui/button";

export function AzioniCliente({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();

  async function elimina() {
    const esito = await eliminaCliente(id);
    if (!esito.successo) throw Object.assign(new Error(esito.messaggio), { code: esito.codice });
    router.push("/clienti");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" asChild><Link href={`/clienti/${id}/modifica`}><Pencil aria-hidden="true" /> Modifica</Link></Button>
      <ConfermaEliminazione tipo="cliente" nome={nome} onConferma={elimina} trigger={<Button variant="destructive"><Trash2 aria-hidden="true" /> Elimina</Button>} />
    </div>
  );
}
