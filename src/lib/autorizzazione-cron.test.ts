import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { richiestaCronAutorizzata } from "./autorizzazione-cron.ts";

describe("richiestaCronAutorizzata", () => {
  it("accetta soltanto il bearer token esatto", () => {
    assert.equal(richiestaCronAutorizzata("Bearer token-sicuro", "token-sicuro"), true);
    assert.equal(richiestaCronAutorizzata("Bearer token-diverso", "token-sicuro"), false);
  });

  it("rifiuta richieste o configurazioni incomplete", () => {
    assert.equal(richiestaCronAutorizzata(null, "token-sicuro"), false);
    assert.equal(richiestaCronAutorizzata("Bearer token-sicuro", undefined), false);
  });
});
