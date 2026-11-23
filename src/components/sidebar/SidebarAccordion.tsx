import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AllNodesList } from "@/components/sidebar/AllNodesList";

interface SidebarAccordionProps {
  onSelectType: (type: string) => void;
}

/** Sidebar accordions that list the graph's node types. */
function SidebarAccordion({ onSelectType }: SidebarAccordionProps) {
  return (
    <Accordion>
      <AccordionItem value="all-nodes">
        <AccordionTrigger>All Nodes</AccordionTrigger>
        <AccordionContent>
          <AllNodesList onSelectType={onSelectType} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export { SidebarAccordion };
