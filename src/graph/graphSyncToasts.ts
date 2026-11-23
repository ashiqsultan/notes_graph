import { toast } from "@/components/ui/toast";

const RESULT_TIMEOUT_MS = 6000;

export function showGraphError(title: string, error: unknown): void {
  reportFailure("Graph update failed", error);
  toast.add({
    title: `Couldn't save graph for “${title}”`,
    description: `${describeError(error)} The graph for this note may be out of date.`,
    type: "error",
    timeout: RESULT_TIMEOUT_MS,
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

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function reportFailure(message: string, error: unknown): void {
  console.error(message, error);
}
