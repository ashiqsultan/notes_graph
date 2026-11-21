import { useEffect, useMemo } from "react";
import debounce from "lodash/debounce";

/**
 * Returns a debounced version of `save`. Pending saves are flushed when the
 * component unmounts, so unsaved edits are never lost when the dialog closes.
 */
function useAutoSave<T>(save: (input: T) => Promise<void>, delayMs: number) {
  const debouncedSave = useMemo(
    () => debounce(save, delayMs),
    [save, delayMs]
  );

  useEffect(() => {
    return () => {
      void debouncedSave.flush();
    };
  }, [debouncedSave]);

  return debouncedSave;
}

export { useAutoSave };
