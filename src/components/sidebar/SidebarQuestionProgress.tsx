import { STAGE_INFO, type Text2CypherStage } from "@/graph/text2CypherStages";

interface SidebarQuestionProgressProps {
  stage: Text2CypherStage;
}

/** Shows the current stage of a question with a bar filled to its progress. */
function SidebarQuestionProgress({ stage }: SidebarQuestionProgressProps) {
  const { label, percent } = STAGE_INFO[stage];
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export { SidebarQuestionProgress };
