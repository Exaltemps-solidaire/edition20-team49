"use client";

import Image from "next/image";
import Link from "next/link";
import { usePersona } from "./persona";

export default function PersonaBandeau() {
  const { persona } = usePersona();

  return (
    <div className="flex items-center justify-between gap-4 bg-marine px-5 py-2.5 text-sm text-blanc">
      <Link
        href="/"
        className="flex items-center gap-2.5 font-titres text-base font-bold tracking-wide uppercase"
      >
        <Image
          src="/brand/logo-sport-dans-la-ville.png"
          alt="Sport dans la Ville"
          width={28}
          height={39}
          className="rounded-sm"
        />
        <span>Terrains</span>
      </Link>
      {persona ? (
        <span>
          Vous êtes <strong className="text-blanc">{persona.nom}</strong> — {persona.role} ·{" "}
          {persona.id === "directeur" && (
            <>
              <Link href="/tableau-de-bord" className="font-semibold text-vert-anis">
                tableau de bord
              </Link>{" "}
              ·{" "}
            </>
          )}
          <Link href="/qui-etes-vous" className="font-semibold text-vert-anis">
            changer
          </Link>
        </span>
      ) : (
        <span>
          <Link href="/qui-etes-vous" className="font-semibold text-vert-anis">
            Qui êtes-vous ?
          </Link>
        </span>
      )}
    </div>
  );
}
