import FicheTerrainClient from "./FicheTerrainClient";

// Export statique : il faut la liste des terrains connus pour pré-rendre une page par id.
// Les équipements, eux, sont lus côté navigateur sur l'API (source unique des données).
export function generateStaticParams() {
  return [{ id: "t1" }, { id: "t2" }, { id: "t3" }];
}

export default async function FicheTerrain({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FicheTerrainClient id={id} />;
}
