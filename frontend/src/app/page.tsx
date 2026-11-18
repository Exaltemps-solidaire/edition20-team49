"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="flex flex-1 flex-col items-center px-6 py-10">
      <main className="flex w-full max-w-xl flex-col gap-5">
        <h1>Terrains</h1>
        {erreur && <p>Impossible de charger la liste des terrains.</p>}
        {!erreur && !terrains && <p>Chargement…</p>}
        {terrains && (
          <ul className="flex list-none flex-col gap-3 p-0">
            {terrains.map((terrain) => (
              <li key={terrain.id}>
                <Link href={`/terrains/${terrain.id}`}>
                  <Card className="transition-transform hover:-translate-y-0.5 hover:ring-bleu">
                    <CardContent className="font-semibold text-marine">
                      {terrain.nom} — {terrain.ville} ({terrain.nombreEquipements}{" "}
                      équipements)
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
