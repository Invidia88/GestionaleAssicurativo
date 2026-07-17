import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ModuloCliente } from "@/components/modulo-cliente";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Nuovo cliente" };

export default function NuovoCliente() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href="/clienti"><ArrowLeft aria-hidden="true" /> Torna ai clienti</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Nuovo cliente</CardTitle>
          <CardDescription>Compila soltanto i dati utili. Potrai aggiungere subito una polizza.</CardDescription>
        </CardHeader>
        <CardContent><ModuloCliente /></CardContent>
      </Card>
    </div>
  );
}
