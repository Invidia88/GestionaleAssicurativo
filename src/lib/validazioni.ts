import { z } from "zod";

export const schemaCliente = z.object({
  nome: z.string().trim().min(1, "Inserisci il nome del cliente").max(80),
  cognome: z.string().trim().min(1, "Inserisci il cognome del cliente").max(80),
  telefono: z
    .string()
    .trim()
    .min(1, "Inserisci il numero di telefono")
    .refine(
      (valore) => valore.replace(/\D/g, "").length >= 8,
      "Inserisci un numero di telefono valido",
    ),
  email: z
    .union([z.literal(""), z.string().trim().email("Inserisci un indirizzo email valido")])
    .optional(),
  note: z.string().trim().max(2000, "Le note sono troppo lunghe").optional(),
});

export type DatiCliente = z.infer<typeof schemaCliente>;

export const schemaCompagnia = z.object({
  nome: z.string().trim().min(1, "Inserisci il nome della compagnia").max(120),
  sitoWeb: z
    .union([
      z.literal(""),
      z.string().trim().url("Inserisci un indirizzo web valido").refine(
        (valore) => valore.startsWith("https://") || valore.startsWith("http://"),
        "Il sito deve iniziare con http:// oppure https://",
      ),
    ])
    .optional(),
});

export type DatiCompagnia = z.infer<typeof schemaCompagnia>;

export const tipiPolizza = ["Auto", "Moto", "Autocarro", "Casa", "Vita", "Infortuni", "Salute", "Professionale", "Azienda", "Viaggio", "Altro"] as const;

export const schemaPolizza = z.object({
  clienteId: z.string().uuid("Seleziona un cliente"),
  compagniaId: z.string().uuid("Seleziona una compagnia"),
  tipo: z.enum(tipiPolizza, { message: "Seleziona il tipo di polizza" }),
  dataScadenza: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Inserisci la data di scadenza"),
  numeroPolizza: z.string().trim().max(100).optional(),
  targa: z.string().trim().max(20).optional(),
  premio: z.string().trim().refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Inserisci un importo valido").optional(),
  note: z.string().trim().max(2000).optional(),
});

export type DatiPolizza = z.infer<typeof schemaPolizza>;

export const schemaRinnovoPolizza = z.object({
  dataScadenza: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Inserisci la nuova data di scadenza"),
  numeroPolizza: z.string().trim().max(100).optional(),
  premio: z.string().trim().refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Inserisci un importo valido").optional(),
  note: z.string().trim().max(2000).optional(),
});

export type DatiRinnovoPolizza = z.infer<typeof schemaRinnovoPolizza>;

export const tipiContatto = ["whatsapp", "telefono", "email", "altro"] as const;
export const esitiContatto = ["contattato", "nessuna_risposta", "da_ricontattare", "numero_non_valido", "preventivo_inviato"] as const;

export const schemaContatto = z.object({
  clienteId: z.string().uuid("Cliente non valido"),
  polizzaId: z.string().uuid("Polizza non valida").optional(),
  tipoContatto: z.enum(tipiContatto),
  esito: z.enum(esitiContatto),
  messaggio: z.string().trim().max(4000, "Il messaggio è troppo lungo").optional(),
  note: z.string().trim().max(2000, "Le note sono troppo lunghe").optional(),
});

export type DatiContatto = z.infer<typeof schemaContatto>;

export const schemaImpostazioniAgenzia = z.object({
  nome: z.string().trim().min(1, "Inserisci il nome dell’agenzia").max(160),
  email: z.string().trim().email("Inserisci un indirizzo email valido"),
  telefono: z.union([z.literal(""), z.string().trim().refine((v) => v.replace(/\D/g, "").length >= 8, "Inserisci un numero di telefono valido")]),
  firmaWhatsapp: z.string().trim().max(500).optional(),
  messaggioWhatsapp: z.string().trim().min(1, "Inserisci il messaggio WhatsApp").max(4000),
  giorniPreavviso: z.string().trim().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 365, "Inserisci un numero tra 1 e 365"),
});

export type DatiImpostazioniAgenzia = z.infer<typeof schemaImpostazioniAgenzia>;

export const ruoliUtente = ["amministratore", "collaboratore"] as const;

export const schemaInvitoUtente = z.object({
  nome: z.string().trim().min(1, "Inserisci il nome").max(80),
  cognome: z.string().trim().min(1, "Inserisci il cognome").max(80),
  email: z.string().trim().email("Inserisci un indirizzo email valido"),
});

export type DatiInvitoUtente = z.infer<typeof schemaInvitoUtente>;

export const schemaNuovaAgenzia = z.object({
  nomeAgenzia: z
    .string()
    .trim()
    .min(1, "Inserisci il nome dell’agenzia")
    .max(120),
  emailAgenzia: z
    .string()
    .trim()
    .email("Inserisci l’email dell’agenzia"),
  telefonoAgenzia: z
    .union([
      z.literal(""),
      z.string().trim().refine(
        (valore) => valore.replace(/\D/g, "").length >= 8,
        "Inserisci un numero di telefono valido",
      ),
    ])
    .optional(),
  nomeAmministratore: z
    .string()
    .trim()
    .min(1, "Inserisci il nome dell’amministratore")
    .max(80),
  cognomeAmministratore: z
    .string()
    .trim()
    .min(1, "Inserisci il cognome dell’amministratore")
    .max(80),
  emailAmministratore: z
    .string()
    .trim()
    .email("Inserisci l’email dell’amministratore"),
});

export type DatiNuovaAgenzia = z.infer<typeof schemaNuovaAgenzia>;
