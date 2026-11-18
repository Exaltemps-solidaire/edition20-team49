"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../../page.module.css";

type EtatEquipement = "bon" | "a_surveiller" | "hors_service";
type NiveauUrgence = "faible" | "moderee" | "haute";

type Incident = {
  id: string;
  lieu: string;
  description: string;
  urgence: NiveauUrgence;
  photoUrl?: string;
  etat: "nouveau" | "en_cours" | "resolu";
};

type Equipement = {
  id: string;
  nom: string;
  type: string;
  etat: EtatEquipement;
  incidents: Incident[];
};

type Terrain = {
  id: string;
  nom: string;
  ville: string;
  equipements: Equipement[];
};

const libelleUrgence: Record<NiveauUrgence, string> = {
  faible: "Faible",
  moderee: "Modérée",
  haute: "Haute",
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
  const [formulaireOuvert, setFormulaireOuvert] = useState<string | null>(null);
  const [lieu, setLieu] = useState("");
  const [description, setDescription] = useState("");
  const [urgence, setUrgence] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  const chargerTerrain = () => {
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
  };

  useEffect(chargerTerrain, [id]);

  const ouvrirFormulaire = (equipementId: string) => {
    setFormulaireOuvert(equipementId);
    setLieu("");
    setDescription("");
    setUrgence("");
    setPhotoUrl("");
    setErreur(null);
  };

  const declarerIncident = async (equipementId: string) => {
    setErreur(null);
    const reponse = await fetch("/api/v1/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipementId, lieu, description, urgence, photoUrl }),
    });
    if (!reponse.ok) {
      const corps = await reponse.json().catch(() => null);
      setErreur(corps?.erreur ?? "La déclaration a échoué.");
      return;
    }
    setFormulaireOuvert(null);
    chargerTerrain();
  };

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
                  {equipement.incidents.length > 0 && (
                    <ul>
                      {equipement.incidents.map((incident) => (
                        <li key={incident.id}>
                          [{incident.etat}] {incident.lieu} — {incident.description} (urgence :{" "}
                          {libelleUrgence[incident.urgence]})
                        </li>
                      ))}
                    </ul>
                  )}
                  {formulaireOuvert === equipement.id ? (
                    <form
                      onSubmit={(evenement) => {
                        evenement.preventDefault();
                        declarerIncident(equipement.id);
                      }}
                    >
                      <div>
                        <label>
                          Lieu précis{" "}
                          <input value={lieu} onChange={(e) => setLieu(e.target.value)} />
                        </label>
                      </div>
                      <div>
                        <label>
                          Description{" "}
                          <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </label>
                      </div>
                      <div>
                        <label>
                          Niveau d&apos;urgence{" "}
                          <select value={urgence} onChange={(e) => setUrgence(e.target.value)}>
                            <option value="">— choisir —</option>
                            <option value="faible">Faible</option>
                            <option value="moderee">Modérée</option>
                            <option value="haute">Haute</option>
                          </select>
                        </label>
                      </div>
                      <div>
                        <label>
                          URL d&apos;une photo{" "}
                          <input
                            value={photoUrl}
                            onChange={(e) => setPhotoUrl(e.target.value)}
                          />
                        </label>
                      </div>
                      {erreur && <p role="alert">{erreur}</p>}
                      <button type="submit">Envoyer</button>
                      <button type="button" onClick={() => setFormulaireOuvert(null)}>
                        Annuler
                      </button>
                    </form>
                  ) : (
                    <button type="button" onClick={() => ouvrirFormulaire(equipement.id)}>
                      Déclarer un incident
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
