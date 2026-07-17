import { Badge } from "@/components/ui/badge";
import type { StatoScadenza } from "@/lib/scadenze";

export function BadgeScadenza({ stato }: { stato: StatoScadenza }) {
  const variante =
    stato.categoria === "scaduta" || stato.categoria === "oggi"
      ? "destructive"
      : stato.categoria === "sette"
        ? "default"
        : stato.categoria === "chiusa"
          ? "outline"
          : "secondary";

  return <Badge variant={variante}>{stato.etichetta}</Badge>;
}
