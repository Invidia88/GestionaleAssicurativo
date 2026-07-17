import type { Metadata } from "next";

import { CompletaInvito } from "@/components/completa-invito";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Completa l’invito" };

export default function Invito() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Benvenuto nel gestionale</CardTitle>
        <CardDescription>
          Verifichiamo l’invito della tua agenzia in modo sicuro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CompletaInvito />
      </CardContent>
    </Card>
  );
}
