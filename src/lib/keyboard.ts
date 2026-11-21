import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { SAVE_NOTE_SHORTCUT } from "@/constants/shortcuts";

type ShortcutEvent = Pick<
  ReactKeyboardEvent,
  "key" | "metaKey" | "ctrlKey" | "nativeEvent"
>;

/** True on macOS and iOS, where shortcuts use the Command key. */
function isApplePlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

/** The save shortcut's modifier label, e.g. "⌘" or "Ctrl". */
function getSaveShortcutModifierLabel(): string {
  return isApplePlatform()
    ? SAVE_NOTE_SHORTCUT.modifierLabel.apple
    : SAVE_NOTE_SHORTCUT.modifierLabel.other;
}

/** Whether a key event is the save shortcut for the current platform. */
function isSaveShortcut(event: ShortcutEvent): boolean {
  if (event.nativeEvent.isComposing) return false;
  if (event.key !== SAVE_NOTE_SHORTCUT.key) return false;

  return isApplePlatform() ? event.metaKey : event.ctrlKey;
}

export { getSaveShortcutModifierLabel, isSaveShortcut };
