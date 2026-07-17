"use client";

import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function DettaglioContatto({ cliente, messaggio, note }: { cliente: string; messaggio: string | null; note: string | null }) {
  return <Dialog><DialogTrigger asChild><Button variant="ghost" size="sm"><Eye aria-hidden="true" /> Dettagli</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Contatto con {cliente}</DialogTitle><DialogDescription>Messaggio e note conservati nello storico.</DialogDescription></DialogHeader><div className="space-y-4"><div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Messaggio</p><p className="mt-1 whitespace-pre-wrap text-sm">{messaggio || "Nessun messaggio registrato"}</p></div><div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Note</p><p className="mt-1 whitespace-pre-wrap text-sm">{note || "Nessuna nota"}</p></div></div></DialogContent></Dialog>;
}
