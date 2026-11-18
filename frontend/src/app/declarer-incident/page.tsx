"use client";

import { Suspense, useState } from "react";
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

function FormulaireDeclaration() {
  const parametres = useSearchParams();
  const [terrainNom, setTerrainNom] = useState(parametres.get("terrain") ?? "");
  const [ville, setVille] = useState(parametres.get("ville") ?? "");
  const [codePostal, setCodePostal] = useState("");
  const [adresse, setAdresse] = useState("");
  const [description, setDescription] = useState("");
  const [urgence, setUrgence] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    const reponse = await fetch("/api/v1/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        terrainNom,
        ville,
        codePostal,
        adresse,
        description,
        urgence,
        photoUrl,
      }),
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
          <p>Incident déclaré. Il apparaît au tableau de bord du gestionnaire.</p>
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
            <Label htmlFor="terrainNom">Nom du terrain</Label>
            <Input
              id="terrainNom"
              value={terrainNom}
              onChange={(e) => setTerrainNom(e.target.value)}
              placeholder="Ex. Terrain du parc des Minguettes"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ville">Ville</Label>
              <Input id="ville" value={ville} onChange={(e) => setVille(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="codePostal">Code postal</Label>
              <Input
                id="codePostal"
                value={codePostal}
                onChange={(e) => setCodePostal(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adresse">Adresse précise</Label>
            <Input
              id="adresse"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Rue, numéro, point de repère…"
            />
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
          <Button type="submit" disabled={!terrainNom || !urgence} className="self-start">
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
