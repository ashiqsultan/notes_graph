import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { envelopeRows } from "@/graph/envelopeRows";

interface SidebarRowsPreviewProps {
  cypher: string;
  envelope: string;
}

/** Temporary test view: the Cypher that ran, with its rows as text in a collapsed accordion. */
function SidebarRowsPreview({ cypher, envelope }: SidebarRowsPreviewProps) {
  if (!cypher) return null;
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-2 font-mono text-xs">
      <pre className="whitespace-pre-wrap break-all">{cypher}</pre>
      {envelope && <RowsAccordion envelope={envelope} />}
    </div>
  );
}

function RowsAccordion({ envelope }: { envelope: string }) {
  return (
    <Accordion>
      <AccordionItem value="rows">
        <AccordionTrigger>Rows</AccordionTrigger>
        <AccordionContent>
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(envelopeRows(envelope))}</pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export { SidebarRowsPreview };
