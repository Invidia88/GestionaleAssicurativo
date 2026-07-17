import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { ottieniUrlSito } from "./url-sito.ts";

const variabili = [
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_ENV",
  "VERCEL_BRANCH_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

const originali = Object.fromEntries(
  variabili.map((nome) => [nome, process.env[nome]]),
);

afterEach(() => {
  for (const nome of variabili) {
    const valore = originali[nome];
    if (valore === undefined) delete process.env[nome];
    else process.env[nome] = valore;
  }
});

describe("ottieniUrlSito", () => {
  it("preferisce l'URL configurato e rimuove lo slash finale", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://gestionale.example/";
    process.env.VERCEL_BRANCH_URL = "preview.vercel.app";

    assert.equal(ottieniUrlSito(), "https://gestionale.example");
  });

  it("usa l'alias stabile del branch nei deployment Preview", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_BRANCH_URL = "gestionale-staging.vercel.app";
    process.env.VERCEL_URL = "gestionale-casuale.vercel.app";

    assert.equal(
      ottieniUrlSito(),
      "https://gestionale-staging.vercel.app",
    );
  });

  it("usa il dominio Production soltanto nell'ambiente Production", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "gestionale.vercel.app";
    process.env.VERCEL_URL = "gestionale-casuale.vercel.app";

    assert.equal(ottieniUrlSito(), "https://gestionale.vercel.app");
  });

  it("mantiene il fallback locale fuori da Vercel", () => {
    for (const nome of variabili) delete process.env[nome];

    assert.equal(ottieniUrlSito(), "http://localhost:3000");
  });
});
