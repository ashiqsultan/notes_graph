---
title: Full-text and hybrid search
description: "relate, the embedded Cypher graph database (relatedb.ai): Create a full-text index, search it by words with the SEARCH clause, read its score and terms, and fuse it with a vector search by reciprocal rank."
type: how-to
surfaces:
  - cypher
status: stable
verified: 1.2.0
verified_by:
  - cypher
canonical_url: https://relatedb.ai/docs/guides/cypher/full-text-and-hybrid-search/
prerequisites:
  - get-started/first-graph
related:
  - reference/cypher/search
  - guides/cypher/vector-search
  - cookbook/hybrid-recall
  - concepts/problems-relate-solves#hybrid-retrieval-for-rag
  - reference/cypher/differences-from-neo4j
last_updated: 2026-11-17
---

# Full-text and hybrid search

Create a full-text index, search it by words with the SEARCH clause, read its score and terms, and fuse it with a vector search by reciprocal rank.

> Verified against relate 1.2.0. If your `relate --version` is newer, read https://relatedb.ai/docs/reference/changelog/#since-1.2.0

This guide shows you how to find nodes by the words in their text with a [full-text index](https://relatedb.ai/docs/reference/glossary/#full-text-index) and the [SEARCH clause](https://relatedb.ai/docs/reference/glossary/#search), how the index splits text into terms and ranks a match, and how to fuse a full-text search with a vector search into one ranking. The cells run in page order on one in-memory [store](https://relatedb.ai/docs/reference/glossary/#store), in your browser and in the docs build.

## Prerequisites

- A first look at Cypher, such as [your first graph](https://relatedb.ai/docs/get-started/first-graph/).
- For the hybrid step, embeddings from the model of your choice. This guide uses three-dimensional vectors so the numbers stay readable; [search by vector similarity](https://relatedb.ai/docs/guides/cypher/vector-search/) covers the vector half on its own.

## Load the notes

This cell writes the two example projects and six short notes about them. Each note has a `text`, an `embedding` vector, and an `ABOUT` relationship to its project.

```cypher run name=seed
CREATE (relate:Project {name: 'relate', language: 'Rust'}),
       (tck:Project {name: 'opencypher-tck', language: 'Gherkin'}),
       (:Note {id: 'n1', text: 'The WAL replays on open and trims a torn tail.', embedding: vector([0.9, 0.1, 0.1], 3, FLOAT32)})-[:ABOUT]->(relate),
       (:Note {id: 'n2', text: 'A checkpoint writes the graph to a snapshot.', embedding: vector([0.8, 0.2, 0.2], 3, FLOAT32)})-[:ABOUT]->(relate),
       (:Note {id: 'n3', text: 'The scenarios run on every pull request.', embedding: vector([0.1, 0.9, 0.1], 3, FLOAT32)})-[:ABOUT]->(tck),
       (:Note {id: 'n4', text: 'Release notes list every fixed scenario.', embedding: vector([0.2, 0.5, 0.7], 3, FLOAT32)})-[:ABOUT]->(relate),
       (:Note {id: 'n5', text: 'The docs build replays every cell.', embedding: vector([0.1, 0.4, 0.9], 3, FLOAT32)})-[:ABOUT]->(relate),
       (:Note {id: 'n6', text: 'Recovery tests cut the WAL at every byte.', embedding: vector([0.6, 0.7, 0.1], 3, FLOAT32)})-[:ABOUT]->(tck)
```

```table
(no rows) · nodes created: 8, relationships created: 6, properties set: 22, labels added: 8
```

## Create a full-text index

Name the index, the label, and the string properties it covers after `ON EACH`:

```cypher run name=create-fulltext
CREATE FULLTEXT INDEX note_text IF NOT EXISTS
FOR (n:Note) ON EACH [n.text]
```

```table
(no rows) · indexes added: 1
```

`ON EACH [n.title, n.text]` indexes several properties, and `FOR ()-[r:<TYPE>]-()` indexes relationships instead of nodes. Without `IF NOT EXISTS`, a second index of the same name fails with `semantic error: IndexAlreadyExists`. The [search reference](https://relatedb.ai/docs/reference/cypher/search/#index-statements) has every form.

## Search by words

`SEARCH` restricts the `MATCH` to the index's top results. `LIMIT` is required, and `SCORE AS` names the score:

```json data=words
{"q": "wal tests"}
```

```cypher run name=search params=words
MATCH (n:Note)
SEARCH n IN (FULLTEXT INDEX note_text FOR $q LIMIT 5) SCORE AS score
RETURN n.id AS id, n.text AS text, score
ORDER BY score DESC, id
```

```table
| id   | text                                             | score              |
|------|--------------------------------------------------|--------------------|
| "n6" | "Recovery tests cut the WAL at every byte."      | 1.1371966628886316 |
| "n1" | "The WAL replays on open and trims a torn tail." | 0.4118477668724633 |
2 rows
```

Each word of the query is a term, and a note holding any of the terms matches. `n6` holds both `wal` and `tests`, `n1` only `wal`. The query can be a parameter, as in this cell, or a string literal; any other type fails with `type error: InvalidValueType: fulltext SEARCH requires a STRING query`.

## Read the score

The score is BM25, the relevance score Neo4j's full-text index gives: each matching term adds more when few notes hold it, and a short note scores higher than a long one. `n6` holds both `wal` and `tests` and scores about `1.14`; `n1` holds only `wal` and scores about `0.41`. The score is not normalized, so it ranks results within one search and means nothing next to a vector score. Equal scores have no documented order, so sort on a second key, as the cell does with `id`.

## Know how text becomes terms

The index lowercases text and splits it into words of letters and digits. A query goes through the same split, once its operators ([Combine words with operators](#combine-words-with-operators)) and its wildcard, fuzzy and boost suffixes ([Match part of a word, a typo, or an accent](#match-part-of-a-word-a-typo-or-an-accent)) are read; nothing else happens to either. This cell runs one search per query string and lists the notes each one finds:

```cypher run name=terms
UNWIND ['wal', 'replay', 'replays', 'test', 'the', 'pull-request', '"torn tail"'] AS q
CALL (q) {
  MATCH (n:Note)
  SEARCH n IN (FULLTEXT INDEX note_text FOR q LIMIT 10) SCORE AS score
  RETURN collect(n.id) AS ids
}
RETURN q AS query, ids
```

```table
| query           | ids                            |
|-----------------|--------------------------------|
| "wal"           | ["n6", "n1"]                   |
| "replay"        | []                             |
| "replays"       | ["n5", "n1"]                   |
| "test"          | []                             |
| "the"           | ["n5", "n3", "n2", "n6", "n1"] |
| "pull-request"  | ["n3"]                         |
| "\"torn tail\"" | ["n1"]                         |
7 rows
```

| Query            | What the result shows                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| `wal`            | Case is ignored: it matches `WAL` in the text                             |
| `replay`, `test` | No stemming: `replay` does not match `replays`, nor `test` `tests`        |
| `the`            | No stop words: common words are terms like any other                      |
| `pull-request`   | Punctuation splits words: the query is the two terms `pull` and `request` |
| `"torn tail"`    | No phrase search: quotes are dropped, and the two words match separately  |

`WITH ANALYZER 'english'` after the query stems the query's words and drops English stop words, but the indexed text keeps its written form: with it, `replays` searches for `replay` and `tests` for `test`, which no note holds. To match word variants, use a wildcard or a fuzzy term ([Match part of a word, a typo, or an accent](#match-part-of-a-word-a-typo-or-an-accent)), or store a normalized copy of the text in a second indexed property and search that.

## Combine words with operators

The words of a query are alternatives: any note holding one of them matches. `AND`, `OR` and `NOT`, written in capitals, are operators, and parentheses group them. `wal AND tests` matches only `n6`, and `wal NOT tests` only `n1`. A lowercase `and` is one more term. `&&` and `||` work as `AND` and `OR`; `+`, `-` and `!` before a word change nothing. `text:wal` matches `wal` in the `text` property only, which matters for an index over several properties. The [search reference](https://relatedb.ai/docs/reference/cypher/search/#full-text-matching) lists every rule.

## Match part of a word, a typo, or an accent

A term can carry a wildcard, a fuzzy suffix, or a boost:

| Form                     | Matches                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `tor*`, `t?il`, `*ail`   | `*` stands for any run of characters, none included, and `?` for exactly one, so all three match `torn` or `tail`                     |
| `replay~`, `checkpont~1` | Words within two edits of the term, or within the number after `~`: a character added, removed, changed, or swapped with its neighbor |
| `wal^3`                  | What `wal` matches, with that term's score multiplied by 3                                                                            |

```cypher run name=wildcard-fuzzy
UNWIND ['tor*', 't?il', 'replay~', 'checkpont~1', 'test*'] AS q
CALL (q) {
  MATCH (n:Note)
  SEARCH n IN (FULLTEXT INDEX note_text FOR q LIMIT 10) SCORE AS score
  WITH n ORDER BY n.id
  RETURN collect(n.id) AS ids
}
RETURN q AS query, ids
```

```table
| query         | ids          |
|---------------|--------------|
| "tor*"        | ["n1"]       |
| "t?il"        | ["n1"]       |
| "replay~"     | ["n1", "n5"] |
| "checkpont~1" | ["n2"]       |
| "test*"       | ["n6"]       |
5 rows
```

`replay~` finds the two notes that hold `replays`, one edit away, and `test*` finds `tests`: the two forms that exact terms missed. A wildcard match scores 1.0 per property, and a fuzzy match scores less the further the word is from the term, so neither score compares with an exact term's.

A boost changes the order, never the matches. `n1` holds only `wal`; with that term tripled, its score rises from about `0.41` to about `1.24`:

```cypher run name=boost
MATCH (n:Note)
SEARCH n IN (FULLTEXT INDEX note_text FOR 'wal^3 tests' LIMIT 5) SCORE AS score
RETURN n.id AS id, round(score, 2) AS score
ORDER BY score DESC, id
```

```table
| id   | score |
|------|-------|
| "n6" | 2.05  |
| "n1" | 1.24  |
2 rows
```

Accented letters are letters: on this index, `cafe` does not match `café`. If you want both spellings to match, create the index with the `standard-folding` analyzer, which folds accents in the stored text and in every query:

```cypher
CREATE FULLTEXT INDEX place_name FOR (p:Place) ON EACH [p.name]
OPTIONS {indexConfig: {`fulltext.analyzer`: 'standard-folding'}}
```

The [search reference](https://relatedb.ai/docs/reference/cypher/search/#full-text-matching) runs that index, and lists the limits: a fuzzy term matches at most the 50 closest words, a wildcard term holds at most 256 characters, and a query at most 1,024 clauses.

## Page through and narrow the results

`SKIP` (or `OFFSET`) inside the search skips that many results before `LIMIT`:

```cypher run name=page
MATCH (n:Note)
SEARCH n IN (FULLTEXT INDEX note_text FOR 'every' SKIP 2 LIMIT 2) SCORE AS score
RETURN n.id AS id, score
```

```table
| id   | score               |
|------|---------------------|
| "n3" | 0.2064639029341305  |
| "n6" | 0.19550121782258376 |
2 rows
```

A full-text search takes no `WHERE` inside its parentheses. A filter or a pattern after the `SEARCH` clause keeps only the rows the search already returned, so ask the search for more than you need and limit afterwards. This cell keeps the notes about `relate`:

```cypher run name=narrow
MATCH (n:Note)
SEARCH n IN (FULLTEXT INDEX note_text FOR 'every' LIMIT 6) SCORE AS score
MATCH (n)-[:ABOUT]->(:Project {name: 'relate'})
RETURN n.id AS id, n.text AS text, score
ORDER BY score DESC, id
LIMIT 2
```

```table
| id   | text                                       | score               |
|------|--------------------------------------------|---------------------|
| "n4" | "Release notes list every fixed scenario." | 0.21872908528665308 |
| "n5" | "The docs build replays every cell."       | 0.21872908528665308 |
2 rows
```

## Fuse with a vector search

A full-text search finds the exact words and misses paraphrases; a vector search finds what is near in meaning and misses exact names. Reciprocal rank fusion (RRF) merges the two ranked lists without comparing their scores: a note earns `1 / (60 + rank)` from each list it appears in, and the shares add up. First, a vector index on the embeddings:

```cypher run name=create-vector
CREATE VECTOR INDEX note_embedding IF NOT EXISTS
FOR (n:Note) ON (n.embedding)
OPTIONS {indexConfig: {`vector.dimensions`: 3, `vector.similarity_function`: 'cosine'}}
```

```table
(no rows) · indexes added: 1
```

The question is `wal tests` again, with its embedding. On its own, each search returns a ranked list of `$k` notes:

```json data=question
{"q": "wal tests", "v": [0.5, 0.8, 0.1], "k": 3}
```

```cypher run name=vector-list params=question
MATCH (n:Note)
SEARCH n IN (VECTOR INDEX note_embedding FOR $v LIMIT $k) SCORE AS score
RETURN n.id AS id, score
ORDER BY score DESC, id
```

```table
| id   | score              |
|------|--------------------|
| "n6" | 0.9944459199905396 |
| "n3" | 0.9512366056442261 |
| "n2" | 0.8602553606033325 |
3 rows
```

```cypher run name=fulltext-list params=question
MATCH (n:Note)
SEARCH n IN (FULLTEXT INDEX note_text FOR $q LIMIT $k) SCORE AS score
RETURN n.id AS id, score
ORDER BY score DESC, id
```

```table
| id   | score              |
|------|--------------------|
| "n6" | 1.1371966628886316 |
| "n1" | 0.4118477668724633 |
2 rows
```

`CALL () { … UNION ALL … }` runs both searches in one statement; each branch numbers its results by position, and the outer query adds up the shares and walks from each note to its project:

```cypher run name=fuse params=question
CALL () {
  MATCH (n:Note)
  SEARCH n IN (VECTOR INDEX note_embedding FOR $v LIMIT $k) SCORE AS score
  WITH n ORDER BY score DESC, n.id
  WITH collect(n) AS ns
  UNWIND range(0, size(ns) - 1) AS i
  RETURN ns[i] AS n, 'vector' AS list, i + 1 AS rank
  UNION ALL
  MATCH (n:Note)
  SEARCH n IN (FULLTEXT INDEX note_text FOR $q LIMIT $k) SCORE AS score
  WITH n ORDER BY score DESC, n.id
  WITH collect(n) AS ns
  UNWIND range(0, size(ns) - 1) AS i
  RETURN ns[i] AS n, 'fulltext' AS list, i + 1 AS rank
}
WITH n, sum(1.0 / (60 + rank)) AS rrf,
     min(CASE list WHEN 'vector' THEN rank END) AS vector_rank,
     min(CASE list WHEN 'fulltext' THEN rank END) AS fulltext_rank
ORDER BY rrf DESC, n.id LIMIT $k
MATCH (n)-[:ABOUT]->(p:Project)
RETURN n.id AS id, vector_rank, fulltext_rank, round(rrf, 4) AS rrf, p.name AS project
```

```table
| id   | vector_rank | fulltext_rank | rrf    | project          |
|------|-------------|---------------|--------|------------------|
| "n6" | 1           | 1             | 0.0328 | "opencypher-tck" |
| "n1" | null        | 2             | 0.0161 | "relate"         |
| "n3" | 2           | null          | 0.0161 | "opencypher-tck" |
3 rows
```

The view runs the two lists and the fused statement with the chosen `k`, up to the six notes the page holds, and shows the arithmetic beside the engine's fused score:

The 2 ranked lists for "wal tests", as recorded with k = 3:

| Rank | `vector-list` | `fulltext-list` |
| ---- | ------------- | --------------- |
| 1    | `n6`          | `n6`            |
| 2    | `n3`          | `n1`            |
| 3    | `n2`          |                 |

Fused by reciprocal rank: each list gives an id 1 / (60 + its rank there), and the shares add up. 4 ids, best first:

| id   | Rank in `vector-list` | Rank in `fulltext-list` | Arithmetic          | Fused score |
| ---- | --------------------- | ----------------------- | ------------------- | ----------- |
| `n6` | 1                     | 1                       | 1/(60+1) + 1/(60+1) | 0.0328      |
| `n1` |                       | 2                       | 1/(60+2)            | 0.0161      |
| `n3` | 2                     |                         | 1/(60+2)            | 0.0161      |
| `n2` | 3                     |                         | 1/(60+3)            | 0.0159      |

Live: a k slider runs the page's search statements on its database in your browser with that k, and the view marks the ids the engine returns.

`n6` leads both lists. `n1` holds the word `wal` but is not among the nearest vectors, and `n3` is near in meaning but holds neither word; the fusion keeps both, tied, with `n.id` breaking the tie. The constant 60 keeps one list's first place from outweighing the other list.

[Hybrid recall](https://relatedb.ai/cookbook/hybrid-recall/) builds the same fusion over 40 notes, with a time filter inside the vector search. Two other forms combine the indexes: the intersection, which runs the second search only over what the first returned, and `COMBINE … USING WRRF`, a preview that fuses inside `SEARCH` itself; the [search reference](https://relatedb.ai/docs/reference/cypher/search/#hybrid-search) has both.

## Verify

`SHOW INDEXES` lists both indexes, the properties they cover, and their state:

```cypher run name=verify
SHOW INDEXES YIELD name, type, labelsOrTypes, properties, state
WHERE type IN ['FULLTEXT', 'VECTOR']
RETURN name, type, labelsOrTypes, properties, state
ORDER BY name
```

```table
| name             | type       | labelsOrTypes | properties    | state    |
|------------------|------------|---------------|---------------|----------|
| "note_embedding" | "VECTOR"   | ["Note"]      | ["embedding"] | "ONLINE" |
| "note_text"      | "FULLTEXT" | ["Note"]      | ["text"]      | "ONLINE" |
2 rows
```

Two `ONLINE` indexes and three fused rows mean both searches serve the statement.

## If it goes wrong

| Message or symptom                                                                                                                                           | Cause                                                                                                                                           | Remedy                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `syntax error: InvalidUseOfCommand: WHERE cannot be used together with 'FULLTEXT INDEX'`                                                                     | A `WHERE` inside the full-text search's parentheses.                                                                                            | Move the filter after the `SEARCH` clause and raise its `LIMIT`.                              |
| `syntax error: parse error: expected LIMIT, got ")" (RightParen)`                                                                                            | The search has no `LIMIT`.                                                                                                                      | Add `LIMIT <k>` inside the parentheses.                                                       |
| `syntax error: UndefinedVariable: variable 'score' not defined`                                                                                              | The query reads `score` without `SCORE AS`.                                                                                                     | Add `SCORE AS score` after the closing parenthesis.                                           |
| `IndexDoesNotExist: <name>` or `WrongIndexType: <name>`                                                                                                      | The index name is misspelled, or names a vector index after `FULLTEXT INDEX`.                                                                   | Check the name and type in `SHOW INDEXES`.                                                    |
| No rows for a word the text holds in another form                                                                                                            | The index has no stemming, and folds accents only with the `standard-folding` analyzer; `WITH ANALYZER 'english'` stems the query's words only. | Search with a wildcard (`test*`) or a fuzzy term (`replay~`), or for the form the text holds. |
| ``syntax error: Invalid fulltext query term '<term>': a `^` boost needs a non-negative number``, or `… a fuzzy distance of 1 or more must be a whole number` | A `^` or `~` in the query string that is not a boost or a fuzzy suffix, often from text a person typed.                                         | Remove the character from the string before searching, or write the suffix as `^2` or `~1`.   |
| A query with `and` or `not` returns more notes, not fewer                                                                                                    | Lowercase `and` and `not` are terms, and a query's terms are alternatives.                                                                      | Write the operators in capitals: `wal AND tests`.                                             |

## Related

- [Search](https://relatedb.ai/docs/reference/cypher/search/): index statements, every `SEARCH` rule, the full-text matching table, and hybrid search.
- [Search by vector similarity](https://relatedb.ai/docs/guides/cypher/vector-search/): the vector half, with filters inside the search.
- [Hybrid recall](https://relatedb.ai/cookbook/hybrid-recall/): reciprocal rank fusion over 40 notes, then a hop to each note's topic.
- [Problems relate solves](https://relatedb.ai/docs/concepts/problems-relate-solves/#hybrid-retrieval-for-rag): hybrid retrieval for retrieval-augmented generation, and its data model.

## Terms used on this page

- **full-text index**: An index over one or more string properties that finds entities containing given words, ranked by a BM25 relevance score.
- **search clause**: The Cypher 25 `SEARCH` clause, which restricts a `MATCH` to the top results of a vector or full-text index and binds their score.
- **store**: A relate database: a directory, a single `.rl` file, or `:memory:`, opened with `--database`.
