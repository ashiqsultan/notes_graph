import type { WorkerResponse } from "@/lib/llmMessages";

export type LlmStatus = "loading" | "ready" | "unsupported" | "error";

export interface DownloadProgress {
  file: string;
  percent: number;
}

export interface LlmState {
  status: LlmStatus;
  progress: DownloadProgress | null;
  reply: string;
  generating: boolean;
  error: string | null;
}

export function createInitialLlmState(webGpuAvailable: boolean): LlmState {
  return {
    status: webGpuAvailable ? "loading" : "unsupported",
    progress: null,
    reply: "",
    generating: false,
    error: null,
  };
}

export function reduceWorkerResponse(
  state: LlmState,
  response: WorkerResponse,
): LlmState {
  switch (response.type) {
    case "progress":
      return { ...state, progress: { file: response.file, percent: response.percent } };
    case "ready":
      return { ...state, status: "ready", progress: null };
    case "reply":
      return state;
    case "error":
      if (response.id !== undefined) return state;
      return {
        ...state,
        status: state.status === "loading" ? "error" : state.status,
        error: response.message,
      };
  }
}

export function startGenerating(state: LlmState): LlmState {
  return { ...state, generating: true, error: null };
}

export function finishGenerating(state: LlmState, reply: string): LlmState {
  return { ...state, reply, generating: false };
}

export function failGenerating(state: LlmState, message: string): LlmState {
  return { ...state, error: message, generating: false };
}
