// Owns the relate database. Loads the engine from /relate/ (see copy-relate)
// and keeps the graph in OPFS so it survives reloads.
import type { RunRequest, RunResponse } from "./relateProtocol";

interface RelateEngine {
  default: () => Promise<unknown>;
  RelateDb: { open: (uri: string) => Promise<EngineDatabase> };
}

interface EngineDatabase {
  execute: (statement: string) => string;
}

type IsWasmTrap = (err: unknown) => boolean;

const DATABASE_URI = "opfs://notes_graph";

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<RunRequest>) => void) | null;
  postMessage: (response: RunResponse) => void;
};

let isTrap: IsWasmTrap = () => false;
let databasePromise: Promise<EngineDatabase> | null = null;

function engineUrl(file: string): string {
  return new URL(`/relate/${file}`, self.location.origin).href;
}

async function openDatabase(): Promise<EngineDatabase> {
  const [relate, trap]: [RelateEngine, { isWasmTrap: IsWasmTrap }] = await Promise.all([
    import(/* @vite-ignore */ engineUrl("relate.js")),
    import(/* @vite-ignore */ engineUrl("trap.js")),
  ]);
  isTrap = trap.isWasmTrap;
  await relate.default();
  return relate.RelateDb.open(DATABASE_URI);
}

/** Opens the store once; a failed open is retried on the next request. */
function getDatabase(): Promise<EngineDatabase> {
  databasePromise ??= openDatabase().catch((err: unknown) => {
    databasePromise = null;
    throw err;
  });
  return databasePromise;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

async function runStatement(request: RunRequest): Promise<RunResponse> {
  try {
    const db = await getDatabase();
    return { id: request.id, text: db.execute(request.statement) };
  } catch (err) {
    return { id: request.id, failed: errorMessage(err), trap: isTrap(err) };
  }
}

scope.onmessage = async (event) => {
  const response = await runStatement(event.data);
  scope.postMessage(response);
};
