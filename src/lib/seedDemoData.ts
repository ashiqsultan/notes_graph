import seed from "@/seed.json";
import { db } from "@/db";
import { restoreBackupData } from "@/lib/restoreBackup";

const SEEDED_KEY = "isOldUser";

let seedRun: Promise<boolean> | null = null;

/** Loads the bundled demo notes for a new user. Resolves true only when this call seeded. Repeated calls share one run, so React strict mode cannot seed twice. */
export function seedDemoDataOnce(onStart: () => void): Promise<boolean> {
  seedRun ??= seedDemoDataIfNeeded(onStart);
  return seedRun;
}

async function seedDemoDataIfNeeded(onStart: () => void): Promise<boolean> {
  if (localStorage.getItem(SEEDED_KEY) === "true") return false;
  if ((await db.notes.count()) > 0) {
    markSeeded();
    return false;
  }
  onStart();
  await restoreBackupData(seed);
  markSeeded();
  return true;
}

function markSeeded(): void {
  localStorage.setItem(SEEDED_KEY, "true");
}
