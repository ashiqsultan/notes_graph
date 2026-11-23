import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { DeleteNodeTypeDialog } from "@/components/settings/DeleteNodeTypeDialog";
import { colorForLabel } from "@/graph/nodeColors";
import { RESERVED_NODE_TYPES } from "@/graph/nodeTypes";
import type { NodeTypeEntry } from "@/db";
import { removeNodeType, saveEditedNodeType } from "@/lib/nodeTypeActions";
import {
  createNodeType,
  getAllNodeTypes,
  seedNodeTypesIfNeeded,
  type NodeTypeInput,
} from "@/lib/nodeTypes";
import { useNotesStore } from "@/store";

interface Draft {
  /** Set when editing an existing entry; undefined when adding a new one. */
  id?: number;
  /** The name before editing; empty when adding a new one. */
  previousType: string;
  type: string;
  description: string;
}

/** Sidebar trigger and settings dialog for editing the classified node types. */
function NodeTypesSettings() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<NodeTypeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NodeTypeEntry | null>(null);
  const notifyGraphChanged = useNotesStore((state) => state.notifyGraphChanged);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open]);

  async function load() {
    setLoading(true);
    try {
      await seedNodeTypesIfNeeded();
      setEntries(await getAllNodeTypes());
    } finally {
      setLoading(false);
    }
  }

  function startAdd() {
    setDraft({ previousType: "", type: "", description: "" });
  }

  function startEdit(entry: NodeTypeEntry) {
    setDraft({
      id: entry.id,
      previousType: entry.type,
      type: entry.type,
      description: entry.description,
    });
  }

  function cancel() {
    setDraft(null);
  }

  async function save() {
    if (!draft) return;
    const error = validateDraft(draft, entries);
    if (error) {
      showError(error);
      return;
    }
    const input = { type: draft.type.trim(), description: draft.description.trim() };
    const saved = await attempt(() => writeDraft(draft, input));
    if (!saved) return;
    toast.add({ title: draft.id === undefined ? "Node type added" : "Node type saved", type: "success" });
    notifyGraphChanged();
    setDraft(null);
    await load();
  }

  async function confirmDelete(entry: NodeTypeEntry) {
    setPendingDelete(null);
    const removed = await attempt(() => removeNodeType(entry));
    if (!removed) return;
    toast.add({ title: "Node type deleted", type: "success" });
    notifyGraphChanged();
    if (draft?.id === entry.id) setDraft(null);
    await load();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal />
        Node types
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Node types</DialogTitle>
            <DialogDescription>
              Graph Node Types to classify the words in notes
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <NodeTypeForm
              draft={draft}
              onChange={setDraft}
              onCancel={cancel}
              onSave={save}
            />
          ) : (
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={startAdd}>
              <Plus />
              Add node type
            </Button>
          )}

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No node types</p>
          ) : (
            <ScrollArea className="max-h-64 w-full min-w-0 rounded-md border">
              <ul className="flex w-full flex-col gap-1 p-2">
                {entries.map((entry) => (
                  <NodeTypeRow
                    key={entry.id}
                    entry={entry}
                    onEdit={() => startEdit(entry)}
                    onDelete={() => setPendingDelete(entry)}
                  />
                ))}
              </ul>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <DeleteNodeTypeDialog
        entry={pendingDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingDelete(null);
        }}
        onConfirm={(entry) => void confirmDelete(entry)}
      />
    </>
  );
}

async function writeDraft(draft: Draft, input: NodeTypeInput): Promise<void> {
  if (draft.id === undefined) {
    await createNodeType(input);
    return;
  }
  await saveEditedNodeType(draft.id, draft.previousType, input);
}

/** Runs a change and reports any failure as a toast. Returns whether it succeeded. */
async function attempt(action: () => Promise<void>): Promise<boolean> {
  try {
    await action();
    return true;
  } catch (err) {
    showError(err instanceof Error ? err.message : "Something went wrong.");
    return false;
  }
}

function showError(message: string): void {
  toast.add({ title: message, type: "error" });
}

function NodeTypeForm({
  draft,
  onChange,
  onCancel,
  onSave,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onSave();
  }

  return (
    <form className="flex min-w-0 flex-col gap-3" onSubmit={submit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="node-type-name">Type</Label>
        <Input
          id="node-type-name"
          value={draft.type}
          placeholder="e.g. Person"
          onChange={(event) => onChange({ ...draft, type: event.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="node-type-description">Description</Label>
        <Textarea
          id="node-type-description"
          value={draft.description}
          placeholder="Explain what this type covers"
          onChange={(event) => onChange({ ...draft, description: event.target.value })}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">{draft.id === undefined ? "Add" : "Save"}</Button>
      </div>
    </form>
  );
}

function NodeTypeRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: NodeTypeEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-accent">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: colorForLabel(entry.type) }}
      />
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{entry.type}</p>
        <p className="line-clamp-2 break-words text-xs text-muted-foreground">{entry.description}</p>
      </div>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Edit ${entry.type}`}>
        <Pencil />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onDelete} aria-label={`Delete ${entry.type}`}>
        <Trash2 />
      </Button>
    </li>
  );
}

/** Returns a validation error message, or null when the draft is valid. */
function validateDraft(draft: Draft, entries: NodeTypeEntry[]): string | null {
  const type = draft.type.trim();
  const description = draft.description.trim();
  if (!type) return "Type is required.";
  if (!description) return "Description is required.";
  if (isReservedName(type)) return `"${type}" is reserved. Choose another name.`;
  const duplicate = entries.some(
    (entry) => entry.id !== draft.id && entry.type.toLowerCase() === type.toLowerCase(),
  );
  if (duplicate) return "A type with this name already exists.";
  return null;
}

function isReservedName(type: string): boolean {
  return RESERVED_NODE_TYPES.some((name) => name.toLowerCase() === type.toLowerCase());
}

export { NodeTypesSettings };
