import type { KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GraphSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

/** Search box for nodes by name, key or type. Enter does not submit a form. */
function GraphSearchInput({ value, onChange }: GraphSearchInputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label="Search nodes"
        placeholder="Search nodes..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={preventEnterSubmit}
        className="h-11 border-2 pl-10 text-base shadow-sm"
      />
    </div>
  );
}

function preventEnterSubmit(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter") event.preventDefault();
}

export { GraphSearchInput };
