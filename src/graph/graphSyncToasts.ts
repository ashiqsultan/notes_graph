import { toast } from "@/components/ui/toast";

const RESULT_TIMEOUT_MS = 6000;

/** Shows a persistent toast while the model reads the note. Returns its id so it can be updated. */
export function showExtractingToast(title: string): string {
  return toast.add({
    title: `Extracting entities from “${title}”…`,
    type: "loading",
    timeout: 0,
  });
}

export function showGraphSaved(toastId: string, title: string): void {
  updateResultToast(toastId, {
    title: `Graph updated for “${title}”`,
    type: "success",
  });
}

export function showModelUnavailable(title: string): void {
  toast.add({
    title: `Couldn't extract entities from “${title}”`,
    description: "WebGPU is not available in this browser, so the AI model cannot run.",
    type: "error",
    timeout: RESULT_TIMEOUT_MS,
  });
}

export function showExtractionError(toastId: string, title: string, error: unknown): void {
  reportFailure("Entity extraction failed", error);
  updateResultToast(toastId, {
    title: `Couldn't extract entities from “${title}”`,
    description: `${describeError(error)} The existing graph was kept.`,
    type: "error",
  });
}

export function showGraphError(toastId: string, title: string, error: unknown): void {
  reportFailure("Graph update failed", error);
  updateResultToast(toastId, {
    title: `Couldn't save graph for “${title}”`,
    description: `${describeError(error)} The graph for this note may be out of date.`,
    type: "error",
  });
}

export function showRemovalError(error: unknown): void {
  reportFailure("Graph removal failed", error);
  toast.add({
    title: "Couldn't remove note from graph",
    description: describeError(error),
    type: "error",
    timeout: RESULT_TIMEOUT_MS,
  });
}

export function showUnexpectedError(error: unknown): void {
  reportFailure("Graph sync failed", error);
  toast.add({
    title: "Could not update the graph",
    description: describeError(error),
    type: "error",
    timeout: RESULT_TIMEOUT_MS,
  });
}

interface ResultUpdate {
  title: string;
  description?: string;
  type: "success" | "error";
}

function updateResultToast(toastId: string, update: ResultUpdate): void {
  toast.update(toastId, { ...update, timeout: RESULT_TIMEOUT_MS });
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function reportFailure(message: string, error: unknown): void {
  console.error(message, error);
}
