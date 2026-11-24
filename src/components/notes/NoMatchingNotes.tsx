import { SearchXIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/** Shown when the search matches none of the notes. */
function NoMatchingNotes() {
  return (
    <Empty className="border py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>No notes match your search</EmptyTitle>
        <EmptyDescription>Try a different word or clear the search box.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export { NoMatchingNotes };
