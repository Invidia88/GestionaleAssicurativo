import type { Metadata } from "next";

import { ModuloNuovaPassword } from "@/components/modulo-nuova-password";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Nuova password" };

export default function AggiornaPassword() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Scegli una nuova password</CardTitle>
        <CardDescription>
          Usa una password lunga e diversa da quelle utilizzate altrove.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ModuloNuovaPassword />
      </CardContent>
    </Card>
  );
}
