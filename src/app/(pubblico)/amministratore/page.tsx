import { redirect } from "next/navigation";

import { trovaProprietarioPiattaforma } from "@/lib/autenticazione";

export default async function AccessoAmministratore() {
  const proprietario = await trovaProprietarioPiattaforma();

  redirect(
    proprietario ? "/piattaforma/agenzie" : "/login?area=piattaforma",
  );
}
