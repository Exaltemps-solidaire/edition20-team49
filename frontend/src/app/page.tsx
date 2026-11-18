"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type TerrainResume = {
  id: string;
  nom: string;
  ville: string;
  nombreEquipements: number;
};

export default function Accueil() {
  const [terrains, setTerrains] = useState<TerrainResume[] | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    fetch("/api/v1/terrains")
      .then((reponse) => {
        if (!reponse.ok) throw new Error("échec");
        return reponse.json();
      })
      .then(setTerrains)
      .catch(() => setErreur(true));
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Terrains</h1>
        {erreur && <p>Impossible de charger la liste des terrains.</p>}
        {!erreur && !terrains && <p>Chargement…</p>}
        {terrains && (
          <ul className={styles.listeTerrains}>
            {terrains.map((terrain) => (
              <li key={terrain.id}>
                <Link href={`/terrains/${terrain.id}`}>
                  {terrain.nom} — {terrain.ville} ({terrain.nombreEquipements}{" "}
                  équipements)
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
