"use client";

import Image from "next/image";
import Link from "next/link";
import { usePersona } from "./persona";
import styles from "./persona.module.css";

export default function PersonaBandeau() {
  const { persona } = usePersona();

  return (
    <div className={styles.bandeau}>
      <Link href="/" className={styles.marque}>
        <Image
          src="/brand/logo-sport-dans-la-ville.png"
          alt="Sport dans la Ville"
          width={28}
          height={39}
          className={styles.logo}
        />
        <span>Terrains</span>
      </Link>
      {persona ? (
        <span className={styles.persona}>
          Vous êtes <strong>{persona.nom}</strong> — {persona.role} ·{" "}
          <Link href="/qui-etes-vous">changer</Link>
        </span>
      ) : (
        <span className={styles.persona}>
          <Link href="/qui-etes-vous">Qui êtes-vous ?</Link>
        </span>
      )}
    </div>
  );
}
