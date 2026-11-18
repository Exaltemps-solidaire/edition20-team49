"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePersona } from "../persona";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EtatIncident = "nouveau" | "en_cours" | "resolu";
type NiveauUrgence = "faible" | "moderee" | "haute";

type IncidentDashboard = {
  id: string;
  terrainNom: string;
  ville?: string;
  codePostal?: string;
  adresse?: string;
  description: string;
  urgence: NiveauUrgence;
  etat: EtatIncident;
  prestataire?: string;
  dateIntervention?: string;
};

const libelleUrgence: Record<NiveauUrgence, string> = {
  faible: "Faible",
  moderee: "Modérée",
  haute: "Haute",
};

const colonnes: { etat: EtatIncident; titre: string }[] = [
  { etat: "nouveau", titre: "Nouveau" },
  { etat: "en_cours", titre: "En cours" },
  { etat: "resolu", titre: "Résolu" },
];

const rangUrgence: Record<NiveauUrgence, number> = { haute: 0, moderee: 1, faible: 2 };

function trierParUrgence(incidents: IncidentDashboard[]): IncidentDashboard[] {
  return [...incidents].sort((a, b) => rangUrgence[a.urgence] - rangUrgence[b.urgence]);
}

export default function TableauDeBord() {
  const { persona } = usePersona();
  const [incidents, setIncidents] = useState<IncidentDashboard[] | null>(null);
  const [affectationOuverte, setAffectationOuverte] = useState<string | null>(null);
  const [prestataire, setPrestataire] = useState("");
  const [dateIntervention, setDateIntervention] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = () => {
    fetch("/api/v1/incidents")
      .then((reponse) => reponse.json())
      .then(setIncidents)
      .catch(() => setIncidents([]));
  };

  useEffect(() => {
    if (persona?.id === "directeur") charger();
  }, [persona]);

  if (!persona || persona.id !== "directeur") {
    return (
      <div className="flex flex-1 flex-col items-center px-6 py-10">
        <main className="flex w-full max-w-xl flex-col gap-3">
          <p>
            Le tableau de bord est réservé au directeur. <Link href="/qui-etes-vous">Changer de persona</Link>.
          </p>
        </main>
      </div>
    );
  }

  const ouvrirAffectation = (id: string) => {
    setAffectationOuverte(id);
    setPrestataire("");
    setDateIntervention("");
    setErreur(null);
  };

  const affecter = async (id: string) => {
    setErreur(null);
    const reponse = await fetch(`/api/v1/incidents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestataire, dateIntervention }),
    });
    if (!reponse.ok) {
      const corps = await reponse.json().catch(() => null);
      setErreur(corps?.erreur ?? "L'affectation a échoué.");
      return;
    }
    setAffectationOuverte(null);
    charger();
  };

  const marquerResolu = async (id: string) => {
    await fetch(`/api/v1/incidents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etat: "resolu" }),
    });
    charger();
  };

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10">
      <main className="flex w-full max-w-5xl flex-col gap-5">
        <h1>Tableau de bord des incidents</h1>
        {!incidents && <p>Chargement…</p>}
        {incidents && (() => {
          const urgents = incidents.filter(
            (incident) => incident.etat !== "resolu" && incident.urgence === "haute"
          );
          return (
            <>
              <p
                className={
                  urgents.length > 0
                    ? "font-semibold text-destructive"
                    : "text-muted-foreground"
                }
              >
                {urgents.length > 0
                  ? `${urgents.length} incident${urgents.length > 1 ? "s" : ""} en urgence haute demande${
                      urgents.length > 1 ? "nt" : ""
                    } votre attention.`
                  : "Aucun incident en urgence haute en attente."}
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {colonnes.map((colonne) => (
                  <div key={colonne.etat} className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold text-marine uppercase">{colonne.titre}</h2>
                    <ul className="flex list-none flex-col gap-3 p-0">
                      {trierParUrgence(
                        incidents.filter((incident) => incident.etat === colonne.etat)
                      ).map((incident) => (
                      <li key={incident.id}>
                        <Card>
                          <CardContent className="flex flex-col gap-2 text-sm">
                            <p className="font-semibold text-marine">
                              {incident.terrainNom}
                              {incident.ville ? ` — ${incident.ville}` : ""}
                            </p>
                            {(incident.adresse || incident.codePostal) && (
                              <p className="text-muted-foreground">
                                {[incident.adresse, incident.codePostal].filter(Boolean).join(", ")}
                              </p>
                            )}
                            <p>{incident.description}</p>
                            <p className="text-muted-foreground">
                              Urgence : {libelleUrgence[incident.urgence]}
                            </p>
                            {incident.prestataire && (
                              <p className="text-muted-foreground">
                                Prestataire : {incident.prestataire}
                                {incident.dateIntervention
                                  ? ` (intervention prévue le ${incident.dateIntervention})`
                                  : ""}
                              </p>
                            )}
                            {colonne.etat === "nouveau" &&
                              (affectationOuverte === incident.id ? (
                                <form
                                  className="flex flex-col gap-2"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    affecter(incident.id);
                                  }}
                                >
                                  <div className="flex flex-col gap-1">
                                    <Label htmlFor={`prestataire-${incident.id}`}>Prestataire</Label>
                                    <Input
                                      id={`prestataire-${incident.id}`}
                                      value={prestataire}
                                      onChange={(e) => setPrestataire(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <Label htmlFor={`date-intervention-${incident.id}`}>
                                      Date d&apos;intervention prévue (optionnel)
                                    </Label>
                                    <Input
                                      id={`date-intervention-${incident.id}`}
                                      value={dateIntervention}
                                      onChange={(e) => setDateIntervention(e.target.value)}
                                    />
                                  </div>
                                  {erreur && (
                                    <p role="alert" className="text-destructive">
                                      {erreur}
                                    </p>
                                  )}
                                  <div className="flex gap-2">
                                    <Button type="submit" size="sm">
                                      Affecter
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setAffectationOuverte(null)}
                                    >
                                      Annuler
                                    </Button>
                                  </div>
                                </form>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="self-start"
                                  onClick={() => ouvrirAffectation(incident.id)}
                                >
                                  Affecter un prestataire
                                </Button>
                              ))}
                            {colonne.etat === "en_cours" && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="self-start"
                                onClick={() => marquerResolu(incident.id)}
                              >
                                Marquer résolu
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </main>
    </div>
  );
}
