export type RisorsaEliminabile = "cliente" | "compagnia" | "polizza";

type ErroreConCodice = {
  code?: string;
  message?: string;
};

function haCodice(errore: unknown): errore is ErroreConCodice {
  return typeof errore === "object" && errore !== null && "code" in errore;
}

export function messaggioErroreEliminazione(
  errore: unknown,
  risorsa: RisorsaEliminabile,
) {
  if (haCodice(errore) && errore.code === "23503") {
    if (risorsa === "cliente") {
      return "Il cliente ha polizze o contatti collegati. Gestiscili prima di eliminarlo.";
    }

    if (risorsa === "compagnia") {
      return "La compagnia ha polizze collegate. Gestiscile prima di eliminarla.";
    }

    if (risorsa === "polizza") {
      return "La polizza non può essere eliminata perché contiene collegamenti non rimovibili.";
    }
  }

  if (errore instanceof Error && errore.message) {
    return "Non è stato possibile completare l’eliminazione. Riprova tra poco.";
  }

  return "Si è verificato un errore durante l’eliminazione.";
}
