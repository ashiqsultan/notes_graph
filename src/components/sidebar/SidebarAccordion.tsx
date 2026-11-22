import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AllNodesList } from "@/components/sidebar/AllNodesList";

interface SidebarAccordionProps {
  onSelectNode: (nodeId: string) => void;
}

/** Sidebar accordions that list the graph's nodes. */
function SidebarAccordion({ onSelectNode }: SidebarAccordionProps) {
  return (
    <Accordion>
      <AccordionItem value="all-nodes">
        <AccordionTrigger>All Nodes</AccordionTrigger>
        <AccordionContent>
          <AllNodesList onSelect={onSelectNode} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export { SidebarAccordion };
