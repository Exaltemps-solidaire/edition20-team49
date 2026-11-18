"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type PersonaId = "rst" | "directeur";

export type Persona = { id: PersonaId; nom: string; role: string };

export const personas: Persona[] = [
  { id: "rst", nom: "Amina Diallo", role: "Responsable sportif territorial (RST)" },
  { id: "directeur", nom: "Karim Belkacem", role: "Directeur national des infrastructures" },
];

type PersonaContextValeur = {
  persona: Persona | null;
  choisirPersona: (id: PersonaId) => void;
};

const PersonaContext = createContext<PersonaContextValeur>({
  persona: null,
  choisirPersona: () => {},
});

const CLE_STOCKAGE = "persona-choisie";

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona | null>(null);

  useEffect(() => {
    const id = window.localStorage.getItem(CLE_STOCKAGE);
    const trouvee = personas.find((candidate) => candidate.id === id);
    // Lecture d'un système externe (localStorage) au montage, pas de la dérivation d'état React.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (trouvee) setPersona(trouvee);
  }, []);

  const choisirPersona = (id: PersonaId) => {
    const trouvee = personas.find((candidate) => candidate.id === id);
    if (!trouvee) return;
    setPersona(trouvee);
    window.localStorage.setItem(CLE_STOCKAGE, id);
  };

  return (
    <PersonaContext.Provider value={{ persona, choisirPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
}
