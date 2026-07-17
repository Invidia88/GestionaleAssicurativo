export type CallbackInvito =
  | { tipo: "sessione"; accessToken: string; refreshToken: string }
  | { tipo: "codice"; codice: string }
  | { tipo: "token"; tokenHash: string }
  | { tipo: "errore"; descrizione: string }
  | { tipo: "assente" };

export function leggiCallbackInvito(indirizzo: string): CallbackInvito {
  let url: URL;

  try {
    url = new URL(indirizzo);
  } catch {
    return { tipo: "assente" };
  }

  const frammento = new URLSearchParams(url.hash.replace(/^#/, ""));
  const descrizioneErrore =
    url.searchParams.get("error_description") ??
    frammento.get("error_description");

  if (descrizioneErrore) {
    return { tipo: "errore", descrizione: descrizioneErrore };
  }

  const accessToken = frammento.get("access_token");
  const refreshToken = frammento.get("refresh_token");

  if (accessToken && refreshToken) {
    return { tipo: "sessione", accessToken, refreshToken };
  }

  const tokenHash = url.searchParams.get("token_hash");
  if (tokenHash && url.searchParams.get("type") === "invite") {
    return { tipo: "token", tokenHash };
  }

  const codice = url.searchParams.get("code");
  if (codice) {
    return { tipo: "codice", codice };
  }

  return { tipo: "assente" };
}
