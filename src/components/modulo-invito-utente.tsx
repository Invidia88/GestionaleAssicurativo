"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { invitaUtente } from "@/app/(app)/utenti/azioni";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { schemaInvitoUtente, type DatiInvitoUtente } from "@/lib/validazioni";

export function ModuloInvitoUtente() {
  const [errore, setErrore] = useState<string | null>(null);
  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<DatiInvitoUtente>({ resolver: zodResolver(schemaInvitoUtente), defaultValues: { nome: "", cognome: "", email: "", ruolo: "collaboratore" } });
  async function invia(dati: DatiInvitoUtente) { setErrore(null); const esito = await invitaUtente(dati); if (!esito.successo) { Object.entries(esito.errori ?? {}).forEach(([campo, messaggi]) => { if (messaggi?.[0]) setError(campo as keyof DatiInvitoUtente, { message: messaggi[0] }); }); setErrore(esito.messaggio ?? null); return; } toast.success("Invito inviato"); reset(); }
  return <form onSubmit={handleSubmit(invia)} className="space-y-4" noValidate>{errore ? <Alert variant="destructive"><AlertDescription>{errore}</AlertDescription></Alert> : null}<div className="grid gap-4 sm:grid-cols-2"><Campo id="nomeUtente" label="Nome" errore={errors.nome?.message}><Input id="nomeUtente" {...register("nome")} /></Campo><Campo id="cognomeUtente" label="Cognome" errore={errors.cognome?.message}><Input id="cognomeUtente" {...register("cognome")} /></Campo></div><Campo id="emailUtente" label="Email" errore={errors.email?.message}><Input id="emailUtente" type="email" {...register("email")} /></Campo><div className="space-y-2"><Label>Ruolo</Label><Controller name="ruolo" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="collaboratore">Collaboratore</SelectItem><SelectItem value="amministratore">Amministratore</SelectItem></SelectContent></Select>} /></div><Button type="submit" className="w-full" disabled={isSubmitting}><Send aria-hidden="true" />{isSubmitting ? "Invio…" : "Invia invito"}</Button></form>;
}

function Campo({ id, label, errore, children }: { id: string; label: string; errore?: string; children: React.ReactNode }) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{errore ? <p className="text-sm text-destructive">{errore}</p> : null}</div>; }
