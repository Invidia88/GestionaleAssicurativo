import { Construction } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function PaginaInPreparazione({
  titolo,
  descrizione,
}: {
  titolo: string;
  descrizione: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{titolo}</h1>
        <p className="mt-1 text-muted-foreground">{descrizione}</p>
      </div>
      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Construction aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-medium">Questa sezione è in preparazione</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Il collegamento è pronto e la funzionalità verrà aggiunta nella
              prossima fase del gestionale.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
