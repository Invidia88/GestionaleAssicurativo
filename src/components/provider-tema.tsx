"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

type Tema = "light" | "dark";

type ContestoTema = {
  tema: Tema;
  impostaTema: (tema: Tema) => void;
};

const ContestoTema = createContext<ContestoTema | null>(null);

const EVENTO_CAMBIO_TEMA = "gestionale-assicurativo:cambio-tema";

function leggiTemaBrowser(): Tema {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function leggiTemaServer(): Tema {
  return "light";
}

function sottoscriviTema(notifica: () => void) {
  window.addEventListener(EVENTO_CAMBIO_TEMA, notifica);
  window.addEventListener("storage", notifica);

  return () => {
    window.removeEventListener(EVENTO_CAMBIO_TEMA, notifica);
    window.removeEventListener("storage", notifica);
  };
}

export function ProviderTema({ children }: { children: React.ReactNode }) {
  const tema = useSyncExternalStore(sottoscriviTema, leggiTemaBrowser, leggiTemaServer);
  const impostaTema = useCallback((nuovoTema: Tema) => {
    const modalitaScura = nuovoTema === "dark";
    document.documentElement.classList.toggle("dark", modalitaScura);
    document.documentElement.style.colorScheme = nuovoTema;
    window.localStorage.setItem("gestionale-assicurativo-tema", nuovoTema);
    window.dispatchEvent(new Event(EVENTO_CAMBIO_TEMA));
  }, []);
  const valore = useMemo(() => ({ tema, impostaTema }), [impostaTema, tema]);

  return <ContestoTema.Provider value={valore}>{children}</ContestoTema.Provider>;
}

export function useTema() {
  const contesto = useContext(ContestoTema);

  if (!contesto) {
    throw new Error("useTema deve essere usato all’interno di ProviderTema");
  }

  return contesto;
}
