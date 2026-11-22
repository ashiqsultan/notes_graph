import { Button } from "@/components/ui/button";

interface SidebarShowAllButtonProps {
  onClick: () => void;
  disabled: boolean;
}

function SidebarShowAllButton({ onClick, disabled }: SidebarShowAllButtonProps) {
  return (
    <Button type="button" variant="outline" className="w-full" onClick={onClick} disabled={disabled}>
      Show all
    </Button>
  );
}

export { SidebarShowAllButton };
