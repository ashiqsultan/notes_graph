/** Returns every node, one row each, including nodes with no relationships. */
export const ALL_NODES_QUERY = "MATCH (n)\nRETURN n AS node";

/** Returns every relationship once, in its stored direction. */
export const ALL_RELATIONSHIPS_QUERY = "MATCH (a)-[r]->(b)\nRETURN r AS rel";
