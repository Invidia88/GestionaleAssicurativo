const fusoOrario = "Europe/Rome";

export type StatoPolizza = "attiva" | "rinnovata" | "annullata";

export type StatoScadenza = {
  etichetta: string;
  giorni: number;
  categoria: "scaduta" | "oggi" | "sette" | "trenta" | "futura" | "chiusa";
};

function serialeData(data: string) {
  const [anno, mese, giorno] = data.split("-").map(Number);
  return Math.floor(Date.UTC(anno, mese - 1, giorno) / 86_400_000);
}

export function ottieniDataOggiRoma(ora = new Date()) {
  const parti = new Intl.DateTimeFormat("en-CA", {
    timeZone: fusoOrario,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ora);
  const valore = Object.fromEntries(parti.map((parte) => [parte.type, parte.value]));
  return `${valore.year}-${valore.month}-${valore.day}`;
}

export function calcolaGiorniMancanti(dataScadenza: string, ora = new Date()) {
  return serialeData(dataScadenza) - serialeData(ottieniDataOggiRoma(ora));
}

function creaDataValida(anno: number, mese: number, giorno: number) {
  const ultimoGiorno = new Date(Date.UTC(anno, mese, 0)).getUTCDate();
  return `${anno}-${String(mese).padStart(2, "0")}-${String(Math.min(giorno, ultimoGiorno)).padStart(2, "0")}`;
}

export type RecuperoAnnuale = {
  dataRicorrenza: string;
  giorniAllaRicorrenza: number;
  daContattare: boolean;
};

export function calcolaRecuperoAnnuale(
  dataScadenza: string,
  ora = new Date(),
  giorniPreavviso = 14,
): RecuperoAnnuale {
  const [annoScadenza, mese, giorno] = dataScadenza.split("-").map(Number);
  const oggi = ottieniDataOggiRoma(ora);
  const annoOggi = Number(oggi.slice(0, 4));
  let annoRicorrenza = Math.max(annoScadenza + 1, annoOggi);
  let dataRicorrenza = creaDataValida(annoRicorrenza, mese, giorno);

  if (dataRicorrenza < oggi) {
    annoRicorrenza += 1;
    dataRicorrenza = creaDataValida(annoRicorrenza, mese, giorno);
  }

  const giorniAllaRicorrenza = serialeData(dataRicorrenza) - serialeData(oggi);

  return {
    dataRicorrenza,
    giorniAllaRicorrenza,
    daContattare: giorniAllaRicorrenza <= giorniPreavviso,
  };
}

export function calcolaStatoScadenza(
  dataScadenza: string,
  stato: StatoPolizza,
  ora = new Date(),
): StatoScadenza {
  const giorni = calcolaGiorniMancanti(dataScadenza, ora);

  if (stato === "rinnovata") {
    return { etichetta: "Rinnovata", giorni, categoria: "chiusa" };
  }

  if (stato === "annullata") {
    return { etichetta: "Annullata", giorni, categoria: "chiusa" };
  }

  if (giorni < 0) {
    const trascorsi = Math.abs(giorni);
    return {
      etichetta: trascorsi === 1 ? "Scaduta ieri" : `Scaduta da ${trascorsi} giorni`,
      giorni,
      categoria: "scaduta",
    };
  }

  if (giorni === 0) {
    return { etichetta: "Scade oggi", giorni, categoria: "oggi" };
  }

  if (giorni <= 7) {
    return {
      etichetta: giorni === 1 ? "Manca 1 giorno" : `Mancano ${giorni} giorni`,
      giorni,
      categoria: "sette",
    };
  }

  if (giorni <= 30) {
    return {
      etichetta: `Mancano ${giorni} giorni`,
      giorni,
      categoria: "trenta",
    };
  }

  return { etichetta: "Scadenza futura", giorni, categoria: "futura" };
}

export function formattaDataItaliana(data: string) {
  const [anno, mese, giorno] = data.split("-");
  return `${giorno}/${mese}/${anno}`;
}

export function suggerisciScadenzaRinnovo(data: string) {
  const [anno, mese, giorno] = data.split("-").map(Number);
  const nuovoAnno = anno + 1;
  const ultimoGiornoDelMese = new Date(Date.UTC(nuovoAnno, mese, 0)).getUTCDate();
  const nuovoGiorno = Math.min(giorno, ultimoGiornoDelMese);

  return `${nuovoAnno}-${String(mese).padStart(2, "0")}-${String(nuovoGiorno).padStart(2, "0")}`;
}

export function normalizzaTelefono(telefono: string) {
  const valore = telefono.trim();
  const cifre = valore.replace(/\D/g, "");

  if (!cifre) return "";
  if (valore.startsWith("+") && cifre.length >= 8) return `+${cifre}`;
  if (cifre.startsWith("00")) return `+${cifre.slice(2)}`;
  if (cifre.startsWith("39") && cifre.length >= 10) return `+${cifre}`;
  return `+39${cifre}`;
}

type DatiMessaggio = {
  nomeCliente: string;
  cognomeCliente: string;
  tipoPolizza: string;
  compagnia: string;
  dataScadenza: string;
  giorniMancanti: number;
  nomeAgenzia: string;
  telefonoAgenzia: string | null;
};

const messaggioPredefinito =
  "Buongiorno {{nome_cliente}}, ti ricordiamo che la tua polizza {{tipo_polizza}} scadrà il {{data_scadenza}}. Contattaci per ricevere il nuovo preventivo. {{nome_agenzia}}";

export function creaMessaggioWhatsapp(
  modello: string | null,
  dati: DatiMessaggio,
) {
  const valori: Record<string, string> = {
    nome_cliente: dati.nomeCliente,
    cognome_cliente: dati.cognomeCliente,
    tipo_polizza: dati.tipoPolizza,
    compagnia: dati.compagnia,
    data_scadenza: formattaDataItaliana(dati.dataScadenza),
    giorni_mancanti: String(dati.giorniMancanti),
    nome_agenzia: dati.nomeAgenzia,
    telefono_agenzia: dati.telefonoAgenzia ?? "",
  };

  let messaggio = modello?.trim() || messaggioPredefinito;

  Object.entries(valori).forEach(([chiave, valore]) => {
    messaggio = messaggio.replaceAll(`{{${chiave}}}`, valore);
  });

  // Compatibilità con i modelli demo iniziali, più brevi.
  messaggio = messaggio
    .replaceAll("{nome}", dati.nomeCliente)
    .replaceAll("{tipo}", dati.tipoPolizza)
    .replaceAll("{data_scadenza}", formattaDataItaliana(dati.dataScadenza));

  return messaggio;
}

export function creaLinkWhatsapp(telefono: string, messaggio: string) {
  const numero = normalizzaTelefono(telefono).replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(messaggio)}`;
}

export function creaMessaggioRecuperoWhatsapp({
  nomeCliente,
  tipoPolizza,
  dataRicorrenza,
  nomeAgenzia,
  telefonoAgenzia,
}: {
  nomeCliente: string;
  tipoPolizza: string;
  dataRicorrenza: string;
  nomeAgenzia: string;
  telefonoAgenzia: string | null;
}) {
  const contatto = telefonoAgenzia ? ` Puoi contattarci al ${telefonoAgenzia}.` : "";

  return `Buongiorno ${nomeCliente}, si avvicina la ricorrenza annuale del ${formattaDataItaliana(dataRicorrenza)} per la tua polizza ${tipoPolizza}. Possiamo prepararti un nuovo preventivo senza impegno. ${nomeAgenzia}.${contatto}`;
}
