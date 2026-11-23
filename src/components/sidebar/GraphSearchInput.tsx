import type { KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GraphSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

/** Search box for nodes by name, key or type. */
function GraphSearchInput({ value, onChange, onKeyDown }: GraphSearchInputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label="Search nodes"
        placeholder="Search nodes..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        className="h-11 border-2 pl-10 text-base shadow-sm"
      />
    </div>
  );
}

export { GraphSearchInput };
