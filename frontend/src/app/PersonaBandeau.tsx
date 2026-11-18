"use client";

import Link from "next/link";
import { usePersona } from "./persona";
import styles from "./persona.module.css";

export default function PersonaBandeau() {
  const { persona } = usePersona();

  return (
    <div className={styles.bandeau}>
      {persona ? (
        <span>
          Vous êtes <strong>{persona.nom}</strong> — {persona.role} ·{" "}
          <Link href="/qui-etes-vous">changer</Link>
        </span>
      ) : (
        <span>
          <Link href="/qui-etes-vous">Qui êtes-vous ?</Link>
        </span>
      )}
    </div>
  );
}
