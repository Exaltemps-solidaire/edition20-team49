"use client";

import { useRouter } from "next/navigation";
import { personas, usePersona, type PersonaId } from "../persona";
import { Card, CardContent } from "@/components/ui/card";

export default function QuiEtesVous() {
  const { choisirPersona } = usePersona();
  const router = useRouter();

  const choisir = (id: PersonaId) => {
    choisirPersona(id);
    router.push("/");
  };

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10">
      <main className="flex w-full max-w-xl flex-col gap-5">
        <h1>Qui êtes-vous ?</h1>
        <ul className="flex list-none flex-col gap-3 p-0">
          {personas.map((persona) => (
            <li key={persona.id}>
              <button
                type="button"
                onClick={() => choisir(persona.id)}
                className="w-full text-left"
              >
                <Card className="transition-transform hover:-translate-y-0.5 hover:ring-bleu">
                  <CardContent>
                    <p className="font-semibold text-marine">{persona.nom}</p>
                    <p className="text-sm text-muted-foreground">{persona.role}</p>
                  </CardContent>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
