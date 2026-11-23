import { Button } from "@/components/ui/button";

interface SidebarShowAllButtonProps {
  onClick: () => void;
  disabled: boolean;
  className?: string;
  variant?: "default" | "outline";
}

function SidebarShowAllButton({ onClick, disabled, className, variant = "default" }: SidebarShowAllButtonProps) {
  return (
    <Button type="button" variant={variant} className={className} onClick={onClick} disabled={disabled}>
      Show all
    </Button>
  );
}

export { SidebarShowAllButton };
