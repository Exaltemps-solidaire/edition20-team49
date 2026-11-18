import "server-only"
import { promises as fs } from "fs"
import path from "path"
import type { Db } from "./types"
import { buildSeed } from "./data/seed"

// Prototype store: one JSON file, seeded with demo data on first use.
const FILE = path.join(process.cwd(), "data", "db.json")

let queue: Promise<unknown> = Promise.resolve()

export async function readDb(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Db
  } catch {
    const seed = buildSeed()
    await fs.mkdir(path.dirname(FILE), { recursive: true })
    await fs.writeFile(FILE, JSON.stringify(seed, null, 2))
    return seed
  }
}

/** Serialises writes so two requests never overwrite each other. */
export function mutateDb<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb()
    const result = await fn(db)
    await fs.writeFile(FILE, JSON.stringify(db, null, 2))
    return result
  })
  queue = run.catch(() => undefined)
  return run
}

export async function resetDb() {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(buildSeed(), null, 2))
}
