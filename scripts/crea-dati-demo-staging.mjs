import { createClient } from "@supabase/supabase-js";
import { addDays, format } from "date-fns";

const RIFERIMENTO_STAGING = "ooqekupusuchabdyrgev";

const configurazione = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  secretKey: process.env.SUPABASE_SECRET_KEY,
  passwordDemo: process.env.DEMO_PASSWORD,
  emailAdminDemo: process.env.DEMO_ADMIN_EMAIL?.trim() || "admin.aurora@demo.example",
};

function verificaConfigurazione() {
  if (!configurazione.url?.includes(RIFERIMENTO_STAGING)) {
    throw new Error("Seed interrotto: NEXT_PUBLIC_SUPABASE_URL non punta a Staging.");
  }

  if (!configurazione.secretKey?.startsWith("sb_secret_")) {
    throw new Error("Seed interrotto: SUPABASE_SECRET_KEY di Staging non configurata.");
  }

  if (!configurazione.passwordDemo || configurazione.passwordDemo.length < 12) {
    throw new Error("Seed interrotto: DEMO_PASSWORD deve contenere almeno 12 caratteri.");
  }
}

verificaConfigurazione();

const supabase = createClient(configurazione.url, configurazione.secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const agenzie = [
  {
    id: "d1000000-0000-4000-8000-000000000001",
    nome: "Agenzia Demo Aurora",
    email: "aurora@demo.example",
    telefono: "+390212345678",
    firma_whatsapp: "Agenzia Aurora",
    messaggio_whatsapp:
      "Buongiorno {nome}, la polizza {tipo} scade il {data_scadenza}. Contattaci per il rinnovo.",
    giorni_preavviso: 30,
  },
  {
    id: "d1000000-0000-4000-8000-000000000002",
    nome: "Agenzia Demo Tirreno",
    email: "tirreno@demo.example",
    telefono: "+390612345678",
    firma_whatsapp: "Agenzia Tirreno",
    messaggio_whatsapp:
      "Buongiorno {nome}, ti ricordiamo la scadenza {tipo} del {data_scadenza}.",
    giorni_preavviso: 30,
  },
];

const definizioniUtenti = [
  {
    email: configurazione.emailAdminDemo,
    agenziaId: agenzie[0].id,
    nome: "Anna",
    cognome: "Amministratrice",
    ruolo: "amministratore",
  },
  {
    email: "collaboratore.aurora@demo.example",
    agenziaId: agenzie[0].id,
    nome: "Carlo",
    cognome: "Collaboratore",
    ruolo: "collaboratore",
  },
  {
    email: "admin.tirreno@demo.example",
    agenziaId: agenzie[1].id,
    nome: "Teresa",
    cognome: "Amministratrice",
    ruolo: "amministratore",
  },
  {
    email: "collaboratore.tirreno@demo.example",
    agenziaId: agenzie[1].id,
    nome: "Luca",
    cognome: "Collaboratore",
    ruolo: "collaboratore",
  },
];

function creaUuid(prefisso, indice) {
  return `${prefisso}-0000-4000-8000-${String(indice).padStart(12, "0")}`;
}

async function eseguiUpsert(tabella, righe, onConflict = "id") {
  const { error } = await supabase.from(tabella).upsert(righe, { onConflict });
  if (error) {
    throw new Error(`Errore durante il seed di ${tabella}: ${error.message}`);
  }
}

async function recuperaOCreaUtente(definizione) {
  const { data: elenco, error: erroreElenco } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (erroreElenco) {
    throw new Error(`Impossibile leggere gli utenti Auth: ${erroreElenco.message}`);
  }

  const esistente = elenco.users.find(
    (utente) => utente.email?.toLowerCase() === definizione.email.toLowerCase(),
  );

  if (esistente) {
    const { error } = await supabase.auth.admin.updateUserById(esistente.id, {
      password: configurazione.passwordDemo,
      email_confirm: true,
      user_metadata: { nome: definizione.nome, cognome: definizione.cognome },
    });
    if (error) {
      throw new Error(`Impossibile aggiornare ${definizione.email}: ${error.message}`);
    }
    return esistente.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: definizione.email,
    password: configurazione.passwordDemo,
    email_confirm: true,
    user_metadata: { nome: definizione.nome, cognome: definizione.cognome },
  });

  if (error || !data.user) {
    throw new Error(`Impossibile creare ${definizione.email}: ${error?.message}`);
  }

  return data.user.id;
}

async function contaRighe(tabella, agenziaId, configuraQuery) {
  let query = supabase
    .from(tabella)
    .select("id", { count: "exact", head: true })
    .eq("agenzia_id", agenziaId);

  if (configuraQuery) {
    query = configuraQuery(query);
  }

  const { count, error } = await query;
  if (error) {
    throw new Error(`Impossibile verificare ${tabella}: ${error.message}`);
  }

  return count ?? 0;
}

async function verificaDatiDemo() {
  const oggi = format(new Date(), "yyyy-MM-dd");
  const traSetteGiorni = format(addDays(new Date(), 7), "yyyy-MM-dd");
  const traTrentaGiorni = format(addDays(new Date(), 30), "yyyy-MM-dd");

  for (const agenzia of agenzie) {
    const conteggi = {
      utenti: await contaRighe("utenti", agenzia.id),
      compagnie: await contaRighe("compagnie", agenzia.id),
      clienti: await contaRighe("clienti", agenzia.id),
      polizze: await contaRighe("polizze", agenzia.id),
      contatti: await contaRighe("contatti", agenzia.id),
    };

    const attesi = {
      utenti: 2,
      compagnie: 5,
      clienti: 15,
      polizze: 20,
      contatti: 8,
    };

    for (const [tabella, atteso] of Object.entries(attesi)) {
      if (conteggi[tabella] !== atteso) {
        throw new Error(
          `Verifica fallita per ${agenzia.nome}: ${tabella}=${conteggi[tabella]}, atteso=${atteso}.`,
        );
      }
    }

    const categorieScadenza = {
      scadute: await contaRighe("polizze", agenzia.id, (query) =>
        query.eq("stato", "attiva").lt("data_scadenza", oggi),
      ),
      oggi: await contaRighe("polizze", agenzia.id, (query) =>
        query.eq("stato", "attiva").eq("data_scadenza", oggi),
      ),
      entroSette: await contaRighe("polizze", agenzia.id, (query) =>
        query
          .eq("stato", "attiva")
          .gt("data_scadenza", oggi)
          .lte("data_scadenza", traSetteGiorni),
      ),
      entroTrenta: await contaRighe("polizze", agenzia.id, (query) =>
        query
          .eq("stato", "attiva")
          .gt("data_scadenza", traSetteGiorni)
          .lte("data_scadenza", traTrentaGiorni),
      ),
    };

    if (Object.values(categorieScadenza).some((conteggio) => conteggio < 1)) {
      throw new Error(`Verifica scadenze fallita per ${agenzia.nome}.`);
    }

    console.log(
      `- ${agenzia.nome}: ${conteggi.utenti} utenti, ${conteggi.compagnie} compagnie, ` +
        `${conteggi.clienti} clienti, ${conteggi.polizze} polizze, ${conteggi.contatti} contatti`,
    );
  }
}

async function creaDatiDemo() {
  await eseguiUpsert("agenzie", agenzie);

  const utenti = [];
  for (const definizione of definizioniUtenti) {
    const id = await recuperaOCreaUtente(definizione);
    utenti.push({
      id,
      agenzia_id: definizione.agenziaId,
      nome: definizione.nome,
      cognome: definizione.cognome,
      ruolo: definizione.ruolo,
      attivo: true,
    });
  }
  await eseguiUpsert("utenti", utenti);

  const compagnie = agenzie.flatMap((agenzia, indiceAgenzia) =>
    ["Aurora", "Generale", "Italia", "Serena", "Unione"].map((nome, indice) => ({
      id: creaUuid(`d2${indiceAgenzia}00000`, indice + 1),
      agenzia_id: agenzia.id,
      nome: `${nome} Assicurazioni`,
      sito_web: `https://${nome.toLowerCase()}.example`,
      attiva: true,
    })),
  );
  await eseguiUpsert("compagnie", compagnie);

  const nomi = [
    "Andrea", "Beatrice", "Claudio", "Daniela", "Enrico",
    "Francesca", "Giorgio", "Ilaria", "Marco", "Nadia",
    "Paolo", "Rita", "Stefano", "Valentina", "Walter",
  ];
  const cognomi = [
    "Rossi", "Bianchi", "Romano", "Colombo", "Ricci",
    "Marino", "Greco", "Bruno", "Gallo", "Conti",
    "Costa", "Giordano", "Mancini", "Rizzo", "Lombardi",
  ];

  const clienti = agenzie.flatMap((agenzia, indiceAgenzia) =>
    nomi.map((nome, indice) => ({
      id: creaUuid(`d3${indiceAgenzia}00000`, indice + 1),
      agenzia_id: agenzia.id,
      nome,
      cognome: cognomi[(indice + indiceAgenzia * 3) % cognomi.length],
      telefono: `+3933${indiceAgenzia}${String(indice + 1000000).slice(-7)}`,
      email: `${nome.toLowerCase()}.${indiceAgenzia + 1}@demo.example`,
      note: indice % 5 === 0 ? "Cliente dimostrativo da ricontattare" : null,
    })),
  );
  await eseguiUpsert("clienti", clienti);

  const scostamenti = [-20, 0, 3, 7, 15, 30, 45, 90];
  const tipi = ["Auto", "Moto", "Casa", "Infortuni", "Responsabilità civile"];
  const oggi = new Date();
  const polizze = agenzie.flatMap((agenzia, indiceAgenzia) => {
    const clientiAgenzia = clienti.filter((cliente) => cliente.agenzia_id === agenzia.id);
    const compagnieAgenzia = compagnie.filter(
      (compagnia) => compagnia.agenzia_id === agenzia.id,
    );

    return Array.from({ length: 20 }, (_, indice) => ({
      id: creaUuid(`d4${indiceAgenzia}00000`, indice + 1),
      agenzia_id: agenzia.id,
      cliente_id: clientiAgenzia[indice % clientiAgenzia.length].id,
      compagnia_id: compagnieAgenzia[indice % compagnieAgenzia.length].id,
      tipo: tipi[indice % tipi.length],
      numero_polizza: `DEMO-${indiceAgenzia + 1}-${String(indice + 1).padStart(4, "0")}`,
      targa: indice % 3 === 0 ? `AB${String(100 + indice)}CD` : null,
      data_scadenza: format(addDays(oggi, scostamenti[indice % scostamenti.length]), "yyyy-MM-dd"),
      premio: 150 + indice * 17.5,
      stato: indice === 18 ? "rinnovata" : indice === 19 ? "annullata" : "attiva",
      note: null,
    }));
  });
  await eseguiUpsert("polizze", polizze);

  const contatti = agenzie.flatMap((agenzia, indiceAgenzia) => {
    const clientiAgenzia = clienti.filter((cliente) => cliente.agenzia_id === agenzia.id);
    const polizzeAgenzia = polizze.filter((polizza) => polizza.agenzia_id === agenzia.id);
    const utentiAgenzia = utenti.filter((utente) => utente.agenzia_id === agenzia.id);

    return Array.from({ length: 8 }, (_, indice) => ({
      id: creaUuid(`d5${indiceAgenzia}00000`, indice + 1),
      agenzia_id: agenzia.id,
      cliente_id: clientiAgenzia[indice % clientiAgenzia.length].id,
      polizza_id: polizzeAgenzia[indice % polizzeAgenzia.length].id,
      utente_id: utentiAgenzia[indice % utentiAgenzia.length].id,
      tipo_contatto: indice % 2 === 0 ? "whatsapp" : "telefono",
      esito: indice % 3 === 0 ? "da_ricontattare" : "contattato",
      messaggio: "Messaggio dimostrativo relativo alla scadenza.",
      contattato_il: addDays(oggi, -indice).toISOString(),
      note: null,
    }));
  });
  await eseguiUpsert("contatti", contatti);

  console.log("Dati demo Staging creati o aggiornati:");
  console.log(`- ${agenzie.length} agenzie`);
  console.log(`- ${utenti.length} utenti`);
  console.log(`- ${compagnie.length} compagnie`);
  console.log(`- ${clienti.length} clienti`);
  console.log(`- ${polizze.length} polizze`);
  console.log(`- ${contatti.length} contatti`);
  console.log("Verifica remota per agenzia:");
  await verificaDatiDemo();
}

creaDatiDemo().catch((errore) => {
  console.error(errore instanceof Error ? errore.message : "Errore seed non previsto.");
  process.exitCode = 1;
});
