# Bypass log

Read this after working around a shared component, and before planning work
on shared code.

## The rule

**The framework is the happy path, not a cage.** A project's shared code
(its components, templates, internal libraries, the contracts between them)
is the preferred way to build. It will not cover everything. When the work
the owner wants cannot be done through it, go around it: compose by hand,
add a one-off, extend a component locally. That is how the shared code
learns what it is missing.

Two conditions:

1. **Every bypass is logged**, in the same change, in the project's bypass
   log ([templates/bypass-log.md](../../templates/bypass-log.md)).
2. **A bypass goes around components, never around rules.** The project's
   non-negotiable rules (privacy, frozen references, evidence, anything its
   constitution lists) still hold.

At night, a builder that needs a bypass the card does not allow raises a
Question instead of taking it.

## Entry format

Newest at the bottom. A few lines each:

```text
### 2026-09-25  Gift cards in the checkout total        Status: open
Needed:   Checkout had to accept a gift card as a partial payment.
Bypassed: `PaymentSummary` accepts one payment method only.
Built:    A one-off `GiftCardSummary` in src/checkout/gift/, wired in by hand.
Lesson:   `PaymentSummary` needs a list of payment lines, not one method.
```

- `Status:` is `open` (optionally with where the fix is planned) or
  `closed by <commit, card or decision>`.
- **Never delete an entry.** Mark it closed when the gap is filled.

## The rule of three

- A gap seen once is logged.
- A second appearance flags it for shared-code work: note the earlier entry.
- A third appearance makes it shared-code work: a card for a component, a
  slot or an extension.

Read the log before planning shared-code work; it is the evidence for what
to build next.
