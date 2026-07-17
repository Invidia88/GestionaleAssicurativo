"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { salvaImpostazioniAgenzia } from "@/app/(app)/impostazioni/azioni";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { schemaImpostazioniAgenzia, type DatiImpostazioniAgenzia } from "@/lib/validazioni";

export function ModuloImpostazioni({ valori }: { valori: DatiImpostazioniAgenzia }) {
  const [errore, setErrore] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<DatiImpostazioniAgenzia>({ resolver: zodResolver(schemaImpostazioniAgenzia), defaultValues: valori });
  async function salva(dati: DatiImpostazioniAgenzia) { setErrore(null); const esito = await salvaImpostazioniAgenzia(dati); if (!esito.successo) { Object.entries(esito.errori ?? {}).forEach(([campo, messaggi]) => { if (messaggi?.[0]) setError(campo as keyof DatiImpostazioniAgenzia, { message: messaggi[0] }); }); setErrore(esito.messaggio ?? null); return; } toast.success("Impostazioni salvate"); }
  return <form onSubmit={handleSubmit(salva)} className="space-y-6" noValidate>{errore ? <Alert variant="destructive"><AlertDescription>{errore}</AlertDescription></Alert> : null}<div className="grid gap-5 sm:grid-cols-2"><Campo id="nomeAgenzia" label="Nome agenzia" errore={errors.nome?.message}><Input id="nomeAgenzia" {...register("nome")} /></Campo><Campo id="emailAgenzia" label="Email" errore={errors.email?.message}><Input id="emailAgenzia" type="email" {...register("email")} /></Campo><Campo id="telefonoAgenzia" label="Telefono" errore={errors.telefono?.message}><Input id="telefonoAgenzia" type="tel" {...register("telefono")} /></Campo><Campo id="preavvisoAgenzia" label="Giorni di preavviso" errore={errors.giorniPreavviso?.message}><Input id="preavvisoAgenzia" type="number" min="1" max="365" {...register("giorniPreavviso")} /></Campo></div><div className="space-y-2"><Label htmlFor="firmaWhatsapp">Firma WhatsApp</Label><Textarea id="firmaWhatsapp" rows={2} placeholder="Esempio: Anna, Agenzia Aurora" {...register("firmaWhatsapp")} /></div><div className="space-y-2"><Label htmlFor="messaggioWhatsapp">Messaggio WhatsApp</Label><Textarea id="messaggioWhatsapp" rows={6} {...register("messaggioWhatsapp")} />{errors.messaggioWhatsapp?.message ? <p className="text-sm text-destructive">{errors.messaggioWhatsapp.message}</p> : null}<p className="text-xs text-muted-foreground">Puoi usare: {"{{nome_cliente}}"}, {"{{tipo_polizza}}"}, {"{{compagnia}}"}, {"{{data_scadenza}}"}, {"{{nome_agenzia}}"}.</p></div><Button type="submit" size="lg" disabled={isSubmitting}><Save aria-hidden="true" />{isSubmitting ? "Salvataggio…" : "Salva impostazioni"}</Button></form>;
}

function Campo({ id, label, errore, children }: { id: string; label: string; errore?: string; children: React.ReactNode }) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{errore ? <p className="text-sm text-destructive">{errore}</p> : null}</div>; }
