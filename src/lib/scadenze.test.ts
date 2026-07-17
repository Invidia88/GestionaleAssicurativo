import assert from "node:assert/strict";
import test from "node:test";

import {
  calcolaGiorniMancanti,
  calcolaStatoScadenza,
  creaLinkWhatsapp,
  creaMessaggioWhatsapp,
  normalizzaTelefono,
  suggerisciScadenzaRinnovo,
} from "./scadenze.ts";
import { schemaCliente, schemaCompagnia, schemaContatto, schemaImpostazioniAgenzia, schemaInvitoUtente, schemaNuovaAgenzia, schemaPolizza, schemaRinnovoPolizza } from "./validazioni.ts";

const riferimento = new Date("2026-07-17T10:00:00.000Z");

test("calcola i giorni mancanti nel fuso Europe/Rome", () => {
  assert.equal(calcolaGiorniMancanti("2026-07-17", riferimento), 0);
  assert.equal(calcolaGiorniMancanti("2026-07-24", riferimento), 7);
  assert.equal(calcolaGiorniMancanti("2026-07-16", riferimento), -1);
});

test("descrive gli stati della scadenza senza salvarli nel database", () => {
  assert.equal(calcolaStatoScadenza("2026-07-16", "attiva", riferimento).categoria, "scaduta");
  assert.equal(calcolaStatoScadenza("2026-07-17", "attiva", riferimento).etichetta, "Scade oggi");
  assert.equal(calcolaStatoScadenza("2026-07-20", "attiva", riferimento).categoria, "sette");
  assert.equal(calcolaStatoScadenza("2026-08-01", "attiva", riferimento).categoria, "trenta");
  assert.equal(calcolaStatoScadenza("2026-08-30", "rinnovata", riferimento).etichetta, "Rinnovata");
});

test("normalizza i numeri italiani", () => {
  assert.equal(normalizzaTelefono("333 123-4567"), "+393331234567");
  assert.equal(normalizzaTelefono("0039 (333) 1234567"), "+393331234567");
  assert.equal(normalizzaTelefono("+39 333 1234567"), "+393331234567");
});

test("sostituisce i placeholder e crea il link WhatsApp", () => {
  const messaggio = creaMessaggioWhatsapp(
    "Ciao {{nome_cliente}}, {{tipo_polizza}} scade il {{data_scadenza}}. {{nome_agenzia}}",
    {
      nomeCliente: "Mario",
      cognomeCliente: "Rossi",
      tipoPolizza: "Auto",
      compagnia: "Aurora",
      dataScadenza: "2026-07-24",
      giorniMancanti: 7,
      nomeAgenzia: "Agenzia Demo",
      telefonoAgenzia: "+390212345678",
    },
  );

  assert.equal(messaggio, "Ciao Mario, Auto scade il 24/07/2026. Agenzia Demo");
  assert.equal(
    creaLinkWhatsapp("+39 333 1234567", messaggio),
    `https://wa.me/393331234567?text=${encodeURIComponent(messaggio)}`,
  );
});

test("valida i campi essenziali del cliente", () => {
  assert.equal(
    schemaCliente.safeParse({ nome: "", cognome: "Rossi", telefono: "+393331234567" }).success,
    false,
  );
  assert.equal(
    schemaCliente.safeParse({
      nome: "Mario",
      cognome: "Rossi",
      telefono: "+39 333 1234567",
      email: "mario@example.com",
      note: "",
    }).success,
    true,
  );
});

test("valida nome e sito web della compagnia", () => {
  assert.equal(schemaCompagnia.safeParse({ nome: "Aurora", sitoWeb: "https://example.com" }).success, true);
  assert.equal(schemaCompagnia.safeParse({ nome: "", sitoWeb: "" }).success, false);
  assert.equal(schemaCompagnia.safeParse({ nome: "Aurora", sitoWeb: "example.com" }).success, false);
});

test("valida i dati essenziali della polizza", () => {
  const base = { clienteId: "d3000000-0000-4000-8000-000000000001", compagniaId: "d2000000-0000-4000-8000-000000000001", tipo: "Auto", dataScadenza: "2026-12-31", premio: "250.50" };
  assert.equal(schemaPolizza.safeParse(base).success, true);
  assert.equal(schemaPolizza.safeParse({ ...base, dataScadenza: "" }).success, false);
  assert.equal(schemaPolizza.safeParse({ ...base, premio: "-10" }).success, false);
});

test("prepara e valida la nuova scadenza del rinnovo", () => {
  assert.equal(suggerisciScadenzaRinnovo("2027-02-28"), "2028-02-28");
  assert.equal(suggerisciScadenzaRinnovo("2028-02-29"), "2029-02-28");
  assert.equal(schemaRinnovoPolizza.safeParse({ dataScadenza: "2027-12-31", premio: "320" }).success, true);
  assert.equal(schemaRinnovoPolizza.safeParse({ dataScadenza: "", premio: "-1" }).success, false);
});

test("valida la registrazione di un contatto", () => {
  const base = { clienteId: "d3000000-0000-4000-8000-000000000001", polizzaId: "d5000000-0000-4000-8000-000000000001", tipoContatto: "whatsapp", esito: "contattato" };
  assert.equal(schemaContatto.safeParse(base).success, true);
  assert.equal(schemaContatto.safeParse({ ...base, esito: "sconosciuto" }).success, false);
});

test("valida le impostazioni essenziali dell’agenzia", () => {
  const base = { nome: "Agenzia Aurora", email: "agenzia@example.com", telefono: "+390212345678", firmaWhatsapp: "Anna", messaggioWhatsapp: "Ciao {{nome_cliente}}", giorniPreavviso: "30" };
  assert.equal(schemaImpostazioniAgenzia.safeParse(base).success, true);
  assert.equal(schemaImpostazioniAgenzia.safeParse({ ...base, giorniPreavviso: "0" }).success, false);
});

test("valida i dati dell’invito utente", () => {
  assert.equal(schemaInvitoUtente.safeParse({ nome: "Luca", cognome: "Bianchi", email: "luca@example.com" }).success, true);
  assert.equal(schemaInvitoUtente.safeParse({ nome: "", cognome: "Bianchi", email: "non-valida" }).success, false);
});

test("valida agenzia e primo amministratore", () => {
  const dati = {
    nomeAgenzia: "Agenzia Rossi",
    emailAgenzia: "info@agenzia-rossi.it",
    telefonoAgenzia: "02 12345678",
    nomeAmministratore: "Anna",
    cognomeAmministratore: "Rossi",
    emailAmministratore: "anna@agenzia-rossi.it",
  };

  assert.equal(schemaNuovaAgenzia.safeParse(dati).success, true);
  assert.equal(
    schemaNuovaAgenzia.safeParse({
      ...dati,
      emailAmministratore: "email-non-valida",
    }).success,
    false,
  );
  assert.equal(
    schemaNuovaAgenzia.safeParse({ ...dati, nomeAgenzia: "" }).success,
    false,
  );
});
