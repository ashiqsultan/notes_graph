interface ResultRowsViewProps {
  rows: unknown[];
}

/** Shows the rows of a query that returned no graph, as formatted JSON. */
function ResultRowsView({ rows }: ResultRowsViewProps) {
  return (
    <pre className="min-h-0 flex-1 overflow-auto rounded-md border bg-muted p-2 font-mono text-xs">
      {JSON.stringify(rows, null, 2)}
    </pre>
  );
}

export { ResultRowsView };
