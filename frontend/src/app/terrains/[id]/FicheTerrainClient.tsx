"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

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
  bon: "text-accent-foreground",
  a_surveiller: "text-vert-anis-fonce",
  hors_service: "text-destructive",
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
    <div className="flex flex-1 flex-col items-center px-6 py-10">
      <main className="flex w-full max-w-xl flex-col gap-5">
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
            <ul className="flex list-none flex-col gap-3 p-0">
              {terrain.equipements.map((equipement) => (
                <li key={equipement.id}>
                  <Card>
                    <CardContent className="flex flex-col gap-3">
                      <p>
                        <span className="font-semibold text-marine">{equipement.nom}</span>{" "}
                        —{" "}
                        <span className={classeEtat[equipement.etat]}>
                          {libelleEtat[equipement.etat]}
                        </span>
                      </p>
                      {equipement.incidents.length > 0 && (
                        <ul className="flex list-none flex-col gap-1 p-0 text-sm text-muted-foreground">
                          {equipement.incidents.map((incident) => (
                            <li key={incident.id}>
                              [{incident.etat}] {incident.lieu} — {incident.description} (urgence
                              : {libelleUrgence[incident.urgence]})
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link
                        href={`/declarer-incident?terrain=${terrain.id}`}
                        className={buttonVariants({ variant: "secondary", className: "self-start" })}
                      >
                        Déclarer un incident
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
