# Travel Script - Claude Guidelines

## 1) Booking Verifier Settings

1. Run headful (`BV_HEADFUL=1`) to reduce bot suspicion.
2. Capture network: look for JSON endpoints returning:
   - available dates
   - time slots
   - price breakdowns
3. Prefer parsing JSON responses over scraping DOM text.
4. If the site blocks automation:
   - return status=blocked
   - provide the minimal "user-assisted" steps (e.g., "open link, pick date, tell me the displayed price/time")

---

## 2) Conventions that prevent drift

- Keep this file short and universally applicable.
- Put detailed runbooks in `/docs/` and refer to them here (progressive disclosure).
- If you add subprojects, you may add nested `CLAUDE.md` files in those folders for local rules.

---

## 3) Quickstart (human)

1. Run travel-planner to generate a draft + candidates.
2. Approve "vibes + activities".
3. Run travel-coordinator:
   - generates AvailabilityRequests
   - calls booking-verifier for each
   - writes final HTML schedule
4. Open `./data/schedules/<trip_id>.html` and click-book.
