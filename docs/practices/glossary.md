# Glossary

Read this before writing to the owner, a proposal or a document. A project
keeps one list of official terms in `docs/glossary.md`
([templates/glossary.md](../../templates/glossary.md)).

## Rules

1. **One official term per concept, never a synonym.** When the owner, the
   docs and the code use different words for one thing, the glossary term
   wins in prose. Code keeps its name until a task renames it.
2. **Backticks when talking to the owner.** Every official term in a reply
   is wrapped in backticks: `Cart`, `Order`, `Night-ready`. Documents may do
   the same where it helps.
3. **Agents own the vocabulary.** Add, rename or drop a term without asking
   when you notice: a concept that came up twice without a name; two words
   for one thing; one word for two things; or a term the owner coins.
   Write the meaning in one line, where it lives, and the date.
4. **Name every change in the next report.** "New terms: `Wishlist`,
   `Restock Alert`." The owner changes one then if they dislike it; there
   is no approval step.
5. **Dropped terms stay listed**, with the reason and the replacement, so
   nobody brings them back.

Details:

- A term that exists only in an undecided proposal gets `pending: <path>`
  as its code name and is dropped if the idea is rejected.
- A rename or drop updates the prose that uses the term in the same change,
  or records the sweep still owed.
- An agent that may not write the glossary (an idea agent, a Reviewer)
  returns the term to the Lead, who adds it.
- A glossary row change may take the small-change path of
  [review.md](review.md), provided its code name matches the tree at that
  commit and anything unbuilt says so.

## Words with two meanings

The riskiest words are the ones everyone already uses. List them with the
term to say instead:

| Word | Say instead |
|---|---|
| "order" for a sort order | "sort"; `Order` means only a customer's purchase |
| "release" for a version tag | "version tag" (`v3`) |

## Template

Copy into `docs/glossary.md`. Shown filled for Lighthouse; the blank
version with the full rules is
[templates/glossary.md](../../templates/glossary.md).

```markdown
# Glossary

Read this before writing to the owner, a proposal or a document. It is the
one list of <project>'s official terms. Agents keep it: they add, rename
and drop terms themselves and name every change in their next report.

## Rules

1. Use the official term, never a synonym.
2. Official terms in backticks in replies to the owner.
3. Agents own the vocabulary: add, rename or drop a term without asking
   when a concept came up twice without a name, two words are used for one
   thing, one word is used for two things, or the owner coins a term.
4. Name every added, renamed or dropped term in the next report.
5. Dropped terms stay listed.

## Terms

| Term | Meaning | Code name today | Added |
|---|---|---|---|
| `Cart` | The items a shopper has picked but not paid for | `src/cart/` | 2026-09-25 |
| `Order` | A paid purchase, from payment to delivery | `src/orders/`, table `orders` | 2026-09-25 |

## Words with two meanings

| Word | Say instead |
|---|---|
| "order" for a sort order | "sort" |

## Dropped

| Term | Dropped | Use instead |
|---|---|---|
| `Basket` | 2026-09-25: the code and the UI say "cart" | `Cart` |
```
