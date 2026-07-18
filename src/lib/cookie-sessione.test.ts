import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { opzioniCookieSessione } from "./supabase/cookie.ts";

describe("opzioniCookieSessione", () => {
  it("protegge i cookie con HTTPS in Production", () => {
    assert.deepEqual(opzioniCookieSessione("production"), {
      path: "/",
      sameSite: "lax",
      secure: true,
      maxAge: 400 * 24 * 60 * 60,
    });
  });

  it("consente lo sviluppo locale senza forzare HTTPS", () => {
    assert.equal(opzioniCookieSessione("development").secure, false);
  });
});
