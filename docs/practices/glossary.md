# Glossary

Read this before writing to the owner, a task or a document. This
repository keeps one list of official terms in
[docs/glossary.md](../glossary.md).

## Rules

1. **One official term per concept, never a synonym.** When the owner, the
   docs and the code use different words for one thing, the glossary term
   wins in prose. Code keeps its name until a task renames it.
2. **Backticks when talking to the owner.** Every official term in a reply
   is wrapped in backticks: `Night`, `Night file`, `Viewer`. Documents may do
   the same where it helps.
3. **Agents own the vocabulary.** Add, rename or drop a term without asking
   when you notice: a concept that came up twice without a name; two words
   for one thing; one word for two things; or a term the owner coins.
   Write the meaning in one line, where it lives, and the date.
4. **Name every change in the next report.** "New terms: `Meter`,
   `Follow-up file`." The owner changes one then if they dislike it; there
   is no approval step.
5. **Dropped terms stay listed**, with the reason and the replacement, so
   nobody brings them back.

Details:

- A term that exists only in an undecided idea (an `Idea:` task) gets
  `pending: <task id>` as its code name and is dropped if the idea is
  rejected.
- A rename or drop updates the prose that uses the term in the same change,
  or records the sweep still owed.
- An agent that may not write the glossary (an idea agent, a Reviewer)
  returns the term to the Lead, who adds it.
- A glossary row change may take the small-change path of
  [review.md](review.md), provided its code name matches the tree at that
  commit and anything unbuilt says so.

## Words with two meanings

The riskiest words are the ones everyone already uses. List them in the
glossary's own "Words with two meanings" table with the term to say
instead: "night shift" for one session is a `Night`, because Night Shift
is the product.
