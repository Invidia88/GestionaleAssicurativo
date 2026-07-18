const DURATA_COOKIE_SESSIONE = 400 * 24 * 60 * 60;

export function opzioniCookieSessione(ambiente = process.env.NODE_ENV) {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: ambiente === "production",
    maxAge: DURATA_COOKIE_SESSIONE,
  };
}
