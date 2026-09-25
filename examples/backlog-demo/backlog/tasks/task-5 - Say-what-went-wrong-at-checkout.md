---
id: TASK-5
title: Say what went wrong at checkout
status: Done
assignee: []
created_date: '2026-09-25 18:02'
updated_date: '2026-09-25 18:02'
labels: []
dependencies: []
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
night-shift: kind=build size=M touches=src/checkout

A declined card says why and what to do next.
<!-- SECTION:DESCRIPTION:END -->

## Comments

<!-- COMMENTS:BEGIN -->
author: @builder
created: 2026-09-25 18:02
---
night-shift outcome/1
shift: 2026-09-25-night
status: shipped
review: PASS (2 rounds)
line: Checkout now says what went wrong and how to fix it.
commits: 4f2a9c1
evidence: compare checkout-before.svg checkout-after.svg | The declined-card screen, before and after
---
<!-- COMMENTS:END -->
