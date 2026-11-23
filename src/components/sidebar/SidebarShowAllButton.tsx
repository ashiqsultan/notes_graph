import { Button } from "@/components/ui/button";

interface SidebarShowAllButtonProps {
  onClick: () => void;
  disabled: boolean;
  className?: string;
}

function SidebarShowAllButton({ onClick, disabled, className }: SidebarShowAllButtonProps) {
  return (
    <Button type="button" variant="default" className={className} onClick={onClick} disabled={disabled}>
      Show all
    </Button>
  );
}

export { SidebarShowAllButton };
