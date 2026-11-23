import type { ClassifierLoadResponse } from "@/graph/classifierMessages";

export type ClassifierStatus = "loading" | "ready" | "error";

export interface DownloadProgress {
  file: string;
  percent: number;
}

export interface ClassifierState {
  status: ClassifierStatus;
  progress: DownloadProgress | null;
  error: string | null;
}

export const INITIAL_CLASSIFIER_STATE: ClassifierState = {
  status: "loading",
  progress: null,
  error: null,
};

export function reduceClassifierResponse(
  state: ClassifierState,
  response: ClassifierLoadResponse,
): ClassifierState {
  switch (response.type) {
    case "progress":
      return { ...state, progress: { file: response.file, percent: response.percent } };
    case "ready":
      return { ...state, status: "ready", progress: null };
    case "error":
      return { ...state, status: "error", progress: null, error: response.message };
  }
}
