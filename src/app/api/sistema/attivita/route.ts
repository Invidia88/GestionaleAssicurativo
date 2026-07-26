import { NextResponse } from "next/server";

import { richiestaCronAutorizzata } from "@/lib/autorizzazione-cron";
import { creaClientSupabaseAmministratore } from "@/lib/supabase/amministratore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const intestazioniRiservate = {
  "Cache-Control": "private, no-store, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
  Vary: "Authorization",
};

/**
 * Route esclusivamente server-side, chiamata una volta al giorno da GitHub
 * Actions. La SELECT è volutamente minima e non restituisce mai record.
 */
export async function GET(request: Request) {
  if (
    !richiestaCronAutorizzata(
      request.headers.get("authorization"),
      process.env.SUPABASE_KEEPALIVE_SECRET,
    )
  ) {
    return new NextResponse(null, {
      status: 401,
      headers: intestazioniRiservate,
    });
  }

  try {
    const supabase = creaClientSupabaseAmministratore();
    const { error } = await supabase.from("agenzie").select("id").limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true }, { headers: intestazioniRiservate });
  } catch {
    return NextResponse.json(
      { ok: false },
      { status: 503, headers: intestazioniRiservate },
    );
  }
}
