function normalizzaUrl(valore: string) {
  const url = valore.startsWith("http://") || valore.startsWith("https://")
    ? valore
    : `https://${valore}`;

  return url.replace(/\/+$/, "");
}

export function ottieniUrlSito() {
  const configurato = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configurato) return normalizzaUrl(configurato);

  const dominioVercel = process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
    : process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL;

  return dominioVercel
    ? normalizzaUrl(dominioVercel)
    : "http://localhost:3000";
}
