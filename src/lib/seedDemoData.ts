import seed from "@/seed.json";
import { db } from "@/db";
import { restoreBackupData } from "@/lib/restoreBackup";

const SEEDED_KEY = "isOldUser";

let seedRun: Promise<void> | null = null;

/** Loads the bundled demo notes for a new user. Repeated calls share one run, so React strict mode cannot seed twice. */
export function seedDemoDataOnce(onStart: () => void): Promise<void> {
  seedRun ??= seedDemoDataIfNeeded(onStart);
  return seedRun;
}

async function seedDemoDataIfNeeded(onStart: () => void): Promise<void> {
  if (localStorage.getItem(SEEDED_KEY) === "true") return;
  if ((await db.notes.count()) > 0) {
    markSeeded();
    return;
  }
  onStart();
  await restoreBackupData(seed);
  markSeeded();
}

function markSeeded(): void {
  localStorage.setItem(SEEDED_KEY, "true");
}
