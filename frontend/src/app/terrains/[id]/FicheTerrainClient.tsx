"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
                      {formulaireOuvert === equipement.id ? (
                        <form
                          className="flex flex-col gap-3"
                          onSubmit={(evenement) => {
                            evenement.preventDefault();
                            declarerIncident(equipement.id);
                          }}
                        >
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`lieu-${equipement.id}`}>Lieu précis</Label>
                            <Input
                              id={`lieu-${equipement.id}`}
                              value={lieu}
                              onChange={(e) => setLieu(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`description-${equipement.id}`}>Description</Label>
                            <Input
                              id={`description-${equipement.id}`}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`urgence-${equipement.id}`}>
                              Niveau d&apos;urgence
                            </Label>
                            <Select
                              value={urgence}
                              onValueChange={(valeur) => setUrgence(valeur ?? "")}
                            >
                              <SelectTrigger id={`urgence-${equipement.id}`} className="w-full">
                                <SelectValue placeholder="— choisir —" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="faible">Faible</SelectItem>
                                <SelectItem value="moderee">Modérée</SelectItem>
                                <SelectItem value="haute">Haute</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`photo-${equipement.id}`}>URL d&apos;une photo</Label>
                            <Input
                              id={`photo-${equipement.id}`}
                              value={photoUrl}
                              onChange={(e) => setPhotoUrl(e.target.value)}
                            />
                          </div>
                          {erreur && (
                            <p role="alert" className="text-sm text-destructive">
                              {erreur}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button type="submit">Envoyer</Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setFormulaireOuvert(null)}
                            >
                              Annuler
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          className="self-start"
                          onClick={() => ouvrirFormulaire(equipement.id)}
                        >
                          Déclarer un incident
                        </Button>
                      )}
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
