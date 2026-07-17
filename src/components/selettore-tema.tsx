"use client";

import { Moon, Sun } from "lucide-react";

import { useTema } from "@/components/provider-tema";
import { Switch } from "@/components/ui/switch";

export function SelettoreTema() {
  const { impostaTema, tema } = useTema();
  const modalitaScura = tema === "dark";

  return (
    <div className="flex items-center justify-between gap-6 rounded-xl border bg-muted/35 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm ring-1 ring-border">
          {modalitaScura ? (
            <Moon className="size-4" aria-hidden="true" />
          ) : (
            <Sun className="size-4" aria-hidden="true" />
          )}
        </span>
        <div>
          <p className="font-medium">Modalità scura</p>
          <p id="descrizione-modalita-scura" className="mt-1 text-sm text-muted-foreground">
            Riduce la luminosità dell’interfaccia e mantiene un contrasto confortevole.
          </p>
        </div>
      </div>
      <Switch
        checked={modalitaScura}
        onCheckedChange={(attiva) => impostaTema(attiva ? "dark" : "light")}
        aria-label="Attiva modalità scura"
        aria-describedby="descrizione-modalita-scura"
      />
    </div>
  );
}
