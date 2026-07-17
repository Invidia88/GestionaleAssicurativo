import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const percorsiPrivati = [
  "/dashboard",
  "/clienti",
  "/polizze",
  "/compagnie",
  "/contatti",
  "/utenti",
  "/impostazioni",
  "/piattaforma",
];

function percorsoPrivato(pathname: string) {
  return percorsiPrivati.some(
    (percorso) => pathname === percorso || pathname.startsWith(`${percorso}/`),
  );
}

export async function aggiornaSessione(request: NextRequest) {
  let risposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookieDaSalvare) {
          cookieDaSalvare.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          risposta = NextResponse.next({ request });

          cookieDaSalvare.forEach(({ name, value, options }) => {
            risposta.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const autenticato = Boolean(data?.claims?.sub);

  if (!autenticato && percorsoPrivato(request.nextUrl.pathname)) {
    const destinazione = request.nextUrl.clone();
    destinazione.pathname = "/login";
    destinazione.searchParams.set("motivo", "sessione-richiesta");
    return NextResponse.redirect(destinazione);
  }

  return risposta;
}
