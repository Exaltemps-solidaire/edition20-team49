"use client";

import { useRouter } from "next/navigation";
import { personas, usePersona, type PersonaId } from "../persona";
import styles from "../page.module.css";

export default function QuiEtesVous() {
  const { choisirPersona } = usePersona();
  const router = useRouter();

  const choisir = (id: PersonaId) => {
    choisirPersona(id);
    router.push("/");
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Qui êtes-vous ?</h1>
        <ul className={styles.listeTerrains}>
          {personas.map((persona) => (
            <li key={persona.id}>
              <button type="button" onClick={() => choisir(persona.id)}>
                {persona.nom} — {persona.role}
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
