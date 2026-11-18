"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

type TerrainResume = { id: string; nom: string; ville: string };
type Equipement = { id: string; nom: string };
type TerrainDetail = { id: string; equipements: Equipement[] };

function FormulaireDeclaration() {
  const parametres = useSearchParams();
  const [terrains, setTerrains] = useState<TerrainResume[] | null>(null);
  const [terrainId, setTerrainId] = useState(parametres.get("terrain") ?? "");
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [equipementId, setEquipementId] = useState("");
  const [lieu, setLieu] = useState("");
  const [description, setDescription] = useState("");
  const [urgence, setUrgence] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);

  useEffect(() => {
    fetch("/api/v1/terrains")
      .then((r) => r.json())
      .then(setTerrains)
      .catch(() => setTerrains([]));
  }, []);

  useEffect(() => {
    if (!terrainId) return;
    fetch(`/api/v1/terrains/${terrainId}`)
      .then((r) => r.json())
      .then((terrain: TerrainDetail) => setEquipements(terrain.equipements ?? []))
      .catch(() => setEquipements([]));
  }, [terrainId]);

  const choisirTerrain = (v: string | null) => {
    setTerrainId(v ?? "");
    setEquipementId("");
    setEquipements([]);
  };

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
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
    setEnvoye(true);
  };

  if (envoye) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3">
          <p>Incident déclaré. Il apparaît sur la fiche du terrain et au tableau de bord.</p>
          <Button type="button" variant="secondary" className="self-start" onClick={() => setEnvoye(false)}>
            Déclarer un autre incident
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form className="flex flex-col gap-3" onSubmit={envoyer}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="terrain">Terrain</Label>
            <Select value={terrainId} onValueChange={choisirTerrain}>
              <SelectTrigger id="terrain" className="w-full">
                <SelectValue placeholder="— choisir un terrain —" />
              </SelectTrigger>
              <SelectContent>
                {(terrains ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nom} — {t.ville}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="equipement">Équipement concerné</Label>
            <Select value={equipementId} onValueChange={(v) => setEquipementId(v ?? "")} disabled={!terrainId}>
              <SelectTrigger id="equipement" className="w-full">
                <SelectValue placeholder="— choisir un équipement —" />
              </SelectTrigger>
              <SelectContent>
                {equipements.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lieu">Lieu précis</Label>
            <Input id="lieu" value={lieu} onChange={(e) => setLieu(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="urgence">Niveau d&apos;urgence</Label>
            <Select value={urgence} onValueChange={(v) => setUrgence(v ?? "")}>
              <SelectTrigger id="urgence" className="w-full">
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
            <Label htmlFor="photo">URL d&apos;une photo</Label>
            <Input id="photo" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
          </div>
          {erreur && (
            <p role="alert" className="text-sm text-destructive">
              {erreur}
            </p>
          )}
          <Button type="submit" disabled={!equipementId} className="self-start">
            Envoyer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function DeclarerIncident() {
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10">
      <main className="flex w-full max-w-xl flex-col gap-5">
        <h1>Déclarer un incident</h1>
        <Suspense fallback={<p>Chargement…</p>}>
          <FormulaireDeclaration />
        </Suspense>
      </main>
    </div>
  );
}
