# Visual review round 2: TASK-38

**Viewer:** dev · 3ab0d73. I rebuilt `web/dist` from head. Each width ran on its own fresh `setup.ts` sample in my scratchpad, served on :4861 (1440), :4862 (390) and :4863 (360). Playwright came from agentic-wave. All three servers are stopped and the repository is clean.

**Journeys (all walked to the end at 1440, 390 and 360):**
- **Tab bar on load:**
  - 1440 shows all five tabs.
  - On a phone the bar reads Morning · Next 5 · Questions 2 · History. The bar is 350px wide at 390 and 320px at 360, and its content fits exactly, so nothing is clipped.
  - Trends is hidden on a phone, as intended.
  - The Next count is amber at load (rgb 251,191,36), because blog's A2 still needs an answer.
- **The list:**
  - Order is blog, then mobile. After search's follow-up is created, it is search, blog, mobile (newest first).
  - Items show "Still to do:" with dot separators.
  - The night link is left-aligned, 20px in from the card at every width.
- **The link back:** opens "Night of Sat 26 Sept" scrolled to the top.
- **Answering blog's question:** chose Buttondown and saved in the deck. With no reload:
  - the count turns blue (rgb 96,165,250) and stays at 5;
  - A2 becomes "Your decision · Which newsletter provider? → Buttondown";
  - Questions drops from 2 to 1.
- **Create follow-up on search:** the count goes from 5 to 6 at once, and a search section appears at the top.
- **A running night takes items on:**
  - I ran `cli.ts start --file plan.json` inside mobile. The plan took 2026-09-24-a/A1 as T1 and listed A2 as skipped. It exited 0 and opened night 2026-09-28-a.
  - The mobile section disappears and the count drops from 6 to 4, both on a plain tab switch and after a full reload.
- **Empty state:** I resolved blog A1–A3 (done) and search A1 (skipped) from the CLI and switched tabs, with no reload.
  - The page reads "Nothing is scheduled…" and the badge disappears.
  - mobile's taken items stay off the list.
- **Sideways scroll:** none. The page width equals the window width at every step and every width.

## Findings

### V1 Note (Nit): at 360 the link's arrow wraps onto a line of its own
- **Journey/step:** the list.
- **Width:** 360 (at 390 it fits on one line).
- **Saw:** "From the Night of Sat 26 Sept" fills the first line and the ">" sits alone on the second line (link height 58px against 29px at 390).
- **Expected:** the arrow stays with the last word.
- **Screenshot:** `.local/evidence/2026-09-28-visual-next-night-r2/360-08-next-after-create.png`
- **Fix:** wrap the last word and the icon together in a `whitespace-nowrap` span.

### V2 Note: after a night takes mobile's items, Morning still shows the old mobile night as waiting for an agent
- **Journey/step:** a running night takes items on, then Morning after a reload.
- **Width:** 1440.
- **Saw:** mobile shows two chips, "mobile 28 Sept · Running" and "mobile 24 Sept · Waiting for an agent · 3 days", while Next night no longer lists mobile. The follow-up items are still open in the file, so the Morning state is technically derived correctly. But that state comes from TASK-24's logic (which works out what each night is waiting on), not from TASK-38.
- **Screenshot:** `1440-10-load-after-start.png`
- **Fix:** none for TASK-38. For TASK-24/25, consider treating a follow-up whose items a running night has taken as no longer waiting.

The round-1 findings are resolved:
- **V1 (Blocking, tabs clipped on a phone):** fixed. Every tab fits at 360 and 390, with or without badges.
- **V3 (the run-on "Left:" line):** fixed.
- **V4 (list order):** fixed.
- **V2 (Morning stale after items resolved elsewhere):** not changed, by the author's decision (TASK-25 rebuilds Morning).

## Console
Clean. No console messages, page errors, failed requests or 4xx/5xx responses in any run. Logs: `1440-log.txt`, `390-log.txt`, `360-log.txt`.

## Verdict: PASS
No Blocking findings; two Notes. 36 screenshots and 3 logs are in `C:\Users\jimzord12\Documents\GitHub\night-shift\.local\evidence\2026-09-28-visual-next-night-r2\`. The script and plan are in my scratchpad under `r2v\` (`walk.mjs`, `plan.json`).
