import type { Metadata } from "next";

import { ModuloRecuperoPassword } from "@/components/modulo-recupero-password";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Recupera password" };

export default function RecuperaPassword() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Recupera password</CardTitle>
        <CardDescription>
          Ti invieremo un collegamento per scegliere una nuova password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ModuloRecuperoPassword />
      </CardContent>
    </Card>
  );
}
