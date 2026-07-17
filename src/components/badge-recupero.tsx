import { Badge } from "@/components/ui/badge";

export function BadgeRecupero({ giorni }: { giorni: number }) {
  if (giorni === 0) {
    return <Badge variant="destructive">Ricorrenza oggi</Badge>;
  }

  if (giorni <= 14) {
    return <Badge>Da contattare · {giorni} gg</Badge>;
  }

  if (giorni <= 30) {
    return <Badge variant="secondary">Tra {giorni} giorni</Badge>;
  }

  return <Badge variant="outline">In programma</Badge>;
}
