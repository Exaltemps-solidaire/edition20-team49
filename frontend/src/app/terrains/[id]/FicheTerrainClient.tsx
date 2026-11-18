"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../../page.module.css";

type EtatEquipement = "bon" | "a_surveiller" | "hors_service";

type Equipement = {
  id: string;
  nom: string;
  type: string;
  etat: EtatEquipement;
};

type Terrain = {
  id: string;
  nom: string;
  ville: string;
  equipements: Equipement[];
};

const libelleEtat: Record<EtatEquipement, string> = {
  bon: "Bon",
  a_surveiller: "À surveiller",
  hors_service: "Hors service",
};

const classeEtat: Record<EtatEquipement, string> = {
  bon: styles.etatBon,
  a_surveiller: styles.etatASurveiller,
  hors_service: styles.etatHorsService,
};

export default function FicheTerrainClient({ id }: { id: string }) {
  const [terrain, setTerrain] = useState<Terrain | null>(null);
  const [introuvable, setIntrouvable] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/terrains/${id}`)
      .then((reponse) => {
        if (reponse.status === 404) {
          setIntrouvable(true);
          return null;
        }
        if (!reponse.ok) throw new Error("échec");
        return reponse.json();
      })
      .then((donnees) => donnees && setTerrain(donnees))
      .catch(() => setIntrouvable(true));
  }, [id]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p>
          <Link href="/">← Retour à la liste des terrains</Link>
        </p>
        {introuvable && <p>Ce terrain est introuvable.</p>}
        {!introuvable && !terrain && <p>Chargement…</p>}
        {terrain && (
          <>
            <h1>
              {terrain.nom} — {terrain.ville}
            </h1>
            <ul className={styles.listeEquipements}>
              {terrain.equipements.map((equipement) => (
                <li key={equipement.id}>
                  {equipement.nom} —{" "}
                  <span className={classeEtat[equipement.etat]}>
                    {libelleEtat[equipement.etat]}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
