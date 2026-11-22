const WRITE_OR_PROCEDURE_KEYWORD =
  /\b(CREATE|MERGE|DELETE|DETACH|SET|REMOVE|DROP|LOAD|CALL)\b/i;

/** Returns an error message when the query could write or call a procedure, or null when it is safe to run. */
export function readOnlyViolation(cypher: string): string | null {
  const match = WRITE_OR_PROCEDURE_KEYWORD.exec(cypher);
  if (!match) return null;
  return `Only read queries are allowed; found ${match[1].toUpperCase()}`;
}
