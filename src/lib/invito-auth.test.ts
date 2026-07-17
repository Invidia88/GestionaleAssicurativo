import assert from "node:assert/strict";
import test from "node:test";

import { leggiCallbackInvito } from "./invito-auth.ts";

test("legge la sessione implicita di un invito Supabase", () => {
  assert.deepEqual(
    leggiCallbackInvito(
      "https://gestionale.example/auth/invito#access_token=accesso&refresh_token=rinnovo&type=invite",
    ),
    {
      tipo: "sessione",
      accessToken: "accesso",
      refreshToken: "rinnovo",
    },
  );
});

test("supporta il token hash dei template email personalizzati", () => {
  assert.deepEqual(
    leggiCallbackInvito(
      "https://gestionale.example/auth/invito?token_hash=hash&type=invite",
    ),
    { tipo: "token", tokenHash: "hash" },
  );
});

test("supporta anche un eventuale callback con codice", () => {
  assert.deepEqual(
    leggiCallbackInvito(
      "https://gestionale.example/auth/invito?code=codice-monouso",
    ),
    { tipo: "codice", codice: "codice-monouso" },
  );
});

test("non accetta come invito una sessione già presente nel browser", () => {
  assert.deepEqual(
    leggiCallbackInvito("https://gestionale.example/auth/invito"),
    { tipo: "assente" },
  );
});
