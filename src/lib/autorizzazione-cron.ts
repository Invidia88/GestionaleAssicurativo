import { timingSafeEqual } from "node:crypto";

/**
 * Confronto a tempo costante per la route interna eseguita da GitHub Actions.
 * Il segreto non viene mai inviato al browser né incluso nelle risposte.
 */
export function richiestaCronAutorizzata(
  intestazioneAutorizzazione: string | null,
  segretoPrevisto: string | undefined,
) {
  if (!intestazioneAutorizzazione || !segretoPrevisto) {
    return false;
  }

  const ricevuto = Buffer.from(intestazioneAutorizzazione);
  const previsto = Buffer.from(`Bearer ${segretoPrevisto}`);

  return (
    ricevuto.length === previsto.length && timingSafeEqual(ricevuto, previsto)
  );
}
